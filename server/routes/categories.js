const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

module.exports = router;
