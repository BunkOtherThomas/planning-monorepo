describe('Authentication Flow', () => {
  beforeEach(() => {
    // Intercept API calls with delays to show loading states
    cy.intercept('POST', 'http://localhost:3001/auth/signup', {
      statusCode: 200,
      delayMs: 1000, // Add delay to show loading state
      body: {
        token: 'fake-jwt-token',
        user: {
          id: '1',
          username: 'TestUser',
          email: 'test@example.com',
          role: 'adventurer',
          title: 'Novice Adventurer',
          rank: 1,
          experience: 0,
          gold: 100,
        },
      },
    }).as('signupRequest');

    cy.intercept('POST', 'http://localhost:3001/auth/login', {
      statusCode: 200,
      delayMs: 1000, // Add delay to show loading state
      body: {
        token: 'fake-jwt-token',
        user: {
          id: '1',
          username: 'TestUser',
          email: 'test@example.com',
          role: 'adventurer',
          title: 'Novice Adventurer',
          rank: 1,
          experience: 0,
          gold: 100,
        },
      },
    }).as('loginRequest');

    // Clear cookies before each test
    cy.clearCookies();
  });

  it('completes the full authentication flow', () => {
    // Visit root and get redirected to login
    cy.visit('/');
    cy.url().should('include', '/login');

    // Verify login page elements
    cy.contains('h1', 'Welcome, Adventurer').should('be.visible');

    // Navigate to signup
    cy.contains('Join the Quest Board').click();
    cy.url().should('include', '/signup');

    // Verify signup page elements
    cy.contains('h1', 'Join the Quest Board').should('be.visible');

    // Fill out signup form
    cy.get('input[name="username"]').type('TestUser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    
    // Select adventurer role (it's already selected by default)
    cy.get('input[value="adventurer"]').should('be.checked');
    
    // Submit signup form
    cy.contains('button', 'Begin Your Journey').click();
    
    // Wait for signup request
    cy.wait('@signupRequest').then((interception) => {
      // Set the auth token cookie
      cy.setCookie('auth-token', interception.response?.body.token);
    });
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard', { timeout: 10000 });

    // Clear cookies for testing login
    cy.clearCookies();
    cy.visit('/login');

    // Verify login page elements again
    cy.contains('h1', 'Welcome, Adventurer').should('be.visible');

    // Fill out login form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    
    // Submit login form
    cy.contains('button', 'Enter the Realm').click();
    
    // Wait for login request
    cy.wait('@loginRequest').then((interception) => {
      // Set the auth token cookie
      cy.setCookie('auth-token', interception.response?.body.token);
    });
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });

  it('shows error message for mismatched passwords', () => {
    cy.visit('/signup');
    
    // Fill out signup form with mismatched passwords
    cy.get('input[name="username"]').type('TestUser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password456');
    
    // Submit form
    cy.contains('button', 'Begin Your Journey').click();
    
    // Verify error message
    cy.contains('Your scrolls of passage do not match').should('be.visible');
  });

  it('shows loading state during form submission', () => {
    // Test signup loading state
    cy.visit('/signup');
    cy.get('input[name="username"]').type('TestUser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.contains('button', 'Begin Your Journey').click();
    
    // Check loading state immediately after click
    cy.contains('Forging Your Destiny...', { timeout: 1000 }).should('be.visible');
    cy.wait('@signupRequest');
    
    // Clear cookies before testing login
    cy.clearCookies();
    
    // Visit login page with failOnStatusCode: false to handle redirects
    cy.visit('/login', { failOnStatusCode: false });
    
    // Wait for the login page to be visible
    cy.contains('h1', 'Welcome, Adventurer', { timeout: 10000 }).should('be.visible');
    
    // Fill out login form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.contains('button', 'Enter the Realm').click();
    
    // Check loading state immediately after click
    cy.contains('Opening Portal...', { timeout: 1000 }).should('be.visible');
    cy.wait('@loginRequest');
  });
}); 