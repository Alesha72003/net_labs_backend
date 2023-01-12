const { permissions } = require("../middlewares/2-admin");
const { mustAuthenticated } = require("../tools/authTools");

const express = require("express");
const router = express.Router();

router.use(mustAuthenticated, async (req, res) => {
  if (permissions[req.session.middlewareGroup]) {
    permissions[req.session.middlewareGroup](req, res);
  } else {
    return res.status(403).send("Access denied");
  }
});

module.exports = {
  '/admin': router
};