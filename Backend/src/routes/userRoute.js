import express from 'express';
import * as userController from '../controllers/userController.js';
import baseLogger from '../utils/logger.js';

const router = express.Router();
const logger = baseLogger.child({ module: 'UserRoute' });

router.get('/user', userController.getAllUsers);
router.get('/user/:id', userController.getUserById);
router.post('/user', userController.createUser);
router.put('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

export default router;