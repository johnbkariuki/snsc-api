/* eslint-disable prefer-destructuring */
import { Router } from 'express';
import * as userController from './controllers/user_controller';
import * as organizationController from './controllers/organization_controller';
import * as filterController from './controllers/filters_controller';
import * as faqController from './controllers/faq_controller';
import { requireAuth, requireSignin } from './services/passport';

const router = Router();
const fs = require('fs');
const util = require('util');

const unlinkFile = util.promisify(fs.unlink);

const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const { uploadFile, getFileStream, deleteFile } = require('./services/s3');

// homepage
router.get('/', (req, res) => {
  res.json({ message: 'Hello! Welcome to the SNSC database API' });
});

// image functions

// upload the images
// input is {image: file, organizationId}
router.post('/images', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const result = await uploadFile(file);
    await unlinkFile(file.path);
    res.send({ imageKey: result.Key });
  } catch (error) {
    console.log(error);
    res.status(422).json({ error: error.toString() });
  }
});

// get the images
const handleGetImage = async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);

    readStream.pipe(res);
    // use readStream to return the image to the client
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleDeleteImage = async (req, res) => {
  try {
    const key = req.params.key;
    const result = deleteFile(key);

    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

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

const handleResetPassword = async (req, res) => {
  try {
    const result = await userController.resetPassword(req.user.id, req.body.newPassword);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

router.post('/signup', async (req, res) => {
  try {
    const result = await userController.signup(req.body);
    res.json({
      token: result.token, name: result.user.name, email: result.user.email, password: req.body.password, isAdmin: result.user.isAdmin,
    });
  } catch (error) {
    console.log(error);
    res.status(422).json({ error: error.toString() });
  }
});

router.post('/admin/signup', async (req, res) => {
  try {
    const result = await userController.adminSignup(req.body);
    res.json({
      token: result.token, name: result.user.name, email: result.user.email, password: req.body.password, isAdmin: result.user.isAdmin,
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
      token, name: req.user.name, email: req.user.email, password: req.body.password, isAdmin: req.user.isAdmin,
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
    const result = await organizationController.readJsonFile('./json_files/resources.json');
    await organizationController.addAllOrganizationInfo(result);
    res.send('Successfully added all organization info');
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
    console.log(req.body);
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

// filter functions
const handleGetAllDisabilityFilters = async (req, res) => {
  try {
    const result = await filterController.getAllDisabilityFilters();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleGetAllServiceFilters = async (req, res) => {
  try {
    const result = await filterController.getAllServiceFilters();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleGetAllStateFilters = async (req, res) => {
  try {
    const result = await filterController.getAllStateFilters();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleGetAllInsuranceFilters = async (req, res) => {
  try {
    const result = await filterController.getAllInsuranceFilters();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

// FAQ routes
const handleGetAllFaqs = async (req, res) => {
  try {
    const result = await faqController.getAllFaqs();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleCreateFaq = async (req, res) => {
  try {
    const result = await faqController.createFaq(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleDeleteFaq = async (req, res) => {
  try {
    const result = await faqController.deleteFaq(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleUpdateFaq = async (req, res) => {
  try {
    const result = await faqController.updateFaq(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const addAllFaqInfo = async (req, res) => {
  try {
    const result = await faqController.readJsonFile('./json_files/faqs.json');
    await faqController.addAllFaqInfo(result);
    res.send('Success');
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

// otp
const handleCreateOTP = async (req, res) => {
  try {
    const result = await userController.createNewOTP(req.body.userEmail);
    res.json({ fullHash: result });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const handleVerifyOTP = async (req, res) => {
  try {
    // req.body needs userEmail, otp, and fullhash
    const token = await userController.verifyOTP(req.body);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

// routes
router.route('/user').get(requireAuth, handleGetUser).put(requireAuth, handleUpdateUser);
router.route('/user/password').put(requireAuth, handleUpdatePassword);
router.route('/user/resetPassword').put(requireAuth, handleResetPassword);
router.route('/user/favorites/add/:id').put(requireAuth, handleSaveToFavorites);
router.route('/user/favorites/remove/:id').put(requireAuth, handleRemoveFromFavorites);
router.route('/user/favorites').get(requireAuth, handleGetAllFavorites);
router.route('/users').get(requireAuth, handleGetAllUsers);

// organization routes
// add requireAuth
router.route('/organizations/:id').get(requireAuth, handleGetOrganization).put(requireAuth, handleUpdateOrganization).delete(requireAuth, handleDeleteOrganization);
router.route('/organizations').get(handleGetAllOrganizations).post(requireAuth, handleCreateOrganization);
router.route('/search/organizations').post(handleSearchOrganizations);
router.route('/autocomplete/organizations').post(handleAutocomplete);
router.route('/load_data/organizations').post(requireAuth, addAllOrganizationInfo);

// filter routes
router.route('/filters/disabilities').get(handleGetAllDisabilityFilters);
router.route('/filters/services').get(handleGetAllServiceFilters);
router.route('/filters/states').get(handleGetAllStateFilters);
router.route('/filters/insurances').get(handleGetAllInsuranceFilters);

// faq routes
router.route('/faq').get(handleGetAllFaqs).post(requireAuth, handleCreateFaq);
router.route('/faq/:id').put(requireAuth, handleUpdateFaq).delete(requireAuth, handleDeleteFaq);
router.route('/load_data/faq').post(requireAuth, addAllFaqInfo);

// otp routes
router.route('/otp').post(handleCreateOTP);
router.route('/verifyOTP').post(handleVerifyOTP);

// images routes
router.route('/images/:key').get(handleGetImage);
router.route('/images/:key').delete(requireAuth, handleDeleteImage);

export default router;
