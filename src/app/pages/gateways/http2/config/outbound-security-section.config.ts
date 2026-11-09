import { FormFieldConfig, FormSectionConfig } from "@app/core/forms/form-section.model";
import { OutboundTokenSource } from "@core/index";

const EXTERNAL_ENDPOINT_FIELDS: FormFieldConfig[] = [
    { type: 'text', controlName: 'outbound_security.token_endpoint', label: 'Token Endpoint' },
    { type: 'text', controlName: 'outbound_security.client_id', label: 'Client ID' },
    { type: 'password', controlName: 'outbound_security.client_secret', label: 'Client Secret' },
    { type: 'text', controlName: 'outbound_security.scope', label: 'Scope' },
];

const MTLS_DETAIL_FIELDS: FormFieldConfig[] = [
    { type: 'text', controlName: 'outbound_security.client_certificate_path', label: 'Client Certificate Path' },
    { type: 'text', controlName: 'outbound_security.client_private_key_path', label: 'Client Private Key Path' },
    { type: 'text', controlName: 'outbound_security.truststore_ca_path', label: 'Truststore CA Path' },
];

export interface OutboundSecuritySectionState {
    oauth2_enabled: boolean;
    token_source: OutboundTokenSource | null;
}

export function buildOutboundSecuritySection(state: OutboundSecuritySectionState): FormSectionConfig {
    const oauth2Fields: FormFieldConfig[] = [];

    if (state.oauth2_enabled) {
        oauth2Fields.push({
            type: 'radio',
            controlName: 'outbound_security.token_source',
            label: 'Token Source',
            labelCol: 'col-sm-4',
            inputCol: 'col-sm-8',
            options: [
                { label: 'Using NRFs JWT', value: 'NRF' },
                { label: 'Using External Endpoint', value: 'EXTERNAL' },
            ],
        });

        if (state.token_source === 'EXTERNAL') {
            oauth2Fields.push(...EXTERNAL_ENDPOINT_FIELDS);
        }
    }

    return {
        title: '',
        topMargin: false,
        columns: [
            [
                {
                    type: 'checkbox',
                    controlName: 'outbound_security.oauth2_enabled',
                    label: 'OAuth2 Enabled',
                    labelCol: 'col-sm-4',
                    inputCol: 'col-sm-8',
                },
                ...oauth2Fields,
            ],
            [
                {
                    type: 'checkbox',
                    controlName: 'outbound_security.mtls_enabled',
                    label: 'mTLS Enabled',
                    labelCol: 'col-sm-4',
                    inputCol: 'col-sm-8',
                },
                ...MTLS_DETAIL_FIELDS,
            ],
        ],
    };
}
