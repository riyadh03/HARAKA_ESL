/**
 * Biomechanics Math Utility
 * Calculates angles and analyzes poses from MediaPipe landmarks.
 */

export interface Point {
    x: number;
    y: number;
    visibility?: number;
  }
  
  /**
   * Calculates the 2D angle between three points.
   * Point B is the vertex of the angle.
   * Returns angle in degrees (0 to 180).
   */
  export function calculateAngle(a: Point, b: Point, c: Point): number {
    // Vector AB
    const ab = { x: a.x - b.x, y: a.y - b.y };
    // Vector CB
    const cb = { x: c.x - b.x, y: c.y - b.y };
  
    const dotProduct = ab.x * cb.x + ab.y * cb.y;
    
    const magnitudeAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
    const magnitudeCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
    
    // Avoid division by zero
    if (magnitudeAB * magnitudeCB === 0) return 0;
  
    const cosineAngle = dotProduct / (magnitudeAB * magnitudeCB);
    
    // Clamp between -1 and 1 to avoid floating point inaccuracies causing NaN
    const clampedCosine = Math.max(-1, Math.min(1, cosineAngle));
    
    const angleRadians = Math.acos(clampedCosine);
    const angleDegrees = angleRadians * (180.0 / Math.PI);
    
    return angleDegrees;
  }
  
  /**
   * Checks if a set of landmarks are clearly visible.
   */
  export function areLandmarksVisible(points: Point[], threshold = 0.65): boolean {
    return points.every(p => (p.visibility ?? 0) >= threshold);
  }
  
