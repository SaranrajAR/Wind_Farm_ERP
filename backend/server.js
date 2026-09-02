const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const managerRoutes = require('./routes/managerRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true // Crucial for sending cookies via Axios
}));

app.use('/api/auth', authRoutes);
app.use('/api/manager',managerRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch(err => console.error(err));