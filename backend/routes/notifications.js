const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

router.use(authenticate);

// GET /api/notifications
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Notify Get Error:", err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// POST /api/notifications/read/:id
router.post('/read/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) {
            if (error.code === '23503') return res.status(401).json({ error: "User mismatch" });
            throw error;
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Notify Read Error:", err);
        res.status(500).json({ error: "Failed to update notification" });
    }
});

module.exports = router;
