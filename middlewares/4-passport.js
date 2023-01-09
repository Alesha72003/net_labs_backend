const passport = require("passport");
const LocalStrategy = require('passport-local');
const models = require('./models');
const crypto = require('crypto');
const { findPriorityGroup } = require("../tools/admin");
const { adminGroups } = require("./2-admin.js");

passport.use(new LocalStrategy((username, passport, cb) => {
  models.User.findOne({
    where: {
      username
    },
    include: {
      model: models.Group,
      attributes: ["id", "name"]
    }
  }).then(user => {
    if (!user) {
      return cb(null, false);
    }
    const hash = crypto.createHash('sha256').update(password).digest("hex");
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
        admin: Boolean(adminGroups[req.session.middlewareGroup]),
        canUpdate: true,
        Groups: req.user.Groups
      })
  );
};