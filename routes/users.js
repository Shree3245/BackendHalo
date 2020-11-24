const { json } = require("express");
const express = require("express");
const User = require("../models/User");
const debug = require("debug")("shree-express:server");

const router = express.Router();

router.post("/register", (req, res, next) => {
  // Check if user and password parameters are set
  if (req.body.username && req.body.password) {
    // Check if user exists
    User.findOne({ username: req.body.username })
      .then((doc) => {
        if (!doc) {
          // Doesn't exist, create one
          const newUser = new User({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
          });
          // We're constructing and saving rather than using
          // User.create() because our pre-save hook is only
          // called when we use the save method, and we need
          // the pre-save hook to hash the password
          newUser
            .save()
            .then((doc) => {
              debug(`Created a new user: ${JSON.stringify(doc, null, 2)}`);
              res.status(201).json({ message: "User successfully registered" });
            })
            .catch((err) => {
              debug(`Failed to create a new user: ${err}`);
              res
                .status(500)
                .json({ message: `Couldn't register new user: ${err}` });
            });
        } else {
          // A user with the username already exists, return errorsaa
          res.status(400).json({
            message: `${req.body.username} already exists in the DB `,
          });
        }
      })
      .catch((reason) => {
        res.status(500).json({ message: `Internal error ${reason}` });
      });
  } else {
    res.status(401).json({ message: "Invalid form" });
  }
});

router.post("/login", (req, res, next) => {
  console.log(req.body);
  if (!req.body.username || !req.body.password) {
    res.status(401).json({ message: "No username/password passed" });
    next();
  }

  // Validate credential
  User.findOne({ username: req.body.username }, (err, doc) => {
    if (err) res.status(500).json({ message: `Fucking shit myself: ${err}` });

    if (!doc) {
      res
        .status(401)
        .json({ message: "You don't exist on my database asshole" });
    }

    // Doc found without errors, compare password

    if (doc.password === req.body.password) {
      res.status(201).json({ message: "User successfully logged in" });
    } else {
      console.log(req.body.password);
      console.log(doc.password);
      res
        .status(401)
        .json({ message: "You don't exist on my database asshole" });
    }
  });
});

router.get("/usersList", function (req, res) {
  User.find({}, function (err, users) {
    var userMap = {};

    users.forEach(function (user) {
      userMap[user._id] = user;
    });

    res.send(userMap);
  });
});

module.exports = router;
