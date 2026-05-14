import { Component } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AlertService, AuthService } from "@app/core";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['../login/login.component.scss'],
})
export class ChangePasswordComponent {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  async onPasswordChange(form: FormGroup) {
    const userName = this.route.snapshot.queryParamMap.get('userName');
    const password = form.value.password;

    try {
      const resp = await this.authService.changePassword({ userName, password }, true);

      if (resp?.status === 200) {
        const loginResponse = await this.authService.signup({ userName, password });

        const { data } = loginResponse;

        if (data?.access_token) {
          this.alertService.showAlert(1, 'Success', 'Password updated successfully, please login again');
          this.router.navigate(['/auth/login']);
        } else {
          this.alertService.showAlert(2, 'Error', 'Password updated, but login failed');
          this.router.navigate(['/auth/login']);
        }
        localStorage.clear();
      } else {
        const errorMessage = resp?.comment || resp?.message || 'Failed to update password';
        this.alertService.showAlert(2, 'Error', errorMessage);
      }
    } catch {
      this.alertService.showAlert(3, 'Error', 'Failed to update password');
    }
  }

  get logoPath() {
    return environment.logoPaicore;
  }
}
