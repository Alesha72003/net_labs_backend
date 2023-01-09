const express = require("express");
const passport = require("passport");
const router = expres.Router();

// /login : middlewares/2-passport.js

router.use('/logout', (req, res) => {
  if (!req.user) {
    return res.send("OK");
  }
  req.logout(err => 
    err ? res.status(500).send(err.toString()) : res.send("OK")
  );
});