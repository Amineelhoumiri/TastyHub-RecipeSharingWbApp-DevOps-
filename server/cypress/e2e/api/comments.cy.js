// Integration tests for Comment endpoints
describe('Comment Endpoints', () => {
  let authToken;
  let testRecipeId;
  let testCommentId;

  before(() => {
    // Get an authentication token and create a test recipe
    const email = `comment_test_${Date.now()}@example.com`;
    cy.registerUser({
      username: `commenttest_${Date.now()}`,
      email: email,
      password: 'password123',
    }).then(() => {
      cy.login(email, 'password123').then((response) => {
        authToken = response.token;

        // Create a recipe
        cy.authenticatedRequest('POST', '/api/recipes', {
          title: `Recipe for Comments ${Date.now()}`,
          description: 'Test recipe for comment testing',
        }).then((response) => {
          testRecipeId = response.body.recipe.id;
        });
      });
    });
  });

  it('POST /api/recipes/:recipeId/comments - should create a comment with rating', () => {
    const commentData = {
      comment: 'This is an amazing recipe! Highly recommend it.',
      rating: 5,
    };

    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/comments`, commentData).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('comment');
      expect(response.body.comment.comment).to.eq(commentData.comment);
      expect(response.body.comment.rating).to.eq(commentData.rating);
      expect(response.body.comment).to.have.property('id');
      testCommentId = response.body.comment.id;
    });
  });

  it('POST /api/recipes/:recipeId/comments - should create a comment without rating', () => {
    const commentData = {
      comment: 'Great recipe, will try it soon!',
    };

    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/comments`, commentData).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.comment.comment).to.eq(commentData.comment);
      expect(response.body.comment.rating).to.be.null;
    });
  });

  it('POST /api/recipes/:recipeId/comments - should reject invalid rating', () => {
    const commentData = {
      comment: 'Test comment',
      rating: 10, // Invalid - should be 1-5
    };

    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/comments`, commentData).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('between 1 and 5');
    });
  });

  it('PUT /api/comments/:commentId - should update own comment', () => {
    let commentId;

    // Make sure we have a comment to update
    if (!testCommentId) {
      cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/comments`, {
        comment: 'Original comment',
        rating: 3,
      }).then((response) => {
        commentId = response.body.comment.id;
      });
    } else {
      commentId = testCommentId;
    }

    const updateData = {
      comment: 'Updated comment text',
      rating: 4,
    };

    cy.authenticatedRequest('PUT', `/api/comments/${commentId}`, updateData).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.comment.comment).to.eq(updateData.comment);
      expect(response.body.comment.rating).to.eq(updateData.rating);
    });
  });

  it('PUT /api/comments/:commentId - should reject update without ownership', () => {
    let commentId;
    let secondUserToken;

    // Create a comment with first user
    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/comments`, {
      comment: 'Comment for ownership test',
      rating: 5,
    }).then((response) => {
      commentId = response.body.comment.id;

      // Create a second user
      const email = `comment_${Date.now()}@example.com`;
      cy.registerUser({
        username: `commentuser_${Date.now()}`,
        email: email,
        password: 'password123',
      }).then(() => {
        cy.login(email, 'password123').then((loginResponse) => {
          secondUserToken = loginResponse.token;

          // Try to update with second user (should fail)
          cy.request({
            method: 'PUT',
            url: `/api/comments/${commentId}`,
            headers: {
              Authorization: `Bearer ${secondUserToken}`,
            },
            body: { comment: 'Unauthorized update' },
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.include('Access denied');
          });
        });
      });
    });
  });

  it('DELETE /api/comments/:commentId - should delete own comment', () => {
    let commentToDelete;

    // Create a comment to delete
    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/comments`, {
      comment: 'This comment will be deleted',
      rating: 3,
    }).then((response) => {
      commentToDelete = response.body.comment.id;

      // Delete the comment
      cy.authenticatedRequest('DELETE', `/api/comments/${commentToDelete}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.include('deleted successfully');
        expect(response.body.commentId).to.eq(commentToDelete);
      });
    });
  });

  it('DELETE /api/comments/:commentId - should reject delete without ownership', () => {
    let commentId;
    let secondUserToken;

    // Create a comment with first user
    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/comments`, {
      comment: 'Comment for delete test',
      rating: 4,
    }).then((response) => {
      commentId = response.body.comment.id;

      // Create a second user
      const email = `deletecomment_${Date.now()}@example.com`;
      cy.registerUser({
        username: `deletecomment_${Date.now()}`,
        email: email,
        password: 'password123',
      }).then(() => {
        cy.login(email, 'password123').then((loginResponse) => {
          secondUserToken = loginResponse.token;

          // Try to delete with second user (should fail)
          cy.request({
            method: 'DELETE',
            url: `/api/comments/${commentId}`,
            headers: {
              Authorization: `Bearer ${secondUserToken}`,
            },
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.include('Access denied');
          });
        });
      });
    });
  });
});






