import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class DataServiceBaseService<T> {

  private dataSubject = new BehaviorSubject<T | null>(null);
  public data$ = this.dataSubject.asObservable();

  updateData(data: T | null) {
    this.dataSubject.next(data);
  }

  getDataValue(): T | null {
    return this.dataSubject.value;
  }
}
