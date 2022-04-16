import { Router } from 'express';
import * as userController from './controllers/user_controller';
import * as organizationController from './controllers/organization_controller';
import { requireAuth, requireSignin } from './services/passport';

const router = Router();

// homepage
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

const handleUpdatePassword = async (req, res) => {
  try {
    const result = await userController.updatePassword(req.user.id, req.body);
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
      token, name: req.user.name, email: req.user.email, password: req.body.password,
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

const addAllOrganizationInfo = async (req, res) => {
  try {
    const result = await organizationController.readJsonFile('./json_files/updated_organization_resources.json');
    await organizationController.addAllOrganizationInfo(result);
    res.send('Success');
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleSaveToFavorites = async (req, res) => {
  try {
    await organizationController.saveToFavorites(req.params.id, req.user);
    res.send('Success');
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleGetAllFavorites = async (req, res) => {
  try {
    const organizations = await organizationController.getAllFavorites(req.user.favoriteIds);
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleRemoveFromFavorites = async (req, res) => {
  try {
    await organizationController.removeFromFavorites(req.params.id, req.user);
    res.send('Success');
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleAutocomplete = async (req, res) => {
  try {
    const result = await organizationController.autoComplete(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleSearchOrganizations = async (req, res) => {
  try {
    const searchResult = await organizationController.searchOrganizations(req.body);
    res.json(searchResult);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

// routes
router.route('/user').get(requireAuth, handleGetUser).put(requireAuth, handleUpdateUser);
router.route('/user/password').put(requireAuth, handleUpdatePassword);
router.route('/user/favorites/add/:id').put(requireAuth, handleSaveToFavorites);
router.route('/user/favorites/remove/:id').put(requireAuth, handleRemoveFromFavorites);
router.route('/user/favorites').get(requireAuth, handleGetAllFavorites);
router.route('/users').get(handleGetAllUsers);
router.route('/organizations/:id').get(handleGetOrganization).put(handleUpdateOrganization).delete(handleDeleteOrganization);
router.route('/organizations').get(handleGetAllOrganizations).post(handleCreateOrganization);
router.route('/search/organizations').post(handleSearchOrganizations);
router.route('/autocomplete/organizations').post(handleAutocomplete);
router.route('/load_data/organizations').post(addAllOrganizationInfo);

export default router;
