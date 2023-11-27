import request from 'supertest';
import { app } from '../main/express-app'; // Asegúrate de importar tu aplicación
import { connectdb } from '../main/mongo-utils';

describe('Pruebas de integración (ruta → controlador → acción)', () => {
  let userId; // Asegúrate de tener el ID válido de un usuario existente

  beforeAll(async () => {
    // Realiza operaciones necesarias antes de las pruebas (p. ej., crea usuarios de prueba)
    // Asegúrate de tener acceso al ID del usuario creado para las pruebas
  });

  afterAll(async () => {
    // Realiza operaciones después de todas las pruebas (p. ej., limpiar la base de datos)
  });

  it('Debería crear un usuario, hacer login y obtenerlo por ID', async () => {
    // Prueba de creación de usuario
    const createResponse = await request(app).post('/create').send({
      name: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      password: 'password123',
      phone: '123456789',
      type: 'Cliente',
    });

    expect(createResponse.status).toBe(201);
    userId = createResponse.body.newUser._id; // Guarda el ID del usuario creado

    // Prueba de login
    const loginResponse = await request(app).post('/').send({
      email: 'nuevo@example.com',
      password: 'password123',
    });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token;

    // Prueba de obtener usuario por ID
    const getResponse = await request(app)
      .get('/' + userId)
      .set('Authorization', 'Bearer ' + token);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty('name', 'Nuevo Usuario');
  });

  // Agrega más pruebas según sea necesario
});
