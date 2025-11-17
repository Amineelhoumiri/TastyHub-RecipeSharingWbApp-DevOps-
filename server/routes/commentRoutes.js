const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware'); // Import our authentication middleware

// @route   PUT /api/comments/:commentId
// Protected route - only the comment owner can update it
router.put('/:commentId', authMiddleware, commentController.updateComment);

// @route   DELETE /api/comments/:commentId
// Protected route - only the comment owner can delete it
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;
