function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
      return next();
  }
  res.redirect('/login');
}

function ensureAdmin(req, res, next) {
  if (req.session.user?.role === 'admin') {
      return next();
  }
  res.status(403).send('Access denied');
}

function ensureDrafter(req, res, next) {
  if (req.session.user?.role === 'drafter') {
      return next();
  }
  res.status(403).send('Access denied');
}

function ensureChecker(req, res, next) {
  if (req.session.user?.role === 'checker') {
      return next();
  }
  res.status(403).send('Access denied');
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  ensureDrafter,
  ensureChecker
};