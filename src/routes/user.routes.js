const express = require('express');
const router  = express.Router();
const verifyToken = require('../middleware/auth.middleware');

router.get('/profile', verifyToken, (req, res) => {
    res.json({ user: req.user })
})

module.exports = router;
