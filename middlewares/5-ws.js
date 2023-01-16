const expressWs = require('express-ws');
const { onLogout } = require("./4-passport.js");

let handlers = [];

module.exports = (app) => {

  let sessions = {};

  expressWs(app);

  app.ws("/ws", (ws, req) => {
    sessions[req.session.id] = ws;
    handlers.filter(el => el.type != "logout").forEach(el => {
      ws.on(el.type, (e) => el.f(ws, e));
    })
  })

  app.use((req, res, next) => {
    req.ws = sessions[req.session.id];
    next();
  })

  onLogout((req, oldSession) => {
    sessions[req.session.id] = sessions[oldSession.id];
    delete sessions[oldSession.id];
    handlers.filter(el => el.type == "logout").forEach(el => {
      el.f(sessions[req.session.id], "logout");
    });
  })
};

module.exports.on = (type, f) => {
  handlers.push({type, f});
}

module.exports.on("close", (ws) => {
  console.log("Websocket closed")
})