const session = require('express-session');
const redis = require("redis");
const connectRedis = require("connect-redis");
const cookieParser = require('cookie-parser');

const RedisStore = connectRedis(session);
const RedisClient = redis.createClient({ legacyMode: true });


RedisClient
  .connect()
  .then(() => console.log("Connected to redis"))
  .catch((e) => {
    console.log("Cannot connect to redis");
    throw e;
  });

module.exports = app => {
  app.use(cookieParser());
  app.use(session({
    store: new RedisStore({ client: RedisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false
  }));
}