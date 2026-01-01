// src/middleware/roleMiddleware.js
const ApiResponse = require('../utils/response');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res, 
        `Access denied. Required role: ${allowedRoles.join(' or ')}`
      );
    }

    next();
  };
};

// Shorthand middlewares
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Authentication required');
  }

  if (req.user.role !== 'ADMIN') {
    return ApiResponse.forbidden(res, 'Access denied. Admin role required');
  }

  next();
};

const isTeamOwner = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Authentication required');
  }

  if (req.user.role !== 'TEAM_OWNER') {
    return ApiResponse.forbidden(res, 'Access denied. Team Owner role required');
  }

  next();
};

const isAdminOrOwner = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Authentication required');
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEAM_OWNER') {
    return ApiResponse.forbidden(res, 'Access denied. Admin or Team Owner role required');
  }

  next();
};

module.exports = {
  roleMiddleware,
  isAdmin,
  isTeamOwner,
  isAdminOrOwner
}; 