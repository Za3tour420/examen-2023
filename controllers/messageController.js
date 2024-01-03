var express = require('express');
var router = express.Router();

// Import Message functions
var {showMessages, displayCreateForm, createMessage, displayUpdateForm,
    updateMessage, deleteMessage, likeMessage, displayChat} = require('../services/messageService');

// Import validation middleware
var validation = require('../middlewares/validation');

router.get('/', showMessages);
router.get('/create', displayCreateForm);
router.post('/create', validation, createMessage);
router.get('/update/:id', displayUpdateForm);
router.post('/update/:id', validation, updateMessage);
router.get('/delete/:id', deleteMessage);
router.get('/like/:id', likeMessage);
router.get('/chat', displayChat);

 
module.exports = router;