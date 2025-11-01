const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// @route   PUT /api/comments/:commentId
router.put('/:commentId', commentController.updateComment);

// @route   DELETE /api/comments/:commentId
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;