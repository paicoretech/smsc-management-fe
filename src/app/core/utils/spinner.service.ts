import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  showSpinner(): void {
    this.loadingSubject.next(true);
  }

  hideSpinner(): void {
    this.loadingSubject.next(false);
  }
}
