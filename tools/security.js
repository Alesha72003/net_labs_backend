module.exports = {

  whiteListBodyParams: (whiteList) => {
    const accepted = new Set(whiteList);
    return (req, res, next) => {
      const notAcceptedItems = Object.keys(req.body).filter(el => !accepted.has(el))
      if (notAcceptedItems.length > 0) {
        return res.status(400).send(`'${notAcceptedItems.join('\', \'')}' is protected or not valid items`);
      }
      next();
    }
  }

};