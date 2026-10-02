/**
 * Media compatibility shim.
 *
 * Historical content records can still carry old illustrative image keys, but
 * synthetic placeholder artwork is intentionally disabled. Returning undefined
 * keeps those records compatible without importing or shipping generated image
 * assets in the application bundle.
 *
 * Real/approved media should be added explicitly at the rendering surface and
 * marked as official rather than added to this legacy key registry.
 */
export const IMAGES: Readonly<Record<string, never>> = {};

export const img = (_key?: string): undefined => undefined;
