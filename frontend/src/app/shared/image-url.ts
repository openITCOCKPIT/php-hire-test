import { environment } from '../../environments/environment';

/**
 * Build the public URL for an uploaded recipe image, or null when there is none.
 * Same origin in production (`/uploads/…`), the backend origin in dev.
 */
export function recipeImageUrl(imagePath: string | null): string | null {
  return imagePath ? `${environment.uploadsBaseUrl}/uploads/${imagePath}` : null;
}
