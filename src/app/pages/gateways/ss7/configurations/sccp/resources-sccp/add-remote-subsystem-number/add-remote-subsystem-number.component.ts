import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-remote-subsystem-number',
  templateUrl: './add-remote-subsystem-number.component.html',
})
export class AddRemoteSubsystemNumberComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      // TODO: GET DATA FORM
    }
  }
  title = 'Create RSS';
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      rsp: ['', [Validators.required]],
      rss: ['', [Validators.required]],
      mark_prohibited: ['', [Validators.required]],
    });
  }


  save(): void {
    this.close();
  }

  close(): void {
    this.closeModal.emit(true);
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }
}
