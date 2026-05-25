import { MetadataRoute } from 'next';

// Use fixed dates for stable lastmod — update these when content actually changes
const SITE_LAUNCH = new Date('2025-05-18');
const CONTENT_UPDATE = new Date('2025-05-18');

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://collegematch-ai.vercel.app";
  
  return [
    // Homepage — highest priority
    {
      url: baseUrl,
      lastModified: CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // Core tool pages — most valuable for users
    {
      url: `${baseUrl}/exams`,
      lastModified: CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cutoff-calculator`,
      lastModified: CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/scholarships`,
      lastModified: CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Auth pages
    {
      url: `${baseUrl}/login`,
      lastModified: SITE_LAUNCH,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: SITE_LAUNCH,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Content pages
    {
      url: `${baseUrl}/blog`,
      lastModified: CONTENT_UPDATE,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: SITE_LAUNCH,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/testimonial`,
      lastModified: CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
