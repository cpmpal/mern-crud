const express = require('express');
const router = express.Router();
const RateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const stringCapitalizeName = require('string-capitalize-name');

const User = require('../models/user');

// Attempt to limit spam post requests for inserting data
const minutes = 5;
const postLimiter = new RateLimit({
  windowMs: minutes * 60 * 1000, // milliseconds
  max: 100, // Limit each IP to 100 requests per windowMs 
  delayMs: 0, // Disable delaying - full speed until the max limit is reached 
  handler: (req, res) => {
    res.status(429).json({ success: false, msg: `You made too many requests. Please try again after ${minutes} minutes.` });
  }
});

// READ (ONE)
router.get('/username/:username/password/:password', (req, res) => {
  User.findOne({username: req.params.username,
             password: req.params.password}, 'name email username')
    .then((result) => {
       res.json(result);
    })
    .catch((err) => {
      res.status(404).json({ success: false, msg: `No such user.` });
    });
});

// get users for 
router.get('/:id', (req, res) => {
  User.find({_id : req.params.id}, '-password')
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(404).json({ sucess: false, msg: 'No such user.' });
    })
})

// READ (ALL)
router.get('/', (req, res) => {
  User.find({}, 'name email username')
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: `Something went wrong. ${err}` });
    });
});

// CREATE
router.post('/', postLimiter, (req, res) => {

  let newUser = new User({
    name: sanitizeName(req.body.name),
    email: sanitizeEmail(req.body.email),
    username: sanitizeUserName(req.body.username),
    password: req.body.password
  });


  newUser.save()
    .then((result) => {
      res.json({
        success: true,
        msg: `Successfully added!`,
        result: {
          _id: result._id,
          name: result.name,
          email: result.email,
          username: result.username,
        }
      });
    })
    .catch((err) => {
      if (err.errors) {
        if (err.errors.name) {
          res.status(400).json({ success: false, msg: err.errors.name.message });
          console.log('name');
          return;
        }
        if (err.errors.email) {
          res.status(400).json({ success: false, msg: err.errors.email.message });
          console.log('email');
          return;
        }
        if (err.errors.username) {
          res.status(400).json({ success: false, msg: err.errors.username.message });
          console.log('username');
          return;
        }
        if (err.errors.password) {
          res.status(400).json({ success: false, msg: err.errors.password.message });
          console.log('password');
          return;
        }
        // Show failed if all else fails for some reasons
        res.status(500).json({ success: false, msg: `Something went wrong. ${err}` });
      }
    });
});

// UPDATE
router.put('/:id', (req, res) => {

  // Validate the age
  let age = sanitizeAge(req.body.age);
  if (age < 5 && age != '') return res.status(403).json({ success: false, msg: `You're too young for this.` });
  else if (age > 130 && age != '') return res.status(403).json({ success: false, msg: `You're too old for this.` });

  let updatedUser = {
    name: sanitizeName(req.body.name),
    email: sanitizeEmail(req.body.email),
    username: sanitizeUserName(req.body.username),
    password: req.body.password
  };

  User.findOneAndUpdate({ _id: req.params.id }, updatedUser, { runValidators: true, context: 'query' })
    .then((oldResult) => {
      User.findOne({ _id: req.params.id })
        .then((newResult) => {
          res.json({
            success: true,
            msg: `Successfully updated!`,
            result: {
              _id: newResult._id,
              name: newResult.name,
              email: newResult.email,
              username: newResult.username,
            }
          });
        })
        .catch((err) => {
          res.status(500).json({ success: false, msg: `Something went wrong. ${err}` });
          return;
        });
    })
    .catch((err) => {
      if (err.errors) {
        if (err.errors.name) {
          res.status(400).json({ success: false, msg: err.errors.name.message });
          return;
        }
        if (err.errors.email) {
          res.status(400).json({ success: false, msg: err.errors.email.message });
          return;
        }
        if (err.errors.age) {
          res.status(400).json({ success: false, msg: err.errors.age.message });
          return;
        }
        if (err.errors.gender) {
          res.status(400).json({ success: false, msg: err.errors.gender.message });
          return;
        }
        // Show failed if all else fails for some reasons
        res.status(500).json({ success: false, msg: `Something went wrong. ${err}` });
      }
    });
});

// DELETE
router.delete('/:id', (req, res) => {

  User.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.json({
        success: true,
        msg: `It has been deleted.`,
        result: {
          _id: result._id,
          name: result.name,
          email: result.email,
          username: result.username
        }
      });
    })
    .catch((err) => {
      res.status(404).json({ success: false, msg: 'Nothing to delete.' });
    });
});

module.exports = router;

// Minor sanitizing to be invoked before reaching the database
sanitizeName = (name) => {
  return stringCapitalizeName(name);
}
sanitizeEmail = (email) => {
  return email.toLowerCase();
}
// strip whitespace from username
sanitizeUserName = (username) => {
  return username.toLowerCase().replace(/\s+/g, '');
}

