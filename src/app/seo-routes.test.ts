import { siteConfig } from "@/config/site";
import { GET as llms } from "@/app/llms.txt/route";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("lists every public page with its social card", () => {
    const entries = sitemap();

    expect(entries.map((entry) => entry.url)).toEqual(
      siteConfig.publicPages.map(
        (page) => `http://localhost:3000${page.path === "/" ? "/" : page.path}`,
      ),
    );
    expect(
      entries.find((entry) => entry.url.endsWith("/sign-up"))?.images,
    ).toEqual(["http://localhost:3000/cards/sign-up"]);
    expect(
      entries.find((entry) => entry.url.endsWith("/sign-in"))?.images,
    ).toEqual(["http://localhost:3000/opengraph-image"]);
  });
});

describe("robots", () => {
  it("points at the sitemap and keeps private areas out", () => {
    const result = robots();
    expect(result.sitemap).toBe("http://localhost:3000/sitemap.xml");
    expect(result.rules).toMatchObject({
      disallow: expect.arrayContaining(["/admin", "/api/"]),
    });
  });
});

describe("llms.txt", () => {
  it("serves a plain-text overview with absolute links", async () => {
    const response = llms();
    const text = await response.text();

    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(
      text.startsWith(`# ${siteConfig.name}\n\n> ${siteConfig.description}`),
    ).toBe(true);
    expect(text).toContain("- [Sign in](http://localhost:3000/sign-in)");
    expect(text).toContain(`${siteConfig.repositoryUrl}/blob/main/README.md`);
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
