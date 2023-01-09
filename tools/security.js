export function whiteListBodyParams(whiteList) {
  const accepted = new Set(whiteList);
  return (req, res, next) => {
    if (!Object.keys(req.body).map(el => accepted.has(el)).reduce((el, base) => base = base && el, true)) {
      const notAcceptedItems = Object.keys(req.body).filter(el => !accepted.has(el))
      return res.status(400).send(`'${notAcceptedItems.join('\', \'')}' is protected or not valid items`);
    }
    next();
  }
}