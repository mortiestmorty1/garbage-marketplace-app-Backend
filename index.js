const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Route Integrations
app.use('/api/users', userRoutes);       // Routes for user operations
app.use('/api/items', itemRoutes);       // Routes for item operations
app.use('/api/orders', orderRoutes);     // Routes for order operations
app.use('/api/deliveries', deliveryRoutes); // Routes for delivery operations

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 Error Handling for Undefined Routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
