import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '.check_form',
})
export class CheckFormTooltipDirective implements OnDestroy {
  @Input() checkFormTooltip = '';

  private tooltipElement?: HTMLElement;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  @HostListener('focus')
  showTooltip(): void {
    const tooltipText = this.checkFormTooltip.trim();

    if (this.tooltipElement || !tooltipText) {
      return;
    }

    const element = this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    const tooltip = this.renderer.createElement('span') as HTMLElement;

    this.renderer.addClass(tooltip, 'check-form-tooltip');
    this.renderer.setProperty(tooltip, 'textContent', tooltipText);
    this.renderer.setStyle(tooltip, 'position', 'fixed');
    this.renderer.setStyle(tooltip, 'left', `${rect.left + rect.width / 2}px`);
    this.renderer.setStyle(tooltip, 'top', `${rect.top - 8}px`);
    this.renderer.setStyle(tooltip, 'transform', 'translate(-50%, -100%)');
    this.renderer.setStyle(tooltip, 'z-index', '1080');
    this.renderer.setStyle(tooltip, 'max-width', '260px');
    this.renderer.setStyle(tooltip, 'padding', '6px 8px');
    this.renderer.setStyle(tooltip, 'border-radius', '4px');
    this.renderer.setStyle(tooltip, 'background', '#1A1A1A');
    this.renderer.setStyle(tooltip, 'color', '#FFFFFF');
    this.renderer.setStyle(tooltip, 'font-size', '12px');
    this.renderer.setStyle(tooltip, 'line-height', '1.3');
    this.renderer.setStyle(tooltip, 'box-shadow', '0 4px 12px rgba(0, 0, 0, 0.18)');
    this.renderer.setStyle(tooltip, 'pointer-events', 'none');
    this.renderer.setStyle(tooltip, 'white-space', 'normal');

    this.renderer.appendChild(document.body, tooltip);
    this.tooltipElement = tooltip;
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  hideTooltip(): void {
    if (!this.tooltipElement) {
      return;
    }

    this.renderer.removeChild(document.body, this.tooltipElement);
    this.tooltipElement = undefined;
  }

  ngOnDestroy(): void {
    this.hideTooltip();
  }
}
