import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-remote-signaling-point-code',
  templateUrl: './add-remote-signaling-point-code.component.html',
})
export class AddRemoteSignalingPointCodeComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      // TODO: GET DATA FORM
    }
  }
  title = 'Create RSP';
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      rsp: ['', [Validators.required]],
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
