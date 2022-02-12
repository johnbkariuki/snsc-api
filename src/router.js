import { Router } from 'express';
import * as userController from './controllers/user_controller';
import { requireAuth, requireSignin } from './services/passport';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello! Welcome to the SNSC database API' });
});

const handleGetUser = async (req, res) => {
  try {
    const result = await userController.getUser(req.params.id);
    console.log(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleGetAllUsers = async (req, res) => {
  try {
    const result = await userController.getAllUsers();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleUpdateUser = async (req, res) => {
  try {
    const result = await userController.updateUser(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

router.post('/signup', async (req, res) => {
  try {
    const token = await userController.signup(req.body);
    res.json({
      token, name: req.body.name, email: req.body.email, password: req.body.password,
    });
  } catch (error) {
    res.status(422).json({ error: error.toString() });
  }
});

router.post('/login', requireSignin, async (req, res) => {
  try {
    const token = userController.login(req.body);
    res.json({
      token, name: req.body.name, email: req.body.email, password: req.body.password,
    });
  } catch (error) {
    res.status(422).json({ error: error.toString() });
  }
});

router.route('/users/:id').get(requireAuth, handleGetUser).put(requireAuth, handleUpdateUser);
router.route('/users').get(handleGetAllUsers);

export default router;
