/**
 * LiveCanvas Utils - Main barrel export
 * 
 * This module provides EXACT replicas of LiveCanvas utility functions
 * for full compatibility with the existing LiveCanvas ecosystem.
 * 
 * All functions work identically to their LiveCanvas counterparts.
 */

// Export all utilities by category
export * from './browser';
export * from './core';
export * from './content';
export * from './data';
export * from './files';
export * from './performance';
export * from './preview';
export * from './styling';
export * from './text';
export * from './ui';
export * from './window';

// Export main bootstrap function for easy initialization
export { initializeLiveCanvasUtils } from './window';