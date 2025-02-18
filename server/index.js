// Load required modules
const http = require("http"); // http server core module
const path = require("path");
var cors = require('cors');
const express = require("express"); // web framework external module
// Set process name
process.title = "networked-aframe-server";
// Get port or default to 8080
const port = process.env.PORT || 8080;
// Setup and configure Express https server.
const app = express();
app.use(cors())
app.use(express.static(path.resolve(__dirname, "..", "ChatVR")));
const webServer = http.createServer(app);

// needed to add allowEI03 flag otherwise get a protocol error
const io = require("socket.io")(webServer, {
  allowEIO3: true // false by default
});
// Serve the example and build the bundle in development.
if (process.env.NODE_ENV === "development") {
  const webpackMiddleware = require("webpack-dev-middleware");
  const webpack = require("webpack");
  const config = require("../webpack.dev");
  app.use(
    webpackMiddleware(webpack(config), {
      publicPath: "/dist/"
    })
  );
}

io.engine.on("connection_error", (err) => {
  console.log(err);
});

const rooms = {};

io.on("connection", socket => {
  console.log("user connected", socket.id);
  let curRoom = null;

  socket.on("joinRoom", data => {
    const { room } = data;
    if (!rooms[room]) {
      rooms[room] = {
        name: room,
        occupants: {},
      };
    }

    const joinedTime = Date.now();
    rooms[room].occupants[socket.id] = joinedTime;
    curRoom = room;

    console.log(`${socket.id} joined room ${room}`);
    socket.join(room);

    socket.emit("connectSuccess", { joinedTime });

    // add multicmam here?

    const occupants = rooms[room].occupants;
    //experimental to see if can return count of total connected
    io.in(curRoom).emit("occupantsChanged", { occupants });
    socket.emit('getCount', { occupants } )
  });

  socket.on("send", data => {
    io.to(data.to).emit("send", data);
  });

  socket.on("broadcast", data => {
    socket.to(curRoom).broadcast.emit("broadcast", data);
  });

  socket.on("disconnect", () => {
    console.log('disconnected: ', socket.id, curRoom);
    if (rooms[curRoom]) {
      console.log("user disconnected", socket.id);

      delete rooms[curRoom].occupants[socket.id];
      const occupants = rooms[curRoom].occupants;
      socket.to(curRoom).broadcast.emit("occupantsChanged", { occupants });

      if (occupants == {}) {
        console.log("everybody left room");
        delete rooms[curRoom];
      }
    }
  });
});

webServer.listen(port, () => {
  console.log("listening on http://localhost:" + port);
});
