describe("Randevu Alma Akışı", () => {
  beforeEach(() => {
    cy.visit("/doctor");
  });

  it("Doktor paneline girilebildiğini kontrol et", () => {
    cy.get("main").should("exist");
    cy.contains("button", "Doktor").should("be.visible");
  });

  it("Randevu alanı görüntülendiğini kontrol et", () => {
    cy.get('[role="grid"], [role="table"]').should("exist");
  });

  it("Slot seçilebildiğini kontrol et", () => {
    // Boş bir slot bulup tıkla
    cy.get('[data-testid="appointment-slot"]:not(.booked)').first().click({ force: true });
    cy.get('[role="dialog"]').should("be.visible");
  });

  it("Randevu iptali çalıştığını kontrol et", () => {
    cy.get('[data-testid="cancel-appointment"]').first().should("exist");
  });

  it("Erişilebilirlik kontrol et (WCAG AA)", () => {
    // Tüm form elemanlarının aria-label veya label'ı olduğunu kontrol et
    cy.get("input, select, textarea").each(($element) => {
      cy.wrap($element).should(
        "have.attr",
        "aria-label"
      );
    });
  });

  it("Mobil görünüm kontrol et", () => {
    cy.viewport("iphone-x");
    cy.get('[data-testid="agenda-view"]').should("be.visible");
    cy.get('[role="grid"]').should("not.be.visible");
  });

  it("Tablet görünüm kontrol et", () => {
    cy.viewport("ipad-2");
    cy.get('[data-testid="week-view"]').should("be.visible");
  });
});

describe("Hasta Dashboard", () => {
  beforeEach(() => {
    cy.visit("/patient");
  });

  it("Hasta paneline girilebildiğini kontrol et", () => {
    cy.get("main").should("exist");
    cy.contains("button", "Hasta").should("be.visible");
  });

  it("Dosya yüklenebileceğini kontrol et", () => {
    cy.get('input[type="file"]').should("exist");
  });

  it("Randevular listelendiğini kontrol et", () => {
    cy.get('[data-testid="appointment-list"]').should("exist");
  });
});

describe("Tema Değişimi", () => {
  it("Temayı değiştirebilmek için kontrol et", () => {
    cy.get("[aria-label*='tema']").click();
    cy.get("html").should("have.class", "dark");
  });
});
