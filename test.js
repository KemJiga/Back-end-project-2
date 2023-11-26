const bcrypt = require('bcrypt');

bcrypt.genSalt(10, (err, salt) => {
  if (err) return next(err);

  // hash the password using the new salt
  console.log(salt);
  bcrypt.hash(this.password, salt, (hashErr, hash) => {
    if (hashErr) return next(hashErr);

    // override the cleartext password with the hashed one
    this.password = hash;
    next();
  });
});
