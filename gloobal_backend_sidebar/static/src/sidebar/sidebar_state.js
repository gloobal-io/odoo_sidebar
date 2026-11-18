import { proxy } from "@odoo/owl";
import { browser } from "@web/core/browser/browser";

const COLLAPSED_KEY = "gloobal_sidebar.collapsed";

function readCollapsed() {
    try {
        return browser.localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
        return false;
    }
}

/**
 * State shared by the sidebar and the navbar toggle button.
 * - collapsed: desktop rail mode (icons only), remembered in the browser;
 * - mobileOpen: off-canvas panel on small screens, closed by default.
 */
export const sidebarState = proxy({
    collapsed: readCollapsed(),
    mobileOpen: false,
});

export function toggleSidebar(isSmall) {
    if (isSmall) {
        sidebarState.mobileOpen = !sidebarState.mobileOpen;
        return;
    }
    sidebarState.collapsed = !sidebarState.collapsed;
    try {
        browser.localStorage.setItem(COLLAPSED_KEY, sidebarState.collapsed ? "1" : "0");
    } catch {
        // storage unavailable (private mode…): the state stays for this page only
    }
}
