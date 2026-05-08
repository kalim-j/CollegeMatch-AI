export default function sitemap() {
  const baseUrl = "https://collegematch-ai.vercel.app";
  return [
    { url: baseUrl,                          lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/dashboard`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${baseUrl}/dashboard/compare`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/dashboard/trends`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/dashboard/history`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${baseUrl}/dashboard/contact`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
