const express = require('express')
const router = express.Router();
import userController from '../controllers/userController.js';
import middlewareController from '../controllers/middlewareController';
import uploadCloud from '../config/cloudinary';

// middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

router.get('/ok', userController.ok);

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/refresh-token', userController.reqRefreshToken);
router.post('/logout', userController.logoutUser);
router.post('/decode-token', middlewareController.verifyToken, userController.reqDecodeToken);

router.post('/upsert', userController.upsertUser);
router.get('/get-user-info', userController.getUser);
router.delete('/delete-user', middlewareController.verifyTokenAndAdminAuthor, userController.deleteUser);
router.post('/restore-user', middlewareController.verifyTokenAndAdminAuthor, userController.restoreUser);
router.delete('/delete-permanent-user', middlewareController.verifyTokenAndAdminAuthor, userController.deletePermanentUser);

router.post('/reset-password', userController.resetPassword);
router.patch('/change-password', userController.changePassword);

module.exports = router