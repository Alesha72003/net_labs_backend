const { mustAuthenticated, itsMe, hashPassword } = require("../tools/authTools");
const { whiteListBodyParams } = require("../tools/security");
const models = require("../models");

const express = require("express");
const router = express.Router();

router.get('//', (req, res) => {
  if (!req.user) {
    return res.status(401).send("Not authorized");
  }
  console.log(req.user)
  return res.send({
    id: req.user.id,
    username: req.user.username,
    admin: req.session.admin,
    canUpdate: true,
    Groups: req.user.Groups
  })
});

router.get('/:id', mustAuthenticated, async (req, res) => {
  const data = await models.User.findOne({
    attributes: ['id', 'username'],
    where: {
      id: req.params.id
    },
    include: {
      model: models.Group,
      attributes: ['id', 'name'],
      required: true,
      include: req.params.id == req.user.id ? null : {
        model: models.User,
        attributes: ['id'],
        required: true,
        where: req.user.id
      }
    }
  });
  if (!data) {
    return res.status(404).send("User not found");
  }
  data.dataValues.Groups = data.dataValues.Groups.map(({id, name}) => ({id, name}));
  return res.send(data.dataValues);
});

router.put('/:id', 
  mustAuthenticated,
  whiteListBodyParams(['username', 'password']),
  itsMe,
  async (req, res) => {
    const record = await models.User.findOne({
      attributes: ['id'],
      where: {
        id: req.params.id
      }
    });
    if ('password' in req.body) {
      req.body.passwordhash = hashPassword(req.body.password);
      delete req.body.password;
    }
    await record.update(req.body);
    return res.send("OK");
  }
);

router.delete('/:id',
  mustAuthenticated,
  itsMe,
  async (req, res) => {
    const record = await models.User.findOne({
      attributes: ['id'],
      where: {
        id: req.params.id
      }
    });
    await record.destroy();
    req.logout(err => console.log(err));
    return res.send("OK");
  }
);

module.exports = {
  '/user': router
};