/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://collegematch-ai.vercel.app',
  generateRobotsTxt: true,
  exclude: ['/dashboard', '/profile', '/history', '/interview'],
};
