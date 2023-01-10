const models = require("../models");
const { adminGroups } = require("../middlewares/2-admin.js");

module.exports = {

  findPriorityGroup: async (req, res, next) => {
    req.session.middlewareGroup = (await models.User_Group.findOne({
      where: {
        UserId: req.user.id
      }, 
      order: [
        ['GroupId', 'ASC']
      ]
    })).GroupId;
    req.session.admin = Boolean(adminGroups[req.session.middlewareGroup]);
    next();
  }

};