import { FormSectionConfig } from "@app/core/forms/form-section.model";

export function buildIncomingSecuritySection(): FormSectionConfig {
    return {
        title: '',
        topMargin: false,
        columns: [
            [
                {
                    type: 'checkbox',
                    controlName: 'incoming_security.oauth2_enabled',
                    label: 'OAuth2 Enabled',
                    labelCol: 'col-sm-4',
                    inputCol: 'col-sm-8',
                },
                {
                    type: 'text',
                    controlName: 'incoming_security.expected_issuer',
                    label: 'Expected Issuer',
                },
            ],
            [
                {
                    type: 'checkbox',
                    controlName: 'incoming_security.require_mtls',
                    label: 'Require mTLS',
                    labelCol: 'col-sm-4',
                    inputCol: 'col-sm-8',
                },
                {
                    type: 'text',
                    controlName: 'incoming_security.ca_certificate_path',
                    label: 'CA Certificate Path',
                },
                {
                    type: 'text',
                    controlName: 'incoming_security.expected_amf_certificate_path',
                    label: 'Expected AMF Cert Path',
                },
                {
                    type: 'text',
                    controlName: 'incoming_security.server_certificate_path',
                    label: 'Server Certificate Path',
                },
                {
                    type: 'text',
                    controlName: 'incoming_security.server_private_key_path',
                    label: 'Server Private Key Path',
                },
            ],
        ],
    };
}
