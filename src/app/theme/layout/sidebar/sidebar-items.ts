import { FEATURE_FLAGS } from "@app/core/config/feeature-flag";
import { RouteInfo } from "@core/interfaces/RouteInfo";
import { SMSC_BASE, IP_SM_GW_BASE } from "@core/utils/global.constants";

function removeIpSmGwSection(routes: RouteInfo[]): RouteInfo[] {
  if (FEATURE_FLAGS.ipSmGwEnabled) return routes;

  return routes
    .filter((route) => {
      const isGroupTitle = route.groupTitle && route.title === 'IP-SM-GW';
      const isIpSmGwPath = route.path?.startsWith(IP_SM_GW_BASE);
      return !isGroupTitle && !isIpSmGwPath;
    })
    .map((route) => ({
      ...route,
      submenu: (route.submenu || []).filter(
        (item) => !item.path?.startsWith(IP_SM_GW_BASE)
      ),
    }));
}

function removeVasSection(routes: RouteInfo[]): RouteInfo[] {
  if (FEATURE_FLAGS.vasEnabled) return routes;

  return routes.filter((route) => route.moduleKey !== 'pms-vas');
}

function removePlmnNetworkSection(routes: RouteInfo[]): RouteInfo[] {
  if (FEATURE_FLAGS.plmnNetworkEnabled) return routes;

  return routes.filter((route) => route.moduleKey !== 'plmn-network');
}

function removeHttp2Entry(routes: RouteInfo[]): RouteInfo[] {
  if (FEATURE_FLAGS.http2Enabled) return routes;

  return routes.map((r) => ({
    ...r,
    submenu: (r.submenu || []).filter(
      (s) => !(typeof s.path === 'string' && s.path === '/pages/gateways/http2')
    ),
  }));
}

export const ROUTES: RouteInfo[] = removeHttp2Entry(removePlmnNetworkSection(removeVasSection(removeIpSmGwSection([
  {
    path: "/pages/home",
    title: "Home",
    icon: "home-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [],
    show: false,
    isRoot: true,
  },

  {
    path: "",
    title: "SMSC",
    icon: "",
    groupTitle: true,
    role: ["All"],
    submenu: [],
    show: false,
  },

  {
    path: "/pages/service-providers",
    title: "Service Providers",
    icon: "service-provider-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [
      {
        path: "/pages/service-providers/http",
        title: "HTTP",
        icon: "service-provider-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
      {
        path: "/pages/service-providers/smpp",
        title: "SMPP",
        icon: "service-provider-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
    ],
    show: false,
  },

  {
    path: "/pages/gateways",
    title: "Gateways",
    icon: "gateways-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [
      {
        path: `${SMSC_BASE}/ss7`,
        title: "SS7",
        icon: "gateway-icon",
        groupTitle: false,
        premium: true,
        role: ["All"],
        submenu: [],
      },
      {
        path: `${SMSC_BASE}/diameter`,
        title: "Diameter",
        icon: "gateway-icon",
        groupTitle: false,
        premium: true,
        role: ["All"],
        submenu: [],
      },
      {
        path: "/pages/gateways/smpp",
        title: "SMPP",
        icon: "gateway-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
      {
        path: "/pages/gateways/http",
        title: "HTTP",
        icon: "gateway-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
      {
        path: "/pages/gateways/http2",
        title: "HTTP/2",
        icon: "gateway-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
    ],
    show: false,
  },

  {
    path: "/pages/errors-management",
    title: "Error Management",
    icon: "response-code-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [
      {
        path: "/pages/delivery-error-code",
        title: "Delivery Error Code",
        icon: "response-code-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
      {
        path: "/pages/error-code",
        title: "Error Code",
        icon: "response-code-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
      {
        path: "/pages/error-code-mappging",
        title: "Error Code Mapping",
        icon: "response-code-mapping-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
    ],
    show: false,
  },

  {
    path: "/pages/broadcast",
    title: "Broadcast SMS",
    icon: "broadcast",
    groupTitle: false,
    role: ["All"],
    submenu: [],
    show: false,
  },

  {
    path: "/pages/settings",
    title: "Settings",
    icon: "settings-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [
      {
        path: "/pages/settings",
        title: "General Settings",
        icon: "settings-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
      {
        path: "/pages/interpreter",
        title: "Interpreter",
        icon: "interpreter",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
    ],
    show: false,
  },
  {
    path: "/pages/analyze",
    title: "Analyze",
    icon: "menu-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [
      {
        path: "/pages/analyze/dashboard",
        title: "Dashboards",
        icon: "response-code-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
      {
        path: "/pages/analyze/log",
        title: "Logs",
        icon: "response-code-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
      {
        path: "/pages/analyze/report",
        title: "Reports",
        icon: "response-code-icon",
        groupTitle: false,
        role: ["All"],
        submenu: [],
      },
    ],
    show: false,
  },
  {
    path: "/pages/dnd",
    title: "DND",
    icon: "dnd-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [],
    show: false,
    isRoot: true, 
  },
  {
    path: "/pages/retries",
    title: "Retries",
    icon: "settings-icon",
    boxIcon: "bx-refresh",
    groupTitle: false,
    role: ["All"],
    submenu: [],
    show: false,
    isRoot: true,
  },
  {
    path: "/pages/rules-and-routing",
    title: "Rules and Routing",
    icon: "rules_and_Routing_icon",
    groupTitle: false,
    role: ["All"],
    submenu: [],
    show: false,
    isRoot: true,
  },
  {
    path: "/pages/plmn-network",
    title: "PLMN Network",
    icon: "menu-icon",
    boxIcon: "bx-network-chart",
    groupTitle: false,
    role: ["All"],
    submenu: [],
    show: false,
    isRoot: true,
    moduleKey: "plmn-network",
  },

  {
    path: "",
    title: "IP-SM-GW",
    icon: "",
    groupTitle: true,
    role: ["All"],
    submenu: [],
    show: false,
  },
  {
    path: `${IP_SM_GW_BASE}`,
    title: "Gateways",
    icon: "gateways-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [
      {
        path: `${IP_SM_GW_BASE}/ss7`,
        title: "SS7",
        icon: "gateway-icon",
        groupTitle: false,
        premium: true,
        role: ["All"],
        submenu: [],
      },
      {
        path: `${IP_SM_GW_BASE}/diameter`,
        title: "Diameter",
        icon: "gateway-icon",
        groupTitle: false,
        premium: true,
        role: ["All"],
        submenu: [],
      },
    ],
    show: false,
  },
  {
    path: `${IP_SM_GW_BASE}/sip-gateways`,
    title: "SIP Gateways",
    icon: "settings-icon",
    groupTitle: false,
    externalUrl: "https://github.com/paicoretech/ip-sm-gw",
    role: ["All"],
    submenu: [],
    show: false,
  },

  {
    path: "",
    title: "VAS",
    icon: "",
    groupTitle: true,
    role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
    submenu: [],
    show: false,
    moduleKey: "pms-vas",
  },
  {
    path: "/pages/pms-vas",
    title: "VAS",
    icon: "settings-icon",
    groupTitle: false,
    role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
    submenu: [
      {
        path: "/pages/pms-vas/overview",
        title: "Overview",
        icon: "reports",
        groupTitle: false,
        role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
        submenu: [
          {
            path: "/pages/pms-vas/overview/dashboards",
            title: "Dashboards",
            icon: "reports",
            groupTitle: false,
            role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
            submenu: [],
            moduleKey: "pms-vas",
          },
          {
            path: "/pages/pms-vas/overview/logs",
            title: "Logs",
            icon: "reports",
            groupTitle: false,
            role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
            submenu: [],
            moduleKey: "pms-vas",
          },
          {
            path: "/pages/pms-vas/overview/reports",
            title: "Reports",
            icon: "reports",
            groupTitle: false,
            role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
            submenu: [],
            moduleKey: "pms-vas",
          },
        ],
        show: false,
        moduleKey: "pms-vas",
      },
      {
        path: "/pages/pms-vas/operators",
        title: "Operators",
        icon: "settings-icon",
        groupTitle: false,
        role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
        submenu: [],
        moduleKey: "pms-vas",
      },
      {
        path: "/pages/pms-vas/packages",
        title: "Packages",
        icon: "settings-icon",
        groupTitle: false,
        role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
        submenu: [],
        moduleKey: "pms-vas",
      },
      {
        path: "/pages/pms-vas/subscriptions",
        title: "Subscriptions",
        icon: "settings-icon",
        groupTitle: false,
        role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
        submenu: [],
        moduleKey: "pms-vas",
      },
      {
        path: "/pages/pms-vas/campaigns",
        title: "Campaigns",
        icon: "broadcast",
        groupTitle: false,
        role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
        submenu: [
          {
            path: "/pages/pms-vas/campaigns",
            title: "Campaigns",
            icon: "broadcast",
            groupTitle: false,
            role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
            submenu: [],
            moduleKey: "pms-vas",
          },
          {
            path: "/pages/pms-vas/targets",
            title: "Targets",
            icon: "broadcast",
            groupTitle: false,
            role: ["ROOT", "ADMINISTRATOR", "PMS_VAS_ACCESS"],
            submenu: [],
            moduleKey: "pms-vas",
          },
        ],
        show: false,
        moduleKey: "pms-vas",
      },
    ],
    show: false,
    moduleKey: "pms-vas",
  },

    // {
  //   path: "/pages/reports",
  //   title: "Reports",
  //   icon: "reports",
  //   groupTitle: false,
  //   role: ["All"],
  //   submenu: [
  //     {
  //       path: "/pages/reports/general",
  //       title: "General",
  //       icon: "response-code-icon",
  //       groupTitle: false,
  //       role: ["All"],
  //       submenu: [],
  //     },
  //     {
  //       path: "/pages/reports/sms-report",
  //       title: "SMS",
  //       icon: "response-code-icon",
  //       groupTitle: false,
  //       role: ["All"],
  //       submenu: [],
  //     },
  //   ],
  //   show: false,
  // },

  {
    path: "/pages/users",
    title: "Users",
    icon: "users",
    groupTitle: false,
    role: ["All"],
    submenu: [],
    show: false,
    isRoot: true,
  },

  {
    path: "/pages/charging-settings",
    title: "Charging",
    icon: "settings-icon",
    groupTitle: false,
    premium: true,
    role: ["All"],
    submenu: [],
    show: false,
    isRoot: true
  },
  {
    path: "/pages/mnos",
    title: "MNO",
    icon: "Mno-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [],
    show: false,
    isRoot: true
  },
]))));
