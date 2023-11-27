import request from 'supertest';
import { app } from '../main/express-app'; // Asegúrate de importar tu aplicación
import { connectdb } from '../main/mongo-utils';
import { clearCollections, mongoDisconnect } from '../test-utils/helpers';
import { UsertwFaDocument } from '../models/2fa.model';
import { UserDocument } from '../models/user.model';
import * as twoFactor from 'node-2fa';
const MONGO_URI_TEST = process.env.MONGO_URI_TEST;
// "**/?(*.)+(test).ts"

describe('Product tests', () => {
  beforeAll(async () => {
    await connectdb(MONGO_URI_TEST as string);
    await clearCollections();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  var user: UserDocument;
  var secret: UsertwFaDocument;
  var restaurant_id = '';
  var token = '';
  var product_id = '';
  var order_id = '';

  describe('Integration test for createOrder route (createUser + login + createRestaurant + createProduct + createOrder)', () => {
    it('should create a Restaurant admin user', async () => {
      const response = await request(app).post('/api/users/create').send({
        name: 'John Doe',
        email: 'john+doe@example.com',
        password: 'secretPassword123',
        phone: '+1 (555) 555-5515',
        type: 'Restaurant admin',
      });
      expect(response.status).toBe(201);
      user = response.body.newUser;
      secret = response.body.secretTwfa;
    });

    it('should login to the Restaurant admin user', async () => {
      const pin = twoFactor.generateToken(secret.secret);
      const response = await request(app)
        .post('/api/users/')
        .send({
          email: 'john+doe@example.com',
          password: 'secretPassword123',
          pin: pin?.token,
        });
      token = response.body.token;
      expect(response.status).toBe(200);
    });

    it('should create a restaurant for the user', async () => {
      const response = await request(app)
        .post('/api/restaurants/')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Mcdonald Gourmet',
          category: 'Gourmet',
          address: 'Walter street 82',
        });
      console.log(response.body);
      expect(response.status).toBe(201);
      restaurant_id = response.body._id;
    });

    it('should create a product for the restaurant', async () => {
      const response = await request(app)
        .post('/api/products/')
        .send({
          name: 'walterShake',
          description: 'Shake made of Walter Deluxe',
          price: '0',
          category: 'Gourmet',
          restaurant: restaurant_id,
        })
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(201);
      product_id = response.body._id;
    });

    it('should create an order for the restaurant', async () => {
      const response = await request(app)
        .post('/api/orders/')
        .send({
          restaurant: restaurant_id,
          products: [[product_id, 10]],
        })
        .set('Authorization', `Bearer ${token}`);
      console.log(response.body);
      console.log(restaurant_id);
      console.log(product_id);
      expect(response.status).toBe(201);

      order_id = response.body._id;
    });
  });
  describe('GET /orders/:_id', () => {
    it('should get order by id', async () => {
      const response = await request(app)
        .get('/api/orders/' + order_id)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should fail (id does not exist)', async () => {
      const response = await request(app)
        .get('/api/orders/' + order_id.replace(order_id.toString()[0], 'b'))
        .set('Authorization', `Bearer ${token}`);

      console.log(response.body);
      expect(response.status).toBe(404);
    });

    it('should fail (invalid auth)', async () => {
      const response = await request(app)
        .get('/api/orders/' + order_id)
        .set('Authorization', `Bearer your_token`);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /orders/:_id', () => {
    it('should update order', async () => {
      const response = await request(app)
        .patch('/api/orders/' + order_id)
        .send({
          products: [[product_id, 5]],
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should fail (order not found)', async () => {
      const response = await request(app)
        .patch('/api/orders/' + order_id.replace(order_id.toString()[0], 'b'))
        .send({
          products: [[product_id, 5]],
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should fail (nothing to update)', async () => {
      const response = await request(app)
        .patch('/api/orders/' + order_id)
        .send({})
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it('should fail (invalid auth)', async () => {
      const response = await request(app)
        .patch('/api/orders/' + order_id)
        .send({
          products: [[product_id, 5]],
        })
        .set('Authorization', 'Bearer yout_token');

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /orders/:_id', () => {
    it('should delete order', async () => {
      const response = await request(app)
        .delete('/api/orders/' + order_id)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should fail (order not found)', async () => {
      const response = await request(app)
        .delete('/api/orders/' + order_id.replace(order_id.toString()[0], 'b'))
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should fail (invalid auth)', async () => {
      const response = await request(app)
        .delete('/api/orders/' + order_id)
        .set('Authorization', 'Bearer yout_token');

      expect(response.status).toBe(500);
    });
  });
  // Agrega más pruebas según sea necesario
});
