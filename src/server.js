require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors  = require('cors')

const app = express();

app.use(express.json());

const appUrls = (process.env.APP_URL || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || appUrls.includes(origin)) {
      return callback(null, true);
    }
    try {
      const hostname = new URL(origin).hostname;
      if (hostname === 'localhost' || hostname.endsWith('.vercel.app') || hostname.endsWith('.onrender.com')) {
        return callback(null, true);
      }
    } catch (err) {
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

app.use(cookieParser());
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/resumeUpload.route')
connectDB()

const PORT = process.env.PORT || 5000
app.use('/api/auth', authRoutes)
app.use('/api/user', profileRoutes)
app.use('/api/resume/', uploadRoutes)
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})