import homeIcon from "../assets/images/home_icon.svg";
import homeIconActive from "../assets/images/home_icon_active.svg";

import tenderFilesIcon from "../assets/images/tender_files_icon.svg";
import tenderFilesIconActive from "../assets/images/tender_files_icon_active.svg";

import fileListIcon from "../assets/images/file_list_icon.svg";
import fileListIconActive from "../assets/images/file_list_icon_active.svg";

import dashboardIcon from "../assets/images/dashboard_icon.svg";
import dashboardIconActive from "../assets/images/dashboard_icon_active.svg";

export const sidebarData = [
  {
    title: "Home",
    icon: homeIcon,
    activeIcon: homeIconActive,
    link: "/page/dashboard",
    pointerEvent: true,
    forAdmin: false,
  },

  {
    title: `Tender 
    List`,
    icon: tenderFilesIcon,
    activeIcon: tenderFilesIconActive,
    link: "/page/tender-files",
    pointerEvent: true,
    forAdmin: false,
  },
  {
    title: `File List`,
    icon: fileListIcon,
    activeIcon: fileListIconActive,
    link: "/page/file-list",
    pointerEvent: true,
    forAdmin: false,
  },
];

export const adminSidebarData = [
  ...sidebarData,
  {
    title: "Dashboard",
    icon: dashboardIcon,
    activeIcon: dashboardIconActive,
    link: "/page/admin/dashboard",
    pointerEvent: true,
    forAdmin: true,
  },
];
