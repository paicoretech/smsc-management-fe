import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { AuthService, SettingServices } from '@core/index';

@Injectable({
  providedIn: 'root'
})
export class AnalyzeGuard implements CanLoad {

  private readonly allowedRoles = ['ROOT', 'ADMINISTRATOR', 'TECH_SUPPORT'];

  constructor(
    private authService: AuthService, 
    private router: Router,
    private settingServices: SettingServices
  ) {}

  async canLoad(_route: Route, _segments: UrlSegment[]): Promise<boolean> {
    try {
      const [roles, { use_analyze }] = await Promise.all([
        this.authService.getRoles(),
        this.settingServices.getAnalyzeAndDndSettings(),
      ]);

      const allowedRolesSet = new Set(this.allowedRoles);
      const hasRolePermission = roles.some(role => allowedRolesSet.has(role));

      const allowed = hasRolePermission && use_analyze;

      if (!allowed) {
        this.router.navigate(['/pages']);
      }

      return allowed;
    } catch (err) {
      this.router.navigate(['/pages']);
      return false;
    }
  }
}
