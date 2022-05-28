const express = require("express");
const { ClientRequest } = require('http');
const app = express();
const server = require("http").createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);

const PORT = 1506;

const Clients = new Array();
const maxClients = 4

var response = {
    call: undefined,
    player_details: undefined,
    response: undefined,
    code: undefined   
}

app.use(express.static("./dist"));

io.on('connection', (socket) => {
    console.log('A user has connect to socket.');
    socket.on('join', (playerDetails) => {
        const roomClients = io.sockets.adapter.rooms[loginDetails.roomId] || { length: 0 }
        const numberOfClients = roomClients.length

        console.log(`User ${playerDetails.userId} join arrived`)

        if(numberOfClients == 0) {

            console.log(`User:${playerDetails.userId} - has requested a creation of Room: ${playerDetails.roomId}`);
            playerDetails.isRoomOwner = true;
            Clients.push(playerDetails);
            console.log(Clients);

            socket.join(playerDetails.roomId);

            response.call = 'room-created';
            response.player_details = playerDetails;
            response = "OK";
            code = 200;

            socket.emit('room-created', response);

        } else if (numberOfClients <= maxClients) {
            
            console.log(`User:${playerDetails.userId} - has requested joining of Room: ${playerDetails.roomId}`)
            playerDetails.isRoomOwner = false;
            Clients.push(playerDetails);
            console.log(Clients);

            response.call = 'room-joined';
            response.player_details = playerDetails;
            response = "OK";
            code = 200;

            socket.join(playerDetails.roomId);
            socket.emit('room-joined', response);

        } else {

            console.log(`User:${playerDetails.userId} - has requested joining of Room: ${playerDetails.roomId}, but room was full`);

            response.call = 'full-room';
            response.player_details = playerDetails;
            response = "NOT OK";
            code = 402;

            socket.emit("full-room", response);

        }
    })

    socket.on('disconnect', (playerDetails) => {
        console.log(`User:${playerDetails.userId} - has left the Room: ${playerDetails.roomId}, emit disconnect`)
        Clients.splice(Clients.findIndex(item => item.userId === playerDetails.userId), 1)

        if((playerDetails.isRoomOwner) && Clients.length > 0) { 
            Clients[0].isRoomOwner = true          
            console.log(Clients)
        }
  
        socket.leave(playerDetails.roomId)

        response.call = 'ack-bye';
        response.player_details = playerDetails;
        response = "OK";
        code = 202;

        socket.emit('ack-bye', response)

        if(!Clients.length == 0){
            var nisRoomOwner = Clients[Clients.findIndex(item => item.isRoomOwner == true)].userId

            response.call = 'leave-room'
            response.player_details = playerDetails;
            response = "OK";  
            code = 202;

            var leave_response = {
                response: response,
                nisRoomOwner: nisRoomOwner
            }

            socket.broadcast.to(playerDetails.roomId).emit('leave-room', leave_response)
        }
    })
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
