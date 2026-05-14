import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
@Injectable({
  providedIn: 'root'
})
export class DataTableConfigService {

  private readonly STORAGE_KEY = 'dtOptions';

  constructor() { }

  getConfig(): any {
    const storedConfig = localStorage.getItem(this.STORAGE_KEY);
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }
    return {
      ...environment.dtOptions,
      pageLength: Number(environment.dtOptions.pageLength),
      lengthMenu: environment.dtOptions.lengthMenu.map(Number)
    };
  }

  setConfig(config: any): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
  }

  updateConfig(updatedConfig: Partial<any>): void {
    const currentConfig = this.getConfig();
    const newConfig = { ...currentConfig, ...updatedConfig };
    this.setConfig(newConfig);
  }
}
