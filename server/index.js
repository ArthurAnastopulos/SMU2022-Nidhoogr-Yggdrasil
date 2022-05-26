const express = require("express");
const { ClientRequest } = require('http');
const app = express();
const server = require("http").createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);

const PORT = 1506;

const Clients = new Array();

app.use(express.static("./dist"));

io.on('connection', (socket) => {
    console.log('A user has connect to socket.');

    socket.on('create-room', (clientDetails) => {
        console.log(`User:${clientDetails.userId} - has requested a creation of Room: ${clientDetails.roomId}`);

        Clients.push(clientDetails);
        console.log(JSON.stringify(Clients));

        socket.join(clientDetails.roomId);

        var response = {
            res: "ok",
            roomId: clientDetails.roomId,
            code: 200
        }
    
        socket.emit('room-created', response);

    })

    socket.on('join-room', (clientDetails) => {
        console.log(`User:${clientDetails.userId} - has requested joining of Room: ${clientDetails.roomId}`);

        Clients.push(clientDetails);
        console.log(JSON.stringify(Clients));


        socket.join(clientDetails.roomId);

        var response = {
            res: "ok",
            roomId: clientDetails.roomId,
            code: 200
        }

        socket.emit('room-joined', response);
    })
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
