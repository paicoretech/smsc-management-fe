import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-delete',
  templateUrl: './modal-delete.component.html',
})
export class ModalDeleteComponent {

  @Input() mensaje: string = 'Are you sure you want to delete this item?';
  @Output() confirmAction: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() confirmButtonText: string = 'Yes';
  @Input() cancelButtonText: string = 'No';

  onConfirmAction(action: boolean = false): void {
    this.confirmAction.emit(action);
  }

}
