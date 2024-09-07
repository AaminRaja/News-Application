const express = require('express');

let {userSignup, userLogin, authenticateAccessToken, generateNewAccessToken, saveNews, unSaveNews, updateUserDetails} = require('../Controllers/controllers.Users')

let router = express.Router()
router.post('/userSignup', userSignup)
router.post('/userLogin', userLogin)
router.put('/updateUserDetails', authenticateAccessToken, updateUserDetails)
router.put('/saveNews/:id', authenticateAccessToken, saveNews)
router.put('/unSaveNews/:id', authenticateAccessToken, unSaveNews)

module.exports = router