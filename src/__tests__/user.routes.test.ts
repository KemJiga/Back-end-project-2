import request from 'supertest';
import { app } from '../main/express-app'; // Asegúrate de importar tu aplicación
import { connectdb } from '../main/mongo-utils';
import { clearCollections, mongoDisconnect } from '../test-utils/helpers';
const MONGO_URI_TEST = process.env.MONGO_URI_TEST;
var userId = '';
var token = '';
// "**/?(*.)+(test).ts"

describe('Pruebas unitarias de ruta de usuario', () => {
  beforeAll(async () => {
    await connectdb(MONGO_URI_TEST as string);
    await clearCollections();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });
  describe('POST /create user', () => {
    it('Debería crear un usuario correctamente', async () => {
      const response = await request(app).post('/api/users/create').send({
        name: 'John Doe',
        email: 'john+doe@example.com',
        password: 'secretPassword123',
        phone: '+1 (555) 555-5515',
        type: 'Client',
      });
      expect(response.status).toBe(201);
      userId = response.body._id;
    });

    it('Debería responder error a la creacion', async () => {
      const response = await request(app).post('/api/users/create').send({
        name: 'John Doe',
      });
      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('Debería hacer login correctamente', async () => {
      const response = await request(app).post('/api/users/').send({
        email: 'john+doe@example.com',
        password: 'secretPassword123',
      });
      expect(response.status).toBe(200);
      token = response.body.token;
    });

    it('Debería no poder hacer login (user not found)', async () => {
      const response = await request(app).post('/api/users/').send({
        email: 'johndoe@example.com',
        password: 'secretPassword123',
      });
      expect(response.status).toBe(404);
    });

    it('Debería no poder hacer login (invalid password)', async () => {
      const response = await request(app).post('/api/users/').send({
        email: 'john+doe@example.com',
        password: 'secreword123',
      });
      expect(response.status).toBe(403);
    });

    it('Debería no poder hacer login (no data)', async () => {
      const response = await request(app).post('/api/users/').send({
        password: 'secreword123',
      });
      expect(response.status).toBe(500);
    });
  });

  describe('GET /user/:id', () => {
    it('Debería obtener un usuario por ID correctamente', async () => {
      const response = await request(app)
        .get('/api/users/' + userId)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('Debería fallar por no Id proveido', async () => {
      const response = await request(app)
        .get('/api/users/')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('Debería fallar (id no existe en db)', async () => {
      const response = await request(app)
        .get('/api/users/' + userId.replace(userId.toString()[0], 'b'))
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('Debería fallar (token no es valido)', async () => {
      const response = await request(app)
        .get('/api/users/' + userId)
        .set('Authorization', 'Bearer  your_token');

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /user/:id', () => {
    it('Debería actualizar un usuario por ID correctamente', async () => {
      const response = await request(app)
        .patch('/api/users/' + userId)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John',
        });

      expect(response.status).toBe(200);
    });

    it('Debería fallar por no Id proveido', async () => {
      const response = await request(app)
        .patch('/api/users/')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('Debería fallar (id no existe en db)', async () => {
      const response = await request(app)
        .patch('/api/users/' + userId.replace(userId.toString()[0], 'b'))
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it('Debería fallar (token no es valido)', async () => {
      const response = await request(app)
        .patch('/api/users/' + userId)
        .set('Authorization', 'Bearer  your_token');

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /user/:id', () => {
    it('Debería eliminar un usuario por ID correctamente', async () => {
      const response = await request(app)
        .delete('/api/users/' + userId)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('Debería fallar por no Id proveido', async () => {
      const response = await request(app)
        .delete('/api/users/')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('Debería fallar (id no existe en db)', async () => {
      const response = await request(app)
        .delete('/api/users/' + userId.replace(userId.toString()[0], 'b'))
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it('Debería fallar (token no es valido)', async () => {
      const response = await request(app)
        .delete('/api/users/' + userId)
        .set('Authorization', 'Bearer  your_token');

      expect(response.status).toBe(500);
    });
  });
});
