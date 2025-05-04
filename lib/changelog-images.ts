import { CHANGELOG_IMAGES_DIR, DEFAULT_PLACEHOLDER } from './changelog-data';

// Map of version numbers to image paths
// This allows easily updating image paths without changing the changelog data
const versionImageMap: Record<string, string> = {
  // Example: '1.3.0': '/custom-image-path.png',
};

/**
 * Get the image path for a specific changelog version
 * 
 * If a custom image is defined in versionImageMap, it will be used.
 * Otherwise, it will look for an image in the version folder.
 * If no image exists, it will fall back to the placeholder.
 * 
 * @param version The version number (e.g., "1.3.0")
 * @param imageName Optional image name, defaults to "main.png"
 * @returns The path to the image
 */
export function getChangelogImage(version: string, imageName: string = "main.png"): string {
  // Strip "Version " prefix if present
  const cleanVersion = version.replace('Version ', '');
  
  // Check if there's a custom image mapping
  if (versionImageMap[cleanVersion]) {
    return versionImageMap[cleanVersion];
  }
  
  // Return the path to the image in the version folder
  return `${CHANGELOG_IMAGES_DIR}/${cleanVersion}/${imageName}`;
}

/**
 * Register a custom image for a specific version
 * 
 * @param version The version number (e.g., "1.3.0")
 * @param imagePath The path to the image
 */
export function registerChangelogImage(version: string, imagePath: string): void {
  const cleanVersion = version.replace('Version ', '');
  versionImageMap[cleanVersion] = imagePath;
}

/**
 * Check if an image exists and return either the image path or a fallback
 * You can use this in client components to validate images
 * 
 * @param imageSrc The source image path to check
 * @param fallbackSrc The fallback image path if the source doesn't exist
 * @returns Promise that resolves to either the valid image path or the fallback
 */
export async function validateImage(imageSrc: string, fallbackSrc: string = DEFAULT_PLACEHOLDER): Promise<string> {
  if (typeof window === 'undefined') {
    return imageSrc; // During SSR, just return the original
  }
  
  // Check if image exists
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(imageSrc);
    img.onerror = () => resolve(fallbackSrc);
    img.src = imageSrc;
  });
}

/**
 * Instructions for adding new images:
 * 
 * 1. Create a version-specific folder in /public/images/changelog/ 
 *    Example: /public/images/changelog/1.3.0/
 * 
 * 2. Add your images to that folder. The main image should be named "main.png"
 *    Example: /public/images/changelog/1.3.0/main.png
 * 
 * 3. For additional images, you can choose any name:
 *    Example: /public/images/changelog/1.3.0/feature-screenshot.png
 * 
 * 4. For custom image paths, register them in your code:
 *    ```
 *    import { registerChangelogImage } from '@/lib/changelog-images';
 *    
 *    // Do this in a component that runs on app initialization
 *    registerChangelogImage('1.3.0', '/images/changelog/custom-path.png');
 *    ```
 */ 