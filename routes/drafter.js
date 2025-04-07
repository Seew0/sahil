const express = require('express');
const router = express.Router();
const { ensureDrafter } = require('../middlewares/auth');
const { submitForm } = require('../utils/formSubmissions');

// Enhanced debug middleware
router.use((req, res, next) => {
    console.log(`[DRAFTER] ${req.method} ${req.originalUrl}`);
    next();
});

// Drafter Dashboard
router.get('/', ensureDrafter, (req, res) => {
    res.render('dashboards/drafter', {
        title: 'Drafter Dashboard',
        user: req.session.user,
        success: req.query.success,
        error: req.query.error,
        layout: './layouts/main'
    });
});

// Form Routes
router.get('/form1', ensureDrafter, (req, res) => {
    res.render('drafters/form1', {
        title: 'Form 1 - Drafting',
        user: req.session.user,
        error: req.query.error || null,  // Add this line
        layout: './layouts/main'
    });
});
router.post('/submit/form1', ensureDrafter, async (req, res) => {
    try {
        const submissionData = {
            drafter: req.session.user.email,
            timestamp: new Date().toISOString(),
            ...req.body
        };

        const success = await submitForm('form1', submissionData);
        
        if (success) {
            return res.redirect('/dashboard/drafter?success=Form submitted successfully');
        }
        return res.redirect('/dashboard/drafter/form1?error=Submission failed');
        
    } catch (error) {
        console.error('Form submission failed:', error);
        return res.redirect('/dashboard/drafter/form1?error=' + 
               encodeURIComponent(error.message));
    }
});

router.post('/submit/form2', ensureDrafter, async (req, res) => {
    try {
        const submissionData = {
            drafter: req.session.user.email,
            timestamp: new Date().toISOString(),
            ...req.body
        };

        const success = await submitForm('form2', submissionData);
        
        if (success) {
            return res.redirect('/dashboard/drafter?success=Form submitted successfully');
        }
        return res.redirect('/dashboard/drafter/form1?error=Submission failed');
        
    } catch (error) {
        console.error('Form submission failed:', error);
        return res.redirect('/dashboard/drafter/form2?error=' + 
               encodeURIComponent(error.message));
    }
});

router.post('/submit/form3', ensureDrafter, async (req, res) => {
    try {
        const submissionData = {
            drafter: req.session.user.email,
            timestamp: new Date().toISOString(),
            ...req.body
        };

        const success = await submitForm('form3', submissionData);
        
        if (success) {
            return res.redirect('/dashboard/drafter?success=Form submitted successfully');
        }
        return res.redirect('/dashboard/drafter/form1?error=Submission failed');
        
    } catch (error) {
        console.error('Form submission failed:', error);
        return res.redirect('/dashboard/drafter/form3?error=' + 
               encodeURIComponent(error.message));
    }
});

module.exports = router;