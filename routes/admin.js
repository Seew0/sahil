const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middlewares/auth');
const { getAllUsers, addUser, updateUser, deleteUser } = require('../utils/googleSheets');

// Enhanced debug middleware

// Dashboard Home
router.get('/', ensureAdmin, async (req, res) => {
    try {
        console.log('[ADMIN] Fetching users from Google Sheets...');
        const users = await getAllUsers();
        
        console.log(`[ADMIN] Fetched ${users.length} users`);
        console.log('User data:', users);
        if (users.length > 0) {
            console.log('First user sample:', {
                email: users[0][0],
                role: users[0][2]
            });
        }

        res.render('dashboards/admin', {
            title: 'Admin Dashboard',
            user: req.session.user,
            users: formatUsersForDisplay(users),
            success: req.query.success,
            error: req.query.error,
            layout: './layouts/main'
        });

    } catch (error) {
        console.error('[ADMIN ERROR] Dashboard error:', {
            message: error.message,
            stack: error.stack
        });
        
        res.status(500).render('dashboards/admin', {
            title: 'Admin Dashboard',
            user: req.session.user,
            users: [],
            error: 'Failed to load user data. Please check server logs.',
            layout: './layouts/main'
        });
    }
});

// Add User
router.post('/users', ensureAdmin, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.redirect('/dashboard/admin?error=Missing required fields');
        }

        console.log(`[ADMIN] Adding user: ${email} (${role})`);
        const success = await addUser(email, password, role);
        
        if (!success) throw new Error('Failed to write to Google Sheets');
        
        console.log(`[ADMIN] Successfully added user: ${email}`);
        res.redirect('/dashboard/admin?success=User added successfully');

    } catch (error) {
        console.error('[ADMIN ERROR] Add user error:', error);
        res.redirect(`/dashboard/admin?error=${encodeURIComponent(error.message)}`);
    }
});

// Update User
router.post('/users/:email', ensureAdmin, async (req, res) => {
    try {
        const { newEmail, password, role } = req.body;
        const oldEmail = req.params.email;
        
        console.log(`[ADMIN] Updating user ${oldEmail} to:`, {
            newEmail,
            newRole: role
        });

        const success = await updateUser(oldEmail, {
            email: newEmail,
            password,
            role
        });

        if (!success) throw new Error('Update failed in Google Sheets');
        
        console.log(`[ADMIN] Successfully updated user: ${oldEmail} → ${newEmail}`);
        res.redirect('/dashboard/admin?success=User updated successfully');

    } catch (error) {
        console.error('[ADMIN ERROR] Update user error:', error);
        res.redirect(`/dashboard/admin?error=${encodeURIComponent(error.message)}`);
    }
});

// Delete User
router.post('/users/:email/delete', ensureAdmin, async (req, res) => {
    try {
        const email = req.params.email;
        console.log(`[ADMIN] Deleting user: ${email}`);

        const success = await deleteUser(email);
        if (!success) throw new Error('Delete failed in Google Sheets');
        
        console.log(`[ADMIN] Successfully deleted user: ${email}`);
        res.redirect('/dashboard/admin?success=User deleted successfully');

    } catch (error) {
        console.error('[ADMIN ERROR] Delete user error:', error);
        res.redirect(`/dashboard/admin?error=${encodeURIComponent(error.message)}`);
    }
});

// Helper function to format users for display
function formatUsersForDisplay(users) {
    console.log('[ADMIN] Formatting users for display:', users);
    return users.map(user => ({
        email: user[0],
        password: user[1], // Note: In production, you shouldn't expose passwords
        role: user[2],
        // Add any additional formatting here
    }));
}

module.exports = router;