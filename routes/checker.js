const express = require('express');
const router = express.Router();
const { ensureChecker } = require('../middlewares/auth');
const { getFormSubmissions, updateSubmission } = require('../utils/formSubmissions');

// Checker dashboard
router.get('/', ensureChecker, async (req, res) => {
    try {
        const submissions = await getFormSubmissions('Pending');
        res.render('dashboards/checker', {
            title: 'Checker Dashboard',
            submissions: submissions || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading checker dashboard');
    }
});

// Approval routes
router.post('/approve/:submissionId', ensureChecker, async (req, res) => {
    try {
        const success = await updateSubmission(
            req.params.submissionId,
            'Approved',
            req.body.comments,
            res.locals.user.email
        );
        if (success) res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        else res.status(500).send('Error approving submission');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error approving submission');
    }
});

// Rejection route
router.post('/reject/:submissionId', ensureChecker, async (req, res) => {
    try {
        const success = await updateSubmission(
            req.params.submissionId,
            'Rejected',
            req.body.comments,
            res.locals.user.email
        );
        if (success) res.redirect('/dashboard/checker?success=rejected');
        else res.status(500).send('Error rejecting submission');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error rejecting submission');
    }
});

module.exports = router;