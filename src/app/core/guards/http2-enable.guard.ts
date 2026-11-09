import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FEATURE_FLAGS } from '../config/feeature-flag';


export const http2EnabledGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (FEATURE_FLAGS.http2Enabled) {
    return true;
  }

  return router.parseUrl('/pages/home');
};
