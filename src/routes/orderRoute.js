const express = require('express')
const router = express.Router();
import orderController from '../controllers/orderController.js';
import middlewareController from '../controllers/middlewareController';

// middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

router.post('/create-payment-url', orderController.createPaymentUrl);
router.get('/vnpay_return', orderController.returnPaymentUrl);
router.get('/get-order', orderController.getOrder);
router.patch('/update-order', orderController.updateOrder);
router.patch('/re-payment-url', orderController.rePaymentUrl);

module.exports = router