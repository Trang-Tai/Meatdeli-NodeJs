const express = require('express')
const router = express.Router();
import allcodeController from '../controllers/allcodeController.js';

router.get('/keymap', allcodeController.getKeyMap);

module.exports = router