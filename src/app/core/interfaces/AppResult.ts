export class AppResult {

  static OK_CODE = 0;
  static INFO_CODE = 10;
  static WARNING_CODE = 30;
  static ERROR_CODE = 50;

  code: number;
  message: string;
  data?: any;

  constructor(code: number, message: string, data?: any) {
    this.code = code;
    this.message = message;
    this.data = data;
  }


  isOk()    { return this.code === AppResult.OK_CODE; }
  isInfo()  { return this.code >= AppResult.INFO_CODE && this.code < AppResult.WARNING_CODE; }
  isWarn()  { return this.code >= AppResult.WARNING_CODE && this.code < AppResult.ERROR_CODE; }
  isError() { return this.code >= AppResult.ERROR_CODE; }


  static success(data: any, message: string = 'Success') {
    return new AppResult(AppResult.OK_CODE, message, data);
  }

  static successNoData(message: string = 'Success') {
    return new AppResult(AppResult.OK_CODE, message, null);
  }

  static info(message: string = 'Info', data?: any) {
    return new AppResult(AppResult.INFO_CODE, message, data);
  }

  static error(message: string = 'Error', data?: any) {
    return new AppResult(AppResult.ERROR_CODE, message, data);
  }

  static warning(message: string = 'Warning', data?: any) {
    return new AppResult(AppResult.WARNING_CODE, message, data);
  }
}
