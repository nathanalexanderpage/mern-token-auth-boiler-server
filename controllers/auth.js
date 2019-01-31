require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const db = require('../models');

// POST /auth/login route - returns a JWT
router.post('/login', (req, res) => {
  // TODO: Debug statements; remove when no longer needed!
  console.log('In the POST /auth/login route');
  console.log(req.body);

  // Find out if the user is in our DB (for login, you'd expect they should be)
  db.User.findOne({ email: req.body.email })
  .then(user => {
    // Make sure there's a user and a password
    if(!user || !user.password){
      return res.status(400).send('User not found');
    }

    // Yay, the user exists! Now check the password.
    if(!user.isAuthenticated(req.body.password)){
      // Invalid user
      return res.status(401).send('Invalid Credentials');
    }

    // Valid user; passed authentication. Need to make them a token.
    const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 24 // 24 hours (in seconds)
    });

    // Send that token!
    res.send({ token: token });
  })
  .catch(err => {
    console.log('Error when finding user in POST /auth/login route:', err);
    res.status(503).send('Database Error. Bummer! :(');
  });
});

// POST /auth/signup route - create a user in the DB and then log them in
router.post('/signup', (req, res) => {
  // TODO: Debug statements; remove when no longer needed!
  console.log('In the POST /auth/signup route');
  console.log(req.body);

  db.User.findOne({ email: req.body.email })
  .then(user => {
    if(user){
      // If the user exists, don't let them create a duplicate account!
      return res.status(409).send('Email already in use!');
    }

    // Good - they don't exist yet :)
    db.User.create(req.body)
    .then(createdUser => {
      // We created a new user. Yay! Let's create and send a token for them!
      const token = jwt.sign(createdUser.toJSON(), process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24 // 24 hours (in seconds)
      });

      res.send({ token: token });
    })
    .catch(err => {
      console.log('Error in POST /auth/signup when creating new user', err);
      res.status(500).send('Database error?! Oh no! :(');
    });
  })
  .catch(err => {
    console.log('Error in POST /auth/signup', err);
    res.status(503).send('Database Error. Sad day. :(');
  });
});

// This is what is returned when client queries for new user data
router.post('/current/user', (req, res) => {
  // TODO: Remove this console log when not needed anymore
  console.log('GET /auth/current/user STUB');

  if(!req.user || !req.user.id){
    return res.status(401).send({ user: null });
  }

  db.User.findById(req.user.id)
  .then(user => {
    res.send({ user: user });
  })
  .catch(err => {
    console.log('Error in GET /auth/curent/user route:', err);
    res.status(503).send({ user: null });
  })
});

module.exports = router;





















