import { ApiContext } from '@app/core/utils/types/api-context.type';

export function isIpSmGw(ctx: ApiContext): boolean {
  return ctx === ApiContext.IP_SM_GW;
}

export function isSmsc(ctx: ApiContext): boolean {
  return ctx === ApiContext.SMSC;
}
