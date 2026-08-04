import { createServerFn } from "@tanstack/react-start";

// Server function to fetch a topic-matched stock image for a news headline.
// Uses Pexels API (server-side, key in env) so no API key leaks to the browser.
export const fetchNewsImage = createServerFn({ method: "POST" })
  .validator((data: { title: string }) => data)
  .handler(async ({ data }) => {
    try {
      const apiKey = process.env.PEXELS_API_KEY ?? process.env.VITE_PEXELS_API_KEY;
      if (!apiKey) {
        return { imageUrl: null };
      }

      // Extract keywords from the title
      const keywords = data.title
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 4)
        .join(" ");
      const query = keywords || "news technology business";

      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        {
          headers: { Authorization: apiKey },
        },
      );

      if (!res.ok) return { imageUrl: null };
      const json = (await res.json()) as {
        photos?: Array<{ src?: { medium?: string } }>;
      };
      const url = json.photos?.[0]?.src?.medium ?? null;
      return { imageUrl: url };
    } catch {
      return { imageUrl: null };
    }
  });
