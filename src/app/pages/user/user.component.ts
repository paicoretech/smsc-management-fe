import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertService, AuthService, DataTableConfigService, ResponseI, User } from '@app/core';
import { UserService } from '@app/core/services/user.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: User[] = [];
  itemUser!: User;
  module: any;
  formModal: any;
  formModalDelete: any;
  formModalChangePassword: any;
  messageShow: string = '';
  permission: boolean = false;
  private isUnlockAction: boolean = false;

  constructor(
    private alertService: AlertService,
    private dtConfigService: DataTableConfigService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void { 
    this.loadDtOptions();
    this.loadUsers();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalUser'),)
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteUser'),)
    this.formModalChangePassword = new window.bootstrap.Modal(document.getElementById('modalChangePassword'));
  }

  async loadUsers() {

    const roles = await this.authService.getRoles();

    if (!roles.includes('ROOT') && !roles.includes('ADMINISTRATOR')) {
      this.permission = false;
      this.dtTrigger.next(this.dtOptions);
      return;
    }

    this.permission = true;
    this.response = await this.userService.getUsers();
    if (this.response.status == 200) {
        this.data = this.response.data;
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModal.show();
  }

  openChangePasswordModal(user: User) {
    this.itemUser = user;
    this.formModalChangePassword.show();
  }

  editData(user: User) {
    this.module = {
        title: 'Edit Item',
        isEdit: true,
        userEdit: user,
    }
    this.showModal(true);
  }

  onCloseModal(band: boolean) {
    this.module = {
      title: '',
    }
    if (band) {
      this.formModal.hide();
    }
    this.renderer();
  }

  async deleteUser(user: User) {
    if (user.roles.includes('ROOT')) {
      this.alertService.warning('Users with ROOT role cannot be deleted.');
      return;
    }
  
    this.itemUser = user;
    this.isUnlockAction = false;
    const action = user.status === 1 ? 'deactivate' : 'activate';
    this.messageShow = `Are you sure you want to ${action} the user "${user.user_name}"?`;
    this.formModalDelete.show();
  }

  async onCloseModalDelete(band: boolean) {
    this.formModalDelete.hide();
    if (band) {
      await this.toggleUserStatus();
    }
    this.renderer();
  }

  async toggleUserStatus() {
    try {
      let updatedUser;
      let actionMessage;

      if (this.isUnlockAction) {
        updatedUser = {
          ...this.itemUser,
          account_locked: false,
          user_name: this.itemUser.user_name,
        };
        actionMessage = `User "${this.itemUser.user_name}" has been successfully unlocked.`;
      } else {
        const newStatus = this.itemUser.status === 1 ? 0 : 1;
        updatedUser = {
          ...this.itemUser,
          status: newStatus,
          user_name: this.itemUser.user_name,
        };
        const action = newStatus === 1 ? 'activated' : 'deactivated';
        actionMessage = `User "${this.itemUser.user_name}" has been successfully ${action}.`;
      }

      const resp = await this.userService.updateUser(this.itemUser.id, updatedUser);

      if (resp.status === 200) {
        this.alertService.showAlert(1, 'Success', actionMessage);
      } else {
        this.alertService.showAlert(2, 'Action failed', resp.comment || 'Try again later.');
      }
    } catch (err) {
      this.alertService.showAlert(3, 'Server error', 'Could not update user.');
    }
    this.messageShow = '';
    this.isUnlockAction = false;
  }
    
  async changePasswordFromModal(form: FormGroup) {
    const password = form.value.password;
    const userName = this.itemUser.user_name;
  
    try {
      const currentUser = await this.authService.getIdentity();
      const response = await this.authService.changePassword({ userName, password }, false);
  
      if (response.status === 200) {
        
        this.formModalChangePassword.hide();
        this.itemUser = null as unknown as User;
        
        if (userName === currentUser) {
          this.alertService.showAlert(
            1,
            'Success',
            'Password updated. You will be logged out for security reasons.',
          );
          await this.authService.logout();
        } else {
          this.alertService.showAlert(1, 'Success', 'Password updated');
          this.renderer();
        }
      } else {
        this.alertService.showAlert(2, 'Action failed', response.comment || 'Try again later.');
      }
    } catch (error) {
      this.alertService.showAlert(3, 'Server error', 'Could not update password.');
    }
  }
  
  onCancelChangePassword() {
    this.formModalChangePassword.hide();
    this.itemUser = null as unknown as User;
  }

  unlockUser(user: User) {
    this.itemUser = user;
    this.isUnlockAction = true;
    this.messageShow = `Are you sure you want to unlock the user "${user.user_name}"?`;
    this.formModalDelete.show();
  }
  
  loadDtOptions() {
    this.dtOptions = {
      ...this.dtConfigService.getConfig(),
      initComplete: () => {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
                    this.onPageLengthChange(len);
                });
            });
        }
    };
  }
  
  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadUsers();
    });
  }
  
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  
  refresh() {
    this.renderer();
  }
}