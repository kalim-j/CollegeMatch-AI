# Requirements Document

## Introduction

This document specifies the requirements for enhancing CollegeMatch-AI with SEO optimization, AI-powered college comparison, cutoff prediction, Progressive Web App (PWA) capabilities, and shareable result cards. The system is a Next.js 14 application deployed on Vercel, using Firebase for data storage, Groq API for AI capabilities, and TypeScript with Tailwind CSS for the frontend.

The enhancements aim to improve discoverability through search engines, provide advanced decision-making tools for students, enable offline access through PWA features, and facilitate social sharing of results.

## Glossary

- **System**: The CollegeMatch-AI web application
- **SEO_Module**: The search engine optimization components including metadata, sitemap, and robots configuration
- **Comparison_Tool**: The AI-powered college comparison feature allowing side-by-side analysis
- **Predictor**: The cutoff prediction engine that estimates admission chances
- **PWA_Manager**: The Progressive Web App service worker and manifest configuration
- **Share_Card_Generator**: The component that creates downloadable and shareable result images
- **Groq_API**: The AI service using llama-3.3-70b-versatile model for analysis
- **Protected_Route**: Pages requiring user authentication with redirect to login
- **College_Card**: UI component displaying individual college information
- **Match_Score**: Numerical value (0-100) indicating college-student compatibility
- **Glassmorphism_Theme**: The existing dark theme with frosted glass visual effects
- **Service_Worker**: Background script enabling offline functionality and caching
- **Manifest**: JSON file defining PWA metadata and installation behavior
- **Open_Graph**: Metadata protocol for social media link previews
- **Canonical_Link**: The preferred URL for search engine indexing
- **Sitemap**: XML file listing all public URLs for search engine crawlers
- **Cutoff_Mark**: Entrance exam score used for admission eligibility
- **NAAC_Grade**: National Assessment and Accreditation Council quality rating
- **NIRF_Rank**: National Institutional Ranking Framework position

## Requirements

### Requirement 1: SEO & Search Engine Visibility

**User Story:** As a student searching "AI college finder India" on Google or Edge browser, I want to find CollegeMatch-AI in search results so that I can use the tool without needing a direct link.

#### Acceptance Criteria

1. THE SEO_Module SHALL export metadata including title, description, keywords, Open_Graph tags, and Twitter card tags from app/layout.tsx
2. THE SEO_Module SHALL include verification meta tags for Google Search Console and Bing Webmaster Tools
3. THE SEO_Module SHALL define a Canonical_Link pointing to https://collegematch-ai.vercel.app
4. THE System SHALL generate a Sitemap at app/sitemap.ts containing all public URLs with lastModified timestamps
5. THE System SHALL serve a robots.txt file from public/robots.txt allowing all search engine crawlers
6. THE System SHALL provide an Open_Graph image at public/og-image.png with dimensions 1200x630 pixels
7. THE System SHALL include favicon.ico and icon.png files in the public directory
8. THE SEO_Module SHALL include structured data (JSON-LD) for WebApplication schema
9. FOR ALL new pages created, THE System SHALL add corresponding entries to the Sitemap
10. THE metadata title SHALL contain keywords "AI college predictor India" for search relevance

### Requirement 2: AI College Comparison Tool

**User Story:** As a student who received 8 college matches, I want to compare 2 or 3 colleges side by side so that I can make an informed decision about which one to apply to.

#### Acceptance Criteria

1. WHEN a user views college results, THE System SHALL display checkboxes on each College_Card for selection
2. THE System SHALL limit college selection to a maximum of 3 colleges
3. WHEN 2 or more colleges are selected, THE System SHALL display a floating "Compare selected" button
4. WHEN the compare button is clicked, THE System SHALL navigate to /compare page with selected college data
5. THE Comparison_Tool SHALL display colleges in side-by-side columns on the /compare page
6. FOR EACH college, THE Comparison_Tool SHALL display name, location, type, NAAC_Grade, NIRF_Rank, cutoff, Match_Score, courses, and fees
7. WHEN comparison data is loaded, THE Comparison_Tool SHALL invoke Groq_API to generate pros and cons for each college
8. THE Groq_API SHALL use the llama-3.3-70b-versatile model for analysis
9. THE Comparison_Tool SHALL display an AI-generated comparison summary highlighting key differences
10. THE /compare page SHALL be a Protected_Route redirecting unauthenticated users to /login
11. THE Comparison_Tool SHALL maintain the existing Glassmorphism_Theme styling
12. WHEN API errors occur, THE System SHALL return NextResponse.json() with appropriate error messages
13. THE Comparison_Tool SHALL be accessible from the Tools dropdown in the Navbar

### Requirement 3: Cutoff Predictor

**User Story:** As a student who knows their marks, I want to predict whether I will get a seat in a specific college this year so that I can decide where to apply with confidence.

#### Acceptance Criteria

1. THE System SHALL provide a /predict page with a prediction form
2. THE prediction form SHALL accept Cutoff_Mark, community, stream, state, college name, and course as inputs
3. WHEN the form is submitted, THE Predictor SHALL invoke Groq_API with the provided data
4. THE Groq_API SHALL use the llama-3.3-70b-versatile model for prediction
5. THE Predictor SHALL return a verdict of "Likely", "Borderline", or "Unlikely" with a confidence percentage
6. THE Predictor SHALL display the last 3 years cutoff trend as a CSS bar chart
7. WHEN the verdict is "Unlikely", THE Predictor SHALL recommend alternative colleges
8. THE /predict page SHALL be a Protected_Route redirecting unauthenticated users to /login
9. THE Predictor SHALL maintain the existing Glassmorphism_Theme styling
10. WHEN API errors occur, THE System SHALL return NextResponse.json() with appropriate error messages
11. THE Predictor SHALL be accessible from the Tools dropdown in the Navbar
12. THE prediction API route SHALL be created at app/api/predict-cutoff/route.ts

### Requirement 4: Progressive Web App (PWA)

**User Story:** As a student on an Android phone, I want to install CollegeMatch-AI on my home screen so that I can use it like a native app without the app store.

#### Acceptance Criteria

1. THE PWA_Manager SHALL provide a Manifest file at public/manifest.json with app metadata
2. THE Manifest SHALL include name, short_name, description, start_url, display mode, theme_color, and background_color
3. THE Manifest SHALL reference icon-192.png and icon-512.png for app icons
4. THE System SHALL create icon-192.png and icon-512.png in the public directory
5. THE PWA_Manager SHALL include PWA meta tags in app/layout.tsx linking to the Manifest
6. THE PWA_Manager SHALL provide a Service_Worker at public/sw.js for offline support
7. THE Service_Worker SHALL cache critical assets for offline access
8. THE System SHALL register the Service_Worker in the application
9. THE System SHALL provide an offline fallback page at app/offline/page.tsx
10. WHEN the user is offline, THE Service_Worker SHALL serve cached content or the offline page
11. THE PWA_Manager SHALL enable installation prompts on supported browsers
12. THE Manifest display mode SHALL be "standalone" for native-like experience

### Requirement 5: Shareable Result Card

**User Story:** As a student who got matched to a great college, I want to share my result as an image card on WhatsApp and Instagram so that my friends can also use CollegeMatch-AI.

#### Acceptance Criteria

1. THE Share_Card_Generator SHALL create a component at components/ShareCard.tsx
2. THE Share_Card_Generator SHALL render a card with dimensions 800x450 pixels
3. THE Share_Card SHALL display the top 3 college matches with Match_Score values
4. THE Share_Card SHALL include CollegeMatch-AI branding and logo
5. THE Share_Card_Generator SHALL use html2canvas library to capture the card as PNG
6. WHEN the "Download result card" button is clicked, THE System SHALL generate and download the PNG image
7. WHEN the "Share on WhatsApp" button is clicked, THE System SHALL open WhatsApp with pre-filled text and link
8. THE pre-filled WhatsApp text SHALL include a message promoting CollegeMatch-AI
9. THE Share_Card_Generator SHALL be integrated into the interview results page
10. THE Share_Card SHALL maintain the existing Glassmorphism_Theme styling
11. THE Share_Card_Generator SHALL handle canvas rendering errors gracefully

### Requirement 6: Build and Deployment Quality

**User Story:** As a developer, I want all new features to integrate seamlessly so that deployment succeeds without errors.

#### Acceptance Criteria

1. WHEN npm run build is executed, THE System SHALL complete with zero errors
2. FOR ALL new pages, THE System SHALL follow the existing Glassmorphism_Theme design patterns
3. FOR ALL new API routes, THE System SHALL use Groq_API with llama-3.3-70b-versatile model
4. FOR ALL new API routes, THE System SHALL return NextResponse.json() with proper error handling
5. FOR ALL new protected pages, THE System SHALL redirect unauthenticated users to /login
6. THE System SHALL NOT modify lib/firebase.ts, context/AuthContext.tsx, or existing API routes
7. THE System SHALL add html2canvas dependency if not present in package.json
8. FOR ALL new pages, THE System SHALL add corresponding entries to app/sitemap.ts
9. THE System SHALL maintain TypeScript type safety across all new components
10. THE System SHALL follow existing code conventions and file structure patterns

### Requirement 7: Navigation and User Experience

**User Story:** As a user, I want to easily access new features so that I can utilize all available tools.

#### Acceptance Criteria

1. THE Navbar SHALL include "Compare" option in the Tools dropdown menu
2. THE Navbar SHALL include "Predict" option in the Tools dropdown menu
3. WHEN a Tools dropdown item is clicked, THE System SHALL navigate to the corresponding page
4. THE interview results page SHALL display comparison checkboxes on College_Cards
5. THE interview results page SHALL display share functionality buttons
6. FOR ALL new navigation items, THE System SHALL maintain consistent styling with existing menu items
7. THE Tools dropdown SHALL display icons for each tool option
8. THE System SHALL provide visual feedback when colleges are selected for comparison

## Non-Functional Requirements

### Performance

1. THE System SHALL generate Share_Card images within 2 seconds
2. THE Groq_API calls SHALL complete within 10 seconds or timeout with error message
3. THE Service_Worker SHALL cache assets for offline access within 5 seconds of first load

### Security

1. FOR ALL Protected_Routes, THE System SHALL verify authentication before rendering content
2. THE System SHALL sanitize user inputs before sending to Groq_API
3. THE System SHALL NOT expose Firebase configuration or API keys in client-side code

### Compatibility

1. THE PWA_Manager SHALL support installation on Chrome, Edge, and Safari browsers
2. THE Share_Card_Generator SHALL render correctly on devices with minimum 360px width
3. THE System SHALL maintain responsive design across mobile, tablet, and desktop viewports

### Maintainability

1. THE System SHALL use TypeScript for type safety across all new components
2. THE System SHALL follow existing naming conventions and file organization
3. THE System SHALL include error logging for debugging production issues

## Files to Create

- app/compare/page.tsx
- app/predict/page.tsx
- app/offline/page.tsx
- app/api/compare-colleges/route.ts
- app/api/predict-cutoff/route.ts
- components/ShareCard.tsx
- public/robots.txt
- public/og-image.png
- public/icon-192.png
- public/icon-512.png

## Files to Modify

- app/layout.tsx (metadata, PWA tags, service worker registration)
- app/interview/page.tsx (comparison checkboxes, share functionality)
- app/sitemap.ts (add new page entries)
- components/Navbar.tsx (add Compare and Predict to Tools dropdown)
- package.json (add html2canvas if needed)

## Files NOT to Modify

- lib/firebase.ts
- context/AuthContext.tsx
- app/api/groq-suggest/route.ts
- app/api/find-scholarships/route.ts
- app/api/entrance-exams/route.ts
- components/AppBackground.tsx
- components/LoginBackground.tsx
- docker-compose.yml
