require('dotenv').config();

const express = require('express');
const auth = require('../middleware/auth');
const router = new express.Router();
const User = require('../models/user');
const multer = require('multer');
const sharp = require('sharp');
const {
  sendWelcomeEmail,
  sendCancelationEmail
} = require('../emails/accounts');

/**
 * Create user
 */
router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

/**
 * Login
 */
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

/**
 * Logout
 */
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(400).send();
  }
});

/**
 * LogoutAll
 */
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(400).send();
  }
});

/**
 * Read users
 */
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

/**
 * Get current user
 */
router.get('/users/me', auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

/**
 * Update current user
 */
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'age', 'email', 'password'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send('error: invalid updates attempted');
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * Delete current user
 */
router.delete('/users/me', auth, async (req, res) => {
  try {
    req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

/**
 * Create multer upload
 */
const upload = multer({
  limits: {
    fileSize: 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File must be an image file'));
    }
    cb(undefined, true);
  }
});

/**
 * Upload avatar
 */
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

/**
 * Delete avatar
 */
router.delete(
  '/users/me/avatar',
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {}
);

/**
 * Return avatar as an image
 */
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error('no avatar');
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

module.exports = router;
