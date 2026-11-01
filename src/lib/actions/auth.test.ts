import {
  forgotPasswordAction,
  resetPasswordAction,
  signUpAction,
  verifyEmail,
} from "@/lib/actions/auth";

const mocks = vi.hoisted(() => ({
  db: { user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() } },
  issueToken: vi.fn(),
  consumeToken: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ db: mocks.db }));
vi.mock("@/lib/tokens", () => ({
  issueToken: mocks.issueToken,
  consumeToken: mocks.consumeToken,
}));
vi.mock("@/lib/mail", () => ({
  sendVerificationEmail: mocks.sendVerificationEmail,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
}));
vi.mock("@/lib/auth", () => ({ signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn(async (p: string) => `hashed:${p}`),
}));
// Each test gets its own client IP so the module-level rate limiters don't interfere.
let ip = 0;
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": `198.51.100.${++ip}` }),
}));

const signUp = {
  name: "Ada",
  email: "ada@example.com",
  password: "Password123",
  confirmPassword: "Password123",
};

describe("signUpAction", () => {
  it("returns field errors for invalid input without touching the database", async () => {
    const result = await signUpAction({ ...signUp, email: "bad" });
    expect(result).toMatchObject({
      ok: false,
      fieldErrors: { email: [expect.any(String)] },
    });
    expect(mocks.db.user.findUnique).not.toHaveBeenCalled();
  });

  it("creates the user with a hashed password and sends a verification email", async () => {
    mocks.db.user.findUnique.mockResolvedValue(null);
    mocks.db.user.create.mockResolvedValue({ id: "user-1" });
    mocks.issueToken.mockResolvedValue("token-1");

    const result = await signUpAction(signUp);

    expect(result.ok).toBe(true);
    expect(mocks.db.user.create).toHaveBeenCalledWith({
      data: {
        name: "Ada",
        email: "ada@example.com",
        passwordHash: "hashed:Password123",
      },
    });
    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith(
      "ada@example.com",
      "token-1",
      "Ada",
    );
  });

  it("gives the same reply for an existing account, without creating one", async () => {
    mocks.db.user.findUnique.mockResolvedValue({
      id: "user-1",
      emailVerified: new Date(),
    });
    mocks.db.user.create.mockResolvedValue({ id: "user-2" });

    const existing = await signUpAction(signUp);
    mocks.db.user.findUnique.mockResolvedValue(null);
    const fresh = await signUpAction(signUp);

    expect(existing).toEqual(fresh);
    expect(mocks.db.user.create).toHaveBeenCalledTimes(1);
  });
});

describe("forgotPasswordAction", () => {
  it("replies identically whether or not the account exists", async () => {
    mocks.db.user.findUnique.mockResolvedValueOnce(null);
    const unknown = await forgotPasswordAction({ email: "nobody@example.com" });

    mocks.db.user.findUnique.mockResolvedValueOnce({
      id: "user-1",
      name: "Ada",
    });
    mocks.issueToken.mockResolvedValue("reset-token");
    const known = await forgotPasswordAction({ email: "ada@example.com" });

    expect(unknown).toEqual(known);
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledOnce();
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(
      "ada@example.com",
      "reset-token",
      "Ada",
    );
  });
});

describe("resetPasswordAction", () => {
  const values = {
    token: "t",
    password: "Password123",
    confirmPassword: "Password123",
  };

  it("rejects an invalid or expired token", async () => {
    mocks.consumeToken.mockResolvedValue(null);
    await expect(resetPasswordAction(values)).resolves.toMatchObject({
      ok: false,
    });
    expect(mocks.db.user.update).not.toHaveBeenCalled();
  });

  it("stores the new hash for a valid token", async () => {
    mocks.consumeToken.mockResolvedValue("user-1");
    await expect(resetPasswordAction(values)).resolves.toMatchObject({
      ok: true,
    });
    expect(mocks.db.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        passwordHash: "hashed:Password123",
        emailVerified: expect.any(Date),
      },
    });
  });
});

describe("verifyEmail", () => {
  it("marks the user verified for a valid token", async () => {
    mocks.consumeToken.mockResolvedValue("user-1");
    await expect(verifyEmail("t")).resolves.toMatchObject({ ok: true });
    expect(mocks.db.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { emailVerified: expect.any(Date) },
    });
  });

  it("fails for an unknown token", async () => {
    mocks.consumeToken.mockResolvedValue(null);
    await expect(verifyEmail("t")).resolves.toMatchObject({ ok: false });
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
