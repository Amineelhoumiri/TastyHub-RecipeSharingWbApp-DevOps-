// Integration tests for Recipe endpoints
describe('Recipe Endpoints', () => {
  let authToken;
  let testRecipeId;

  before(() => {
    // Get an authentication token before running recipe tests
    const email = `recipe_test_${Date.now()}@example.com`;
    cy.registerUser({
      username: `recipetest_${Date.now()}`,
      email: email,
      password: 'password123',
    }).then(() => {
      cy.login(email, 'password123').then((response) => {
        authToken = response.token;
      });
    });
  });

  it('GET /api/recipes - should return paginated recipes', () => {
    cy.request({
      method: 'GET',
      url: '/api/recipes',
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('recipes');
      expect(response.body).to.have.property('count');
      expect(response.body).to.have.property('page');
      expect(response.body).to.have.property('pageSize');
      expect(response.body).to.have.property('totalCount');
      expect(response.body.recipes).to.be.an('array');
    });
  });

  it('GET /api/recipes?page=1&pageSize=5 - should respect pagination', () => {
    cy.request({
      method: 'GET',
      url: '/api/recipes?page=1&pageSize=5',
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.page).to.eq(1);
      expect(response.body.pageSize).to.eq(5);
      expect(response.body.recipes.length).to.be.at.most(5);
    });
  });

  it('POST /api/recipes - should create a recipe with valid token', () => {
    const recipeData = {
      title: `Test Recipe ${Date.now()}`,
      description: 'This is a test recipe',
      cookingTime: 30,
      servings: 4,
    };

    cy.authenticatedRequest('POST', '/api/recipes', recipeData).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('recipe');
      expect(response.body.recipe.title).to.eq(recipeData.title);
      expect(response.body.recipe.description).to.eq(recipeData.description);
      testRecipeId = response.body.recipe.id;
    });
  });

  it('POST /api/recipes - should reject without token', () => {
    const recipeData = {
      title: 'Test Recipe',
      description: 'This is a test recipe',
    };

    cy.request({
      method: 'POST',
      url: '/api/recipes',
      body: recipeData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('POST /api/recipes - should reject without title', () => {
    const recipeData = {
      description: 'This is a test recipe without title',
    };

    cy.authenticatedRequest('POST', '/api/recipes', recipeData).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('Title is required');
    });
  });

  it('GET /api/recipes/:recipeId - should get recipe by ID', () => {
    // Create a recipe first if we don't have one
    if (!testRecipeId) {
      cy.authenticatedRequest('POST', '/api/recipes', {
        title: `Test Recipe for Get ${Date.now()}`,
        description: 'Test description',
      }).then((response) => {
        testRecipeId = response.body.recipe.id;
      });
    }

    cy.request({
      method: 'GET',
      url: `/api/recipes/${testRecipeId}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('recipe');
      expect(response.body.recipe.id).to.eq(testRecipeId);
    });
  });

  it('GET /api/recipes/:recipeId - should return 404 for non-existent recipe', () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    cy.request({
      method: 'GET',
      url: `/api/recipes/${fakeId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body.message).to.include('not found');
    });
  });

  it('PUT /api/recipes/:recipeId - should update recipe with valid token and ownership', () => {
    // Make sure we have a recipe to update
    if (!testRecipeId) {
      cy.authenticatedRequest('POST', '/api/recipes', {
        title: `Recipe to Update ${Date.now()}`,
        description: 'Original description',
      }).then((response) => {
        testRecipeId = response.body.recipe.id;
      });
    }

    const updateData = {
      title: 'Updated Recipe Title',
      description: 'Updated description',
      cookingTime: 45,
      servings: 6,
    };

    cy.authenticatedRequest('PUT', `/api/recipes/${testRecipeId}`, updateData).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.recipe.title).to.eq(updateData.title);
      expect(response.body.recipe.description).to.eq(updateData.description);
      expect(response.body.recipe.cookingTime).to.eq(updateData.cookingTime);
      expect(response.body.recipe.servings).to.eq(updateData.servings);
    });
  });

  it('PUT /api/recipes/:recipeId - should reject update without ownership', () => {
    let recipeId;
    let secondUserToken;

    // Create a recipe with first user
    cy.authenticatedRequest('POST', '/api/recipes', {
      title: `Recipe for Ownership Test ${Date.now()}`,
      description: 'Test description',
    }).then((response) => {
      recipeId = response.body.recipe.id;

      // Create a second user
      const email = `second_${Date.now()}@example.com`;
      cy.registerUser({
        username: `seconduser_${Date.now()}`,
        email: email,
        password: 'password123',
      }).then(() => {
        cy.login(email, 'password123').then((loginResponse) => {
          secondUserToken = loginResponse.token;

          // Try to update with second user (should fail)
          cy.request({
            method: 'PUT',
            url: `/api/recipes/${recipeId}`,
            headers: {
              Authorization: `Bearer ${secondUserToken}`,
            },
            body: { title: 'Unauthorized Update' },
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.include('Access denied');
          });
        });
      });
    });
  });

  it('DELETE /api/recipes/:recipeId - should delete recipe with valid token and ownership', () => {
    let recipeToDelete;

    // Create a recipe to delete
    cy.authenticatedRequest('POST', '/api/recipes', {
      title: `Recipe to Delete ${Date.now()}`,
      description: 'This recipe will be deleted',
    }).then((response) => {
      recipeToDelete = response.body.recipe.id;

      // Delete the recipe
      cy.authenticatedRequest('DELETE', `/api/recipes/${recipeToDelete}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.include('deleted successfully');
        expect(response.body.recipeId).to.eq(recipeToDelete);

        // Verify it's actually deleted
        cy.request({
          method: 'GET',
          url: `/api/recipes/${recipeToDelete}`,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(404);
        });
      });
    });
  });

  it('DELETE /api/recipes/:recipeId - should reject delete without ownership', () => {
    let recipeId;
    let secondUserToken;

    // Create a recipe with first user
    cy.authenticatedRequest('POST', '/api/recipes', {
      title: `Recipe for Delete Test ${Date.now()}`,
      description: 'Test description',
    }).then((response) => {
      recipeId = response.body.recipe.id;

      // Create a second user
      const email = `delete_${Date.now()}@example.com`;
      cy.registerUser({
        username: `deleteuser_${Date.now()}`,
        email: email,
        password: 'password123',
      }).then(() => {
        cy.login(email, 'password123').then((loginResponse) => {
          secondUserToken = loginResponse.token;

          // Try to delete with second user (should fail)
          cy.request({
            method: 'DELETE',
            url: `/api/recipes/${recipeId}`,
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

  it('POST /api/recipes/:recipeId/like - should like a recipe', () => {
    // Make sure we have a recipe
    if (!testRecipeId) {
      cy.authenticatedRequest('POST', '/api/recipes', {
        title: `Recipe to Like ${Date.now()}`,
        description: 'Test description',
      }).then((response) => {
        testRecipeId = response.body.recipe.id;
      });
    }

    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/like`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.isLiked).to.eq(true);
      expect(response.body.message).to.include('liked successfully');
      expect(response.body.totalLikes).to.be.at.least(0);
    });
  });

  it('POST /api/recipes/:recipeId/like - should unlike a recipe (toggle)', () => {
    let recipeId;

    // Create a fresh recipe for this test to avoid state issues
    cy.authenticatedRequest('POST', '/api/recipes', {
      title: `Recipe to Unlike ${Date.now()}`,
      description: 'Test description',
    }).then((response) => {
      recipeId = response.body.recipe.id;

      // Like it first
      cy.authenticatedRequest('POST', `/api/recipes/${recipeId}/like`).then((likeResponse) => {
        expect(likeResponse.body.isLiked).to.eq(true);

        // Then unlike it
        cy.authenticatedRequest('POST', `/api/recipes/${recipeId}/like`).then((response) => {
          expect(response.body.isLiked).to.eq(false);
          expect(response.body.message).to.include('unliked successfully');
        });
      });
    });
  });

  it('POST /api/recipes/:recipeId/favourite - should favorite a recipe', () => {
    // Make sure we have a recipe
    if (!testRecipeId) {
      cy.authenticatedRequest('POST', '/api/recipes', {
        title: `Recipe to Favorite ${Date.now()}`,
        description: 'Test description',
      }).then((response) => {
        testRecipeId = response.body.recipe.id;
      });
    }

    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/favourite`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.isFavorited).to.eq(true);
      expect(response.body.message).to.include('added to favorites');
    });
  });

  it('POST /api/recipes/:recipeId/favourite - should unfavorite a recipe (toggle)', () => {
    let recipeId;

    // Create a fresh recipe for this test to avoid state issues
    cy.authenticatedRequest('POST', '/api/recipes', {
      title: `Recipe to Unfavorite ${Date.now()}`,
      description: 'Test description',
    }).then((response) => {
      recipeId = response.body.recipe.id;

      // Favorite it first
      cy.authenticatedRequest('POST', `/api/recipes/${recipeId}/favourite`).then((favoriteResponse) => {
        expect(favoriteResponse.body.isFavorited).to.eq(true);

        // Then unfavorite it
        cy.authenticatedRequest('POST', `/api/recipes/${recipeId}/favourite`).then((response) => {
          expect(response.body.isFavorited).to.eq(false);
          expect(response.body.message).to.include('removed from favorites');
        });
      });
    });
  });

  it('POST /api/recipes/:recipeId/comments - should create a comment on recipe', () => {
    // Make sure we have a recipe
    if (!testRecipeId) {
      cy.authenticatedRequest('POST', '/api/recipes', {
        title: `Recipe for Comment ${Date.now()}`,
        description: 'Test description',
      }).then((response) => {
        testRecipeId = response.body.recipe.id;
      });
    }

    const commentData = {
      comment: 'This is a great recipe!',
      rating: 5,
    };

    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/comments`, commentData).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('comment');
      expect(response.body.comment.comment).to.eq(commentData.comment);
      expect(response.body.comment.rating).to.eq(commentData.rating);
    });
  });

  it('POST /api/recipes/:recipeId/comments - should reject comment without text', () => {
    if (!testRecipeId) {
      cy.authenticatedRequest('POST', '/api/recipes', {
        title: `Recipe for Comment Test ${Date.now()}`,
        description: 'Test description',
      }).then((response) => {
        testRecipeId = response.body.recipe.id;
      });
    }

    cy.authenticatedRequest('POST', `/api/recipes/${testRecipeId}/comments`, { rating: 5 }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('Comment text is required');
    });
  });
});







