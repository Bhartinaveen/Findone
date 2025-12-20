const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Middleware to verify token
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

// GET /api/wishlist
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('wishlist_items')
            .select('*, product:products(*)')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Wishlist Get Error:", err);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
});

// POST /api/wishlist/add
router.post('/add', async (req, res) => {
    try {
        const { product_id, desired_min_price, desired_max_price } = req.body;

        const { data, error } = await supabase
            .from('wishlist_items')
            .insert([{
                user_id: req.user.id,
                product_id,
                desired_min_price,
                desired_max_price
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') return res.status(400).json({ error: "Item already in wishlist" });
            if (error.code === '23503') return res.status(401).json({ error: "User not found (Please login again)" }); // Stale token
            throw error;
        }

        res.json(data);
    } catch (err) {
        console.error("Wishlist Add Error:", err);
        res.status(500).json({ error: "Failed to add to wishlist" });
    }
});

// DELETE /api/wishlist/:id
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error("Wishlist Delete Error:", err);
        res.status(500).json({ error: "Failed to remove item" });
    }
});

module.exports = router;
