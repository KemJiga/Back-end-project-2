import mongoose, { Schema, Model, Document } from 'mongoose';

type ProductDocument = Document & {
  name: string;
  description: string;
  price: number;
  category: [string];
  restaurant: Schema.Types.ObjectId;
  createdOn: Date;
  updatedAt: Date;
  deletedAt: Date;
};

type ProductInput = {
  name: ProductDocument['name'];
  description: ProductDocument['description'];
  price: ProductDocument['price'];
  category: ProductDocument['category'];
  restaurant: ProductDocument['restaurant'];
};

const productSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      validate: {
        validator(description: string) {
          return description.length <= 150 && description.length >= 10;
        },
        message: '{VALUE} is not a valid description',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      validate: {
        validator(num: number) {
          return num >= 0;
        },
        message: '{VALUE} is not a valid popularity number',
      },
    },
    category: {
      type: [String],
      validate: {
        validator(category: [string]) {
          return category.length > 0;
        },
        message: '{VALUE} is not a valid category',
      },
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'restaurants',
      required: [true, 'Product must belong to a restaurant'],
      validate: {
        async validator(restaurantId: Schema.Types.ObjectId) {
          const restaurant = await mongoose.model('Restaurants').findById(restaurantId);
          if (!restaurant || restaurant.deletedAt !== null) {
            throw new Error('Restaurant not found');
          }
        },
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
  },
  {
    collection: 'products',
  }
);

const Product: Model<ProductDocument> = mongoose.model<ProductDocument>('Order', productSchema);

export { Product, ProductInput, ProductDocument };
