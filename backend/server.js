const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Neusearch AI Backend is Running');
});

const productRoutes = require('./routes/products');
const chatRoutes = require('./routes/chat');



app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/offers', require('./routes/offers'));

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;
