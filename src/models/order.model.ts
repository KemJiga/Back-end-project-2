import mongoose, { Schema, Model, Document } from 'mongoose';

type OrderDocument = Document & {
  user: Schema.Types.ObjectId;
  restaurant: Schema.Types.ObjectId;
  products: Map<Schema.Types.ObjectId, number>;
  total: number;
  status: string;
  createdOn: Date;
  updatedAt: Date;
  deletedAt: Date;
};

type OrderInput = {
  user: OrderDocument['user'];
  restaurant: OrderDocument['restaurant'];
  products: OrderDocument['products'];
  total: OrderDocument['total'];
  status: OrderDocument['status'];
};

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'Order must belong to a user'],
    validate: {
      async validator(userId: Schema.Types.ObjectId) {
        const user = await mongoose.model('User').findById(userId);
        if (!user || user.deletedAt !== null) {
          throw new Error('User not found');
        }
      },
    },
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'restaurants',
    required: [true, 'Order must belong to a restaurant'],
    validate: {
      async validator(restaurantId: Schema.Types.ObjectId) {
        const restaurant = await mongoose.model('Restaurant').findById(restaurantId);
        if (!restaurant || restaurant.deletedAt !== null) {
          throw new Error('Restaurant not found');
        }
      },
    },
  },
  products: {
    type: Map,
    of: String,
    required: [true, 'Order must have products'],
  },
  total: {
    type: Number,
    required: [true, 'Order must have a total'],
    //validate non negative
  },
  status: {
    type: String,
    enum: ['Created', 'Recieved', 'Sended', 'Delivered'],
    required: [true, 'Order must have a status'],
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
  deliveredAt: {
    type: Date,
    default: null,
  },
});

const Order: Model<OrderDocument> = mongoose.model<OrderDocument>('Order', orderSchema);

export { Order, OrderInput, OrderDocument };
