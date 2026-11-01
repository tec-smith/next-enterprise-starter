import { passwordResetEmail, verificationEmail } from "@/lib/mail/templates";

describe("email templates", () => {
  it("includes the action link in both HTML and text", () => {
    const email = verificationEmail(
      "Acme",
      "https://acme.test/verify-email?token=abc",
    );
    expect(email.subject).toBe("Verify your email for Acme");
    expect(email.html).toContain(
      'href="https://acme.test/verify-email?token=abc"',
    );
    expect(email.text).toContain("https://acme.test/verify-email?token=abc");
  });

  it("escapes user-controlled values in HTML", () => {
    const email = passwordResetEmail(
      "Acme",
      "https://acme.test/r",
      '<script>alert("x")</script>',
    );
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
