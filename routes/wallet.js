const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const walletController = require('../controllers/walletController');
const { limiterTransfer } = require('../middlewares/rateLimiter');

router.get('/me', authenticate, (req, res) => {
  res.json({
    message: 'Protected route',
    user: req.user, // dari JWT payload
  });
});

router.post('/topup', authenticate, walletController.topUp);
router.post('/transfer', authenticate, limiterTransfer, walletController.transfer);
router.get('/transactions', authenticate, walletController.getTransactions);
router.get('/balance', authenticate, walletController.getBalance);

module.exports = router;
