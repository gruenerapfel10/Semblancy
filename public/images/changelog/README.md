# Changelog Images

This directory contains images used in the changelog/updates notifications of the Semblancy platform.

## Folder Structure

Each version of the changelog should have its own dedicated folder:

```
/images/changelog/
├── 1.3.0/                 # Version folder
│   ├── main.png           # Main image for this version
│   └── feature-detail.png # Additional images if needed
├── 1.2.0/
│   └── main.png
└── 1.1.0/
    └── main.png
```

## Adding New Images

### Option 1: Standard Approach

1. Create a folder for your version:
   ```
   /public/images/changelog/1.3.0/
   ```

2. Add your main image as `main.png` in that folder:
   ```
   /public/images/changelog/1.3.0/main.png
   ```

3. You can add additional images to the same folder if needed.

### Option 2: Custom Registration

For more control, you can explicitly register images in your code:

```typescript
import { registerChangelogImage } from '@/lib/changelog-images';

// Do this in a component that runs on app initialization
registerChangelogImage('1.3.0', '/images/changelog/custom-path.png');
```

## Image Specifications

For the best results:

- **Format**: PNG only
- **Recommended size**: 1200x675px (16:9 aspect ratio)
- **File size**: Keep under 500KB for good performance
- **Style**: Consistent with the platform's design language

## Default Images

If an image doesn't exist, the system will automatically fall back to a placeholder.

## Current Changelog Entries

1. **Version 1.3.0**: Mass Selection & Improved Algorithm
   - Expected image: `/images/changelog/1.3.0/main.png`

2. **Version 1.2.0**: Spaced Repetition & Retention Scores
   - Expected image: `/images/changelog/1.2.0/main.png`

3. **Version 1.1.0**: Interactive Flashcards
   - Expected image: `/images/changelog/1.1.0/main.png` 