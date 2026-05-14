import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '@core/index';

@Injectable({
  providedIn: 'root'
})
export class BroadcastOperatorGuard implements CanActivate {

  private readonly allowedRoles = ['ROOT', 'CAMPAIGN_APPROVER', 'CAMPAIGN_OPERATOR'];

  constructor(private authSvc: AuthService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const roles = await this.authSvc.getRoles();
    const hasPermission = roles.some(role =>
      this.allowedRoles.includes(role)
    );

    if (!hasPermission) {
      this.router.navigate(['/pages/broadcast']);
      return false;
    }

    return true;
  }
}
