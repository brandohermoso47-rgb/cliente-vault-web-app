import { User } from '../types';

/**
 * Unified helper function to verify premium entitlement across the platform.
 * Returns true if the user has an active billing status, an active instructor pass,
 * or possesses an instructor role.
 */
export function isPremium(user?: User | null): boolean {
  if (!user) return false;
  
  if (user.role === 'instructor') {
    return true;
  }

  if (user.billingStatus === 'active') {
    return true;
  }

  if (
    user.subscriptionTier === 'instructor_pass' || 
    user.subscriptionTier === 'basic_practice'
  ) {
    return true;
  }

  return false;
}
