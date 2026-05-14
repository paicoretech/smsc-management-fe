import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertService } from '../utils/alert.service';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
  constructor(
    private router: Router, 
    private alertSvc: AlertService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('accessToken');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.handleUnauthorized();
        } else {
          this.handleError(error);
        }
        return throwError(error);
      })
    );
  }

  private handleUnauthorized(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  private handleError(error: any): void {
    // this.alertSvc.showAlert(4, 'Not found', 'Error');
  }
}