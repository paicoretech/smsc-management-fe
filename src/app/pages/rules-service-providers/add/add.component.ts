import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Catalog, ErrorCode, RoutingRules, Network, CustomParams } from '@core/index';
import { RoutingRolesService, AuthService, AlertService } from '@core/index';
import { environment } from '@env/environment';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {
   
  public title = '';
  public isEdit = false;
  public form!: FormGroup;
  public formTarget!: FormGroup;
  public formFields!: FormGroup;
  public formAdvancedActions!: FormGroup;
  public destinationList: any[] = [];
  public destinationDelete: any[] = [];
  public customParamsList: CustomParams[] = [];
  public customParamsDelete: CustomParams[] = [];

  private env = environment;
  private sourceAddressTon = this.env.RulesServiceProviderDefaults.source_addr_ton;
  private sourceAddressNpi = this.env.RulesServiceProviderDefaults.source_addr_npi;
  private destAddrTon = this.env.RulesServiceProviderDefaults.dest_addr_ton;
  private destAddrNpi = this.env.RulesServiceProviderDefaults.dest_addr_npi;
  destinationNetwoksList: Network[] = [];
  applicationContextOptions: Array<{ label: string; value: string }> = [];
  roles: string[] = [];
  canView: boolean = false;
  
  private allowedVariables = ['sourceAddr', 'destinationAddr', 'globalTitle'];
  tooltipText: string = `Source Address -> {{sourceAddr}}
    Destination Address -> {{destinationAddr}}
    Global Title Digits -> {{globalTitle}}`;

  accordionA: boolean = false;
  accordionB: boolean = false;
  accordionC: boolean = false;

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() providerErrorCodeList: ErrorCode[] = [];
  @Input() routingRolesList: RoutingRules[] = [];
  @Input() networksList: Network[] = [];
  @Input() networksListSs7: Network[] = [];
  @Input() newSourceAddressTonList: Catalog[] = [];
  @Input() newSourceAddressNpiList: Catalog[] = [];
  @Input() newDestAddrTonList: Catalog[] = [];
  @Input() newDestAddrNpiList: Catalog[] = [];
  @Input() set dataUpdate(value: any) {
    this.resetAccordions();
    if (value != null && value != undefined) {
      this.loadDataForm(value.responseCodeEdit);
      this.applyDefaultDisabledState();
    }
    else {
      this.title = 'Create Routing Rules';
      this.isEdit = false;
      if (this.form != undefined) {
        this.cdr.detectChanges();
        this.form.reset();
        this.form.get('new_source_addr_ton')?.setValue(this.sourceAddressTon);
        this.form.get('new_source_addr_npi')?.setValue(this.sourceAddressNpi);
        this.form.get('new_dest_addr_ton')?.setValue(this.destAddrTon);
        this.form.get('new_dest_addr_npi')?.setValue(this.destAddrNpi);
        this.applyDefaultDisabledState();
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private routingRolesService: RoutingRolesService,
    private authService: AuthService,
    private alertSvr: AlertService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getRoles();
    this.initializeForm();
    this.loadDataForm(null);
    this.applyDefaultDisabledState();

    this.form.valueChanges.subscribe(() => this.applyDefaultDisabledState());
  }

  async getRoles() {
    this.roles = await this.authService.getRoles() || [];
    const allowedRoles = ['ROOT', 'ACTIONS_ADVANCED'];
    this.canView = this.roles.some(role => allowedRoles.includes(role));
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [undefined],
      origin_network_id: [undefined, [Validators.required]],
      regex_source_addr: ['', []],
      regex_source_addr_ton: ['', [Validators.pattern('^[a-zA-Z0-9]+$')]],
      regex_source_addr_npi: ['', []],
      regex_destination_addr: ['', []],
      regex_dest_addr_ton: ['', [Validators.pattern('^[0-9]+$')]],
      regex_dest_addr_npi: ['', [Validators.pattern('^[34]+$')]],
      regex_imsi_digits_mask: ['', []],
      regex_network_node_number: ['', []],
      regex_calling_party_address: ['', []],
      destination: this.fb.array([
        this.initializeTarget()
      ]),
      new_source_addr: ['', []],
      new_source_addr_ton: [this.sourceAddressTon, [Validators.required, Validators.pattern('^-1|[0-9]+$')]],
      new_source_addr_npi: [this.sourceAddressNpi, [Validators.required, Validators.pattern('^-1|[0-9]+$')]],
      new_destination_addr: ['', []],
      new_dest_addr_ton: [this.destAddrTon, [Validators.required, Validators.pattern('^-1|[0-9]+$')]],
      new_dest_addr_npi: [this.destAddrNpi, [Validators.required, Validators.pattern('^-1|[0-9]+$')]],
      add_source_addr_prefix: ['', []],
      add_dest_addr_prefix: ['', []],
      remove_source_addr_prefix: ['', []],
      remove_dest_addr_prefix: ['', []],
      new_gt_sccp_addr: ['', [this.gtSccpAddrValidator.bind(this)]],
      drop_map_sri: [false, []],
      network_id_to_map_sri: ['', []],
      network_id_to_permanent_failure: ['', []],
      drop_temp_failure: [false, []],
      network_id_temp_failure: ['', []],
      check_sri_response: [false, []],
      is_sri_response: [false, []],
      custom_params_matcher: this.fb.array([
        this.initializeFormFields()
      ]),
      regex_short_message: ['', []],
      new_short_message: ['', []],
      diameter_charging: [false, []],
      apply_for_refund: [false, []],
      action_advanced: this.initializeFormActionAdvanced()
    });

    this.form.get('apply_for_refund')?.disable();
  }

  initializeTarget(): void {
    this.formTarget = this.fb.group({
      id: [],
      priority: [{ value: 1, disabled: true }, [Validators.required, Validators.pattern('^[0-9]+$')],],
      network_id: [0, [Validators.required]],
      action: [2, [Validators.required]],
    });
  }

  initializeFormFields(): void {
    this.formFields = this.fb.group({
      property_name: ['', [Validators.required]],
      value_matcher: ['', [Validators.required]]
    });
  }

  initializeFormActionAdvanced(): void {
    this.formAdvancedActions = this.fb.group({
      map_version: [-1, []],
      operation_code_sri: [-1, []],
      operation_code_mt: [-1, []],
      ssn_smsc_sri: [-1, []],
      ssn_hlr_sri: [-1, []],
      ssn_msc_mt: [-1, []],
      ssn_smsc_mt: [-1, []],
      sccp_source_address_sri: ['', []],
      sccp_source_address_mt: ['', []],
      sccp_destination_address_mt: ['', []],
      sccp_destination_address_sri: ['', []],
      custom_map_layer_source_address_sri: ['', []],
      custom_map_layer_source_address_mt: ['', []],
      priority_flag_sri: [true, []],
      application_context_mt: ['', []]
    });

    this.applicationContextOptions = [
      { label: 'Default', value: '' },
    ];

    this.formAdvancedActions.get('operation_code_mt')?.disable();
    this.formAdvancedActions.get('application_context_mt')?.disable();
  }

  onMapVersionChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.updateApplicationContextOptions(value);
  }

  private updateApplicationContextOptions(mapVersion: number, preselect?: string) {
    const ctrl = this.formAdvancedActions.get('application_context_mt');
    const opCodeCtrl = this.formAdvancedActions.get('operation_code_mt'); 

    if (mapVersion === 2) {
      this.applicationContextOptions = [
        { label: 'Default', value: '' },
        { label: 'Short Msg MT Relay Context', value: 'shortMsgMTRelayContext' },
        { label: 'Short Msg MO Relay Context', value: 'shortMsgMORelayContext' },
      ];
      ctrl?.enable();

      opCodeCtrl?.setValue('-1');
      opCodeCtrl?.disable();
    } else if (mapVersion === 3) {
      this.applicationContextOptions = [
        { label: 'Default', value: '' },
        { label: 'Short Msg MT Relay Context', value: 'shortMsgMTRelayContext' },
      ];

      ctrl?.disable();
      opCodeCtrl?.enable();
    } else {
       this.applicationContextOptions = [
        { label: 'Default', value: '' },
      ];
      ctrl?.setValue('');
      ctrl?.disable();

      opCodeCtrl?.setValue('-1');
      opCodeCtrl?.disable();
      return;
    }

    const values = this.applicationContextOptions.map(o => o.value);
    if (preselect !== undefined && values.includes(preselect)) {
      ctrl?.setValue(preselect);
    } else {
      ctrl?.setValue('');
    }
  }

  loadDataForm(data: any): void {
    if (data == null || data == undefined) {
      this.title = 'Create Routing Rules';
      return;
    } else {
      this.title = 'Edit Routing Rules';
      this.isEdit = true;
      this.form.reset({
        id: (data.id == null || data.id == undefined) ? '' : parseInt(data.id),
        origin_network_id: (data.origin_network_id == null || data.origin_network_id == undefined) ? '' : parseInt(data.origin_network_id),
        regex_source_addr: (data.regex_source_addr == null || data.regex_source_addr == undefined) ? '' : data.regex_source_addr,
        regex_source_addr_ton: (data.regex_source_addr_ton == null || data.regex_source_addr_ton == undefined) ? '' : data.regex_source_addr_ton,
        regex_source_addr_npi: (data.regex_source_addr_npi == null || data.regex_source_addr_npi == undefined) ? '' : data.regex_source_addr_npi,
        regex_destination_addr: (data.regex_destination_addr == null || data.regex_destination_addr == undefined) ? '' : data.regex_destination_addr,
        regex_dest_addr_ton: (data.regex_dest_addr_ton == null || data.regex_dest_addr_ton == undefined) ? '' : data.regex_dest_addr_ton,
        regex_dest_addr_npi: (data.regex_dest_addr_npi == null || data.regex_dest_addr_npi == undefined) ? '' : data.regex_dest_addr_npi,
        regex_imsi_digits_mask: (data.regex_imsi_digits_mask == null || data.regex_imsi_digits_mask == undefined) ? '' : data.regex_imsi_digits_mask,
        regex_network_node_number: (data.regex_network_node_number == null || data.regex_network_node_number == undefined) ? '' : data.regex_network_node_number,
        regex_calling_party_address: (data.regex_calling_party_address == null || data.regex_calling_party_address == undefined) ? '' : data.regex_calling_party_address,
        new_source_addr: (data.new_source_addr == null || data.new_source_addr == undefined) ? '' : data.new_source_addr,
        new_source_addr_ton: (data.new_source_addr_ton == null || data.new_source_addr_ton == undefined) ? this.sourceAddressTon : parseInt(data.new_source_addr_ton),
        new_source_addr_npi: (data.new_source_addr_npi == null || data.new_source_addr_npi == undefined) ? this.sourceAddressNpi : parseInt(data.new_source_addr_npi),
        new_destination_addr: (data.new_destination_addr == null || data.new_destination_addr == undefined) ? '' : data.new_destination_addr,
        new_dest_addr_ton: (data.new_dest_addr_ton == null || data.new_dest_addr_ton == undefined) ? this.destAddrTon : parseInt(data.new_dest_addr_ton),
        new_dest_addr_npi: (data.new_dest_addr_npi == null || data.new_dest_addr_npi == undefined) ? this.destAddrNpi : parseInt(data.new_dest_addr_npi),
        add_source_addr_prefix: (data.add_source_addr_prefix == null || data.add_source_addr_prefix == undefined) ? '' : data.add_source_addr_prefix,
        add_dest_addr_prefix: (data.add_dest_addr_prefix == null || data.add_dest_addr_prefix == undefined) ? '' : data.add_dest_addr_prefix,
        remove_source_addr_prefix: (data.remove_source_addr_prefix == null || data.remove_source_addr_prefix == undefined) ? '' : data.remove_source_addr_prefix,
        remove_dest_addr_prefix: (data.remove_dest_addr_prefix == null || data.remove_dest_addr_prefix == undefined) ? '' : data.remove_dest_addr_prefix,
        new_gt_sccp_addr: (data.new_gt_sccp_addr == null || data.new_gt_sccp_addr == undefined) ? '' : data.new_gt_sccp_addr,
        drop_map_sri: (data.drop_map_sri == null || data.drop_map_sri == undefined) ? false : data.drop_map_sri,
        network_id_to_map_sri: (data.network_id_to_map_sri == null || data.network_id_to_map_sri == undefined) ? '' : data.network_id_to_map_sri,
        network_id_to_permanent_failure: (data.network_id_to_permanent_failure == null || data.network_id_to_permanent_failure == undefined) ? '' : data.network_id_to_permanent_failure,
        drop_temp_failure: (data.drop_temp_failure == null || data.drop_temp_failure == undefined) ? false : data.drop_temp_failure,
        network_id_temp_failure: (data.network_id_temp_failure == null || data.network_id_temp_failure == undefined) ? '' : data.network_id_temp_failure,
        check_sri_response: (data.check_sri_response == null || data.check_sri_response == undefined) ? false : data.check_sri_response,
        is_sri_response: (data.is_sri_response == null || data.is_sri_response == undefined) ? false : data.is_sri_response,
        regex_short_message: (data.regex_short_message == null || data.regex_short_message == undefined) ? '' : data.regex_short_message,
        new_short_message: (data.new_short_message == null || data.new_short_message == undefined) ? '' : data.new_short_message,
        diameter_charging: (data.diameter_charging == null || data.diameter_charging == undefined) ? false : data.diameter_charging,
        apply_for_refund: (data.apply_for_refund == null || data.apply_for_refund == undefined) ? false : data.apply_for_refund
      });
      this.applyDefaultDisabledState();
      this.customParamsList = data.custom_params_matcher;

      if (data.drop_temp_failure == true && data.network_id_temp_failure != null && data.network_id_temp_failure != undefined) {
        this.form.get('drop_temp_failure')?.setValue(true);
      }

      if (data.destination != null && data.destination != undefined) {
        for (let index = 0; index < data.destination.length; index++) {
          const element = data.destination[index];
          let network = this.networksList.find(x => x.network_id == element.network_id);
          this.destinationList.push({
            id: element.id,
            routing_rules_id: element.routing_rules_id,
            priority: element.priority,
            network_id: element.network_id,
            gateway_name: network?.name,
            action: element?.action
          });
        }

        // load destination networks
        const found = this.networksList.find(x => x.network_id === parseInt(this.form.get('origin_network_id')?.value));

        if (found?.network_type === 'SP') {
          this.destinationNetwoksList = this.networksList.filter(x => x.network_type == 'GW');
        } else {
          this.destinationNetwoksList = this.networksList;
        }

        let priority = this.destinationList.length + 1;
        this.formTarget.get('priority')?.setValue(priority);

        const diameter_charging = this.form.get('diameter_charging')?.value === true;
        this.form.get('apply_for_refund')?.setValue(diameter_charging && data.apply_for_refund === true);
        this.form.get('apply_for_refund')?.[diameter_charging ? 'enable' : 'disable']();

        // Advanced actions
        const actionAdvanced = data.action_advanced;
        if (actionAdvanced != null && actionAdvanced != undefined) {
          const normalized = this.normalizeActionAdvanced(actionAdvanced);
          this.formAdvancedActions.reset(normalized);

          const mapVersion = this.formAdvancedActions.get('map_version')?.value;
          const savedCtx = normalized.application_context_mt;
          this.updateApplicationContextOptions(mapVersion, savedCtx);
        }
      }
    }
  }

  onOriginNetworkChange() {
    this.initializeTarget();

    this.formTarget.get('network_id')?.setValue(null);
    const id = this.form.get('origin_network_id')?.value;

    const found = this.networksList.find(x => x.network_id === parseInt(id));


    if (found?.network_type === 'SP') {
      this.destinationNetwoksList = this.networksList.filter(x => x.network_type == 'GW');
    } else {
      this.destinationNetwoksList = this.networksList;
    }

    this.accordionC = true;
    this.cdr.detectChanges();
  }

  onChangeSRI() {
    if (this.form.get('is_sri_response')?.value) {
      this.destinationNetwoksList = this.networksList.filter(x => x.protocol == 'SS7');
    } else {
      const id = this.form.get('origin_network_id')?.value;
      const found = this.networksList.find(x => x.network_id === parseInt(id));

      if (found?.network_type === 'SP') {
        this.destinationNetwoksList = this.networksList.filter(x => x.network_type == 'GW');
      } else {
        this.destinationNetwoksList = this.networksList;
      }
    }
    this.cdr.detectChanges();
  }

  onChangeDiameterCharging() {
    if (this.form.get('diameter_charging')?.value) {
      this.form.get('apply_for_refund')?.enable();
    }
    else {
      this.form.get('apply_for_refund')?.disable();
      this.form.get('apply_for_refund')?.setValue(false);
    }
  }

  addDestination(): void {
    if (this.formTarget.invalid) {
      this.alertSvr.showAlert(2, 'Error', 'Please fill in the required fields');
      return
    }

    let network_id = this.formTarget.get('network_id')?.value == undefined ? 0 : this.formTarget.get('network_id')?.value;

    if (network_id == 0) {
      this.alertSvr.showAlert(2, 'Error', 'Please select a network');
      return
    }

    let validateProtocol = this.networksList.find(x => x.network_id == network_id);
    if (validateProtocol?.protocol !== 'SS7') {
      // validate origin network id is not equal to destination network id
      if (this.form.get('origin_network_id')?.value == network_id) {
        this.alertSvr.showAlert(2, 'Error', 'Origin network id is equal to destination network id');
        return
      }
    }

    let destination = this.destinationList.find(x => x.network_id == this.formTarget.get('network_id')?.value);

    if (destination != undefined) {
      this.alertSvr.showAlert(2, 'Error', 'Destination already exists');
      return
    }

    let network = this.networksList.find(x => x.network_id == this.formTarget.get('network_id')?.value);
    this.destinationList.push({
      priority: this.formTarget.get('priority')?.value,
      network_id: this.formTarget.get('network_id')?.value,
      gateway_name: network?.name,
    });

    this.initializeTarget();
    let priority = this.destinationList.length + 1;
    this.formTarget.get('priority')?.setValue(priority);
  }

  removeDestination(index: number): void {
    let item: any = this.destinationList[index];
    item.action = 1;
    this.destinationDelete.push(item);
    this.destinationList.splice(index, 1);
    this.formTarget.get('priority')?.setValue(this.destinationList.length + 1);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.destinationList, event.previousIndex, event.currentIndex);
    this.destinationList.forEach((element, i) => {
      element.priority = i + 1;
      element.action = 0;
    });
  }

  close(): void {
    this.resetAccordions();
    this.destinationList = [];
    this.destinationDelete = [];
    this.customParamsList = [];
    this.customParamsDelete = [];
    this.initializeTarget();
    this.initializeForm();
    this.initializeFormActionAdvanced();
    this.closeModal.emit(true);
    this.form.reset();
    this.applyDefaultDisabledState();
    this.cdr.detectChanges();
  }

  private resetAccordions() {
    this.accordionA = true;
    this.accordionB = false;
    this.accordionC = false;
  }

  onChangeState(name: string) {
    if (name == 'network_id_temp_failure') {
      if (this.form.get(name)?.value != null && this.form.get(name)?.value != undefined && this.form.get(name)?.value != '') {
        this.form.get('drop_temp_failure')?.setValue(true);
      } else {
        this.form.get('drop_temp_failure')?.setValue(false);
      }
    }
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  getPatternMessage(name: string) {
    if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[a-z]+$') {
      return 'Only letters are allowed';
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[34]+$') {
      return 'Only numbers 3 or 4 are allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  async save() {
    if (this.form.invalid) {
      return
    }

    if (this.destinationList.length == 0) {
      this.alertSvr.showAlert(2, 'Error', 'Please add at least one destination');
      this.accordionC = true;
      this.cdr.detectChanges();
      return
    }

    let obj = this.form.getRawValue();
    obj.action_advanced = this.formAdvancedActions.getRawValue();

    if (obj.action_advanced) {
      obj.action_advanced = this.normalizeActionAdvanced(obj.action_advanced);
    }

    obj.custom_params_matcher = this.customParamsList;
    if (this.customParamsList.length == 0) {
      delete obj.custom_params_matcher;
    }


    obj.destination = [];
    let array: any[] = structuredClone(this.destinationList.concat(this.destinationDelete));

    for (let index = 0; index < array.length; index++) {
      const element = array[index];

      if (this.isEdit) {
        obj.destination[index] = {
          id: element.id,
          priority: index + 1,
          network_id: element.network_id,
          action: element.action == undefined ? 2 : element.action,
        }
        if (element.id == undefined) {
          delete obj.destination[index].id;
        }
      } else {
        obj.destination[index] = {
          priority: index + 1,
          network_id: element.network_id,
          action: element.action,
        }
      }
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        if (element == null || element == undefined) {
          obj[key] = '';
        }
      }
    }

    let resp;
    if (this.isEdit) {
      resp = await this.routingRolesService.updateRoutingRoles(obj);
      if (resp.status == 200) {
        this.destinationList = [];
        this.destinationDelete = [];
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.id;
      resp = await this.routingRolesService.createRoutingRoles(obj);
      if (resp.status == 200) {
        this.destinationList = [];
        this.destinationDelete = [];
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    }

    if (resp.status == 200) {
      this.close();
    }
  }

  dropRowTableCustomParams(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.customParamsList, event.previousIndex, event.currentIndex);
  }

  removeCustomParams(index: number): void {
    this.customParamsList.splice(index, 1);
  }

  addCustomParams(): void {
    if (this.formFields.invalid) {
      return
    }

    let property_name = this.formFields.get('property_name')?.value;
    let value_matcher = this.formFields.get('value_matcher')?.value;

    this.customParamsList.push({
      property_name: property_name,
      value_matcher: value_matcher,
    });

    this.initializeFormFields();
  }

  gtSccpAddrValidator(control: FormControl) {
    const value: string = control.value;

    if (value == null || value.trim() === '') {
      return null;
    }

    if (/\s/.test(value)) {
      return { invalidFormat: 'Spaces are not allowed' };
    }

    const variableRegex = /{{(.*?)}}/g;
    const variables = [...value.matchAll(variableRegex)].map(match => match[1].trim());

    for (const variable of variables) {
      if (!this.allowedVariables.includes(variable)) {
        return { invalidFormat: `Invalid variable: ${variable}` };
      }
    }

    const valueWithoutVariables = value.replace(variableRegex, '');

    if (!/^\d*$/.test(valueWithoutVariables)) {
      return { invalidFormat: 'Only numbers are allowed outside of variables' };
    }

    return null;
  }

  private normalizeActionAdvanced(adv: any) {
    return {
      ...adv,
      map_version: adv?.map_version || -1,
      operation_code_sri: adv?.operation_code_sri || -1,
      operation_code_mt: adv?.operation_code_mt || -1,
      ssn_smsc_sri: adv?.ssn_smsc_sri || -1,
      ssn_hlr_sri: adv?.ssn_hlr_sri || -1,
      ssn_msc_mt: adv?.ssn_msc_mt || -1,
      ssn_smsc_mt: adv?.ssn_smsc_mt || -1,
      sccp_source_address_sri: adv?.sccp_source_address_sri || '',
      sccp_source_address_mt: adv?.sccp_source_address_mt || '',
      sccp_destination_address_mt: adv?.sccp_destination_address_mt || '',
      sccp_destination_address_sri: adv?.sccp_destination_address_sri || '',
      custom_map_layer_source_address_sri: adv?.custom_map_layer_source_address_sri || '',
      custom_map_layer_source_address_mt: adv?.custom_map_layer_source_address_mt || '',
      application_context_mt: adv?.application_context_mt || '',
      priority_flag_sri: adv?.priority_flag_sri ?? true,
    };
  }

  private applyDefaultDisabledState(): void {
    this.form.get('drop_map_sri')?.disable();
    this.form.get('network_id_to_map_sri')?.disable();
    this.form.get('network_id_to_permanent_failure')?.disable();
    this.form.get('network_id_temp_failure')?.disable();
    this.form.get('check_sri_response')?.disable();
    this.form.get('new_short_message')?.disable();
    this.formAdvancedActions.disable();

    this.form.get('diameter_charging')?.disable();
    this.form.get('apply_for_refund')?.disable();
    this.form.get('new_gt_sccp_addr')?.disable();
  }

  cleanAndValidateNewGtSccpAddr() {
    const control = this.form.get('new_gt_sccp_addr');
    if (!control) return;

    let value = control.value || '';

    value = value.replace(/\s+/g, '');

    value = value.replace(/{{(.*?)}}/g, (_: any, inner: string) => `{{${inner.trim()}}}`);

    control.setValue(value, { emitEvent: true });
  }
}
