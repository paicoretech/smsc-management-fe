import { SmscSetting } from "@app/core/interfaces/Setting";

export function convertToSmscSetting(data: any[]): SmscSetting {
    const smscSetting: SmscSetting = {
      max_password_length: 0,
      max_system_id_length: 0,
      use_local_charging: false,
      use_analyze: false,
      use_dnd_filtering: false,
    };
  
    data.forEach((item) => {
      switch (item.key) {
        case 'USE_LOCAL_CHARGING':
          smscSetting.use_local_charging = item.value === 'true';
          break;
        case 'USE_ANALYZE':
          smscSetting.use_analyze = item.value === 'true';
          break;
        case 'USE_DND_FILTERING':
          smscSetting.use_dnd_filtering = item.value === 'true';
          break;
        case 'SMSC_ACCOUNT_SETTINGS':
          const accountSettings = JSON.parse(item.value);
          smscSetting.max_password_length = accountSettings.max_password_length;
          smscSetting.max_system_id_length = accountSettings.max_system_id_length;
          break;
      }
    });
  
    return smscSetting;
}

export function convertToApiFormat(smscSetting: SmscSetting): any[] {
    const apiData = [
      {
        key: 'USE_LOCAL_CHARGING',
        value: smscSetting.use_local_charging.toString(),
        data_type: 'boolean'
      },
      {
        key: 'USE_ANALYZE',
        value: smscSetting.use_analyze.toString(),
        data_type: 'boolean'
      },
      {
        key: 'USE_DND_FILTERING',
        value: smscSetting.use_dnd_filtering.toString(),
        data_type: 'boolean'
      },
      {
        key: 'SMSC_ACCOUNT_SETTINGS',
        value: JSON.stringify({
          max_password_length: smscSetting.max_password_length,
          max_system_id_length: smscSetting.max_system_id_length
        }),
        data_type: 'json'
      }
    ];
  
    return apiData;
}
  