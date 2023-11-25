import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

type UserDocument = Document & {
  name: string;
  email: string;
  password: string;
  phone: string;
  type: string;
  createdOn: Date;
  updatedAt: Date;
  deletedAt: Date;
};

type UserInput = {
  name: UserDocument['name'];
  email: UserDocument['email'];
  password: UserDocument['password'];
  phone: UserDocument['phone'];
  type: UserDocument['type'];
};

const userSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: [true, 'Name is required'],
  },
  email: {
    type: Schema.Types.String,
    unique: true,
    required: [true, 'Email is required'],
  },
  password: {
    type: Schema.Types.String,
    required: [true, 'Password is required'],
  },
  phone: {
    type: Schema.Types.String,
    required: [true, 'Phone number is required'],
  },
  type: {
    type: Schema.Types.String,
    enum: ['Restaurant admin', 'Delivery', 'Client'],
    required: [true, 'Type is required'],
  },
  createdOn: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  updatedAt: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  deletedAt: {
    type: Schema.Types.Date,
    default: null,
  },
});

userSchema.pre('save', function (this: UserDocument, next: (err?: Error) => void) {
  // only hash the password if it has been modified (or is new)

  if (!this.isModified('password')) return next();
  const SALT_WORK_FACTOR = 10;
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    // hash the password using the new salt
    bcrypt.hash(this.password, salt, (hashErr, hash) => {
      if (hashErr) return next(hashErr);

      // override the cleartext password with the hashed one
      this.password = hash;
      next();
    });
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

userSchema.pre('findOneAndUpdate', async function (this: any, next: (err?: Error) => void) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  const saltRounds = 10;

  if (docToUpdate && this._update.password && docToUpdate.password !== this._update.password) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(this._update.password, salt);
    this._update.password = hash;
  }

  next();
});

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

userSchema.methods.comparePassword = function (this: UserDocument, candidatePassword: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};

const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);

export { User, UserInput, UserDocument };
