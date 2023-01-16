const passport = require("passport");
const LocalStrategy = require('passport-local');
const models = require('../models');
const crypto = require('crypto');
const { findPriorityGroup } = require("../tools/admin");
const { adminGroups } = require("../middlewares/2-admin.js");
const { hashPassword } = require("../tools/authTools");

let onLogoutMiddlewares = [];

passport.use(new LocalStrategy((username, password, cb) => {
  models.User.findOne({
    where: {
      username,
      isworker: true
    },
    include: {
      model: models.Group,
      attributes: ["id", "name"]
    }
  }).then(user => {
    if (!user) {
      return cb(null, false);
    }
    const hash = hashPassword(password);
    if (!crypto.timingSafeEqual(Buffer.from(user.passwordhash), Buffer.from(hash))) {
      return cb(null, false);
    }
    return cb(null, user);
  }).catch(e => {
    return cb(e);
  });
}));

passport.serializeUser((userObj, done) => { done(null, userObj) });
passport.deserializeUser((userObj, done) => { done(null, userObj) });

module.exports = app => {
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(passport.authenticate('session'));
  
  app.post('/login', 
    passport.authenticate('local'), 
    findPriorityGroup,
    async (req, res) => 
      res.send({
        id: req.user.id,
        username: req.user.username,
        admin: req.session.admin,
        canUpdate: true,
        Groups: req.user.Groups
      })
  );

  app.use('/logout', (req, res, next) => {
    if (!req.user) {
      return res.send("OK");
    }
    const oldSession = req.session;
    req.logout(err => {
      if (err) {
        return res.status(500).send(err.toString());
      }
      onLogoutMiddlewares.forEach(f => f(req, oldSession));
      return res.send("OK");
    });
  });
};

module.exports.onLogout = f => onLogoutMiddlewares.push(f);