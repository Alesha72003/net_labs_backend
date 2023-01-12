const { createProxyMiddleware } = require('http-proxy-middleware');

const permissions = {
  1: createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }),
  2: createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }),
};

module.exports = app => {}

module.exports.adminGroups = Object.keys(permissions);
module.exports.permissions = permissions;