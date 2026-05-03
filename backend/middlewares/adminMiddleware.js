const catchAsync = require('../utils/catchAsync');

/**
 * Admin-only middleware.
 * Must be placed AFTER the `protect` middleware.
 * Returns 403 if the authenticated user is not an admin.
 */
exports.adminOnly = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
});
