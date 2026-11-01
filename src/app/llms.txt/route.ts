import { features } from "@/config/features";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/metadata";

/**
 * llms.txt (https://llmstxt.org): a plain-text overview for language models,
 * built from the same config as the pages so the two don't drift apart.
 * Rendered at build time.
 */
export const dynamic = "force-static";

const link = (title: string, url: string, description?: string) =>
  `- [${title}](${url})${description ? `: ${description}` : ""}`;

const doc = (file: string) => `${siteConfig.repositoryUrl}/blob/main/${file}`;

export function GET() {
  const content = `# ${siteConfig.name}

> ${siteConfig.description}

An open-source (MIT) template for Next.js apps. Clone it from ${siteConfig.repositoryUrl} and build on it.

## Pages
${siteConfig.publicPages.map((page) => link(page.title, absoluteUrl(page.path), page.description)).join("\n")}

## Features
${features.map((feature) => `- ${feature.title}: ${feature.description}`).join("\n")}

## Docs
${link("README", doc("README.md"), "Quick start, project structure, authentication, testing and deployment.")}
${link("Agent guide", doc("AGENTS.md"), "Commands and code conventions for working in the repository.")}
${link("Contributing", doc("CONTRIBUTING.md"))}
${link("Security policy", doc("SECURITY.md"))}

## Optional
${link("Source code", siteConfig.repositoryUrl)}
${link("License", doc("LICENSE"), "MIT")}
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
