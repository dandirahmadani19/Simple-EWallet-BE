// File: controllers/walletController.js
const db = require('../config/db');

exports.topUp = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Jumlah tidak valid' });
  }

  try {
    // Update saldo
    await db.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userId]);

    // Simpan transaksi
    await db.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [userId, 'topup', amount, 'Top up saldo']
    );

    res.json({ message: 'Top up berhasil', amount });
  } catch (err) {
    console.error('Top up error:', err);
    res.status(500).json({ error: 'Gagal top up saldo' });
  }
};

exports.transfer = async (req, res) => {
  const senderId = req.user.id;
  const { recipientUsername, amount } = req.body;

  if (!recipientUsername || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Data tidak valid' });
  }

  try {
    // Ambil data penerima
    const recipientRes = await db.query('SELECT id FROM users WHERE username = $1', [recipientUsername]);
    if (recipientRes.rowCount === 0) {
      return res.status(404).json({ error: 'Penerima tidak ditemukan' });
    }
    const recipientId = recipientRes.rows[0].id;

    if (recipientId === senderId) {
      return res.status(400).json({ error: 'Tidak bisa transfer ke diri sendiri' });
    }

    // Ambil saldo pengirim
    const senderRes = await db.query('SELECT balance FROM users WHERE id = $1', [senderId]);
    const senderBalance = senderRes.rows[0].balance;
    if (senderBalance < amount) {
      return res.status(400).json({ error: 'Saldo tidak cukup' });
    }

    // Proses transfer (gunakan transaksi SQL)
    await db.query('BEGIN');

    // Kurangi saldo pengirim
    await db.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, senderId]);

    // Tambah saldo penerima
    await db.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, recipientId]);

    // Simpan transaksi pengirim
    await db.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [senderId, 'payment', amount, `Transfer to ${recipientUsername}`]
    );

    // Simpan transaksi penerima
    await db.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [recipientId, 'receive', amount, `Received from ${req.user.username}`]
    );

    await db.query('COMMIT');
    res.json({ message: 'Transfer berhasil', amount, to: recipientUsername });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Transfer error:', err);
    res.status(500).json({ error: 'Gagal transfer saldo' });
  }
};

exports.getTransactions = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT type, amount, description, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ transactions: result.rows });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Gagal mengambil riwayat transaksi' });
  }
};

exports.getBalance = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query('SELECT balance FROM users WHERE id = $1', [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({ balance: result.rows[0].balance });
  } catch (err) {
    console.error('Get balance error:', err);
    res.status(500).json({ error: 'Gagal mengambil saldo' });
  }
};

