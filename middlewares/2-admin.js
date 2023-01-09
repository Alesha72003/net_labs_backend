const { createProxyMiddleware } = require('http-proxy-middleware');
const { mustAuthenticated } = require("../tools/authTools");

const permissions = {
  1: createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }),
  2: createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }),
};

module.exports = app => {
  app.use("/admin", mustAuthenticated, async (req, res) => {
    if (permissions[req.session.middlewareGroup]) {
      permissions[req.session.middlewareGroup](req, res);
    } else {
      return res.status(403).send("Access denied");
    }
  });
}

module.exports.adminGroups = Object.keys(permissions);