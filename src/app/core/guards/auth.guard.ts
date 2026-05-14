import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@core/index';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanLoad {

    constructor( private authSvc: AuthService ) { }

    canLoad(): Observable<boolean> | Promise<boolean> | boolean {
        return this.authSvc.validateToken();
    }
}