const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model('User', {
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate(val) {
      if (validator.contains(val.toUpperCase(), 'password'.toUpperCase())) {
        throw new Error('Password cannot contain the word "password"');
      }
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error('Age must be a positive number');
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(val) {
      if (val < 0) {
        throw new Error('Age must be a positive number');
      }
    }
  }
});

module.exports = User;
