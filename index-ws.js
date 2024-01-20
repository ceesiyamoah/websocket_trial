const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', (req, res) => {
	res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);

server.listen('3000', () => {
	console.log('Server started on port 3000');
});

process.on('SIGINT', () => {
	wss.clients.forEach((client) => {
		client.close();
	});

	server.close(() => {
		shutDownDB();
	});
});

// websocket beginning
const websSocketServer = require('ws').Server;

const wss = new websSocketServer({ server: server });

wss.on('connection', (ws) => {
	const numClients = wss.clients.size;
	console.log('Clients connected', numClients);

	wss.broadcast(`Current visitors: ${numClients}`);
	if (ws.readyState === ws.OPEN) {
		ws.send('Welcome mortal', numClients);
	}

	db.run(`INSERT INTO visitors (count, time)
	VALUES (${numClients}, datetime('now'))
	`);

	ws.on('close', function close() {
		wss.broadcast(`Current visitors: ${numClients}`);
		getCounts();

		console.log('A client has disconnected');
	});
});

// broadcast function to send to each client
wss.broadcast = function broadcast(data) {
	wss.clients.forEach((client) => {
		client.send(data);
	});
};

//* databases begin
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
	db.run(`
	CREATE TABLE visitors (
		count INTEGER,
		time TEXT
	)
	`);
});

const getCounts = () => {
	db.each(`SELECT * FROM visitors`, (err, row) => {
		console.log(row);
	});
};

const shutDownDB = () => {
	getCounts();
	console.log('I am off');
	db.close();
};
