const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');

// Import route files
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const drafterRoutes = require('./drafter');
const checkerRoutes = require('./checker');

// Mount routes
router.use('/auth', authRoutes);
router.use('/', authRoutes);

// Add this at the VERY TOP of your routes/index.js
// Dashboard redirect logic
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    const { role } = req.session.user;
    res.redirect(`/dashboard/${role}`);
});

// Role-specific routes
router.use('/dashboard/admin', ensureAuthenticated, adminRoutes);
router.use('/dashboard/drafter', ensureAuthenticated, drafterRoutes);
router.use('/dashboard/checker', ensureAuthenticated, checkerRoutes);

// Fallback for invalid roles
router.get('/dashboard/:role', ensureAuthenticated, (req, res) => {
    const validRoles = ['admin', 'drafter', 'checker'];
    if (!validRoles.includes(req.params.role)) {
        return res.status(404).render('error', { 
            title: 'Not Found',
            message: 'Invalid dashboard role'
        });
    }
    res.redirect(`/dashboard/${req.params.role}`);
});

module.exports = router;