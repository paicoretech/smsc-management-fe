import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Output } from '@angular/core';

@Component({
  selector: 'app-cdr-view',
  templateUrl: './view.component.html',
})
export class ViewComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() selectedLog: any;

  title = 'CDR Details';

  constructor() {}

  ngOnInit(): void { }

  close(): void {
    this.closeModal.emit(true);
  }

}
