import { FormFieldOption, FormSectionConfig } from "@app/core/forms/form-section.model";

export function buildUdmSecuritySection(
    ss7Options: FormFieldOption[],
    diameterOptions: FormFieldOption[],
): FormSectionConfig {
    return {
        title: '',
        topMargin: false,
        columns: [
            [
                {
                    type: 'checkbox',
                    controlName: 'udm_security.forward_registration_enabled',
                    label: 'Forward Registration Enabled',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'checkbox',
                    controlName: 'udm_security.nrf_discovery_enabled',
                    label: 'NRF Discovery Enabled',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'text',
                    controlName: 'udm_security.api_root',
                    label: 'UDM Base URL (Api Root)',
                },
                {
                    type: 'text',
                    controlName: 'udm_security.registration_path',
                    label: 'Registration Path',
                },
                {
                    type: 'text',
                    controlName: 'udm_security.deregistration_path',
                    label: 'Deregistration Path',
                },
                {
                    type: 'text',
                    controlName: 'udm_security.subscriber_query_path',
                    label: 'Subscriber Query Path',
                },
                {
                    type: 'select',
                    controlName: 'udm_security.ss7_network_id',
                    label: 'SS7 Gateway (MAP)',
                    options: ss7Options,
                },
                {
                    type: 'select',
                    controlName: 'udm_security.diameter_network_id',
                    label: 'Diameter Gateway',
                    options: diameterOptions,
                },
            ],
            [
                {
                    type: 'checkbox',
                    controlName: 'udm_security.oauth2_enabled',
                    label: 'OAuth2 Enabled',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'text',
                    controlName: 'udm_security.authorization_header',
                    label: 'Authorization Header',
                },
                {
                    type: 'checkbox',
                    controlName: 'udm_security.mtls_enabled',
                    label: 'mTLS Enabled',
                    labelCol: 'col-sm-5',
                    inputCol: 'col-sm-7',
                },
                {
                    type: 'text',
                    controlName: 'udm_security.client_certificate_path',
                    label: 'Client Certificate Path',
                },
                {
                    type: 'text',
                    controlName: 'udm_security.client_private_key_path',
                    label: 'Client Private Key Path',
                },
                {
                    type: 'text',
                    controlName: 'udm_security.truststore_ca_path',
                    label: 'Truststore CA Path',
                },
            ],
        ],
    };
}
