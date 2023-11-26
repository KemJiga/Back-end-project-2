import { clearCollections, mongoDisconnect } from '../test-utils/helpers';
import { app } from '../main/express-app';
import request from 'supertest';
import { connectdb } from '../main/mongo-utils';

describe('users endpoint', () => {
  beforeAll(async () => {
    await connectdb();
    await clearCollections();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Create', () => {
    it('should create a user', async () => {
      const res = await request(app).post('/api/users/create/').send({
        name: 'John Doe 4',
        email: 'john+doe444@example.com',
        password: 'secretPassword123',
        phone: '+1 (555) 555-5515',
        type: 'Client',
      });
      expect(res.statusCode).toBe(201);
    });
  });
});
