import { FEATURE_FLAGS } from "@app/core/config/feeature-flag";
import { RouteInfo } from "@core/interfaces/RouteInfo";
import { SMSC_BASE, IP_SM_GW_BASE } from "@core/utils/global.constants";





function removeIpSmGwSection(routes: RouteInfo[]): RouteInfo[] {

  if (FEATURE_FLAGS.ipSmGwEnabled) return routes;


  return routes
    .filter((r) => {
      const isIpSmGwGroupTitle = r.groupTitle === true && r.title === 'IP-SM-GW';
      const isIpSmGwPath = typeof r.path === 'string' && r.path.startsWith(IP_SM_GW_BASE);
      return !isIpSmGwGroupTitle && !isIpSmGwPath;
    })
    .map((r) => ({
      ...r,
      submenu: (r.submenu || []).filter(
        (s) => !(typeof s.path === 'string' && s.path.startsWith(IP_SM_GW_BASE))
      ),
    }));
}

export const ROUTES: RouteInfo[] = removeIpSmGwSection([
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
    path: `${IP_SM_GW_BASE}/sip-settings`,
    title: "SIP Settings",
    icon: "settings-icon",
    groupTitle: false,
    role: ["All"],
    submenu: [],
    show: false,
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
]);
