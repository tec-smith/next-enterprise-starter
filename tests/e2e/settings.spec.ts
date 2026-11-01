import { expect, test } from "@playwright/test";
import { seededUsers, signIn } from "./helpers";

test("a user can update their name", async ({ page }) => {
  await signIn(page, seededUsers.admin.email);
  await page.goto("/settings");

  const name = `${seededUsers.admin.name} ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile updated.")).toBeVisible();

  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: `Welcome back, ${name}` }),
  ).toBeVisible();

  // Restore the seeded name so other tests can rely on it.
  await page.goto("/settings");
  await page.getByLabel("Name").fill(seededUsers.admin.name);
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile updated.")).toBeVisible();
});

test("changing the password checks the current one", async ({ page }) => {
  await signIn(page, seededUsers.admin.email);
  await page.goto("/settings");

  await page.getByLabel("Current password").fill("wrong-password");
  await page.getByLabel("New password", { exact: true }).fill("NewPassword123");
  await page.getByLabel("Confirm new password").fill("NewPassword123");
  await page.getByRole("button", { name: "Change password" }).click();

  await expect(
    page.getByText("Your current password is incorrect."),
  ).toBeVisible();
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
