import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

type ButtonType = 'button' | 'submit' | 'reset';
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'red' | 'outline-primary' | 'outline-secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() type: ButtonType = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() loadingText = 'Loading...';
  @Input() extraClass = '';

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  get buttonClasses(): string[] {
    const classes = [`btn-${this.variant}`];

    if (this.size !== 'md') {
      classes.push(`btn-${this.size}`);
    }

    if (this.extraClass) {
      classes.push(...this.extraClass.split(' ').filter(Boolean));
    }

    return classes;
  }
}
