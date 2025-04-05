const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');

// Import route files
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const drafterRoutes = require('./drafter');
const checkerRoutes = require('./checker');

// Mount routes
router.use('/', authRoutes);
router.use('/dashboard', ensureAuthenticated, (req, res, next) => {
    // Common dashboard middleware
    res.locals.user = req.session.user;
    next();
});

// Dashboard sub-routes
router.use('/dashboard/admin', adminRoutes);
router.use('/dashboard/drafter', drafterRoutes);
router.use('/dashboard/checker', checkerRoutes);

// Main dashboard route
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    const { role } = req.session.user;
    const title = `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`;
    
    res.render(`dashboards/${role.toLowerCase()}`, {
        title,
        user: req.session.user
    });
});

module.exports = router;