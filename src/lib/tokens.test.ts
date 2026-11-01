import {
  consumeToken,
  hashToken,
  issueToken,
  TOKEN_TTL_MS,
} from "@/lib/tokens";

const db = vi.hoisted(() => ({
  $transaction: vi.fn((operations: unknown[]) => Promise.all(operations)),
  authToken: { deleteMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ db }));

describe("issueToken", () => {
  it("stores only the hash and replaces earlier tokens", async () => {
    const token = await issueToken("user-1", "PASSWORD_RESET");

    expect(token).toMatch(/^[\w-]{43}$/);
    expect(db.authToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", type: "PASSWORD_RESET" },
    });
    const { data } = db.authToken.create.mock.calls[0]![0];
    expect(data.tokenHash).toBe(hashToken(token));
    expect(data.tokenHash).not.toBe(token);
    expect(data.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(
      TOKEN_TTL_MS.PASSWORD_RESET,
    );
  });
});

describe("consumeToken", () => {
  const future = new Date(Date.now() + 60_000);
  const record = {
    id: "t1",
    userId: "user-1",
    type: "PASSWORD_RESET",
    expiresAt: future,
  };

  it("returns the user ID for a valid token and deletes it", async () => {
    db.authToken.findUnique.mockResolvedValue(record);
    db.authToken.deleteMany.mockResolvedValue({ count: 1 });

    await expect(consumeToken("abc", "PASSWORD_RESET")).resolves.toBe("user-1");
    expect(db.authToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashToken("abc") },
    });
    expect(db.authToken.deleteMany).toHaveBeenCalledWith({
      where: { id: "t1" },
    });
  });

  it("rejects unknown and wrong-type tokens", async () => {
    db.authToken.findUnique.mockResolvedValueOnce(null);
    await expect(consumeToken("abc", "PASSWORD_RESET")).resolves.toBeNull();

    db.authToken.findUnique.mockResolvedValueOnce({
      ...record,
      type: "EMAIL_VERIFICATION",
    });
    await expect(consumeToken("abc", "PASSWORD_RESET")).resolves.toBeNull();
  });

  it("rejects expired tokens and still deletes them", async () => {
    db.authToken.findUnique.mockResolvedValue({
      ...record,
      expiresAt: new Date(0),
    });
    db.authToken.deleteMany.mockResolvedValue({ count: 1 });

    await expect(consumeToken("abc", "PASSWORD_RESET")).resolves.toBeNull();
    expect(db.authToken.deleteMany).toHaveBeenCalled();
  });

  it("rejects a token another request consumed first", async () => {
    db.authToken.findUnique.mockResolvedValue(record);
    db.authToken.deleteMany.mockResolvedValue({ count: 0 });

    await expect(consumeToken("abc", "PASSWORD_RESET")).resolves.toBeNull();
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
