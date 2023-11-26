const bcrypt = require('bcrypt');

const saltRounds = 10;
var password = 'Fkdj^45ci@Jad';

bcrypt.genSalt(saltRounds, function (err, salt) {
  console.log(salt);
  bcrypt.hash(password, salt, function (err, hash) {
    console.log(hash);
  });
});

var password2 = 'Fkdj^45ci@Jad';
var hash = '$2b$10$GmLOlHfqD3xjrQdIyO2AoeTdY3ErUnH7RdZ/mI3CHjbgveLlNnWkK';
bcrypt.compare(password2, hash, function (err, result) {
  if (result) {
    console.log('It matches!');
  } else {
    console.log('Invalid password!');
  }
});
