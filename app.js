require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const debug = require("debug")("shree-express:server");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const filesRouter = require("./routes/files");

const app = express();
var io = require("socket.io")(server);

// DB Setup
mongoose
  .connect(process.env.DB_CONECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((val) => console.log("Connected to DB"))
  .catch((err) => {
    if (err) {
      console.log(`Fuck, didn't connect to DB: ${err}`);
    }
  });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/files", filesRouter);
var server = require("http").createServer(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Respond with error message
  res.status(err.status || 500);
  res.json({ error: res.locals.error, message: res.locals.message });
});

// starting socket based functions from here

io.on("connection", (socket) => {
  //take new client ip addr and port which they connected from
  var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`new client connected: ${clientAddress}`);
  sockets.push(socket);
  // List out all the current IPs
  // TODO: remove the following code block
  console.log(`IPs listed as follows: `);
  sockets.forEach((sock) => {
    console.log(`      ${sock.remoteAddress}:${sock.remotePort}`);
  });

  //connect to other open socket ports
  socket.on("data", (data) => {
    /// For debug purpose only
    /// Print out incoming data
    /// TODO: Remove this print statement pls
    var data = data + "";
    console.log(`${clientAddress}: ${data}`);

    /// Check if user wants to read/write
    const incoming = data.split("---");
    if (incoming[0] === "write") {
      const sock = _.sample(sockets);
      console.log(sock.remotePort);
      sock.write("sup suckwad you were lucky this time");
      socket.write(`address---${sock.remoteAddress}:${sock.remotePort}`);
    } else if (incoming[0] === "read") {
      const incomming = incoming[1].split(":");
      const ip = incomming[0];
      const portI = incomming[1];
      //Debug print right here =>
      console.log(`asdfasdfasdfasfa ${ip}:${portI}`);
      sockets.forEach((sock) => {
        console.log(
          `sock port is ${typeof sock.remotePort} looking for port ${portI}`
        );
        if (sock.remotePort === parseInt(portI)) {
          console.log(sock.remotePort);
          sock.write("give me the data fuckwad");
        }
      });
    }

    //May not require this codeblock as it uses a broadcast feature
    // Currently commenting for future use
    //
    //
    // sockets.forEach((sock) => {
    //   if (sock.remotePort === socket.remotePort) {
    //     // here we can return data to og user
    //   }
    //   sock.write(`${sock.remoteAddress}:${sock.remotePort} said ${data}\n`);
    // });
  });

  //if user closed then remove from
  socket.on("close", (data) => {
    const index = sockets.findIndex((o) => {
      return (
        o.remoteAddress === socket.remoteAddress &&
        o.remotePort === socket.remotePort
      );
    });
    if (index !== -1) sockets.splice(index, 1);
    sockets.forEach((sock) => {
      sock.write(`${clientAddress} disconnected\n`);
    });
    // write out error messages to server
    console.log(`connection closed: ${clientAddress}`);
    // Iterate through remaining ports
    console.log("Remaining ports: ");
    sockets.forEach((sock) => {
      console.log(`       ${sock.remoteAddress}:${sock.remotePort}`);
    });
  });

  socket.on("error", (err) => {
    console.log(`Error occurred in ${clientAddress}: ${err.message}`);
  });
});

module.exports = app;
