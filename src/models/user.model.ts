import mongoose, { Schema, Model, Document } from 'mongoose';

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

const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);

export { User, UserInput, UserDocument };
