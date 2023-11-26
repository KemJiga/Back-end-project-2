var twoFactor = require('node-2fa');

var newSecret = twoFactor.generateSecret({ name: 'My Awesome App', account: 'walter' });
console.log(newSecret);

const fa = twoFactor.verifyToken('3ZI6QG7G4NWUUL5EPC55NDWTWI27NBST', '807111');
// { delta: 0 }

console.log(fa);
