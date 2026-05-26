/**
 * Middleware to restrict route access to Admin users only.
 * Assumes that an authentication middleware (like protect/requireAuth) 
 * has already run and populated `req.user`.
 */
export const adminOnly = (req, res, next) => {
  // 1. Check if the user object exists and has an 'admin' role
  if (req.user && req.user.role === 'admin') {
    // User is an admin, proceed to the next controller/middleware
    next();
  } else {
    // 2. Deny access if they are not an admin
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Administrator privileges required.' 
    });
  }
};