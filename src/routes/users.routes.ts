import { Router } from 'express';
import { getRepository } from 'typeorm';
import multer from 'multer';
import CreateUserService from '../services/CreateUserService';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import User from '../models/User';
import uploadConfig from '../config/upload';
import UpdateUserAvatarService from '../services/UpdateUserAvatarService';

const usersRoute = Router();
const upload = multer(uploadConfig);

usersRoute.get('/', async (request, response) => {
  try {
    const usersRepository = getRepository(User);
    const users = await usersRepository.find();
    return response.json(users);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

usersRoute.post('/', async (request, response) => {
  try {
    const { name, email, password } = request.body;
    const createUserService = new CreateUserService();
    const user = await createUserService.execute({ name, email, password });
    delete user.password;
    return response.json(user);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

usersRoute.patch(
  '/avatar',
  ensureAuthenticated,
  upload.single('avatar'),
  async (request, response) => {
    console.log(request.file);

    const updateUserAvatar = new UpdateUserAvatarService();
    const user = await updateUserAvatar.execute({
      user_id: request.user.id,
      avatarFilename: request.file.filename,
    });
    delete user.password;
    return response.json(user);
  },
);

export default usersRoute;
