import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-tag-input',
    templateUrl: './tag-input.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TagInputComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagInputComponent implements ControlValueAccessor {

    @Input() placeholder = 'Type a value and press Enter';

    values: string[] = [];
    disabled = false;

    private onChange: (values: string[]) => void = () => { };
    private onTouched: () => void = () => { };

    constructor(private changeDetectorRef: ChangeDetectorRef) { }

    writeValue(values: string[] | null): void {
        this.values = Array.isArray(values) ? [...values] : [];
        this.changeDetectorRef.markForCheck();
    }

    registerOnChange(onChange: (values: string[]) => void): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: () => void): void {
        this.onTouched = onTouched;
    }

    setDisabledState(disabled: boolean): void {
        this.disabled = disabled;
        this.changeDetectorRef.markForCheck();
    }

    handleKeydown(event: KeyboardEvent, input: HTMLInputElement): void {
        if (event.key !== 'Enter' && event.key !== ',') {
            return;
        }

        event.preventDefault();
        this.addValue(input.value);
        input.value = '';
    }

    handleBlur(input: HTMLInputElement): void {
        this.addValue(input.value);
        input.value = '';
        this.onTouched();
    }

    removeValue(index: number): void {
        if (this.disabled) {
            return;
        }

        this.values = this.values.filter((_, valueIndex) => valueIndex !== index);
        this.emitValue();
    }

    private addValue(value: string): void {
        const normalizedValue = value.trim();

        if (!normalizedValue || this.values.some((item) => item.toLowerCase() === normalizedValue.toLowerCase())) {
            return;
        }

        this.values = [...this.values, normalizedValue];
        this.emitValue();
    }

    private emitValue(): void {
        this.onChange([...this.values]);
        this.onTouched();
        this.changeDetectorRef.markForCheck();
    }
}