const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middlewares/auth');
const { getAllUsers } = require('../utils/googleSheets');

router.get('/', ensureAdmin, async (req, res) => {
    try {
        const users = await getAllUsers();
        console.log('Fetched users:', users); // Debugging line to check fetched users
        res.render('dashboards/admin', {
            title: 'Admin Dashboard',
            user: req.session.user,  // Make sure user is passed
            users: users || []       // Ensure users is always an array
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).render('dashboards/admin', {
            title: 'Admin Dashboard',
            user: req.session.user,
            users: [],
            error: 'Failed to load user data'
        });
    }
});



// User management routes
router.post('/users', ensureAdmin, async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).send('Missing required fields');
    }

    const success = await addUser(email, password, role);
    if (success) res.redirect('/dashboard/admin');
    else res.status(500).send('Error adding user');
});

router.post('/users/:email', ensureAdmin, async (req, res) => {
    const success = await updateUser(req.params.email, {
        email: req.body.newEmail,
        password: req.body.password,
        role: req.body.role
    });
    if (success) res.redirect('/dashboard/admin');
    else res.status(500).send('Error updating user');
});

router.post('/users/:email/delete', ensureAdmin, async (req, res) => {
    const success = await deleteUser(req.params.email);
    if (success) res.redirect('/dashboard/admin');
    else res.status(500).send('Error deleting user');
});

module.exports = router;