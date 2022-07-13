const express = require("express");
const { ClientRequest } = require("http");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const { cli } = require("webpack");
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const Clients = new Array();
const maxClients = 4;

var response = {
  call: undefined,
  player_details: undefined,
  response: undefined,
  code: undefined,
};

app.use(express.static("./dist"));

io.on("connection", (socket) => {
  console.log("A user has connect to socket.");

  socket.on("join", (playerDetails) => {
    console.log(`User ${playerDetails.userId} join arrived`);

    if (Clients.length == 0) {
      console.log(
        `User:${playerDetails.userId} - has requested a creation of Room: ${playerDetails.roomId}`
      );
      playerDetails.isRoomOwner = true;
      playerDetails.userIdSocket = socket.id;
      Clients.push(playerDetails);
      console.log(Clients);

      response.call = "room-created";
      response.player_details = playerDetails;
      response.response = "OK";
      response.code = 200;

      socket.join(playerDetails.roomId);
      socket.emit("room-created", response, Clients.length);
    } else if (Clients.length < maxClients) {
      console.log(
        `User:${playerDetails.userId} - has requested joining of Room: ${playerDetails.roomId}`
      );
      playerDetails.isRoomOwner = false;
      playerDetails.userIdSocket = socket.id;
      Clients.push(playerDetails);
      console.log(Clients);

      response.call = "room-joined";
      response.player_details = playerDetails;
      response.response = "OK";
      response.code = 200;

      socket.join(playerDetails.roomId);
      socket.emit("room-joined", response, Clients.length);
      
      if(Clients.length >= maxClients)
      {
        socket.broadcast.to(playerDetails.roomId).emit("startGame");
      }
    } else {
      console.log(
        `User:${playerDetails.userId} - has requested joining of Room: ${playerDetails.roomId}, but room was full`
      );

      response.call = "full-room";
      response.player_details = playerDetails;
      response.response = "NOT OK";
      response.code = 402;

      socket.emit("full-room", response);
    }
  });

  socket.on("disconnect", function () {
    var currentClient = undefined;

    Clients.forEach((client) => {
      if (client.userIdSocket === socket.id) {
        console.log(
          `User:${client.userId} - has disconnect from the server. Room: ${client.roomId}`
        );

        currentClient = client;
      }
    });
    Clients.splice(
      Clients.findIndex((item) => item.userIdSocket === socket.id),
      1
    );

    if (currentClient !== undefined && Clients.length > 0) {
      if (currentClient.isRoomOwner && Clients.length > 0) {
        Clients[0].isRoomOwner = true;
        console.log(Clients);
      }

      response.call = "ack-bye";
      response.player_details = currentClient;
      response.response = "OK";
      response.code = 202;

      socket.emit("ack-bye", response);

      if (!Clients.length == 0) {
        var nisRoomOwner =
          Clients[Clients.findIndex((item) => item.isRoomOwner == true)].userId;

        response.call = "leave-room";
        response.player_details = currentClient;
        response.response = "OK";
        response.code = 202;

        var leave_response = {
          response: response,
          nisRoomOwner: nisRoomOwner,
        };

        socket.broadcast
          .to(response.player_details.roomId)
          .emit("leave-room", leave_response);
      }
    }
  });

  socket.on("bye", (playerDetails) => {
    console.log(
      `User:${playerDetails.userId} - has left the Room: ${playerDetails.roomId}, emit bye`
    );
    Clients.splice(
      Clients.findIndex((item) => item.userId === playerDetails.userId),
      1
    );

    if (playerDetails.isRoomOwner && Clients.length > 0) {
      Clients[0].isRoomOwner = true;
      console.log(Clients);
    }

    socket.leave(playerDetails.roomId);

    response.call = "ack-bye";
    response.player_details = playerDetails;
    response.response = "OK";
    response.code = 202;

    socket.emit("ack-bye", response);

    if (!Clients.length == 0) {
      var nisRoomOwner =
        Clients[Clients.findIndex((item) => item.isRoomOwner == true)].userId;

      response.call = "leave-room";
      response.player_details = playerDetails;
      response.response = "OK";
      response.code = 202;

      var leave_response = {
        response: response,
        nisRoomOwner: nisRoomOwner,
      };

      socket.broadcast
        .to(response.player_details.roomId)
        .emit("leave-room", leave_response);
    }
  });

  socket.on("offer", (room, description) => {
    socket.broadcast.to(room).emit("offer", room, description);
  });

  socket.on("candidate", (room, signal) => {
    socket.broadcast.to(room).emit("candidate", signal);
  });

  socket.on("answer", (room, description) => {
    socket.broadcast.to(room).emit("answer", description);
  });

  socket.on("playerState", (frameState) => {
    socket.broadcast.to("SMU2022").emit("playerDraw", frameState);
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
