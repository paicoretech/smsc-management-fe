import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Output } from '@angular/core';
import { getDlrStatus } from '@app/core';

@Component({
  selector: 'app-cdr-view',
  templateUrl: './view.component.html',
})
export class ViewComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() selectedLog: any;

  title = 'CDR Details';

  get dlrStatus(): string {
    return getDlrStatus(this.selectedLog);
  }

  constructor() {}

  ngOnInit(): void { }

  close(): void {
    this.closeModal.emit(true);
  }

}
