import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FEATURE_FLAGS } from '../config/feeature-flag';


export const ipSmGwEnabledGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (FEATURE_FLAGS.ipSmGwEnabled) {
    return true;
  }

  return router.parseUrl('/pages/home');
};
