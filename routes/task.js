const { mustAuthenticated, checkAccessToTask } = require("../tools/authTools");
const { whiteListBodyParams } = require("../tools/security");
const { debugOnly } = require("../tools/debug");
const Sequelize = require("sequelize");
const models = require("../models");

const express = require("express");
const router = express.Router();

router.get('//', mustAuthenticated, async (req, res) => {
  let whereClause = {}
  if (req.query.title) {
    whereClause.taskname = {
      [Sequelize.Op.like]: `%${req.query.title}%`
    }
  }
  if (req.query.group && !Number.isNaN(Number(req.query.group))) {
    whereClause.GroupId = Number(req.query.group);
  }
  const check = {
    NEW: req.query.new,
    "IN WORK": req.query.in_work,
    COMPLETED: req.query.completed
  };
  if (!Object.keys(check).reduce((acc, el) => acc && (check[el] === 'true'), true)) {
    whereClause.status = {
      [Sequelize.Op.in]: Object.keys(check).filter(el => (check[el] === 'true'))
    }
  }
  let data = await models.Task.findAll({
    attributes: ['id', 'taskname'],
    where: whereClause,
    include: {
      model: models.Group,
      attributes: ['id'],
      required: true,
      include: {
        model: models.User,
        attributes: ['id'],
        required: true,
        where: {
          id: req.user.id
        }
      }
    },
    order: [
      ['createdAt', 'ASC']
    ]
  });
  data.forEach(el => { delete el.dataValues.Group; });
  return res.send(data);
});

router.get('/:id', mustAuthenticated, checkAccessToTask, async (req, res) => {
  const data = await models.Task.findOne({
    where: {
      id: req.params.id
    },
    include: {
      model: models.Group,
      attributes: ['id', 'name'],
    }
  });
  if (!data) {
    return res.status(404).send("Task not found");
  }
  return res.send(data);
});

router.put('/:id', 
  mustAuthenticated, 
  checkAccessToTask, 
  whiteListBodyParams(
    ['taskname', 'description', 'status', 'deadlineAt']
  ),
  async (req, res) => {
    const record = await models.Task.findOne({
      attributes: ['id'],
      where: {
        id: req.params.id
      }
    });
    if (!record) {
      return res.status(404).send("Not found task");
    }
    
    record.update(req.body);
    return res.send('OK');
  }
);

router.post('/create', mustAuthenticated, debugOnly, async (req, res) => {
  const newtask = await models.Task.create(req.body);
  //newtask.reload();
  return res.status(201).send(newtask);
});

router.delete('/:id',
  mustAuthenticated,
  checkAccessToTask,
  debugOnly,
  async (req, res) => {
    const record = await models.Task.findOne({
      attributes: ['id'],
      where: {
        id: req.params.id
      }
    });

    if (!record) {
      return res.status(404).send("Task not found");
    }

    await record.destroy();
    return res.send("OK");
  }
);

module.exports = {
  '/task': router
};