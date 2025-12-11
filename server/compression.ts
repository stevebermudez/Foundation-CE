import compression from "compression";
import type { Request, Response, NextFunction } from "express";

/**
 * Response compression middleware
 * Compresses responses > 1KB using gzip/brotli
 * Skips already compressed files and small responses
 */
export const compressionMiddleware = compression({
  // Only compress responses above this threshold (1KB)
  threshold: 1024,
  
  // Filter function to determine if response should be compressed
  filter: (req: Request, res: Response): boolean => {
    // Don't compress if client doesn't support it
    if (req.headers["x-no-compression"]) {
      return false;
    }

    // Use compression for all other cases
    return compression.filter(req, res);
  },

  // Compression level (0-9, higher = better compression but slower)
  level: 6,

  // Memory level (1-9, higher = more memory but better compression)
  memLevel: 8,
});


