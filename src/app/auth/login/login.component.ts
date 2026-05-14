import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AlertService } from '@core/index';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  public form!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      let response = await this.authService.signup(this.form.value);
      let { data, status, comment } = response;

      if (status === 403 || status === 400) {
        this.alertService.showAlert(2, 'Error', comment);
        return;
      }

      if (data?.must_change_password) {
        localStorage.setItem('accessToken', data.access_token);
        this.router.navigate(['/auth/change-password'], {
          queryParams: {
            userName: this.form.value.userName,
          },
        });
        return;
      }

      if (data?.access_token) {
        this.alertService.showAlert(1, 'Success', 'Welcome ' + data.user_name + '!');
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('userName', data.user_name);
        localStorage.setItem('userId', data.user_id || data.id);
        localStorage.setItem('roles', JSON.stringify(data.roles));
        const senderIds = Array.isArray(data.sender_ids) ? data.sender_ids : [];
        localStorage.setItem('senderIds', JSON.stringify(senderIds));
        this.router.navigate(['/pages/home']);
      }
    }
  }

  get brandingPaic() {
    return environment.logoPaicore;
  }
}
