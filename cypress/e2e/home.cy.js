describe("Home Page", () => {
  beforeEach(() => cy.visit("http://localhost:3000"));

  it("renders hero section", () => {
    cy.contains("h1", "SQL Practice Platform").should("be.visible");
    cy.contains("p", "Learn SQL interactively").should("be.visible");
  });

  it("renders feature cards", () => {
    cy.contains("Real Datasets").should("be.visible");
    cy.contains("Instant Query Execution").should("be.visible");
    cy.contains("Automatic Grading").should("be.visible");
  });

  it("Start Practicing button navigates to login", () => {
    cy.contains("button", "Start Practicing").click();
    cy.url().should("include", "/login");
  });

  it("navbar has Home, About, and Login links", () => {
    cy.get("nav").contains("Home").should("be.visible");
    cy.get("nav").contains("About").should("be.visible");
    cy.get("nav").contains("Login").should("be.visible");
  });
});
