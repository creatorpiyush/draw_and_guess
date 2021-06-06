/* eslint-disable strict */
/* eslint-disable lines-around-directive */
/* eslint-disable comma-dangle */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
"use strict";

const express = require("express");
const socketio = require("socket.io");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const roomID = req.query.id;
  res.render("index", { roomID });
});

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${server.address().port}`);
});

// const io = socketio(server);

const { EventEmitter } = require("events");
// const sockets = require("../sockets");

const Room = require("./controllers/Rooms");
const Canvas = require("./controllers/Canvas");
const Disconnect = require("./controllers/Disconnect");
const Game = require("./controllers/Game");

const io = socketio(server);
io.on("connection", (socket) => {
  console.log("connected user");
  socket.on("newPrivateRoom", (player) =>
    new Room(io, socket).createPrivateRoom(player)
  );
  socket.on("joinRoom", async (data) => {
    await new Room(io, socket).joinRoom(data);
  });
  socket.on("settingsUpdate", (data) =>
    new Room(io, socket).updateSettings(data)
  );
  socket.on("drawing", (data) => new Canvas(io, socket).broadcastDrawing(data));
  socket.on("clearCanvas", () => new Canvas(io, socket).clearCanvas());
  socket.on("startGame", async () => {
    await new Game(io, socket).startGame();
  });
  socket.on("getPlayers", async () => {
    await new Game(io, socket).getPlayers();
  });
  socket.on("message", (data) => new Game(io, socket).onMessage(data));
  socket.on("disconnect", () => new Disconnect(io, socket).onDisconnect());
});

global.round = new EventEmitter();
global.games = {};
global.BONUS = 250;
global.MAX_POINTS = 500;
// global.socket = sockets;

module.exports = app;
