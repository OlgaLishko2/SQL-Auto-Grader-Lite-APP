describe("Login Page", () => {
  beforeEach(() => cy.visit("http://localhost:3000/login"));

  it("renders login form", () => {
    cy.contains("h2", "Welcome Back").should("be.visible");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.contains("button", "Login").should("be.visible");
  });

  it("shows error on wrong credentials", () => {
    cy.get('input[type="email"]').type("wrong@example.com");
    cy.get('input[type="password"]').type("wrongpassword");
    cy.contains("button", "Login").click();
    cy.contains("Wrong email or password").should("be.visible");
  });

  it("navigates to register page", () => {
    cy.contains("Sign Up").click();
    cy.url().should("include", "/register");
  });
});
