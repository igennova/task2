const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions))

const authMiddle = require('./middleware/authMiddle.js');
const { User, Post } = require('./models/db.js');

const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET_CODE

// Connect to MongoDB
mongoose.connect(process.env.dbURL)
  .then(() => {
    console.log('DB connected');
  })
  .catch((e) => {
    console.log('DB Error ' + e);
  });

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// // Configure CORS
// const allowedOrigins = [process.env.frontendURL, 'http://localhost:5000'];
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

// Routes
app.use('/post', postRoute);
app.use('/user', userRoute);

// List all posts
app.get('/', async (req, res) => {
  try {
    const allPosts = await Post.find({}).sort({ createdAt: -1 });
    return res.json({
      status: 'success',
      count: allPosts.length,
      allPosts,
    });
  } catch (e) {
    return res.json({
      status: 'fail',
      message: 'Error : ' + e,
    });
  }
});

// Sign up
app.post('/signup', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
      return res.json({
        status: 'fail',
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.json({
        status: 'fail',
        message: 'Passwords do not match',
      });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.json({
        status: 'fail',
        message: 'Username already exists',
      });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ username, passwordHash });
    const savedUser = await newUser.save();

    const jwt_token = jwt.sign({
      userID: savedUser._id,
      username: savedUser.username
    }, JWT_SECRET);

    return res.json({
      status: 'success',
      message: 'Logged in',
      jwt_token,
    });
  } catch (e) {
    res.json({
      status: 'fail',
      message: 'Error signing up: ' + e,
    });
  }
});

// Log in
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        status: 'fail',
        message: 'All fields are required',
      });
    }

    const existingUser = await User.findOne({ username });

    if (!existingUser) {
      return res.json({
        status: 'fail',
        message: 'Username or Password invalid',
      });
    }

    const passwordValid = await bcrypt.compare(password, existingUser.passwordHash);

    if (!passwordValid) {
      return res.json({
        status: 'fail',
        message: 'Username or Password invalid',
      });
    }

    const jwt_token = jwt.sign({
      userID: existingUser._id,
      username: existingUser.username
    }, JWT_SECRET);

    return res.json({
      status: 'success',
      message: 'Logged in',
      jwt_token,
    });
  } catch (e) {
    return res.json({
      status: 'fail',
      message: 'Error logging in : ' + e,
    });
  }
});

// Log out
app.get('/logout', authMiddle, (req, res) => {
  try {
    return res.json({
      status: 'success',
      message: 'Logged out',
    });
  } catch (e) {
    return res.json({
      status: 'fail',
      message: 'Error : ' + e,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}...`);
});
