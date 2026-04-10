const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all adverts with optional search/filter
router.get('/', (req, res) => {
  const { search, category, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  let query = `
    SELECT a.*, c.name as category_name, u.name as user_name, u.email as user_email
    FROM adverts a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (search) { query += ' AND (a.title LIKE ? OR a.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (category) { query += ' AND a.category_id = ?'; params.push(category); }

  query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const adverts = db.prepare(query).all(...params);
  const total = db.prepare(`SELECT COUNT(*) as count FROM adverts WHERE 1=1${search ? ' AND (title LIKE ? OR description LIKE ?)' : ''}${category ? ' AND category_id = ?' : ''}`).get(...params.slice(0, -2)).count;

  res.json({ adverts, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// Get single advert
router.get('/:id', (req, res) => {
  const advert = db.prepare(`
    SELECT a.*, c.name as category_name, u.name as user_name, u.email as user_email
    FROM adverts a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `).get(req.params.id);
  if (!advert) return res.status(404).json({ error: 'Not found' });
  res.json(advert);
});

// Create advert
router.post('/', auth, upload.single('image'), (req, res) => {
  const { title, description, price, location, category_id } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const result = db.prepare(
    'INSERT INTO adverts (title, description, price, location, image, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(title, description, price || null, location || null, image, category_id || null, req.user.id);

  res.status(201).json({ id: result.lastInsertRowid });
});

// Update advert
router.put('/:id', auth, upload.single('image'), (req, res) => {
  const advert = db.prepare('SELECT * FROM adverts WHERE id = ?').get(req.params.id);
  if (!advert) return res.status(404).json({ error: 'Not found' });
  if (advert.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { title, description, price, location, category_id } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : advert.image;

  db.prepare(
    'UPDATE adverts SET title=?, description=?, price=?, location=?, image=?, category_id=? WHERE id=?'
  ).run(title || advert.title, description || advert.description, price ?? advert.price, location ?? advert.location, image, category_id ?? advert.category_id, req.params.id);

  res.json({ success: true });
});

// Delete advert
router.delete('/:id', auth, (req, res) => {
  const advert = db.prepare('SELECT * FROM adverts WHERE id = ?').get(req.params.id);
  if (!advert) return res.status(404).json({ error: 'Not found' });
  if (advert.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  db.prepare('DELETE FROM adverts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// My adverts
router.get('/user/me', auth, (req, res) => {
  const adverts = db.prepare(`
    SELECT a.*, c.name as category_name FROM adverts a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.user_id = ? ORDER BY a.created_at DESC
  `).all(req.user.id);
  res.json(adverts);
});

module.exports = router;
