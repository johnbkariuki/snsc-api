import { Router } from 'express';
import * as userController from './controllers/user_controller';
import * as organizationController from './controllers/organization_controller';
import { requireAuth, requireSignin } from './services/passport';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello! Welcome to the SNSC database API' });
});

// user functions
const handleGetUser = async (req, res) => {
  try {
    console.log(req.user);
    const result = await userController.getUser(req.user.id);
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
    console.log(error);
    res.status(422).json({ error: error.toString() });
  }
});

router.post('/login', requireSignin, async (req, res) => {
  try {
    const token = userController.login(req.user);
    res.json({
      token, name: req.body.name, email: req.body.email, password: req.body.password,
    });
  } catch (error) {
    res.status(422).json({ error: error.toString() });
  }
});

// organization function
const handleGetOrganization = async (req, res) => {
  try {
    console.log(req.params.id);
    const result = await organizationController.getOrganization(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleGetAllOrganizations = async (req, res) => {
  try {
    const result = await organizationController.getAllOrganizations();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleUpdateOrganization = async (req, res) => {
  try {
    const result = await organizationController.updateOrganization(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleDeleteOrganization = async (req, res) => {
  try {
    const result = await organizationController.deleteOrganization(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleCreateOrganization = async (req, res) => {
  try {
    const result = await organizationController.createOrganization(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

// routes
router.route('/user').get(requireAuth, handleGetUser).put(requireAuth, handleUpdateUser);
router.route('/users').get(handleGetAllUsers);
router.route('/organizations/:id').get(handleGetOrganization).put(handleUpdateOrganization).delete(handleDeleteOrganization);
router.route('/organizations').get(handleGetAllOrganizations).post(handleCreateOrganization);

export default router;
