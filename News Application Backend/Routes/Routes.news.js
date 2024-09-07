const express = require('express');

let {addNews, editNews, deleteOneNews, fetchAllNews, filterByCategory, filterBySubEditor, fetchSingleNews, fetchBreakingNewses, fetchTopTenNewses, fetchEditorPick} = require('../Controllers/controllers.news')
let {authenticateAccessToken} = require('../Controllers/controllers.Users')

let router = express.Router()
// router.post('/addNews', authenticateAccessToken, addNews)
router.post('/addNews', addNews)
router.put('/editNews/:id', authenticateAccessToken, editNews)
router.delete('/deleteOneNews/:id', authenticateAccessToken, deleteOneNews)
router.get('/allNews', fetchAllNews)
router.post('/filterByCategory', filterByCategory)
router.get('/filterBySubEditor', authenticateAccessToken, filterBySubEditor)
router.get('/fetchSingleNews/:id', fetchSingleNews)
router.get('/fetchBreakingNewses', fetchBreakingNewses)
router.get('/fetchTopTenNewses', authenticateAccessToken, fetchTopTenNewses)
router.get('/fetchEditorPick', authenticateAccessToken, fetchEditorPick)

module.exports = router