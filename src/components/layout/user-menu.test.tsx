import { initials } from "@/components/layout/user-menu";

vi.mock("@/lib/actions/auth", () => ({ signOutAction: vi.fn() }));

describe("initials", () => {
  it.each([
    ["Ada Lovelace", null, "AL"],
    ["Grace Brewster Hopper", null, "GH"],
    ["Cher", null, "CH"],
    [null, "linus@example.com", "LI"],
    [null, null, "?"],
  ])("derives initials from name %s / email %s", (name, email, expected) => {
    expect(initials(name, email)).toBe(expected);
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
