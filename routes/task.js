const { mustAuthenticated, checkAccessToTask } = require("../tools/authTools");
const { whiteListBodyParams } = require("../tools/security");
const { debugOnly } = require("../tools/debug");
const { on } = require("../middlewares/5-ws");
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
  if (req.ws) {
    (req.ws.subscribtions || []).forEach(el => {
      subscribes[el].splice(subscribes[el].indexOf(req.ws), 1);
    })
    data.forEach(el => {
      if (!subscribes[el.id]) {
        subscribes[el.id] = [];
      }
      subscribes[el.id].push(req.ws);
    });
    req.ws.subscribtions = data.map(el => el.id);
  }
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

on("close", ws => {
  (ws.subscribtions || []).forEach(el => { 
    subscribes[el].splice(subscribes[el].indexOf(ws), 1);
  })
});

let subscribes = {};

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
    if (subscribes[req.params.id] != undefined) {
      subscribes[req.params.id].forEach(el => {
        el.send(JSON.stringify({
          type: "list/updateListItem",
          payload: {id: Number(req.params.id), ...req.body}
        }));
      });
    }
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



router.post("/:id/subscribe", (req, res) => {
  if (subscribes[req.params.id] === undefined ) {
    subscribes[req.params.id] = [];
  }
  subscribes[req.params.id].push(req.ws);
  return res.send("OK");
})

router.post("/:id", (req, res) => {
  delete subscribes[req.params.id][req.ws];
  return res.send("OK");
});

module.exports = {
  '/task': router
}