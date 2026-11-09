import { FormSectionConfig } from "@app/core/forms/form-section.model";

export function buildNrfSecuritySection(): FormSectionConfig {
    return {
        title: '',
        topMargin: false,
        columns: [
            [
                {
                    type: 'text',
                    controlName: 'nrf_security.api_root',
                    label: 'Api Root',
                },
                {
                    type: 'text',
                    controlName: 'nrf_security.secret_path',
                    label: 'Secret Path',
                },
                {
                    type: 'text',
                    controlName: 'nrf_security.token_path',
                    label: 'Token Path',
                },
                {
                    type: 'text',
                    controlName: 'nrf_security.nrf_register_path',
                    label: 'NF Register Path',
                },
            ],
            [
                {
                    type: 'checkbox',
                    controlName: 'nrf_security.mtls_enabled',
                    label: 'mTLS Enabled',
                    labelCol: 'col-sm-4',
                    inputCol: 'col-sm-8',
                },
                {
                    type: 'text',
                    controlName: 'nrf_security.client_certificate_path',
                    label: 'Client Certificate Path',
                },
                {
                    type: 'text',
                    controlName: 'nrf_security.client_private_key_path',
                    label: 'Client Private Key Path',
                },
                {
                    type: 'text',
                    controlName: 'nrf_security.truststore_ca_path',
                    label: 'Truststore CA Path',
                },
            ],
        ],
    };
}
