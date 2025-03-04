describe('Avatar Selection During Signup', () => {
  beforeEach(() => {
    // Mock the signup API call
    cy.intercept('POST', '/api/auth/signup', {
      delay: 1000,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: '123',
          email: 'test@example.com',
          displayName: 'Test User',
          avatarId: 0,
          isProjectManager: false,
          isTeamMember: true
        }
      }
    }).as('signupRequest');

    // Clear cookies before each test
    cy.clearCookies();
  });

  it('allows avatar selection without submitting the form', () => {
    // Visit signup page
    cy.visit('/signup');

    // Fill out the form but don't submit
    cy.get('input[name="username"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');

    // Wait for the page to stabilize
    cy.get('button[aria-label="Next avatar"]').should('be.visible');
    cy.get('button[aria-label="Previous avatar"]').should('be.visible');

    // Click the next avatar button and verify no form submission
    cy.get('button[aria-label="Next avatar"]').click();
    // Verify we're still on the signup page
    cy.url().should('include', '/signup');
    // Verify form is still filled out
    cy.get('input[name="username"]').should('have.value', 'Test User');
    cy.get('input[name="email"]').should('have.value', 'test@example.com');
    cy.get('input[name="password"]').should('have.value', 'Password123!');
    cy.get('input[name="confirmPassword"]').should('have.value', 'Password123!');

    // Click the previous avatar button and verify no form submission
    cy.get('button[aria-label="Previous avatar"]').click();
    // Verify we're still on the signup page
    cy.url().should('include', '/signup');
    // Verify form is still filled out
    cy.get('input[name="username"]').should('have.value', 'Test User');
    cy.get('input[name="email"]').should('have.value', 'test@example.com');
    cy.get('input[name="password"]').should('have.value', 'Password123!');
    cy.get('input[name="confirmPassword"]').should('have.value', 'Password123!');

    // Now actually submit the form to verify it works
    cy.get('button[type="submit"]').should('not.be.disabled').click();

    // Verify the signup request was made
    cy.wait('@signupRequest');
    cy.url().should('include', '/dashboard');
  });
}); 