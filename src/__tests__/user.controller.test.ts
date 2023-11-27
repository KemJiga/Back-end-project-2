/* const {
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  login,
} = require('../controllers/user.controller');

describe('Pruebas unitarias de controlador', () => {
  it('Debería obtener un usuario por ID correctamente', async () => {
    const req = { params: { _id: userId }, user: { _id: userId } }; // Asegúrate de tener el ID válido de un usuario existente
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    // Puedes realizar más expectativas según tus necesidades
  });

  it('Debería crear un usuario correctamente', async () => {
    const req = {
      body: {
        name: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        password: 'password123',
        phone: '123456789',
        type: 'Cliente',
      },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    // Puedes realizar más expectativas según tus necesidades
  });

  // Agrega más pruebas según sea necesario
});
 */
