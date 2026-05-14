import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { AuthService, RouteInfo, SettingServices } from '@app/core';
import { ROUTES } from './sidebar-items';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  environment = environment;

  public sidebarItems!: RouteInfo[];
  hidden = false;
  document: any = document;
  currentRoute: string = '';
  userName: string = '';

  private readonly onSettingsUpdated = () => this.handleSettingsUpdate();

  constructor(
    private authService: AuthService,
    private router: Router,
    private settingServices: SettingServices
  ) {
   this.currentRoute = this.router.url;
  }

  async ngOnInit() {
    this.userName = await this.authService.getIdentity();
    await this.loadSidebar();
    window.addEventListener('smsc-settings-updated', this.onSettingsUpdated);
  }

  ngOnDestroy() {
    window.removeEventListener('smsc-settings-updated', this.onSettingsUpdated);
  }

  private handleSettingsUpdate = async () => {
    await this.loadSidebar();
  }

  private openActiveDropdownParents(items: any[], currentUrl: string): boolean {
    let activeFound = false;

    for (const item of items) {

      if (item.groupTitle) continue;

      const isSelfActive = item.path && currentUrl.startsWith(item.path);

      const isChildActive = item.submenu?.length
        ? this.openActiveDropdownParents(item.submenu, currentUrl)
        : false;

      if (item.submenu?.length) {
        item.show = isChildActive;
      }

      activeFound = activeFound || isSelfActive || isChildActive;
    }

    return activeFound;
  }

  /**
   * Load sidebar based on user roles and settings
   */
  async loadSidebar() {
    const [roles, { use_analyze, use_dnd_filtering }] = await Promise.all([
      this.authService.getRoles(),
      this.settingServices.getAnalyzeAndDndSettings(),
    ]);
    const rolesSet = new Set(roles);
    const isAdmin = rolesSet.has('ROOT') || rolesSet.has('ADMINISTRATOR');
    const isLimited = ['CAMPAIGN_APPROVER', 'CAMPAIGN_OPERATOR', 'TECH_SUPPORT']
      .some(r => rolesSet.has(r));

    let items: any[] = [];
    if (isAdmin) {
      items = [...ROUTES];
    } else if (isLimited) {
      items = ROUTES.filter(i => i.title === 'Broadcast SMS');
    } else {
      items = [];
    }

    const featureGate = (item: any) => {
      if (!use_analyze && item.title === 'Analyze') return false;
      if (!use_dnd_filtering && item.title === 'DND') return false;
      return true;
    };

    this.sidebarItems = items.filter(featureGate);


    this.currentRoute = this.router.url;
    this.openActiveDropdownParents(this.sidebarItems as any[], this.currentRoute);
  }

  onSubmit() {
    if (this.hidden) {
      this.document.getElementById('layout-menu').classList.remove('layout-menu-active');
      this.document.getElementById('layout-menu').classList.add('layout-menu-hidden');
    }
  }

  toggleDropdown(index: number): void {
    this.sidebarItems[index].show = !this.sidebarItems[index].show;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.hidden = window.innerWidth < 1250;
  }

  logout() {
    this.authService.logout();
  }
  get brandingPaic() {
    return environment.logoPaicore;
  }
}
