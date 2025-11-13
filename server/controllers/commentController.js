// I'll import the 'Review' model from my main models/index.js file,
// since that's where I decided to store my comments.
const { Review, Recipe, User, sequelize } = require('../models');

/**
 * @route   PUT /api/comments/:commentId
 * @desc    Update *your* own comment/review
 * @access  Private (requires authentication and ownership)
 */
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment, rating } = req.body;

    // Find the comment/review
    const review = await Review.findByPk(commentId);

    if (!review) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user owns this comment
    if (review.userId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own comments.' 
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Build update object
    const updateData = {};
    if (comment !== undefined) updateData.comment = comment.trim();
    if (rating !== undefined) updateData.rating = rating;

    // Update the comment
    await review.update(updateData);

    // If rating was updated, recalculate the recipe's average rating
    // We use a database aggregate function for efficiency instead of fetching all reviews
    if (rating !== undefined) {
      const recipe = await Recipe.findByPk(review.recipeId);
      if (recipe) {
        // Use Sequelize's aggregate function to calculate average directly in the database
        // This is much more efficient than fetching all reviews and calculating in JavaScript
        const result = await Review.findOne({
          where: { recipeId: review.recipeId },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
            [sequelize.fn('COUNT', sequelize.col('rating')), 'ratingCount']
          ],
          raw: true
        });
        
        // Update the recipe's average rating based on the database calculation
        if (result && result.averageRating) {
          const averageRating = parseFloat(parseFloat(result.averageRating).toFixed(1));
          await recipe.update({ averageRating: averageRating });
        } else {
          // No ratings, set to 0
          await recipe.update({ averageRating: 0.0 });
        }
      }
    }

    // Fetch the updated comment with user info
    const updatedReview = await Review.findByPk(commentId, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'username', 'profilePicture']
      }]
    });

    res.json({
      message: 'Comment updated successfully',
      comment: updatedReview
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error while updating comment' });
  }
};

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Delete *your* own comment/review
 * @access  Private (requires authentication and ownership)
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Find the comment/review
    const review = await Review.findByPk(commentId);

    if (!review) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user owns this comment
    if (review.userId !== req.user.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own comments.' 
      });
    }

    // Store recipe ID before deletion (for recalculating average rating)
    const recipeId = review.recipeId;
    const hadRating = review.rating !== null;

    // Delete the comment
    await review.destroy();

    // If the comment had a rating, recalculate the recipe's average rating
    // We use a database aggregate function for efficiency
    if (hadRating) {
      const recipe = await Recipe.findByPk(recipeId);
      if (recipe) {
        // Use Sequelize's aggregate function to calculate average directly in the database
        // This is much more efficient than fetching all reviews and calculating in JavaScript
        const result = await Review.findOne({
          where: { recipeId: recipeId },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
            [sequelize.fn('COUNT', sequelize.col('rating')), 'ratingCount']
          ],
          raw: true
        });
        
        // Update the recipe's average rating based on the database calculation
        if (result && result.averageRating) {
          const averageRating = parseFloat(parseFloat(result.averageRating).toFixed(1));
          await recipe.update({ averageRating: averageRating });
        } else {
          // No more ratings, set to 0
          await recipe.update({ averageRating: 0.0 });
        }
      }
    }

    res.json({
      message: 'Comment deleted successfully',
      commentId: commentId
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
};