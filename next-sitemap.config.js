/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://ero-trick.tokyo',
  generateRobotsTxt: true,
  outDir: 'out',
  sitemapSize: 5000,
  exclude: ['/404'],
  // Custom robots.txt policies
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
}
