import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { AuthService, SettingServices } from '@core/index';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanLoad {

  private readonly allowedRoles = ['ROOT', 'ADMINISTRATOR'];

  constructor(
    private authService: AuthService, 
    private router: Router,
    private settingServices: SettingServices
  ) {}

  async canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {
    try {
      const [roles, { use_dnd_filtering }] = await Promise.all([
        this.authService.getRoles(),
        this.settingServices.getAnalyzeAndDndSettings(),
      ]);

      const allowedRolesSet = new Set(this.allowedRoles);
      const hasRolePermission = roles.some(role => allowedRolesSet.has(role));

      if (!hasRolePermission) {
        this.router.navigate(['/pages']);
        return false;
      }

      const requiresDnd =
        route?.data?.['requiresDnd'] === true ||
        segments.some(s => s.path?.toLowerCase() === 'dnd');

      if (!requiresDnd) {
        return true;
      }

      if (!use_dnd_filtering) {
        this.router.navigate(['/pages']);
        return false;
      }

      return true;
    } catch (err) {
      this.router.navigate(['/pages']);
      return false;
    }
  }
}
