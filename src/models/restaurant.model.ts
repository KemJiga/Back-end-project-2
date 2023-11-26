import mongoose, { Schema, Model, Document } from 'mongoose';

type RestaurantDocument = Document & {
  name: string;
  address: string;
  category: string;
  popularity: number;
  createdOn: Date;
  updatedAt: Date;
  deletedAt: Date;
};

type RestaurantInput = {
  owner: Schema.Types.ObjectId;
  name: RestaurantDocument['name'];
  address: RestaurantDocument['address'];
  category: RestaurantDocument['category'];
};

const restaurantSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'User is required'],
    validate: {
      async validator(userId: Schema.Types.ObjectId) {
        const user = await mongoose.model('User').findById(userId);
        if (!user || user.deletedAt !== null) {
          throw new Error('User not found');
        }
      },
    },
  },
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is required'],
  },
  address: {
    type: String,
    trim: true,
    required: [true, 'Address is required'],
  },
  category: {
    type: String,
    enum: ['Regular', 'Fast', 'Gourmet'],
    required: [true, 'Category is required'],
  },
  popularity: {
    type: Number,
    default: 0,
    validate: {
      validator(num: number) {
        return num >= 0;
      },
      message: '{VALUE} is not a valid popularity number',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

const Restaurant: Model<RestaurantDocument> = mongoose.model<RestaurantDocument>(
  'Restaurant',
  restaurantSchema
);

export { Restaurant, RestaurantInput, RestaurantDocument };
