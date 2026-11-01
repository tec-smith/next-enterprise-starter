import { expect, test } from "@playwright/test";
import { formAlert, seededUsers, signIn } from "./helpers";

test.describe("signed out", () => {
  test("protected pages redirect to sign-in and return afterwards", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/sign-in\?callbackUrl=/);

    await page.getByLabel("Email").fill(seededUsers.user.email);
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("a wrong password shows an error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(seededUsers.user.email);
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(formAlert(page)).toHaveText("Incorrect email or password.");
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("sign-up asks the new user to verify their email", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Name").fill("Test Person");
    await page.getByLabel("Email").fill(`e2e-${Date.now()}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("Password123");
    await page.getByLabel("Confirm password").fill("Password123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("status")).toContainText("verify your email");
  });

  test("an unverified account can't sign in", async ({ page }) => {
    const email = `unverified-${Date.now()}@example.com`;
    await page.goto("/sign-up");
    await page.getByLabel("Name").fill("Unverified");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123");
    await page.getByLabel("Confirm password").fill("Password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("status")).toBeVisible();

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("Password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(formAlert(page)).toContainText("verify your email");
  });

  test("an invalid verification link is rejected", async ({ page }) => {
    await page.goto("/verify-email?token=not-a-real-token");
    await expect(formAlert(page)).toContainText("invalid or has expired");
  });
});

test.describe("signed in", () => {
  test("a user sees the dashboard and can sign out", async ({ page }) => {
    await signIn(page, seededUsers.user.email);
    await expect(
      page.getByRole("heading", {
        name: `Welcome back, ${seededUsers.user.name}`,
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Open user menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("signed-in users are sent from auth pages to the dashboard", async ({
    page,
  }) => {
    await signIn(page, seededUsers.user.email);
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("regular users can't open the admin area", async ({ page }) => {
    await signIn(page, seededUsers.user.email);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("admins can open the admin area", async ({ page }) => {
    await signIn(page, seededUsers.admin.email);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: seededUsers.user.email }),
    ).toBeVisible();
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
