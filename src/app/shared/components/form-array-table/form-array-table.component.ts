import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormFieldOption } from '@app/core/forms/form-section.model';

export type FormArrayTableColumnType = 'index' | 'text' | 'number' | 'select' | 'conditional';

export interface FormArrayTableColumn {
    header: string;
    type: FormArrayTableColumnType;
    controlName?: string;
    typeControlName?: string;
    selectWhenValue?: string | number | null;
    options?: FormFieldOption[];
    placeholder?: string;
    min?: number;
    width?: string;
}

@Component({
    selector: 'app-form-array-table',
    templateUrl: './form-array-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormArrayTableComponent {

    @Input() rows!: FormArray;
    @Input() columns: FormArrayTableColumn[] = [];
    @Input() addLabel = 'Add Row';
    @Input() emptyMessage = 'No rows configured';
    @Input() minimumRows = 0;
    @Input() disabled = false;

    @Output() addRow = new EventEmitter<void>();
    @Output() removeRow = new EventEmitter<number>();

    getGroup(index: number): FormGroup {
        return this.rows.at(index) as FormGroup;
    }

    getControl(index: number, controlName: string): FormControl {
        return this.getGroup(index).get(controlName) as FormControl;
    }

    isConditionalSelect(index: number, column: FormArrayTableColumn): boolean {
        if (column.type !== 'conditional' || !column.typeControlName) {
            return false;
        }

        return this.getControl(index, column.typeControlName).value === column.selectWhenValue;
    }

    canRemoveRow(): boolean {
        return !this.disabled && this.rows.length > this.minimumRows;
    }

    trackByIndex(index: number): number {
        return index;
    }
}
