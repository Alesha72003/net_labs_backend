const { debug } = require("../config/debug.json");

module.exports = {
  debugOnly: (req, res, next) => debug ? next(): res.status(403).send("Only for debug")
}