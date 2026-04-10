const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = process.env.JWT_SECRET || 'advert_secret_key';

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  const hash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, hash);
    const token = jwt.sign({ id: result.lastInsertRowid, name, email }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: result.lastInsertRowid, name, email } });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
