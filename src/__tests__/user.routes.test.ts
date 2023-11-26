import request from 'supertest';
import { app } from '../main/express-app'; // Asegúrate de importar tu aplicación
import { connectdb } from '../main/mongo-utils';
describe('Pruebas unitarias de ruta de usuario', () => {
  it('Debería crear un usuario correctamente', async () => {
    const response = await request(app).post('/create').send({
      name: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      password: 'password123',
      phone: '123456789',
      type: 'Cliente',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('newUser');
    // Puedes realizar más expectativas según tus necesidades
  });

  it('Debería hacer login correctamente', async () => {
    const response = await request(app).post('/').send({
      email: 'usuarioexistente@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    // Puedes realizar más expectativas según tus necesidades
  });

  it('Debería obtener un usuario por ID correctamente', async () => {
    const response = await request(app)
      .get('/' + userId) // Asegúrate de tener el ID válido de un usuario existente
      .set('Authorization', 'Bearer tu_token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'NombreDelUsuario');
    // Puedes realizar más expectativas según tus necesidades
  });

  // Agrega más pruebas según sea necesario
});
