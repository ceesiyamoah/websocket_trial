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

	ws.on('close', function close() {
		wss.broadcast(`Current visitors: ${numClients}`);

		console.log('A client has disconnected');
	});
});

// broadcast function to send to each client
wss.broadcast = function broadcast(data) {
	wss.clients.forEach((client) => {
		client.send(data);
	});
};
