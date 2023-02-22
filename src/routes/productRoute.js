const express = require('express')
const router = express.Router();
import middlewareController from '../controllers/middlewareController';
import productLineController from '../controllers/productLineController.js';
import productController from '../controllers/productController';

router.post('/upsert-productline', middlewareController.verifyTokenAndAdminAuthor, productLineController.upsertProductLine);
router.get('/get-productline', productLineController.getProductLine);
router.delete('/delete-productline', middlewareController.verifyTokenAndAdminAuthor, productLineController.deleteProductLine);

router.post('/upsert-product', middlewareController.verifyTokenAndAdminAuthor, productController.upsertProduct);
router.get('/get-product', productController.getProduct);
router.delete('/delete-product', productController.deleteProduct);

module.exports = router