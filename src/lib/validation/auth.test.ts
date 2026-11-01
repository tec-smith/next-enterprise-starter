import {
  passwordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

describe("passwordSchema", () => {
  it.each([
    ["short", "Ab1"],
    ["no uppercase", "password123"],
    ["no lowercase", "PASSWORD123"],
    ["no number", "Passwordxx"],
    ["over bcrypt's 72-byte limit", `Aa1${"x".repeat(70)}`],
  ])("rejects a password that is %s", (_, password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });

  it("accepts a strong password", () => {
    expect(passwordSchema.safeParse("Password123").success).toBe(true);
  });
});

describe("signInSchema", () => {
  it("normalises the email address", () => {
    const result = signInSchema.parse({
      email: "  Ada@Example.COM ",
      password: "x",
    });
    expect(result.email).toBe("ada@example.com");
  });

  it("rejects an invalid email", () => {
    expect(
      signInSchema.safeParse({ email: "nope", password: "x" }).success,
    ).toBe(false);
  });
});

describe("signUpSchema", () => {
  const valid = {
    name: "Ada",
    email: "ada@example.com",
    password: "Password123",
    confirmPassword: "Password123",
  };

  it("accepts valid input", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("reports mismatched passwords on confirmPassword", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      confirmPassword: "Password124",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });

  it("requires a name", () => {
    expect(signUpSchema.safeParse({ ...valid, name: "   " }).success).toBe(
      false,
    );
  });
});

describe("resetPasswordSchema", () => {
  it("requires a token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "Password123",
      confirmPassword: "Password123",
    });
    expect(result.success).toBe(false);
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
