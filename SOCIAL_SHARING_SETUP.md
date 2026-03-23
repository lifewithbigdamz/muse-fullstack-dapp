# Dynamic Social Sharing Metadata Setup

This document explains the implementation of dynamic metadata for rich social sharing of art pieces in the Muse AI Art Marketplace.

## Overview

The implementation includes:
- Backend API endpoint for fetching artwork metadata
- Frontend components for managing Open Graph and Twitter Card meta tags
- Individual artwork pages with dynamic metadata
- Social sharing functionality

## Backend Implementation

### New API Endpoint
- **Route**: `GET /api/metadata/artwork/:id`
- **Controller**: `apps/backend/src/controllers/metadataController.ts`
- **Returns**: Structured metadata for social sharing including:
  - Open Graph tags (title, description, image, url, type, site_name)
  - Twitter Card tags (card type, site, title, description, image)
  - Custom artwork metadata (category, price, creator, AI model, prompt)

## Frontend Implementation

### New Components
1. **MetaTags Component** (`apps/frontend/src/components/MetaTags.tsx`)
   - Dynamically updates HTML meta tags
   - Supports Open Graph and Twitter Card protocols
   - Handles custom metadata tags

2. **ArtworkPage Component** (`apps/frontend/src/pages/ArtworkPage.tsx`)
   - Individual artwork detail page
   - Fetches metadata using custom hook
   - Includes social sharing buttons

3. **useMetadata Hook** (`apps/frontend/src/hooks/useMetadata.ts`)
   - Fetches artwork metadata from backend API
   - Uses React Query for data fetching and caching

### Route Updates
- Added `/artwork/:id` route to `App.tsx`
- Updated `ExplorePage.tsx` to link to individual artwork pages

## Testing Social Sharing

### 1. Start the Development Servers

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev
```

### 2. Access Individual Artwork Pages

Navigate to:
- Frontend: `http://localhost:3000/artwork/1`
- Backend API: `http://localhost:5000/api/metadata/artwork/1`

### 3. Test with Social Media Validators

#### Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your artwork URL: `http://localhost:3000/artwork/1`
3. Check the scraped metadata

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your artwork URL: `http://localhost:3000/artwork/1`
3. Verify Twitter Card metadata

#### LinkedIn Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your artwork URL: `http://localhost:3000/artwork/1`
3. Check the preview

### 4. Manual Testing

#### Check HTML Meta Tags
1. Open `http://localhost:3000/artwork/1` in your browser
2. Right-click and select "View Page Source"
3. Verify the following meta tags are present:
   ```html
   <meta property="og:title" content="AI Artwork #1 - Muse AI Art Marketplace">
   <meta property="og:description" content="Generated with AI Model...">
   <meta property="og:image" content="https://example.com/image1.jpg">
   <meta property="og:url" content="http://localhost:3000/artwork/1">
   <meta name="twitter:card" content="summary_large_image">
   <meta name="twitter:title" content="AI Artwork #1 - Muse AI Art Marketplace">
   ```

#### Test Social Sharing
1. Click the "Share" button on the artwork page
2. Test the "Tweet" button functionality
3. Verify the share URLs contain correct metadata

## Production Deployment Considerations

### Environment Variables
Make sure to set these in production:
```env
FRONTEND_URL=https://your-domain.com
PORT=5000
```

### Image Optimization
- Ensure artwork images are accessible via HTTPS
- Use appropriate image sizes (1200x630px recommended for Open Graph)
- Consider using a CDN for better performance

### Security
- Validate artwork IDs in the backend
- Implement rate limiting on metadata endpoints
- Consider caching metadata for better performance

## Customization

### Adding New Metadata Fields
1. Update the `metadataController.ts` to include new fields
2. Extend the `MetaTags` component if needed
3. Update TypeScript interfaces

### Supporting Different Social Platforms
- Add platform-specific meta tags in `MetaTags.tsx`
- Update the metadata structure in the backend
- Test with platform-specific validators

## Troubleshooting

### Common Issues
1. **Images not showing**: Ensure images are accessible via HTTPS URLs
2. **Metadata not updating**: Clear browser cache and social media platform caches
3. **Incorrect titles/descriptions**: Check the backend API response format

### Debugging Tools
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Inspector: https://www.linkedin.com/post-inspector/

## Future Enhancements

1. **Structured Data**: Add JSON-LD schema for better SEO
2. **Dynamic Image Generation**: Create custom preview images with artwork details
3. **Social Analytics**: Track social sharing performance
4. **A/B Testing**: Test different metadata formats for better engagement
