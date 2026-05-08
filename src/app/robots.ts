import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/private/"] },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "Slurp", allow: "/" },
    ],
    sitemap: "https://collegematch-ai.vercel.app/sitemap.xml",
    host: "https://collegematch-ai.vercel.app"
  };
}
