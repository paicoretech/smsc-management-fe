import { BehaviorSubject, Subscription } from 'rxjs';
import { AbstractControl, FormGroup } from '@angular/forms';

export type SnapshotNormalizer<T> = (v: T) => T;

export class FormDirtyTracker<T extends Record<string, any> = any> {
  private sub?: Subscription;
  private baseline?: T;

  private paused = false;

  private readonly _isModified$ = new BehaviorSubject<boolean>(false);
  readonly isModified$ = this._isModified$.asObservable();

  get isModified(): boolean {
    return this._isModified$.value;
  }

  constructor(
    private readonly normalizer: SnapshotNormalizer<T> = (v) => v
  ) {}

  attach(form: FormGroup): void {

    this.destroy();
    this.baseline = this.normalizer(form.getRawValue() as T);
    this._isModified$.next(false);

    this.sub = form.valueChanges.subscribe(() => {
      if (this.paused) return;
      const current = this.normalizer(form.getRawValue() as T);
      this._isModified$.next(!deepEqual(current, this.baseline));
    });
  }

  captureSnapshot(form: FormGroup): void {
    this.baseline = this.normalizer(form.getRawValue() as T);
    this._isModified$.next(false);
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  destroy(): void {
    this.sub?.unsubscribe();
    this.sub = undefined;
    this.baseline = undefined;
    this._isModified$.next(false);
    this.paused = false;
  }
}


function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
