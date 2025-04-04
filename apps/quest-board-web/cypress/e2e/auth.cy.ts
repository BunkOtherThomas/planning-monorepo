describe('Authentication Flow', () => {
  beforeEach(() => {
    // Intercept API calls with delays to show loading states
    cy.intercept('POST', 'http://localhost:3001/api/auth/signup', {
      statusCode: 200,
      delayMs: 1000, // Add delay to show loading state
      body: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaXNQcm9qZWN0TWFuYWdlciI6dHJ1ZSwiaXNUZWFtTWVtYmVyIjpmYWxzZSwiaWF0IjoxNzA5OTI2ODAwLCJleHAiOjE3MTA1MzE2MDB9.Hs_oKRgO_y-UUTwQhMDOtXn-55Tb4WKJrz0tK-kMPMU',
        user: {
          id: '1',
          displayName: 'TestUser',
          email: 'test@example.com',
          isProjectManager: true,
          isTeamMember: false,
          avatarId: 0,
        },
      },
    }).as('signupRequest');

    cy.intercept('POST', 'http://localhost:3001/api/auth/login', {
      statusCode: 200,
      delayMs: 1000, // Add delay to show loading state
      body: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaXNQcm9qZWN0TWFuYWdlciI6dHJ1ZSwiaXNUZWFtTWVtYmVyIjpmYWxzZSwiaWF0IjoxNzA5OTI2ODAwLCJleHAiOjE3MTA1MzE2MDB9.Hs_oKRgO_y-UUTwQhMDOtXn-55Tb4WKJrz0tK-kMPMU',
        user: {
          id: '1',
          displayName: 'TestUser',
          email: 'test@example.com',
          isProjectManager: true,
          isTeamMember: false,
          avatarId: 0,
        },
      },
    }).as('loginRequest');

    // Add team status check intercept
    cy.intercept('GET', 'http://localhost:3001/api/teams/status', {
      statusCode: 200,
      body: {
        hasTeamWithSkills: false
      }
    }).as('teamStatusCheck');

    // Add auth verification intercept
    cy.intercept('GET', 'http://localhost:3001/api/auth/me', {
      statusCode: 200,
      body: {
        id: '1',
        displayName: 'TestUser',
        email: 'test@example.com',
        isProjectManager: true,
        isTeamMember: false,
        avatarId: 0,
      },
    }).as('authVerification');

    // Clear cookies before each test
    cy.clearCookies();
  });

  it('completes the full authentication flow', () => {
    // Visit root and get redirected to login
    cy.visit('/');
    cy.url().should('include', '/login');

    // Verify login page elements
    cy.contains('h1', /welcome/i).should('be.visible');

    // Navigate to signup
    cy.contains(/join/i).click();
    cy.url().should('include', '/signup');

    // Verify signup page elements
    cy.contains('h1', /join/i).should('be.visible');

    // Fill out signup form with a strong password
    cy.get('input[name="username"]').type('TestUser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!@#', { delay: 100 });
    
    // Wait for password validation to update
    cy.wait(500);
    
    cy.get('input[name="confirmPassword"]').type('Password123!@#', { delay: 100 });
    
    // Wait for password validation to complete
    cy.get('button[type="submit"]').should('not.be.disabled');
    
    // Submit signup form
    cy.get('button[type="submit"]').click();
    
    // Wait for signup request
    cy.wait('@signupRequest').then((interception) => {
      // Set the auth token cookie
      cy.setCookie('auth-token', interception.response?.body.token);
    });
    
    // Verify redirect to goals
    cy.url().should('include', '/goals', { timeout: 10000 });

    // Clear cookies for testing login
    cy.clearCookies();
    cy.visit('/login');

    // Verify login page elements again
    cy.contains('h1', /welcome/i).should('be.visible');

    // Fill out login form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!@#');
    
    // Submit login form
    cy.contains(/enter/i).click();
    
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
    cy.get('input[name="password"]').type('Password123!@#', { delay: 100 });
    
    // Wait for password validation to update
    cy.wait(500);
    
    cy.get('input[name="confirmPassword"]').type('Password456!@#', { delay: 100 });
    
    // Wait for password validation to complete
    cy.get('button[type="submit"]').should('not.be.disabled');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify error message
    cy.contains(/do not match/i).should('be.visible');
  });

  it('shows loading state during form submission', () => {
    // Test signup loading state
    cy.visit('/signup');
    cy.get('input[name="username"]').type('TestUser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!@#', { delay: 100 });
    
    // Wait for password validation to update
    cy.wait(500);
    
    cy.get('input[name="confirmPassword"]').type('Password123!@#', { delay: 100 });
    
    // Wait for password validation to complete
    cy.get('button[type="submit"]').should('not.be.disabled');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Check loading state immediately after click
    cy.contains(/forging/i, { timeout: 1000 }).should('be.visible');
    cy.wait('@signupRequest');
    
    // Clear cookies before testing login
    cy.clearCookies();
    
    // Visit login page with failOnStatusCode: false to handle redirects
    cy.visit('/login', { failOnStatusCode: false });
    
    // Wait for the login page to be visible
    cy.contains('h1', /welcome/i, { timeout: 10000 }).should('be.visible');
    
    // Fill out login form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!@#');
    cy.contains(/enter/i).click();
    
    // Check loading state immediately after click
    cy.contains(/Opening Portal\.\.\./i, { timeout: 1000 }).should('be.visible');
    cy.wait('@loginRequest');
  });
}); 