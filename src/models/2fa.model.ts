import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

type UsertwFaDocument = Document & {
  user: string;
  secret: string;
};

type UsertwFaInput = {
  user: UsertwFaDocument['user'];
  secret: UsertwFaDocument['secret'];
};

const UsertwFaSchema = new Schema({
  user: {
    type: Schema.Types.String,
    required: [true, 'Name is required'],
  },
  secret: {
    type: Schema.Types.String,
    unique: true,
    required: [true, 'Email is required'],
  },
});

UsertwFaSchema.pre('findOne', async function (this: any, next: (err?: Error) => void) {
  const user_id = this.getQuery()._id.toString();

  const hash = await bcrypt.hash(user_id, process.env.TWOFA_SECRET_SALT as string);
  this.setQuery({ user: hash });
  next();
});

UsertwFaSchema.pre('save', function (this: UsertwFaDocument, next: (err?: Error) => void) {
  // only hash the password if it has been modified (or is new)

  const SALT_WORK_FACTOR = 10;
  // generate a salt
  bcrypt.hash(this.user.toString(), process.env.TWOFA_SECRET_SALT as string, (hashErr, hash) => {
    if (hashErr) return next(hashErr);

    // override the cleartext password with the hashed one
    this.user = hash;
    next();
  });
});

/**
userSchema.pre('save', function (next) {
  const SALT_WORK_FACTOR = 10;
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
}); */

//DOES NOT WORK
/** 
userSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  const saltRounds = 10;
  if (docToUpdate.password !== this._update.password) {
    var salt = await bcrypt.genSalt(saltRounds);
    var hash = await bcrypt.hash(this._update.password, salt);
    this._update.password = hash;
  }
  next();
});
*/

/*userSchema.methods.comparePassword = function (this: UserDocument, candidatePassword: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};*/

const UsertwFa: Model<UsertwFaDocument> = mongoose.model<UsertwFaDocument>(
  'UsertwFa',
  UsertwFaSchema
);

export { UsertwFa, UsertwFaInput, UsertwFaDocument };
