const express = require('express');
const dotenv = require('dotenv');
const routes = require('./Routes/Route');
const connectDB = require('./DataBase/DB');

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/v1', routes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on http://:${PORT}`));