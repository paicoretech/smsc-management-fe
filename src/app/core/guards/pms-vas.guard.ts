import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { FEATURE_FLAGS } from '../config/feeature-flag';

@Injectable({
  providedIn: 'root',
})
export class PmsVasGuard implements CanLoad {
  private readonly allowedRoles = ['ROOT', 'ADMINISTRATOR', 'PMS_VAS_ACCESS'];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  async canLoad(_route: Route, _segments: UrlSegment[]): Promise<boolean> {
    if (!FEATURE_FLAGS.vasEnabled) {
      this.router.navigate(['/pages']);
      return false;
    }

    try {
      const roles = await this.authService.getRoles();
      const allowedRolesSet = new Set(this.allowedRoles);
      const hasPermission = roles.some((role) => allowedRolesSet.has(role));

      if (hasPermission) {
        return true;
      }

      this.router.navigate(['/pages']);
      return false;
    } catch {
      this.router.navigate(['/pages']);
      return false;
    }
  }
}
