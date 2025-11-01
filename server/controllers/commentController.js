/**
 * @route   PUT /api/comments/:commentId
 * [cite_start]@desc    Update *your* own comment [cite: 154]
 */
exports.updateComment = (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  //  TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected
  // 2. Find the comment: `const comment = await Comment.findById(commentId);`
  // 3. Check if `comment.author` is the same as `req.user.id`
  // 4. If they own it, update it:
  //    `const updatedComment = await Comment.findByIdAndUpdate(commentId, { text }, { new: true });`

  res.json({
    message: 'Comment updated (placeholder)',
    comment: { id: commentId, text }
  });
};

/**
 * @route   DELETE /api/comments/:commentId
 * [cite_start]@desc    Delete *your* own comment [cite: 154]
 */
exports.deleteComment = (req, res) => {
  const { commentId } = req.params;

  //  TODO: Auth Middleware & Database logic
  // 1. This route needs to be protected
  // 2. Find the comment: `const comment = await Comment.findById(commentId);`
  // 3. Check if `comment.author` is the same as `req.user.id`
  // 4. If they own it, delete it: `await Comment.findByIdAndDelete(commentId);`

  res.json({
    message: 'Comment deleted (placeholder)',
    commentId: commentId
  });
};