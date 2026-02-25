# Background Image Instructions

## Place your background image here

1. **Save your background image as `bg.png`** in this directory (`/public/images/bg.png`)
2. **Recommended size**: 1920x1080 or higher for good quality
3. **Format**: PNG, JPG, or WebP
4. **File size**: Keep under 2MB for optimal loading

## Current setup

The landing page is configured to use `/images/bg.png` as the background image. If you don't have a background image yet, the page will show a gradient fallback.

## Alternative

If you want to use a different filename or format, update the `backgroundImage` style in `src/pages/Landing.tsx`:

```tsx
style={{
  backgroundImage: "url('/images/your-image-name.jpg')"
}}
``` 