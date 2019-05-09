let bcrypt = require('bcryptjs');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 99
  },
  email: { // TODO: Need to add email validation
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 99
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 99
  }
});

// TODO: Override 'toJSON' to prevent the password from being returned with the user
userSchema.set('toJSON', {
  transform: (doc, user) => {
    // delete user.password; // --> alternate
    // return user;
    return {
      id: user._id,
      name: user.name,
      email: user.email
    }
  }
});

// A helper function to authenticate with bcrypt
userSchema.methods.authenticated = function(password) {
  return bcrypt.compareSync(password, this.password);
}

// Find out Mongoose's version of a beforeCreate hook
userSchema.pre('save', function(next) {
  this.password = bcrypt.hashSync(this.password, 12);
  next();
});

// Exporting the User model
module.exports = mongoose.model('User', userSchema);
