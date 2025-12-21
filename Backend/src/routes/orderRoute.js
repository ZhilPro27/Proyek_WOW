import express from 'express';
import * as orderController from '../controllers/orderController.js';
import baseLogger from '../utils/logger.js';

const router = express.Router();
const logger = baseLogger.child({ module: 'OrderRoute' });

router.get('/order', orderController.getAllOrders);
router.get('/order/:id', orderController.getOrderById);
router.post('/order', orderController.createOrder);
router.put('/order/:id', orderController.updateOrder);
router.delete('/order/:id', orderController.deleteOrder);

export default router;