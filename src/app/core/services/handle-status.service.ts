import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class HandleStatusService {
  private eventSource?: EventSource;
  private eventSubject = new Subject<string>();
  private isConnected = false;

  constructor(private ngZone: NgZone) {}

  startEventStream(): Observable<string> {
    if (this.eventSource && this.isConnected) {
      return this.eventSubject.asObservable();
    }

    this.eventSource = new EventSource(`${environment.APIUrl}/handler-status-stream`);

    this.eventSource.onopen = () => {
      this.isConnected = true;
      console.log('Established connection.');
    };

    this.eventSource.onmessage = (event: MessageEvent) => {
      this.ngZone.run(() => {
        this.eventSubject.next(event.data);
      });
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);

      this.isConnected = false;
      this.eventSource?.close();
      this.eventSource = undefined;

    };

    return this.eventSubject.asObservable();
  }

  stopEventStream(): void {
    this.isConnected = false;
    this.eventSource?.close();
    this.eventSource = undefined;
  }
}