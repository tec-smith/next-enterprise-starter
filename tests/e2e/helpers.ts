import { expect, type Page } from "@playwright/test";

// Created by prisma/seed.ts.
export const seededUsers = {
  admin: { email: "admin@example.com", name: "Ada Admin" },
  user: { email: "user@example.com", name: "Uma User" },
} as const;

export const seedPassword = process.env.SEED_PASSWORD ?? "Password123!";

export async function signIn(
  page: Page,
  email: string,
  password = seedPassword,
) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

/** The form's error banner. Next.js's route announcer also has role="alert", so target ours. */
export function formAlert(page: Page) {
  return page.locator('[data-slot="alert"][role="alert"]');
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
