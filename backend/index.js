var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

server.listen(8000);

console.log(`listening on localhost:8000`);

io.on("connection", function (socket) {
  socket.on("join", function (data) {
    socket.join(data.roomId);
    socket.room = data.roomId;
    const sockets = io.of("/").in().adapter.rooms.get(data.roomId);

    console.log("room " + data.roomId + " :");
    console.log(sockets);

    if (sockets.size === 1) {
      socket.emit("init");
    } else {
      if (sockets.size === 2) {
        io.to(data.roomId).emit("ready");
      } else {
        socket.room = null;
        socket.leave(data.roomId);
        socket.emit("full");
      }
    }
  });

  socket.on("signal", (signal) => {
    io.to(signal.room).emit("desc", signal.desc);
  });

  socket.on("name", (name) => {
    socket.broadcast.to(socket.room).emit('remoteName', name);
  });

  socket.on("score", (score) => {
    socket.broadcast.to(socket.room).emit('remoteScore', score);
  });

  socket.on("startRound", () => {
    console.log("pls");
    io.to(socket.room).emit("roundStarted");
  });

  socket.on("disconnect", () => {
    const roomId = Object.keys(socket.adapter.rooms)[0];
    if (socket.room) {
      io.to(socket.room).emit("disconnected");
    }
  });
});
