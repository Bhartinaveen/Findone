const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123'; // Use env in prod

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password required" });

        // 1. Check if user exists
        const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
        if (existing) return res.status(400).json({ error: "User already exists" });

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insert user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                email,
                password_hash: hashedPassword,
                full_name: fullName
            }])
            .select()
            .single();

        if (error) throw error;

        // 4. Generate Token
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id: newUser.id, email: newUser.email, fullName: newUser.full_name }
        });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Registration failed" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password required" });

        // 1. Find User
        const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        // 2. Validate Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // 3. Generate Token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user.id, email: user.email, fullName: user.full_name }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Login failed" });
    }
});

module.exports = router;
