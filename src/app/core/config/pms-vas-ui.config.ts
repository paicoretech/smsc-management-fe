import { PmsVasUiConfig, PmsVasUiFeature } from '@paicore/pms-vas-ui';

import { AuthService } from '@core/services/auth.service';
import { environment } from '@env/environment';

const WRITE_ROLES = ['ROOT', 'ADMINISTRATOR'];

export function pmsVasUiConfigFactory(authService: AuthService): PmsVasUiConfig {
  return {
    apiBaseUrl: environment.pmsVas.apiBaseUrl,
    internalMessagingApiKey: environment.pmsVas.internalMessagingApiKey,
    canAccess: (_feature: PmsVasUiFeature) => {
      const roles = new Set(authService.getRolesSync());
      return WRITE_ROLES.some((role) => roles.has(role));
    },
  };
}
