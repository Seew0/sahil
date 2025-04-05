const express = require('express');
const router = express.Router();
const { ensureDrafter } = require('../middlewares/auth');
const { submitForm } = require('../utils/formSubmissions');

// Drafter dashboard
router.get('/', ensureDrafter, (req, res) => {
    res.render('dashboards/drafter', {
        title: 'Drafter Dashboard'
    });
});

// Form routes
router.get('/form1', ensureDrafter, (req, res) => {
    res.render('drafters/form1', { title: 'Form 1' });
});

router.post('/submit/form1', ensureDrafter, async (req, res) => {
    try {
        const success = await submitForm('form1', {
            drafterEmail: res.locals.user.email,
            field1: req.body.field1,
            field2: req.body.field2
        });
        if (success) res.redirect('/dashboard?success=form1');
        else res.status(500).send('Error submitting form');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting form');
    }
});

// Similar routes for form2 and form3...

module.exports = router;