const models = require("../models");
const { mustAuthenticated } = require("../tools/authTools");

const express = require("express");
const router = express.Router();

router.get("/:id", mustAuthenticated, async (req, res) => {
  let group = await models.Group.findOne({
    attributes: ['id', "name"],
    where: {
      id: req.params.id
    },
    include: {
      model: models.User,
      required: true,
      attributes: ['id'],
      where: {
        id: req.user.id
      }
    }
  });
  if (!group) {
    return res.status(404).send("Not found");
  }

  const users = await models.User.findAll({
    attributes: ['id', 'username'],
    include: {
      model: models.Group,
      attributes: ['id'],
      where: {
        id: req.params.id
      }
    }
  });
  users.forEach(el => { delete el.dataValues.Groups; });
  group.dataValues.Users = users;
  return res.send(group.dataValues);
});

module.exports = {
  '/group': router
};