require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const db = require('../models');

// POST /auth/login route - returns a JWT
router.post('/login', (req, res) => {
  console.log('In the POST /auth/login route');
  console.log(req.body);

  db.User.findOne({email:req.body.email})
  .then(user => {
    // make sure there's a user and a pw
    if (!user || !user.password) {
      return res.status(404).send({message: 'User Not Found'});
    }

    // the user exists -- now let's check their pw
    if (!user.authenticed(req.body)) {
      // invalid user credentials (bad password)
      return res.status(406).send({message: 'Unacceptable'});
    }

    // valid user, good password -- now we need token
    const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 24
    })

    // send the token
    res.send({token})
  })
  .catch(err => {
    console.log('error when finding user in POST /auth/login', err);
    res.stats(503).send()
  })
});

// POST /auth/signup route - create a user in the DB and then log them in
router.post('/signup', (req, res) => {
  console.log('In the POST /auth/login route');
  console.log(req.body);

  db.User.findOne({ email: req.body.email })
  .then(user => {
    if (user) {
      res.status(409).send({message: 'User already registered with that e-mail.'})
    }

    // user does not exist yet
    db.User.create(req.body)
    .then(createdUser => {
      // we created a user. make a token, send token.
      const token = jwt.sign(createdUser.toJSON(), process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24
      });

      res.send({token});
    })
    .catch(err => {
      console.log('Error when creating user', err);
      res.status(500).send({message: 'Error creating user.'})
    });
  })
  .catch(err => {
    console.log('Error in POST /auth/signup', err);
    res.status(500).send({message: 'Something went wrong--probably DB-related.'})
  });
});

// This is what is returned when client queries for new user data
router.post('/current/user', (req, res) => {
  console.log('In the current user route. Should be logged-in user.', req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).send({message: 'Unauthorized'});
  }

  // NOTE: this is user data from the time the token was issued.
  // WARNING: if you update the user, those changes will not be reflected here.
  // to avoid this, reissue a token when user data is changed.
  res.send({user: req.user});
});

module.exports = router;
