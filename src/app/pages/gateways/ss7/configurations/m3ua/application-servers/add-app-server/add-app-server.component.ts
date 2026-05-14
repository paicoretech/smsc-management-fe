import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { Form, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { M3uaService, AlertService, M3uaGeneralSettings, CatalogService, Catalog } from '@app/core';
import { M3uaSettingsService } from '@app/core/services/m3ua-settings.service';
import { minArrayLength } from '@app/core/utils/functions/validator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-app-server',
  templateUrl: './add-app-server.component.html',
})
export class AddAppServerComponent implements OnInit,OnDestroy {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.isEdit=true;
      this.loadDataForm(value.dataServer);
    } else {
      this.loadDataForm(null);
    }
  }
  title = 'Create Application Server';
  form!: FormGroup;
  formTarget!: FormGroup;
  associationList:any[]=[];
  aspList: any[] = [];
  functionalityList: Catalog[] = [];
  traficModeList: Catalog[] = [];
  m3uaSettings?: M3uaGeneralSettings;
  appserver:any;
  isEdit: boolean = false;

  private subscriptions = new Subscription();

  constructor(private fb: FormBuilder,
     private m3uaService: M3uaService,
     private alertsvr:AlertService,
     private m3uaSettingsService: M3uaSettingsService,
     private catalogService: CatalogService,
     ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.m3uaSettingsService.data$.subscribe(settings => {
      if (settings) {
        this.m3uaSettings = settings;
      }
    }));
    this.loadData();

  }

  loadData() {
    this.loadDataForm(null);
    this.initializeForm();
    this.loadAssociationFactories();
    this.loadfunctionality()
    this.loadTrafficMode();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      exchange: ['', [Validators.required]],
      functionality: ['', [Validators.required]],
      routing_context: ['', [Validators.pattern('^[0-9]*$')]],
      network_appearance: ['', [Validators.pattern('^[0-9]*$')]],
      traffic_mode: ['', [Validators.required]],
      minuimum_asp_for_loadshare: ['', [Validators.pattern('^[0-9]*$')]],
      aspList: this.fb.array([],minArrayLength(1))
    });
    this.initializeTarget();
  }

  initializeTarget(): void {
    this.formTarget = this.fb.group({
      id: [],
      asp: ['', [Validators.required]],
      action: [2, [Validators.required]],
    });
  }

  async loadTrafficMode() {
    let response = await this.catalogService.getByCatalogType('ss7TrafficMode');
    if (response.status == 200) {
      this.traficModeList = response.data;
    }
  }

  save(): void {

    if (this.form.invalid) {
      return;
    }

    const formData = this.form.getRawValue();
    const applicationServerData = {
      id: this.appserver?.id,
      name: formData.name,
      functionality: formData.functionality,
      exchange: formData.exchange,
      routing_context: parseInt(formData.routing_context) || 0,
      network_appearance: parseInt(formData.network_appearance) || null,
      traffic_mode_id: formData.traffic_mode || '',
      minimum_asp_for_loadshare: formData.minuimum_asp_for_loadshare || 0,
      asp_factories: formData.aspList.map((asp: { id: any; }) => asp.id)
    };

    if (this.isEdit) {

      this.m3uaService.updateApplicationServers(applicationServerData.id, applicationServerData)
        .then(response => {
          this.handleResponse(response);
        })
        .catch(error => {
          this.handleError(error);
        });
    } else {

      this.m3uaService.createApplicationServers(applicationServerData)
        .then(response => {
          this.handleResponse(response);
        })
        .catch(error => {
          this.handleError(error);
        });
    }
  }

  handleResponse(response: any) {
    if (response.status === 200) {
      this.alertsvr.showAlert(1, response.message, response.comment);
      this.form.reset();
      this.formTarget.reset();
      this.associationList = [];
      this.close();
    } else {
      this.alertsvr.showAlert(4, response.message, response.comment);
    }
  }

  handleError(error: any) {
    this.alertsvr.showAlert(4, "Error", "An error occurred while processing your request.");
    console.error('Error:', error);
  }

  close(): void {
    this.loadData();
    this.appserver = null;
    this.closeModal.emit(true);
  }

  loadDataForm(data: any): void {

    if (!data) {

      this.title = 'Create Application Server';
      this.isEdit = false;

    } else {

      if (this.associationList.length > 0) {
        this.formTarget.patchValue({
          asp: this.associationList[0].id
        });
      }

      this.title = 'Edit Application Server';
      this.isEdit = true;
      this.appserver = data;

      this.form.reset({
        id:data.id ?? '',
        name: data.name ?? '',
        exchange: data.exchange ?? '',
        functionality: data.functionality ?? '',
        routing_context: data.routing_context ?? '',
        network_appearance: data.network_appearance ?? null,
        traffic_mode: data.traffic_mode_id ?? '',
        minuimum_asp_for_loadshare: data.minimum_asp_for_loadshare ?? 0,
      });
      const aspFactoryIds = data.asp_factories;
      const aspListFormArray = this.form.get('aspList') as FormArray;
      aspListFormArray.clear();

      if (aspFactoryIds && Array.isArray(aspFactoryIds)) {

        aspFactoryIds.forEach(aspId => {
          const aspDetails = this.associationList.find(item => item.id === aspId);
          if (aspDetails) {
            aspListFormArray.push(this.fb.group({
              id: aspDetails.id,
              asp_name: aspDetails.asp_name
            }));
          }
        });
        
        this.associationList = this.associationList.filter(assoc => !aspFactoryIds.includes(assoc.id));
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
    if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
      return 'Only alphanumeric characters are allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }


  //asp name from associations
  async loadAssociationFactories() {
    try {
      if(this.m3uaSettings==null){
        return;
      }
      const response = await this.m3uaService.getAssociationsList(this.m3uaSettings.id);
      if (response.status === 200) {
        this.associationList = response.data;
      } else {
        this.alertsvr.showAlert(2, response.message, response.comment);
      }
    } catch (error) {
      console.error('Error loading sockets:', error);
      this.alertsvr.showAlert(3, 'Server error', 'An error occurred while loading sockets.');
    }
  }

  async loadfunctionality() {
    let response = await this.catalogService.getByCatalogType('ss7Functionality');
    if (response.status == 200) {
      this.functionalityList = response.data;
    }
  }



  get aspListControls() {
    return (this.form.get('aspList') as FormArray)?.controls || [];
  }

  addToAspList(): void {
    const selectedAspId = this.formTarget.value.asp;
    const selectedItem = this.associationList.find(item => item.id == selectedAspId);
    if (selectedItem) {
      const aspList = this.form.get('aspList') as FormArray;
      aspList.push(this.fb.group({
        id: selectedItem.id,
        asp_name: selectedItem.asp_name
      }));
      this.associationList = this.associationList.filter(item => item.id !== selectedItem.id);
      
      this.initializeTarget();

      if (this.associationList.length > 0) {
        this.formTarget.patchValue({
          asp: this.associationList[0].id
        });
      }
    }
  }

  removeFromAspList(index: number): void {
    const item = (this.form.get('aspList') as FormArray).at(index).value;
    this.associationList.push(item);
    (this.form.get('aspList') as FormArray).removeAt(index);
  }

  drop(event: CdkDragDrop<any[]>) {
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

  }
}
