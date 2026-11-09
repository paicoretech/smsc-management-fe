import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-accordion-section',
  templateUrl: './accordion-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionSectionComponent {

  @Input() sectionId = '';
  @Input() title = '';
  @Input() expanded = true;

  toggle(): void {
    this.expanded = !this.expanded;
  }

  get headingId(): string {
    return `${this.sectionId}-heading`;
  }

  get contentId(): string {
    return `${this.sectionId}-content`;
  }
}