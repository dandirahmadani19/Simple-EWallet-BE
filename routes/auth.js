const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { limiterLogin } = require('../middlewares/rateLimiter');

router.post('/register', authController.register);
router.post('/login', limiterLogin, authController.login);

module.exports = router;
