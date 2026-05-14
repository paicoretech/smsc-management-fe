import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  AlertService, 
  AuthService,
  CatalogService, 
  GeneralSetting, 
  SettingServices,
  Catalog, 
  ResponseI, 
  SmscSetting 
} from '@app/core';
import { environment } from '@env/environment';
import { 
  convertToSmscSetting,
  convertToApiFormat
} from '@app/core';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit {

  encodingList: Catalog[] = [];
  tonCatalog: Catalog[] = [];
  npiCatalog: Catalog[] = [];
  
  form!: FormGroup;
  formSmscSetting!: FormGroup;
  reponse!: ResponseI;
  generalSetting!: GeneralSetting;
  smscSetting!: SmscSetting;
  defaultValue = environment.generalSettings.general;
  isRootUser: boolean = false;

  constructor(
    private settingServices: SettingServices,
    private alertSvr: AlertService,
    private fb: FormBuilder,
    private catalogService: CatalogService,
    private authService: AuthService
  ) {  }

  async ngOnInit(): Promise<void> {
    this.initForm();
    this.initFormSmsSetting();
    await this.checkUserRoles();
    this.getCatalogEncodings();
    this.getTonCatalog();
    this.getNpiCatalog();
    this.getData();
    this.getSmscSetting();
  }

  private async checkUserRoles() {
    const roles = await this.authService.getRoles();
    this.isRootUser = roles.includes('ROOT');
  }

  async getCatalogEncodings() {
    const resp = await this.catalogService.getByCatalogType('encodingType');

    if (resp.status == 200) {
      this.encodingList = resp.data;
    }
  }

  async getTonCatalog() {
    this.reponse = await this.catalogService.getByCatalogType('toncatalog');

    if (this.reponse.status == 200) {
      this.tonCatalog = this.reponse.data;
    }
  }

  async getNpiCatalog() {
    this.reponse = await this.catalogService.getByCatalogType('npicatalog');
    if (this.reponse.status == 200) {
      this.npiCatalog = this.reponse.data;
    }
  }

  async getData() {
    this.reponse = await this.settingServices.getGeneralSetting();
    if (this.reponse.status == 200) {
      this.generalSetting = this.reponse.data;
      this.loadForm();
    }
  }

  async getSmscSetting() {
    this.reponse = await this.settingServices.getSmscSetting();
    if (this.reponse.status == 200) {
      this.smscSetting = convertToSmscSetting(this.reponse.data);
      this.loadFormSmsSetting();
    }
  }

  initForm() {
    this.form = this.fb.group({
      id: ['', [Validators.required]],
      validity_period: ['', [Validators.required]],
      max_validity_period: ['', [Validators.required]],
      source_addr_ton: ['', [Validators.required]],
      source_addr_npi: ['', [Validators.required]],
      dest_addr_ton: ['', [Validators.required]],
      dest_addr_npi: ['', [Validators.required]],
      encoding_gsm7: [this.defaultValue.encoding_gsm7, [Validators.required]],
      encoding_ucs2: [this.defaultValue.encoding_ucs2, [Validators.required]],
      encoding_iso88591: [this.defaultValue.encoding_iso88591, [Validators.required]],
    });
  }

  initFormSmsSetting() {
    this.formSmscSetting = this.fb.group({
      max_password_length: ['', [Validators.required]],
      max_system_id_length: ['', [Validators.required]],
      use_local_charging: [false, [Validators.required]],
      use_analyze: [false, [Validators.required]],
      use_dnd_filtering: [false, [Validators.required]]
    });
  }

  loadForm() {
    let encoding_gsm7 = this.defaultValue.encoding_gsm7;
    let encoding_ucs2 = this.defaultValue.encoding_ucs2;
    let encoding_iso88591 = this.defaultValue.encoding_iso88591;

    if (this.generalSetting.encoding_gsm7 !== null && this.generalSetting.encoding_gsm7 !== undefined) {
      encoding_gsm7 = parseInt(this.generalSetting.encoding_gsm7);
    }

    if (this.generalSetting.encoding_ucs2 !== null && this.generalSetting.encoding_ucs2 !== undefined) {
      encoding_ucs2 = parseInt(this.generalSetting.encoding_ucs2);
    }

    if (this.generalSetting.encoding_iso88591 !== null && this.generalSetting.encoding_iso88591 !== undefined) {
      encoding_iso88591 = parseInt(this.generalSetting.encoding_iso88591);
    }

    this.form.patchValue({
      id: this.generalSetting.id,
      validity_period: this.generalSetting.validity_period,
      max_validity_period: this.generalSetting.max_validity_period,
      source_addr_ton: this.generalSetting.source_addr_ton,
      source_addr_npi: this.generalSetting.source_addr_npi,
      dest_addr_ton: this.generalSetting.dest_addr_ton,
      dest_addr_npi: this.generalSetting.dest_addr_npi,
      encoding_gsm7: encoding_gsm7,
      encoding_ucs2: encoding_ucs2,
      encoding_iso88591: encoding_iso88591,
    });
  }

  loadFormSmsSetting() {
    this.formSmscSetting.patchValue({
      max_password_length: this.smscSetting.max_password_length,
      max_system_id_length: this.smscSetting.max_system_id_length,
      use_local_charging: this.smscSetting.use_local_charging,
      use_analyze: this.smscSetting.use_analyze,
      use_dnd_filtering: this.smscSetting.use_dnd_filtering
    });
  }

  async save() {
    if (!this.form.valid) {
      this.alertSvr.showAlert(2, 'Error', 'Please fill all the required fields');
    }

    this.reponse = await this.settingServices.updateGeneralSetting(this.form.value);

    if (this.reponse.status == 200) {
      this.alertSvr.showAlert(1, this.reponse.message, this.reponse.comment);
    } else {
      this.alertSvr.showAlert(4, this.reponse.message, this.reponse.comment);
    }
  }

  async saveSmscSetting() {
    if (!this.formSmscSetting.valid) {
      this.alertSvr.showAlert(2, 'Error', 'Please fill all the required fields');
    }

    const smscSetting = convertToApiFormat(this.formSmscSetting.value);

    this.reponse = await this.settingServices.updateSmscSetting(smscSetting);

    if (this.reponse.status == 200) {
      this.alertSvr.showAlert(1, this.reponse.message, this.reponse.comment);
      // Notify sidebar to refresh when settings are updated
      window.dispatchEvent(new CustomEvent('smsc-settings-updated'));
    } else {
      this.alertSvr.showAlert(4, this.reponse.message, this.reponse.comment);
    }
    this.getSmscSetting();
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }


  getPatternMessage(name: string) {
    if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
      return 'Only alphanumeric characters are allowed';
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\\s]+$') {
      return 'No spaces allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }
}
