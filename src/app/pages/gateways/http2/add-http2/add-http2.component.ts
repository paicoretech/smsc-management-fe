import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { maxResponseGteRequestValidator, priorityRequiredValidator } from '@shared/message-validator';

const NO_SPACES_PATTERN = /^\S+$/;
const ERROR_CODES_PATTERN = /^(\d+(\s*,\s*\d+)*)?$/;
const URL_PATTERN = /^https?:\/\/\S+$/;
const SECRET_MIN_LENGTH = 8;
import { FormDirtyTracker } from '@app/core/forms/form-dirty-tracker';
import {
  AlertService,
  MnosService,
  ResponseI,
  Mno,
  Catalog,
  CatalogService,
  Http2GatewaysService,
  GatewayHttp2,
  Http2GatewayIncomingSecurity,
  Http2GatewayNrfSecurity,
  Http2GatewayOutboundSecurity,
  Http2GatewayUDMSecurity,
  OutboundTokenSource,
  GatewaySs7Service,
  GatewaySs7,
  ChargingSettingsService,
  ChargingSetting,
} from '@core/index';
import { ApiContext } from '@app/core/utils/types/api-context.type';
import { FormFieldOption, FormSectionConfig } from '@app/core/forms/form-section.model';
import { buildHttp2GatewayGeneralSection } from '../config/http2-general-section.config';
import { buildSmsHandlingSection } from '../config/sms-handling-section.config';
import { TIME_SECTION } from '../config/timer-section.config';
import { PERFORMANCE_SECTION } from '../config/performance-section.config';
import { RETRIES_SECTION } from '../config/retries-section.config';
import { buildIncomingSecuritySection } from '../config/incoming-security-section.config';
import { buildNrfSecuritySection } from '../config/nrf-security-section.config';
import { buildOutboundSecuritySection } from '../config/outbound-security-section.config';
import { buildUdmSecuritySection } from '../config/udm-security-section.config';

function normalizeHttp2GatewayForm(value: GatewayHttp2): GatewayHttp2 {
  const toNumber = (input: unknown, fallback = 0): number => {
    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const toNumberOrNull = (input: unknown): number | null => {
    if (input === '' || input === null || input === undefined) {
      return null;
    }
    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const toStringValue = (input: unknown): string => (input ?? '').toString().trim();

  const toStringOrNull = (input: unknown): string | null => {
    const parsed = toStringValue(input);
    return parsed.length ? parsed : null;
  };

  const normalizeIncomingSecurity = (raw?: Partial<Http2GatewayIncomingSecurity> | null): Http2GatewayIncomingSecurity => ({
    oauth2_enabled: !!raw?.oauth2_enabled,
    expected_issuer: toStringOrNull(raw?.expected_issuer),
    require_mtls: !!raw?.require_mtls,
    ca_certificate_path: toStringOrNull(raw?.ca_certificate_path),
    expected_amf_certificate_path: toStringOrNull(raw?.expected_amf_certificate_path),
    server_certificate_path: toStringOrNull(raw?.server_certificate_path),
    server_private_key_path: toStringOrNull(raw?.server_private_key_path),
  });

  const normalizeNrfSecurity = (raw?: Partial<Http2GatewayNrfSecurity> | null): Http2GatewayNrfSecurity => ({
    api_root: toStringOrNull(raw?.api_root),
    secret_path: toStringOrNull(raw?.secret_path),
    token_path: toStringOrNull(raw?.token_path),
    nrf_register_path: toStringOrNull(raw?.nrf_register_path),
    mtls_enabled: !!raw?.mtls_enabled,
    client_certificate_path: toStringOrNull(raw?.client_certificate_path),
    client_private_key_path: toStringOrNull(raw?.client_private_key_path),
    truststore_ca_path: toStringOrNull(raw?.truststore_ca_path),
  });

  const normalizeOutboundSecurity = (raw?: Partial<Http2GatewayOutboundSecurity> | null): Http2GatewayOutboundSecurity => {
    const oauth2Enabled = !!raw?.oauth2_enabled;
    const rawNrf = !!raw?.using_nrf;
    const rawExternal = !!raw?.using_external_endpoint;
    const derivedSource = rawExternal ? 'EXTERNAL' : (rawNrf ? 'NRF' : null);
    const tokenSource = raw?.token_source
      ?? derivedSource
      ?? (oauth2Enabled ? 'NRF' : null);

    return {
      oauth2_enabled: oauth2Enabled,
      using_nrf: tokenSource === 'NRF',
      using_external_endpoint: tokenSource === 'EXTERNAL',
      token_source: tokenSource,
      token_endpoint: toStringOrNull(raw?.token_endpoint),
      client_id: toStringOrNull(raw?.client_id),
      client_secret: toStringOrNull(raw?.client_secret),
      scope: toStringOrNull(raw?.scope),
      mtls_enabled: !!raw?.mtls_enabled,
      client_certificate_path: toStringOrNull(raw?.client_certificate_path),
      client_private_key_path: toStringOrNull(raw?.client_private_key_path),
      truststore_ca_path: toStringOrNull(raw?.truststore_ca_path),
    };
  };

  const normalizeUdmSecurity = (raw?: Partial<Http2GatewayUDMSecurity> | null): Http2GatewayUDMSecurity => ({
    forward_registration_enabled: !!raw?.forward_registration_enabled,
    nrf_discovery_enabled: !!raw?.nrf_discovery_enabled,
    api_root: toStringOrNull(raw?.api_root),
    registration_path: toStringOrNull(raw?.registration_path),
    deregistration_path: toStringOrNull(raw?.deregistration_path),
    subscriber_query_path: toStringOrNull(raw?.subscriber_query_path),
    mtls_enabled: !!raw?.mtls_enabled,
    client_certificate_path: toStringOrNull(raw?.client_certificate_path),
    client_private_key_path: toStringOrNull(raw?.client_private_key_path),
    truststore_ca_path: toStringOrNull(raw?.truststore_ca_path),
    oauth2_enabled: !!raw?.oauth2_enabled,
    authorization_header: toStringOrNull(raw?.authorization_header),
    ss7_network_id: toNumberOrNull(raw?.ss7_network_id),
    smsf_map_address: toStringOrNull(raw?.smsf_map_address),
    diameter_network_id: toNumberOrNull(raw?.diameter_network_id),
    smsf_diameter_address: toStringOrNull(raw?.smsf_diameter_address),
  });

  return {
    network_id: toNumberOrNull(value.network_id),
    name: toStringValue(value.name),
    external_id: toStringOrNull(value.external_id),
    status: toStringValue(value.status),
    protocol: toStringValue(value.protocol),
    host: toStringValue(value.host),
    mno_id: toNumberOrNull(value.mno_id),
    enabled: toNumber(value.enabled),
    multipart_parsing_enabled: !!value.multipart_parsing_enabled,
    binary_sms_enabled: !!value.binary_sms_enabled,
    max_message_size: toNumber(value.max_message_size),
    default_data_coding_id: toNumberOrNull(value.default_data_coding_id),
    request_timeout_ms: toNumber(value.request_timeout_ms),
    connection_timeout_ms: toNumber(value.connection_timeout_ms),
    idle_timeout_ms: toNumber(value.idle_timeout_ms),
    max_response_time_ms: toNumber(value.max_response_time_ms),
    thread_pool_size: toNumber(value.thread_pool_size),
    messages_per_second: toNumber(value.messages_per_second),
    messages_per_second_high: toNumber(value.messages_per_second_high),
    messages_per_second_medium: toNumber(value.messages_per_second_medium),
    messages_per_second_low: toNumber(value.messages_per_second_low),
    rate_limiting_enabled: !!value.rate_limiting_enabled,
    request_dlr: toNumber(value.request_dlr, 2),
    split_message: !!value.split_message,
    no_retry_error_code: toStringOrNull(value.no_retry_error_code),
    auto_retry_error_code: toStringOrNull(value.auto_retry_error_code),
    retry_alternate_destination_error_code: toStringOrNull(value.retry_alternate_destination_error_code),
    incoming_security: normalizeIncomingSecurity(value.incoming_security),
    nrf_security: normalizeNrfSecurity(value.nrf_security),
    outbound_security: normalizeOutboundSecurity(value.outbound_security),
    udm_security: normalizeUdmSecurity(value.udm_security),
  };
}

function buildDefaultIncomingSecurity(): Http2GatewayIncomingSecurity {
  return {
    oauth2_enabled: false,
    expected_issuer: null,
    require_mtls: false,
    ca_certificate_path: null,
    expected_amf_certificate_path: null,
    server_certificate_path: null,
    server_private_key_path: null,
  };
}

function buildDefaultNrfSecurity(): Http2GatewayNrfSecurity {
  return {
    api_root: null,
    secret_path: null,
    token_path: null,
    nrf_register_path: null,
    mtls_enabled: false,
    client_certificate_path: null,
    client_private_key_path: null,
    truststore_ca_path: null,
  };
}

function buildDefaultOutboundSecurity(): Http2GatewayOutboundSecurity {
  return {
    oauth2_enabled: false,
    using_nrf: false,
    using_external_endpoint: false,
    token_source: null,
    token_endpoint: null,
    client_id: null,
    client_secret: null,
    scope: null,
    mtls_enabled: false,
    client_certificate_path: null,
    client_private_key_path: null,
    truststore_ca_path: null,
  };
}

function buildDefaultUDMSecurity(): Http2GatewayUDMSecurity {
  return {
    forward_registration_enabled: false,
    nrf_discovery_enabled: false,
    api_root: null,
    registration_path: null,
    deregistration_path: null,
    subscriber_query_path: null,
    mtls_enabled: false,
    client_certificate_path: null,
    client_private_key_path: null,
    truststore_ca_path: null,
    oauth2_enabled: false,
    authorization_header: 'Authorization',
    ss7_network_id: null,
    smsf_map_address: null,
    diameter_network_id: null,
    smsf_diameter_address: null,
  };
}

@Component({
  selector: 'app-add-http2',
  templateUrl: './add-http2.component.html'
})
export class AddHttp2Component implements OnInit, OnDestroy {
  title = '';
  form!: FormGroup;
  response!: ResponseI;

  defaultValues = environment.GatewayHttp2;

  private get defaultDataCodingId(): number | null {
    const n = Number(this.defaultValues.default_data_coding);
    return Number.isFinite(n) ? n : null;
  }

  isEdit = false;
  isReadonly = false;
  network_id = 0;

  ctx: ApiContext = ApiContext.SMSC;

  disabled = false;
  isModified = false;

  mnoList: Mno[] = [];
  mnoOptions: FormFieldOption[] = [{ label: 'Select MNO', value: null }];
  encodingList: Catalog[] = [];
  encodingOptions: FormFieldOption[] = [];
  ss7List: GatewaySs7[] = [];
  ss7Options: FormFieldOption[] = [{ label: 'None', value: null }];
  diameterList: ChargingSetting[] = [];
  diameterOptions: FormFieldOption[] = [{ label: 'None', value: null }];

  generalSection!: FormSectionConfig;
  smsHandlingSection!: FormSectionConfig;
  timeoutSection = TIME_SECTION;
  performanceSection = PERFORMANCE_SECTION;
  retriesSection = RETRIES_SECTION;
  incomingSecuritySection!: FormSectionConfig;
  nrfSecuritySection!: FormSectionConfig;
  outboundSecuritySection!: FormSectionConfig;
  udmSecuritySection!: FormSectionConfig;

  private readonly dirtyTracker = new FormDirtyTracker<GatewayHttp2>(normalizeHttp2GatewayForm);
  private dirtySub?: Subscription;
  private routingSub = new Subscription();
  private routeParamsSub?: Subscription;

  readonly httpBasePath: string[] = ['/pages/gateways/http2'];

  constructor(
    private fb: FormBuilder,
    private http2Service: Http2GatewaysService,
    private mnoService: MnosService,
    private catalogService: CatalogService,
    private gatewaySs7Service: GatewaySs7Service,
    private chargingSettingsService: ChargingSettingsService,
    private alertSvr: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.ctx = (this.route.snapshot.data['apiContext'] as ApiContext) || ApiContext.SMSC;
    this.isReadonly = this.route.snapshot.queryParamMap.get('readonly') === '1';

    this.initializeForm();
    this.refreshGeneralSection();
    this.refreshSecuritySections();

    await Promise.all([
      this.loadMnos(),
      this.loadEncodings(),
      this.loadSs7Gateways(),
      this.loadDiameterGateways(),
    ]);

    this.bindMessagePriorityRules();
    this.bindSecuritySectionRules();
    this.bindIncomingSecurityRules();
    this.bindNrfSecurityRules();
    this.bindOutboundSecurityRules();
    this.bindUdmSecurityRules();

    this.dirtySub = this.dirtyTracker.isModified$.subscribe((value) => {
      this.isModified = value;
    });

    this.routeParamsSub = this.route.paramMap.subscribe(async (params) => {
      const idParam = params.get('httpGatewayId');

      if (idParam && !Number.isNaN(Number(idParam))) {
        await this.loadForEdit(Number(idParam));
      } else {
        await this.prepareForCreate();
        this.dirtyTracker.attach(this.form);
      }
    });
  }

  ngOnDestroy(): void {
    this.dirtySub?.unsubscribe();
    this.routeParamsSub?.unsubscribe();
    this.routingSub.unsubscribe();
    this.dirtyTracker.destroy();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      network_id: [{ value: 0, disabled: true }, [Validators.required]],
      host: ['', [Validators.required, Validators.pattern(NO_SPACES_PATTERN)]],
      name: ['', [Validators.required]],
      external_id: [null],

      status: [''],
      protocol: ['HTTP2'],
      mno_id: [null, [Validators.required, Validators.min(1)]],

      multipart_parsing_enabled: [true],
      binary_sms_enabled: [true],
      max_message_size: [1048576, [Validators.required, Validators.min(1)]],
      default_data_coding_id: [this.defaultDataCodingId, Validators.required],
      request_timeout_ms: [5000, [Validators.required, Validators.min(1)]],
      connection_timeout_ms: [3000, [Validators.required, Validators.min(1)]],
      idle_timeout_ms: [10000, [Validators.required, Validators.min(1)]],
      max_response_time_ms: [15000, [Validators.required, Validators.min(1)]],

      thread_pool_size: [8, [Validators.required, Validators.min(1)]],
      messages_per_second: [{ value: 100, disabled: true }],
      messages_per_second_high: [70, [Validators.required, Validators.min(0)]],
      messages_per_second_medium: [20, [Validators.required, Validators.min(0)]],
      messages_per_second_low: [10, [Validators.required, Validators.min(0)]],
      rate_limiting_enabled: [true],

      enabled: [0],

      request_dlr: [2, [Validators.required, Validators.min(0)]],
      split_message: [false],
      no_retry_error_code: [null, [Validators.pattern(ERROR_CODES_PATTERN)]],
      auto_retry_error_code: ['', [Validators.pattern(ERROR_CODES_PATTERN)]],
      retry_alternate_destination_error_code: [null, [Validators.pattern(ERROR_CODES_PATTERN)]],

      incoming_security: this.fb.group({
        oauth2_enabled: [false],
        expected_issuer: [null],
        require_mtls: [false],
        ca_certificate_path: [null],
        expected_amf_certificate_path: [null],
        server_certificate_path: [null],
        server_private_key_path: [null],
      }),

      nrf_security: this.fb.group({
        api_root: [null],
        secret_path: [null],
        token_path: [null],
        nrf_register_path: [null],
        mtls_enabled: [false],
        client_certificate_path: [null],
        client_private_key_path: [null],
        truststore_ca_path: [null],
      }),

      outbound_security: this.fb.group({
        oauth2_enabled: [false],
        using_nrf: [false],
        using_external_endpoint: [false],
        token_source: [null],
        token_endpoint: [null],
        client_id: [null],
        client_secret: [null],
        scope: [null],
        mtls_enabled: [false],
        client_certificate_path: [null],
        client_private_key_path: [null],
        truststore_ca_path: [null],
      }),

      udm_security: this.fb.group({
        forward_registration_enabled: [false],
        nrf_discovery_enabled: [false],
        api_root: [null],
        registration_path: [null],
        deregistration_path: [null],
        subscriber_query_path: [null],
        mtls_enabled: [false],
        client_certificate_path: [null],
        client_private_key_path: [null],
        truststore_ca_path: [null],
        oauth2_enabled: [false],
        authorization_header: ['Authorization'],
        ss7_network_id: [null],
        smsf_map_address: [null],
        diameter_network_id: [null],
        smsf_diameter_address: [null],
      }),
    }, {
      validators: [
        priorityRequiredValidator(
          'messages_per_second_high',
          'messages_per_second_medium',
          'messages_per_second_low',
        ),
        maxResponseGteRequestValidator('max_response_time_ms', 'request_timeout_ms'),
      ],
    });
  }

  private createDefaultFormValue(patch?: Partial<GatewayHttp2>): GatewayHttp2 {
    const dv = this.defaultValues;

    const high = Number(patch?.messages_per_second_high ?? dv.messages_per_second_high ?? 70);
    const medium = Number(patch?.messages_per_second_medium ?? dv.messages_per_second_medium ?? 20);
    const low = Number(patch?.messages_per_second_low ?? dv.messages_per_second_low ?? 10);

    const value: GatewayHttp2 = {
      network_id: patch?.network_id ?? 0,
      name: patch?.name ?? '',
      external_id: patch?.external_id ?? null,
      status: patch?.status ?? '',
      protocol: patch?.protocol ?? 'HTTP2',
      host: patch?.host ?? '',
      mno_id: patch?.mno_id ?? null,
      enabled: patch?.enabled ?? 0,
      multipart_parsing_enabled: patch?.multipart_parsing_enabled ?? true,
      binary_sms_enabled: patch?.binary_sms_enabled ?? true,
      max_message_size: patch?.max_message_size ?? dv.max_message_size ?? 1048576,
      default_data_coding_id: patch?.default_data_coding_id ?? this.defaultDataCodingId,
      request_timeout_ms: patch?.request_timeout_ms ?? dv.request_timeout_ms ?? 5000,
      connection_timeout_ms: patch?.connection_timeout_ms ?? dv.connection_timeout_ms ?? 3000,
      idle_timeout_ms: patch?.idle_timeout_ms ?? dv.idle_timeout_ms ?? 10000,
      max_response_time_ms: patch?.max_response_time_ms ?? dv.max_response_time_ms ?? 15000,
      thread_pool_size: patch?.thread_pool_size ?? dv.thread_pool_size ?? 8,
      messages_per_second: patch?.messages_per_second ?? (high + medium + low),
      messages_per_second_high: high,
      messages_per_second_medium: medium,
      messages_per_second_low: low,
      rate_limiting_enabled: patch?.rate_limiting_enabled ?? dv.rate_limiting_enabled ?? true,
      request_dlr: patch?.request_dlr ?? 2,
      split_message: patch?.split_message ?? false,
      no_retry_error_code: patch?.no_retry_error_code ?? null,
      auto_retry_error_code: patch?.auto_retry_error_code ?? '',
      retry_alternate_destination_error_code: patch?.retry_alternate_destination_error_code ?? null,
      incoming_security: { ...buildDefaultIncomingSecurity(), ...(patch?.incoming_security ?? {}) },
      nrf_security: { ...buildDefaultNrfSecurity(), ...(patch?.nrf_security ?? {}) },
      outbound_security: { ...buildDefaultOutboundSecurity(), ...(patch?.outbound_security ?? {}) },
      udm_security: { ...buildDefaultUDMSecurity(), ...(patch?.udm_security ?? {}) },
    };

    return normalizeHttp2GatewayForm(value);
  }

  private refreshGeneralSection(): void {
    this.generalSection = buildHttp2GatewayGeneralSection(this.isEdit, this.mnoOptions);
    this.smsHandlingSection = buildSmsHandlingSection(this.isEdit, this.encodingOptions);
  }

  private refreshSecuritySections(override?: { oauth2_enabled?: boolean; token_source?: OutboundTokenSource | null }): void {
    const oauth2Enabled = override?.oauth2_enabled
      ?? !!this.form?.get('outbound_security.oauth2_enabled')?.value;
    const tokenSource = override?.token_source !== undefined
      ? override.token_source
      : ((this.form?.get('outbound_security.token_source')?.value ?? null) as OutboundTokenSource | null);

    this.incomingSecuritySection = buildIncomingSecuritySection();
    this.nrfSecuritySection = buildNrfSecuritySection();
    this.outboundSecuritySection = buildOutboundSecuritySection({
      oauth2_enabled: oauth2Enabled,
      token_source: tokenSource,
    });
    this.udmSecuritySection = buildUdmSecuritySection(this.ss7Options, this.diameterOptions);
  }

  private bindSecuritySectionRules(): void {
    const oauth2 = this.form.get('outbound_security.oauth2_enabled');
    const tokenSource = this.form.get('outbound_security.token_source');
    if (!oauth2 || !tokenSource) return;

    this.routingSub.add(oauth2.valueChanges.subscribe((value: boolean) => {
      this.refreshSecuritySections({ oauth2_enabled: !!value });
    }));
    this.routingSub.add(tokenSource.valueChanges.subscribe((value: OutboundTokenSource | null) => {
      this.refreshSecuritySections({ token_source: value ?? null });
    }));
  }

  private applySecurityValidators(controlPath: string, required: boolean, extraValidators: ValidatorFn[] = []): void {
    const control = this.form.get(controlPath);
    if (!control) return;
    const validators = required ? [Validators.required, ...extraValidators] : extraValidators;
    control.setValidators(validators.length > 0 ? validators : null);
    control.updateValueAndValidity({ emitEvent: false });
  }

  private resetTouchedState(controlPaths: string[]): void {
    controlPaths.forEach((path) => {
      this.form.get(path)?.markAsUntouched({ onlySelf: true });
    });
  }

  private bindIncomingSecurityRules(): void {
    const oauth2 = this.form.get('incoming_security.oauth2_enabled');
    const requireMtls = this.form.get('incoming_security.require_mtls');
    if (!oauth2 || !requireMtls) return;

    const oauth2Paths = ['incoming_security.expected_issuer'];
    const mtlsPaths = [
      'incoming_security.ca_certificate_path',
      'incoming_security.expected_amf_certificate_path',
      'incoming_security.server_certificate_path',
      'incoming_security.server_private_key_path',
    ];

    const apply = (): void => {
      const oauth2On = !!oauth2.value;
      const mtlsOn = !!requireMtls.value;

      this.applySecurityValidators('incoming_security.expected_issuer', oauth2On, [Validators.pattern(URL_PATTERN)]);
      this.applySecurityValidators('incoming_security.ca_certificate_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('incoming_security.expected_amf_certificate_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('incoming_security.server_certificate_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('incoming_security.server_private_key_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
    };

    apply();
    this.routingSub.add(oauth2.valueChanges.subscribe(() => {
      apply();
      this.resetTouchedState(oauth2Paths);
    }));
    this.routingSub.add(requireMtls.valueChanges.subscribe(() => {
      apply();
      this.resetTouchedState(mtlsPaths);
    }));
  }

  private bindNrfSecurityRules(): void {
    const mtls = this.form.get('nrf_security.mtls_enabled');
    if (!mtls) return;

    const mtlsPaths = ['nrf_security.client_certificate_path', 'nrf_security.client_private_key_path', 'nrf_security.truststore_ca_path'];

    const apply = (): void => {
      const mtlsOn = !!mtls.value;

      this.applySecurityValidators('nrf_security.api_root', false, [Validators.pattern(URL_PATTERN)]);
      this.applySecurityValidators('nrf_security.secret_path', false, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('nrf_security.token_path', false, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('nrf_security.nrf_register_path', false, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('nrf_security.client_certificate_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('nrf_security.client_private_key_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('nrf_security.truststore_ca_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
    };

    apply();
    this.routingSub.add(mtls.valueChanges.subscribe(() => {
      apply();
      this.resetTouchedState(mtlsPaths);
    }));
  }

  private bindOutboundSecurityRules(): void {
    const oauth2 = this.form.get('outbound_security.oauth2_enabled');
    const usingNrf = this.form.get('outbound_security.using_nrf');
    const usingExternal = this.form.get('outbound_security.using_external_endpoint');
    const tokenSource = this.form.get('outbound_security.token_source');
    const mtls = this.form.get('outbound_security.mtls_enabled');
    if (!oauth2 || !usingNrf || !usingExternal || !tokenSource || !mtls) return;

    const externalFieldPaths = [
      'outbound_security.token_endpoint',
      'outbound_security.client_id',
      'outbound_security.client_secret',
      'outbound_security.scope',
    ];
    const mtlsPaths = [
      'outbound_security.client_certificate_path',
      'outbound_security.client_private_key_path',
      'outbound_security.truststore_ca_path',
    ];

    const syncBooleansFromTokenSource = (value: OutboundTokenSource | null): void => {
      const nextNrf = value === 'NRF';
      const nextExternal = value === 'EXTERNAL';
      if (usingNrf.value !== nextNrf) usingNrf.setValue(nextNrf, { emitEvent: false });
      if (usingExternal.value !== nextExternal) usingExternal.setValue(nextExternal, { emitEvent: false });
    };

    const clearExternalEndpointFields = (): void => {
      externalFieldPaths.forEach((path) => {
        const ctrl = this.form.get(path);
        if (ctrl && ctrl.value !== null && ctrl.value !== '') {
          ctrl.setValue(null, { emitEvent: false });
        }
      });
    };

    const apply = (): void => {
      const oauth2On = !!oauth2.value;
      let currentSource = (tokenSource.value ?? null) as OutboundTokenSource | null;

      if (!oauth2On) {
        if (currentSource !== null) tokenSource.setValue(null, { emitEvent: false });
        currentSource = null;
      } else if (currentSource === null) {
        currentSource = 'NRF';
        tokenSource.setValue('NRF', { emitEvent: false });
      }
      syncBooleansFromTokenSource(currentSource);

      const externalOn = oauth2On && currentSource === 'EXTERNAL';
      const mtlsOn = !!mtls.value;

      if (!externalOn) {
        clearExternalEndpointFields();
      }

      this.applySecurityValidators('outbound_security.token_endpoint', externalOn, [Validators.pattern(URL_PATTERN)]);
      this.applySecurityValidators('outbound_security.client_id', externalOn);
      this.applySecurityValidators('outbound_security.client_secret', externalOn, [Validators.minLength(SECRET_MIN_LENGTH)]);
      this.applySecurityValidators('outbound_security.scope', false);

      this.applySecurityValidators('outbound_security.client_certificate_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('outbound_security.client_private_key_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
      this.applySecurityValidators('outbound_security.truststore_ca_path', mtlsOn, [Validators.pattern(NO_SPACES_PATTERN)]);
    };

    apply();
    this.routingSub.add(oauth2.valueChanges.subscribe(() => {
      apply();
      this.resetTouchedState(externalFieldPaths);
    }));
    this.routingSub.add(tokenSource.valueChanges.subscribe(() => {
      apply();
      this.resetTouchedState(externalFieldPaths);
    }));
    this.routingSub.add(mtls.valueChanges.subscribe(() => {
      apply();
      this.resetTouchedState(mtlsPaths);
    }));
  }

  private async loadMnos(): Promise<void> {
    const resp = await this.mnoService.getMnos();

    if (resp.status === 200) {
      this.mnoList = resp.data ?? [];
      this.mnoOptions = [
        { label: 'Select MNO', value: null },
        ...this.mnoList.map((item) => ({
          label: item.name,
          value: item.id,
        })),
      ];
    } else {
      this.mnoList = [];
      this.mnoOptions = [{ label: 'Select MNO', value: null }];
    }

    this.refreshGeneralSection();
  }

  private async loadEncodings(): Promise<void> {
    const resp = await this.catalogService.getByCatalogType('encodingType');

    if (resp.status === 200) {
      this.encodingList = resp.data ?? [];
      this.encodingOptions = this.toEncodingOptions(this.encodingList);
    } else {
      this.encodingList = [];
      this.encodingOptions = [];
    }

    this.refreshGeneralSection();
  }

  private toEncodingOptions(catalogs: Catalog[]): FormFieldOption[] {
    return catalogs
      .filter((item): item is Catalog & { id: number; name: string } =>
        item.id != null && !!item.name?.trim()
      )
      .map((item) => ({
        label: item.name,
        value: item.id,
      }));
  }

  private async loadSs7Gateways(): Promise<void> {
    const resp = await this.gatewaySs7Service.getGatewaySs7(this.ctx);

    if (resp.status === 200) {
      this.ss7List = resp.data ?? [];
      this.ss7Options = [
        { label: 'None', value: null },
        ...this.ss7List
          .filter((item) => item.network_id != null)
          .map((item) => ({
            label: item.name,
            value: item.network_id,
          })),
      ];
    } else {
      this.ss7List = [];
      this.ss7Options = [{ label: 'None', value: null }];
    }

    this.refreshSecuritySections();
  }

  private async loadDiameterGateways(): Promise<void> {
    const resp = await this.chargingSettingsService.getAllDiameterGateways(this.ctx);

    if (resp.status === 200) {
      this.diameterList = resp.data ?? [];
      this.diameterOptions = [
        { label: 'None', value: null },
        ...this.diameterList
          .filter((item) => item.network_id != null)
          .map((item) => ({
            label: item.name,
            value: item.network_id,
          })),
      ];
    } else {
      this.diameterList = [];
      this.diameterOptions = [{ label: 'None', value: null }];
    }

    this.refreshSecuritySections();
  }

  private resetForm(patch?: Partial<GatewayHttp2>): void {
    this.dirtyTracker.pause();

    const value = this.createDefaultFormValue(patch);
    this.form.reset(value, { emitEvent: false });

    this.dirtyTracker.resume();
  }

  private async prepareForCreate(): Promise<void> {
    this.title = 'Create HTTP/2 Gateway';
    this.isEdit = false;
    this.network_id = 0;
    this.disabled = false;

    this.refreshGeneralSection();

    this.resetForm({
      network_id: 0,
      mno_id: null,
    });

    this.form.get('network_id')?.disable({ emitEvent: false });
    this.recalculateTotalTps();
    this.refreshSecuritySections();
    this.applyUdmFieldStates();
  }

  private async loadForEdit(id: number): Promise<void> {
    this.title = 'Edit HTTP/2 Gateway';
    this.isEdit = true;
    this.network_id = id;

    this.refreshGeneralSection();

    const resp = await this.http2Service.getHttp2GatewaysById(id);

    if (resp.status !== 200) {
      this.alertSvr.showAlert(2, 'Error', 'Invalid HTTP/2 gateway');
      this.router.navigate(this.httpBasePath);
      return;
    }

    const data: GatewayHttp2 = resp.data?.http2Gateway ?? resp.data;

    this.dirtyTracker.pause();

    this.resetForm({
      network_id: data.network_id ?? id,
      name: data.name ?? '',
      external_id: data.external_id ?? null,
      status: data.status ?? '',
      protocol: data.protocol ?? 'HTTP2',
      host: data.host ?? '',
      mno_id: data.mno_id ?? null,
      enabled: data.enabled ?? 0,
      multipart_parsing_enabled: data.multipart_parsing_enabled ?? true,
      binary_sms_enabled: data.binary_sms_enabled ?? true,
      max_message_size: data.max_message_size ?? 1048576,
      default_data_coding_id: data.default_data_coding_id ?? this.defaultDataCodingId,
      request_timeout_ms: data.request_timeout_ms ?? 5000,
      connection_timeout_ms: data.connection_timeout_ms ?? 3000,
      idle_timeout_ms: data.idle_timeout_ms ?? 10000,
      max_response_time_ms: data.max_response_time_ms ?? 15000,
      thread_pool_size: data.thread_pool_size ?? 8,
      messages_per_second:
        data.messages_per_second
        ?? ((data.messages_per_second_high ?? 0) + (data.messages_per_second_medium ?? 0) + (data.messages_per_second_low ?? 0)),
      messages_per_second_high: data.messages_per_second_high ?? 0,
      messages_per_second_medium: data.messages_per_second_medium ?? 0,
      messages_per_second_low: data.messages_per_second_low ?? 0,
      rate_limiting_enabled: data.rate_limiting_enabled ?? true,
      request_dlr: data.request_dlr ?? 2,
      split_message: data.split_message ?? false,
      no_retry_error_code: data.no_retry_error_code ?? null,
      auto_retry_error_code: data.auto_retry_error_code ?? '',
      retry_alternate_destination_error_code: data.retry_alternate_destination_error_code ?? null,
      incoming_security: { ...buildDefaultIncomingSecurity(), ...(data.incoming_security ?? {}) },
      nrf_security: { ...buildDefaultNrfSecurity(), ...(data.nrf_security ?? {}) },
      outbound_security: { ...buildDefaultOutboundSecurity(), ...(data.outbound_security ?? {}) },
      udm_security: { ...buildDefaultUDMSecurity(), ...(data.udm_security ?? {}) },
    });

    this.form.get('network_id')?.disable({ emitEvent: false });
    this.recalculateTotalTps();
    this.refreshSecuritySections();

    if (this.isReadonly || data.enabled === 1) {
      this.disabled = true;
      this.form.disable({ emitEvent: false });
    } else {
      this.disabled = false;
      this.form.enable({ emitEvent: false });
      this.form.get('network_id')?.disable({ emitEvent: false });
      this.form.get('messages_per_second')?.disable({ emitEvent: false });
      this.applyUdmFieldStates();
    }

    this.dirtyTracker.resume();
    this.dirtyTracker.attach(this.form);
  }

  private bindUdmSecurityRules(): void {
    const forward = this.form.get('udm_security.forward_registration_enabled');
    const nrfDiscovery = this.form.get('udm_security.nrf_discovery_enabled');
    const oauth2 = this.form.get('udm_security.oauth2_enabled');
    const mtls = this.form.get('udm_security.mtls_enabled');
    if (!forward || !nrfDiscovery || !oauth2 || !mtls) return;

    const apiPaths = [
      'udm_security.api_root',
      'udm_security.registration_path',
      'udm_security.deregistration_path',
      'udm_security.subscriber_query_path',
    ];
    const mtlsPaths = [
      'udm_security.client_certificate_path',
      'udm_security.client_private_key_path',
      'udm_security.truststore_ca_path',
    ];

    const apply = () => {
      const forwardOn = !!forward.value;
      const apiRequired = forwardOn && !nrfDiscovery.value;
      const mtlsRequired = forwardOn && !!mtls.value;

      apiPaths.forEach((path) => this.applySecurityValidators(path, apiRequired, [Validators.pattern(NO_SPACES_PATTERN)]));
      mtlsPaths.forEach((path) => this.applySecurityValidators(path, mtlsRequired, [Validators.pattern(NO_SPACES_PATTERN)]));
      this.applyUdmFieldStates();
    };

    apply();
    this.routingSub.add(forward.valueChanges.subscribe(() => { apply(); this.resetTouchedState([...apiPaths, ...mtlsPaths]); }));
    this.routingSub.add(nrfDiscovery.valueChanges.subscribe(() => { apply(); this.resetTouchedState(apiPaths); }));
    this.routingSub.add(oauth2.valueChanges.subscribe(() => this.applyUdmFieldStates()));
    this.routingSub.add(mtls.valueChanges.subscribe(() => { apply(); this.resetTouchedState(mtlsPaths); }));
  }

  private applyUdmFieldStates(): void {
    if (this.disabled) return;

    const setEnabled = (path: string, enabled: boolean): void => {
      const control = this.form.get(path);
      if (!control) return;
      if (enabled) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    };

    const nrfDiscoveryOn = !!this.form.get('udm_security.nrf_discovery_enabled')?.value;
    const oauth2On = !!this.form.get('udm_security.oauth2_enabled')?.value;
    const mtlsOn = !!this.form.get('udm_security.mtls_enabled')?.value;

    setEnabled('udm_security.api_root', !nrfDiscoveryOn);
    setEnabled('udm_security.authorization_header', oauth2On);
    ['udm_security.client_certificate_path', 'udm_security.client_private_key_path', 'udm_security.truststore_ca_path']
      .forEach((path) => setEnabled(path, mtlsOn));
  }

  private bindMessagePriorityRules(): void {
    ['messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low'].forEach((field) => {
      const control = this.form.get(field);
      if (!control) return;

      this.routingSub.add(control.valueChanges.subscribe(() => this.recalculateTotalTps()));
    });

    this.recalculateTotalTps();
  }

  private recalculateTotalTps(): void {
    const high = Number(this.form.get('messages_per_second_high')?.value ?? 0);
    const medium = Number(this.form.get('messages_per_second_medium')?.value ?? 0);
    const low = Number(this.form.get('messages_per_second_low')?.value ?? 0);
    this.form.get('messages_per_second')?.setValue(high + medium + low, { emitEvent: false });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    let resp: ResponseI;

    if (this.isEdit) {
      resp = await this.http2Service.updateHttp2Gateway(this.network_id, payload);
    } else {
      const { network_id, ...createPayload } = payload;
      resp = await this.http2Service.createHttp2Gateway(createPayload);
    }

    if (resp.status === 200 || resp.status === 201) {
      this.alertSvr.showAlert(1, resp.message, resp.comment);
      this.dirtyTracker.captureSnapshot(this.form);
      this.router.navigate(this.httpBasePath);
    } else {
      this.alertSvr.showAlert(2, resp.message, resp.comment);
    }
  }

  private buildPayload(): GatewayHttp2 {
    const rawValue = this.form.getRawValue() as GatewayHttp2;
    const payload = normalizeHttp2GatewayForm(rawValue);
    delete (payload.outbound_security as { token_source?: unknown }).token_source;
    return payload;
  }

  close(): void {
    this.router.navigate(this.httpBasePath);
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validMinLength(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['minlength'];
  }

  validMaxLength(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['maxlength'];
  }

  validMin(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['min'];
  }

  validMax(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['max'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  getMinLength(name: string) {
    return this.form.get(name)?.errors?.['minlength']?.requiredLength;
  }

  getMaxLength(name: string) {
    return this.form.get(name)?.errors?.['maxlength']?.requiredLength;
  }

  getMin(name: string) {
    return this.form.get(name)?.errors?.['min']?.min;
  }

  getMax(name: string) {
    return this.form.get(name)?.errors?.['max']?.max;
  }

  getValueForm(name: string) {
    return this.form.get(name)?.value;
  }
}
