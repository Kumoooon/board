var express = require("express");
var router = express.Router();
var User = require("../models/User");

// Index
//.sort()로 찾은 값 정려.
//parameter로 {username:1}이 들어간다.
// 1: 오름차순 -1 : 내림차순(username 기준)
//.exec 함수를 이용해 함수를 끼워넣는다
//값을 찾는 콜백함수에, 정렬함수를 끼워넣은 것
router.get("/", function (req, res) {
  User.find({})
    .sort({ username: 1 })
    .exec(function (err, users) {
      if (err) return res.json(err);
      res.render("users/index", { users: users });
    });
});

// New
router.get("/new", function (req, res) {
  res.render("users/new");
});

// create
router.post("/", function (req, res) {
  User.create(req.body, function (err, user) {
    if (err) return res.json(err);
    res.redirect("/users");
  });
});

// show
router.get("/:username", function (req, res) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) return res.json(err);
    res.render("users/show", { user: user });
  });
});

// edit
router.get("/:username/edit", function (req, res) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) return res.json(err);
    res.render("users/edit", { user: user });
  });
});

// update
//models에서 password는 읽어오지 않도록 해 두었지만,
//select('password')를 통해서 읽어옴.
router.put("/:username", function (req, res, next) {
  User.findOne({ username: req.params.username })
    .select("password")
    .exec(function (err, user) {
      if (err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword
        ? req.body.newPassword
        : user.password;
      for (var p in req.body) {
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function (err, user) {
        if (err) return res.json(err);
        res.redirect("/users/" + user.username);
      });
    });
});

// destroy
router.delete("/:username", function (req, res) {
  User.deleteOne({ username: req.params.username }, function (err) {
    if (err) return res.json(err);
    res.redirect("/users");
  });
});

module.exports = router;
