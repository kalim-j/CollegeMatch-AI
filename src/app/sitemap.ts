import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://collegematch-ai.vercel.app';

  const routes = [
    '',
    '/login',
    '/register',
    '/dashboard',
    '/interview',
    '/predict',
    '/scholarships',
    '/exams',
    '/compare',
    '/contact',
    '/colleges/map',
    '/history',
    '/community',
    '/mock-interview',
    '/study-planner',
    '/resume',
    '/sop',
    '/doubt-solver',
    '/career-explorer',
    '/fee-calculator',
    '/cutoff-trends',
    '/documents',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
