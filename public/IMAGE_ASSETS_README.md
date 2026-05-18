# CollegeMatch-AI Image Assets

This directory contains the SEO and branding image assets for CollegeMatch-AI.

## Files Created

### 1. **og-image.png** (1200x630 pixels)
- Open Graph image for social media sharing
- Used when links are shared on Facebook, LinkedIn, Twitter, etc.
- Currently: Minimal placeholder PNG
- **Production**: Replace with high-quality branded image

### 2. **og-image.svg** (1200x630 pixels)
- SVG version of the OG image with full branding
- Features:
  - Dark background (#05071a)
  - Indigo gradient accents (#7c5cfc)
  - Graduation cap icon
  - "CollegeMatch-AI" branding
  - Feature highlights
- Can be used directly or converted to PNG

### 3. **icon.png** (512x512 pixels)
- App icon for PWA installation
- Used for home screen icons on mobile devices
- Currently: Minimal placeholder PNG
- **Production**: Replace with high-quality branded icon

### 4. **icon.svg** (512x512 pixels)
- SVG version of the app icon
- Features:
  - Indigo gradient background (#7c5cfc to #5b3fd1)
  - White graduation cap icon
  - "CM" letters for CollegeMatch
- Can be used directly or converted to PNG

### 5. **favicon.ico** (16x16 pixels)
- Browser tab icon
- Shows in browser tabs, bookmarks, and history
- Currently: Minimal purple-colored ICO file
- **Production**: Replace with detailed favicon

## How to Generate Production-Quality Images

### Option 1: Using the HTML Generator (Recommended)

1. Open `scripts/create-png-images.html` in a web browser
2. The images will auto-generate on page load
3. Click the "Download" buttons to save each image:
   - Download OG Image (1200x630)
   - Download Icon (512x512)
   - Download Favicon (32x32)
4. Replace the placeholder files in this directory

### Option 2: Using SVG Files Directly

The SVG files (`og-image.svg` and `icon.svg`) are production-ready and can be:
- Used directly in HTML/React components
- Converted to PNG using online tools or ImageMagick
- Edited in vector graphics software (Figma, Illustrator, Inkscape)

### Option 3: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Convert OG image
convert public/og-image.svg -resize 1200x630 public/og-image.png

# Convert icon
convert public/icon.svg -resize 512x512 public/icon.png

# Create favicon
convert public/icon.svg -resize 32x32 public/favicon.ico
```

### Option 4: Using Online Converters

1. Upload SVG files to an online converter:
   - [CloudConvert](https://cloudconvert.com/svg-to-png)
   - [Convertio](https://convertio.co/svg-png/)
   - [Online-Convert](https://image.online-convert.com/convert-to-png)
2. Set the appropriate dimensions
3. Download and replace the placeholder files

## Design Specifications

### Colors
- **Background**: #05071a (Dark navy)
- **Primary Accent**: #7c5cfc (Indigo)
- **Secondary Accent**: #5b3fd1 (Deep purple)
- **Text**: #ffffff (White)
- **Subtle Text**: #a78bfa, #c4b5fd (Light purple shades)

### Branding Elements
- **Logo**: Graduation cap icon
- **Name**: CollegeMatch-AI
- **Tagline**: AI-Powered College Finder for Indian Students
- **Features**: Smart Matching, Cutoff Prediction, College Comparison

### Theme
- Glassmorphism design with frosted glass effects
- Dark background with vibrant indigo accents
- Modern, clean, and professional aesthetic

## File Usage in Application

### In `app/layout.tsx`:
```typescript
export const metadata = {
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    images: ['/og-image.png'],
  },
}
```

### In `public/manifest.json`:
```json
{
  "icons": [
    {
      "src": "/icon.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Current Status

✅ **Placeholder files created** - All required files exist and are valid
⚠️ **Production upgrade needed** - Replace placeholders with high-quality images

The current placeholder images are minimal but valid. They will work for development and testing, but should be replaced with the full-quality branded images before production deployment.

## Next Steps

1. ✅ Placeholder images created (DONE)
2. ⏭️ Generate production images using HTML generator
3. ⏭️ Replace placeholder files with production images
4. ⏭️ Test images in browser and social media previews
5. ⏭️ Verify PWA icon displays correctly on mobile devices

---

**Created**: Task 1.4 - SEO Image Assets Implementation
**Requirements**: 1.6, 1.7
**Spec**: collegematch-seo-features
