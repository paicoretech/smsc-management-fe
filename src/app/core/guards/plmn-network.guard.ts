import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { FEATURE_FLAGS } from '../config/feeature-flag';

@Injectable({
  providedIn: 'root',
})
export class PlmnNetworkGuard implements CanLoad {
  constructor(private readonly router: Router) {}

  canLoad(_route: Route, _segments: UrlSegment[]): boolean {
    if (FEATURE_FLAGS.plmnNetworkEnabled) {
      return true;
    }

    this.router.navigate(['/pages/home']);
    return false;
  }
}
