import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {
    constructor(private _router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        let valid = localStorage.getItem('accessToken');
        if (valid != '' && valid != undefined) {
            this._router.navigate(['/pages/home'])
            return false
        } else {
            return true
        }
    }

}