const expressWs = require('express-ws');
const { onLogout } = require("./4-passport.js");

let handlers = [];

module.exports = (app) => {

  let sessions = {};

  expressWs(app);

  app.ws("/ws", (ws, req) => {
    sessions[req.session.id] = ws;
    handlers.forEach(el => {
      ws.on(el.type, (e) => el.f(ws, e));
    })
  })

  app.use((req, res, next) => {
    req.ws = sessions[req.session.id];
    next();
  })

  onLogout((req, oldSession) => {
    sessions[oldSession.id].close();
  })
};

module.exports.on = (type, f) => {
  handlers.push({type, f});
}