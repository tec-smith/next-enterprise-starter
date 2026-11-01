import { expect, test } from "@playwright/test";

test("home page renders with calls to action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();
});

test("health check reports the database as reachable", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok", database: "ok" });
});

test("responses carry security headers", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("pages link their social card, which renders as an image", async ({
  page,
  request,
}) => {
  await page.goto("/sign-up");
  const ogImage = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(ogImage).toMatch(/\/cards\/sign-up$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );

  const card = await request.get(new URL(ogImage!).pathname);
  expect(card.ok()).toBe(true);
  expect(card.headers()["content-type"]).toBe("image/png");
});

test("sitemap, robots.txt and llms.txt are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("<image:loc>");

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap:");

  const llms = await request.get("/llms.txt");
  expect(llms.headers()["content-type"]).toContain("text/plain");
});

test("unknown pages show the 404 page", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
