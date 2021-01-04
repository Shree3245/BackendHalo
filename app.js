require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const app = express();
var server = app.listen(3000, () =>
  console.log("server running on port:" + 3000)
);
var io = require("socket.io")(server);
var logger = require("morgan");
var methodOverride = require("method-override");
var session = require("express-session");
var bodyParser = require("body-parser");
var multer = require("multer");
var errorHandler = require("errorhandler");
const path = require("path");
const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");
const debug = require("debug")("shree-express:server");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const filesRouter = require("./routes/files");

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

//Create a file limit size
app.use(bodyParser({ limit: "50mb" }));
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

// from here on is the io based functions
let sockets = [];
io.on("connection", (socket) => {
  //take new client ip addr and port which they connected from
  var address = socket.request.connection;
  var clientAddress = `${address.remoteAddress}:${address.remotePort}`;
  console.log(`new client connected: ${clientAddress}`);
  sockets.push(socket);
  // List out all the current IPs
  // TODO: remove the following code block
  console.log(`IPs listed as follows: `);
  sockets.forEach((sock) => {
    var sockAddress = sock.request.connection;
    var clientSockAddress = `${sockAddress.remoteAddress}:${sockAddress.remotePort}`;
    console.log(`       ${clientSockAddress}`);
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
      var sockAddress = sock.request.connection;
      var sockClientAddress = `${sockAddress.remoteAddress}:${sockAddress.remotePort}`;
      console.log(sock.remotePort);
      sock.write("sup suckwad you were lucky this time");
      socket.write(`address---${sockClientAddress}`);
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
