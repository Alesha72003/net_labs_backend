const { createProxyMiddleware } = require('http-proxy-middleware');

const permissions = {
  1: createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }),
  2: createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }),
  3: createProxyMiddleware({ target: 'http://localhost:3333', changeOrigin: true }),
};

module.exports = app => {}

module.exports.adminGroups = new Set(Object.keys(permissions));
module.exports.permissions = permissions;