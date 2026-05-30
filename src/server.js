const express = require('express');
const cookieParser = require('cookie-parser');
const cors  = require('cors')

const app = express();
app.use(express.json());
app.use(cors(
{origin: "http://localhost:3000", // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true}
))

app.use(cookieParser());
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/resumeUpload.route')
connectDB()

const port = 4000;

app.use('/api/auth', authRoutes)
app.use('/api/user', profileRoutes)
app.use('/api/resume/', uploadRoutes)
app.listen(port, ()=>{
    console.log(`server running on port ${port}`)
})