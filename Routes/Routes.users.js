const express = require('express');

let { userSignup, userLogin, authenticateAccessToken, generateNewAccessToken, saveNews, unSaveNews, updateUserDetails, fetchSavedNewsIds, fetchSavedNews, verifyCurrentPassword } = require('../Controllers/controllers.Users')

let router = express.Router()
router.post('/userSignup', userSignup)
router.post('/userLogin', userLogin)
router.post('/refreshAccessToken', generateNewAccessToken)
router.put('/updateUserDetails', authenticateAccessToken, updateUserDetails)
router.put('/saveNews/:id', authenticateAccessToken, saveNews)
router.put('/unSaveNews/:id', authenticateAccessToken, unSaveNews)
router.get('/fetchSavedNews', authenticateAccessToken, fetchSavedNews)
router.get('/fetchSavedNewsIds', authenticateAccessToken, fetchSavedNewsIds)
router.get('/verifyCurrentPassword/:id', authenticateAccessToken, verifyCurrentPassword)

module.exports = router