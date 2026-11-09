export const RETRY_API_PATHS = {
  generalConfiguration: 'general-settings/smsc-retry',
  updateGeneralConfiguration: 'general-settings/smsc-retry/update',
  profiles: 'retry-profiles',
  createProfile: 'retry-profiles/create',
  profileById: (profileId: number) => `retry-profiles/${ profileId }`,
  updateProfile: (profileId: number) => `retry-profiles/update/${ profileId }`,
  deleteProfile: (profileId: number) => `retry-profiles/delete/${ profileId }`,
  mappingsByProfile: (profileId: number) => `retry-mappings/profile/${ profileId }`,
  createMapping: 'retry-mappings/create',
  updateMapping: (mappingId: number) => `retry-mappings/update/${ mappingId }`,
  deleteMapping: (mappingId: number) => `retry-mappings/delete/${ mappingId }`,
};