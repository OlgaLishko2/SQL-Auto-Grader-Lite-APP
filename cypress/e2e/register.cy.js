describe("Register Page", () => {
  beforeEach(() => cy.visit("http://localhost:3000/register"));

  it("renders register form", () => {
    cy.contains("h2", "Create Account").should("be.visible");
    cy.get('input[type="text"]').should("exist");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.get("select").should("exist");
    cy.contains("button", "Sign Up").should("be.visible");
  });

  it("role dropdown has student and teacher options", () => {
    cy.get("select").find("option").should("have.length", 2);
    cy.get("select").contains("Student");
    cy.get("select").contains("Teacher");
  });

  it("can select teacher role", () => {
    cy.get("select").select("teacher");
    cy.get("select").should("have.value", "teacher");
  });

  it("navigates to login page", () => {
    cy.contains("Login").click();
    cy.url().should("include", "/login");
  });

  it("shows error on duplicate email", () => {
    cy.get('input[type="text"]').type("Test User");
    cy.get('input[type="email"]').type("existing@example.com");
    cy.get('input[type="password"]').type("password123");
    cy.contains("button", "Sign Up").click();
    cy.contains("already").should("be.visible");
  });
});
