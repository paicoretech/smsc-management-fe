import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { M3uaService, AlertService, CatalogService, M3uaGeneralSettings, Catalog, M3uaRoute } from '@app/core';
import { M3uaSettingsService } from '@app/core/services/m3ua-settings.service';
import { minArrayLength } from '@app/core/utils/functions/validator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-route',
  templateUrl: './add-route.component.html',
})
export class AddRouteComponent implements OnInit, OnDestroy {
  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.isEdit = true;
      this.title = 'Edit Route';
      this.loadDataForm(value.dataRoute);
    } else {
      this.loadDataForm(null);
    }
  }
  m3uaObjet: any;
  @Input() set m3ua(value: any) {
    if (value != null && value != undefined) {
      this.m3uaObjet = value;
    }
  }
  title = 'Create Route';
  form!: FormGroup;
  formTarget!: FormGroup;
  aspList: any[] = [];
  appservList: any[] = [];
  m3uaSettings?: M3uaGeneralSettings;
  traficModeList: Catalog[] = [];
  route:any;
  isEdit = false;
  private subscriptions = new Subscription();

  constructor(private fb: FormBuilder,
    private m3uaService: M3uaService,
    private alertsvr:AlertService,
    private m3uaSettingsService: M3uaSettingsService,
    private catalogService: CatalogService,) {}

  ngOnInit(): void {
    this.subscriptions.add(this.m3uaSettingsService.data$.subscribe(settings => {
      if (settings) {
        this.m3uaSettings = settings;
      }
    }));
    this.loadData();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      destination_point_code: ['', [Validators.required]],
      origination_point_code: ['', [Validators.required]],
      service_indicator: ['', [Validators.required]],
      traffic_mode: ['', [Validators.required]],
      aspList: this.fb.array([
      ], minArrayLength(1))
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

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const formData = this.form.getRawValue();
    const routeData= {
      id: this.route?.id,
      origination_point_code: parseInt(formData.origination_point_code),
      destination_point_code: parseInt(formData.destination_point_code),
      service_indicator: parseInt(formData.service_indicator),
      traffic_mode_id: formData.traffic_mode,
      app_servers: formData.aspList.map((asp: { id: any; }) => asp.id)
    };
    
    if (this.isEdit) {

      this.m3uaService.updateRoute(routeData.id, routeData)
        .then(response => {
          this.handleResponse(response);
        })
        .catch(error => {
          this.handleError(error);
        });
    } else {
      this.m3uaService.createRoute(routeData, this.m3uaObjet.id)
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
      this.executeAfterSuccess();
    } else {
      this.alertsvr.showAlert(4, response.message, response.comment);
    }
  }

  handleError(error: any) {
    this.alertsvr.showAlert(4, "Error", "An error occurred while processing your request.");
    console.error('Error:', error);
  }

  executeAfterSuccess() {
    this.close();

  }

  close(): void {
    this.loadData();
    this.route = null;
    this.closeModal.emit(true);
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  drop(event: CdkDragDrop<any[]>) {
  }

  get aspListControls() {
    return (this.form.get('aspList') as FormArray)?.controls || [];
  }
  async loadApplicationServers() {
    try {
      if(this.m3uaSettings==null){
        return;
      }
      const response = await this.m3uaService.getApplicationServersList(this.m3uaSettings.id);
      if (response.status === 200) {
        this.appservList = response.data;
      } else {
        this.alertsvr.showAlert(2, response.message, response.comment);
      }
    } catch (error) {
      console.error('Error loading sockets:', error);
      this.alertsvr.showAlert(3, 'Server error', 'An error occurred while loading sockets.');
    }
  }

  async loadTrafficMode() {
    let response = await this.catalogService.getByCatalogType('ss7TrafficMode');
    if (response.status == 200) {
      this.traficModeList = response.data;
    }
  }

  loadData() {
    this.loadDataForm(null);
    this.loadApplicationServers();
    this.loadTrafficMode();
    this.initializeForm();
  }

  addToAspList(): void {
    const selectedAspId = this.formTarget.value.asp;
    const selectedItem = this.appservList.find(item => item.id == selectedAspId);
    
    if (selectedItem) {
      const aspList = this.form.get('aspList') as FormArray;
      aspList.push(this.fb.group({
        id: selectedItem.id,
        name: selectedItem.name
      }));
      this.appservList = this.appservList.filter(item => item.id !== selectedItem.id);
      
      this.initializeTarget();

      if (this.appservList.length > 0) {
        this.formTarget.patchValue({
          asp: this.appservList[0].id
        });
      }
    }
  }

  removeFromAspList(index: number): void {
    const item = (this.form.get('aspList') as FormArray).at(index).value;
    this.appservList.push(item);
    (this.form.get('aspList') as FormArray).removeAt(index);
  }

  loadDataForm(data: any): void {
    if (!data) {
      this.title = 'Create Route';
      this.isEdit = false;
      if (this.appservList.length > 0) {
        this.formTarget.patchValue({
          asp: this.appservList[0].id
        });
      }
    }
    else{

      this.route = data;
      this.form.patchValue({
        destination_point_code: data.destination_point_code ?? '',
        origination_point_code: data.origination_point_code ?? '',
        service_indicator: data.service_indicator ?? '',
        traffic_mode: data.traffic_mode_id ?? '',
      });

      const aspListFormArray = this.form.get('aspList') as FormArray;
      aspListFormArray.clear();
      
      if (data.app_servers && Array.isArray(data.app_servers)) {
        data.app_servers.forEach((aspId: any) => {
          const aspDetails = this.appservList.find(item => item.id === aspId);
          if (aspDetails) {
            aspListFormArray.push(this.fb.group({
              id: aspDetails.id,
              name: aspDetails.name,
            }));
          }
        });
        this.appservList = this.appservList.filter(assoc => !data.app_servers.includes(assoc.id));
        if (this.appservList.length > 0) {
          this.formTarget.patchValue({
            asp: this.appservList[0].id
          });
        }
      }
    }

  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
