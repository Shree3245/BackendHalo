const { json } = require("express");
const express = require("express");
const User = require("../models/User");
const File = require("../models/Files");
const debug = require("debug")("shree-express:server");
const uuid = require("uuid");
const router = express.Router();

router.post("/add", (req, res, next) => {
  console.log(req.body);
  if (!req.body.username || !req.body.data || !req.body.filename) {
    res.status(401).json({ message: "No data passed" });
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

    if (!err) {
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
          res.status(201).json({ message: "File added succesfully" });
        })
        .catch((err) => {
          debug(`Failed to create a new user: ${err}`);
          res
            .status(500)
            .json({ message: `Couldn't register new user: ${err}` });
        });
    } else {
      console.log(req.body.password);
      console.log(doc.data);
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
