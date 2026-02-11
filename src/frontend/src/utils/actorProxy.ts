/**
 * Actor proxy utilities for safe actor initialization and method wrapping
 * Handles access control initialization gracefully to prevent startup traps
 */

import { type backendInterface } from '../backend';
import { clearSessionParameter } from './urlParams';

/**
 * Wraps a backend actor to safely handle _initializeAccessControlWithSecret
 * Prevents startup failures from invalid/missing admin tokens
 */
export function createSafeActorProxy(actor: backendInterface): backendInterface {
  return new Proxy(actor, {
    get(target, prop, receiver) {
      // Intercept _initializeAccessControlWithSecret to handle errors gracefully
      if (prop === '_initializeAccessControlWithSecret') {
        return async (adminToken: string) => {
          // If no token provided, treat as no-op (normal user flow)
          if (!adminToken || adminToken.trim() === '') {
            return Promise.resolve();
          }

          try {
            // Attempt to initialize with the provided token
            await target._initializeAccessControlWithSecret(adminToken);
          } catch (error: any) {
            // If token is invalid, clear it from session storage to prevent retry loops
            clearSessionParameter('caffeineAdminToken');
            
            // Log the error but don't trap startup
            console.warn('Access control initialization failed (invalid token):', error.message);
            
            // Return successfully to allow app to continue
            // The user will simply not have admin privileges
            return Promise.resolve();
          }
        };
      }

      // For all other properties, return as normal
      return Reflect.get(target, prop, receiver);
    },
  });
}
