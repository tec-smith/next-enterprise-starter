import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("verifies the original password and rejects others", async () => {
    const hash = await hashPassword("Password123");
    expect(hash).not.toContain("Password123");
    await expect(verifyPassword("Password123", hash)).resolves.toBe(true);
    await expect(verifyPassword("Password124", hash)).resolves.toBe(false);
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
