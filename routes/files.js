const { json } = require("express");
const express = require("express");
const User = require("../models/User");
const File = require("../models/Files");
const debug = require("debug")("shree-express:server");
const uuid = require("uuid");
const router = express.Router();

router.post("/add", (req, res, next) => {
  if (!req.body.username || !req.body.data || !req.body.filename) {
    res.status(401).json({ message: "No data passeds" });
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
  });
  // Doc found without errors, compare password

  const newFile = new File({
    id: uuid.v4(),
    username: req.body.username,
    data: req.body.data,
    filename: req.body.filename,
  });

  newFile
    .save()
    .then((doc) => {
      debug(`Created a new file ${JSON.stringify(doc, null, 2)}`);
      res.status(201).json({ message: "File added succesfully", id: doc._id });
    })
    .catch((err) => {
      debug(`Failed to create a new user: ${err}`);
      res.status(500).json({ message: `Couldn't register new user: ${err}` });
    });
});

router.post("/fileDownload", function (req, res) {
  if (!req.body.username) {
    res.status(401).json({ message: "No user to check for" });
    next();
  }
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) res.status(500).json({ message: err });
    if (!user) {
      res.status(501).json({ message: "Not on my database" });
    }
    if (!err) {
      File.findOne(
        { username: req.body.username, _id: req.body.id },
        function (err, doc) {
          res.status(201).json({ data: doc.data, filename: doc.filename });
        }
      );
    }
  });
});

router.post("/filesList", function (req, res) {
  if (!req.body.username) {
    res.status(401).json({ message: "No user to check for" });
    next();
  }
  User.findOne({ username: req.body.username }, (err, doc) => {
    if (err) res.status(500).json({ message: err });
    if (!doc) {
      res.status(501).json({ message: "Not on my database" });
    }
    if (!err) {
      File.find({ username: req.body.username }, function (err, doc) {
        var userMap = {};

        doc.forEach(function (user) {
          userMap[user._id] = user.filename;
        });

        res.status(201).send(userMap);
      });
    }
  });
});

module.exports = router;
