// Basic app test to ensure server starts correctly
describe('Server Health Check', () => {
  it('GET /api/recipes - should return recipes list', () => {
    cy.request({
      method: 'GET',
      url: '/api/recipes'
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('recipes');
      expect(response.body.recipes).to.be.an('array');
    });
  });
});










