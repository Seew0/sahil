const express = require('express');
const router = express.Router();
const { getUserByEmail } = require('../utils/googleSheets');

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { error: null });
});

// Login handler
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const userData = await getUserByEmail(email);
    
    if (!userData || userData[1] !== password) { // Password is in column B
      return res.render('auth/login', { error: 'Invalid email or password' });
    }
    
    // Store user in session
    req.session.user = {
      email: userData[0],
      role: userData[2] // Role is in column C
    };
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('auth/login', { error: 'An error occurred during login' });
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;