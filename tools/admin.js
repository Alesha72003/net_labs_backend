export async function findPriorityGroup(req, res, next) {
  req.session.middlewareGroup = (await models.User_Group.findOne({
    where: {
      UserId: req.user.id
    }, 
    order: [
      ['GroupId', 'ASC']
    ]
  })).GroupId;
  next();
}