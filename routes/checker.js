const express = require('express');
const router = express.Router();
const { ensureChecker } = require('../middlewares/auth');
const { getFormSubmissions, updateSubmission } = require('../utils/formSubmissions');

// Enhanced debug middleware
router.use((req, res, next) => {
    console.log(`[CHECKER] ${req.method} ${req.originalUrl}`);
    next();
});

router.get('/', ensureChecker, async (req, res) => {
    try {
      console.log('Fetching submissions for checker...');
      
      // Get submissions for all form types
      const submissions = {};
      const formTypes = ['form1', 'form2', 'form3'];
      
      await Promise.all(formTypes.map(async (formType) => {
        try {
          submissions[formType] = await getFormSubmissions(formType);
        } catch (error) {
          console.error(`Error loading ${formType} submissions:`, error);
          submissions[formType] = [];
        }
      }));
  
      res.render('dashboards/checker', {
        title: 'Checker Dashboard',
        user: req.session.user,
        submissions,
        success: req.query.success,
        activeTab: 'form1', // Add this line to set default active tab
        layout: './layouts/main'
      });
  
    } catch (error) {
      console.error('Checker dashboard error:', error);
      res.status(500).render('dashboards/checker', {
        title: 'Checker Dashboard',
        user: req.session.user,
        submissions: {},
        error: 'Failed to load submissions',
        activeTab: 'form1', // Also add to error case
        layout: './layouts/main'
      });
    }
  });

// Approval route
router.post('/approve/:formType/:timestamp', ensureChecker, async (req, res) => {
    try {
        const { formType, timestamp } = req.params;
        const { comments, ...formData } = req.body;
        
        console.log(`[CHECKER] Approving ${formType} submission from ${timestamp}`);
        
        const success = await updateSubmission(
            formType,
            timestamp,
            {
                status: 'Approved',
                comments,
                checker: req.session.user.email,
                checkDate: new Date().toISOString(),
                ...formData
            }
        );

        if (!success) throw new Error('Failed to update Google Sheet');

        console.log(`[CHECKER] Successfully approved ${formType} submission`);
        res.redirect('/dashboard/checker?success=approved');

    } catch (error) {
        console.error('[CHECKER ERROR] Approval failed:', error);
        res.redirect(`/dashboard/checker?error=${encodeURIComponent('Approval failed: ' + error.message)}`);
    }
});

// Rejection route
router.post('/reject/:formType/:timestamp', ensureChecker, async (req, res) => {
    try {
        const { formType, timestamp } = req.params;
        const { comments, ...formData } = req.body;
        
        console.log(`[CHECKER] Rejecting ${formType} submission from ${timestamp}`);
        
        const success = await updateSubmission(
            formType,
            timestamp,
            {
                status: 'Rejected',
                comments,
                checker: req.session.user.email,
                checkDate: new Date().toISOString(),
                ...formData
            }
        );

        if (!success) throw new Error('Failed to update Google Sheet');

        console.log(`[CHECKER] Successfully rejected ${formType} submission`);
        res.redirect('/dashboard/checker?success=rejected');

    } catch (error) {
        console.error('[CHECKER ERROR] Rejection failed:', error);
        res.redirect(`/dashboard/checker?error=${encodeURIComponent('Rejection failed: ' + error.message)}`);
    }
});

module.exports = router;