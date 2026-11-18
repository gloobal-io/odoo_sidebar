import { Component, onMounted, onWillUnmount, proxy, usePlugin } from "@odoo/owl";
import { router } from "@web/core/browser/router";
import { DebugModePlugin } from "@web/core/debug_mode_plugin";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { useDropdownState } from "@web/core/dropdown/dropdown_hooks";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { OfflinePlugin } from "@web/core/offline/offline_plugin";
import { _t } from "@web/core/l10n/translation";
import { useBus, useService } from "@web/core/utils/hooks";
import { sidebarState, toggleSidebar } from "./sidebar_state";

/**
 * Left navigation sidebar of the web client.
 *
 * Lists the apps (menu service) and, under the current app, its menus and
 * sub-menus. On desktop it can be collapsed into a rail of app icons: a first
 * click on an icon opens the app menus (native Dropdown), a second click while
 * they are open opens the app. On small screens it is an off-canvas panel
 * opened from the navbar.
 */
export class GloobalSidebar extends Component {
    static template = "gloobal_backend_sidebar.Sidebar";
    static components = { Dropdown, DropdownItem };

    setup() {
        this.menuService = useService("menu");
        this.pwa = useService("pwa");
        this.ui = proxy(useService("ui"));
        this.debugMode = usePlugin(DebugModePlugin);
        this.offlinePlugin = usePlugin(OfflinePlugin);
        this.sidebar = sidebarState;
        this.state = proxy({
            activeMenuId: null,
            // explicit open/closed choices of the user, by group id
            groups: {},
        });
        this.clickedMenuId = null;
        // one manual dropdown state per app icon of the collapsed rail
        this.railStates = {};

        useBus(this.env.bus, "ACTION_MANAGER:UI-UPDATED", () => this.syncActiveMenu());
        useBus(this.env.bus, "MENUS:APP-CHANGED", () => this.syncActiveMenu());

        onMounted(() => {
            document.body.classList.add("o_gloobal_has_sidebar");
            this.syncActiveMenu();
        });
        onWillUnmount(() => document.body.classList.remove("o_gloobal_has_sidebar"));
    }

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    get apps() {
        const currentApp = this.menuService.getCurrentApp();
        if (this.pwa.isScopedApp) {
            return currentApp ? [currentApp] : [];
        }
        return this.menuService.getApps();
    }

    get currentApp() {
        return this.menuService.getCurrentApp();
    }

    get isCollapsed() {
        return !this.ui.isSmall && this.sidebar.collapsed;
    }

    get isOpen() {
        return this.ui.isSmall ? this.sidebar.mobileOpen : true;
    }

    get collapseLabel() {
        return this.isCollapsed ? _t("Expand menu") : _t("Collapse menu");
    }

    appSections(app) {
        return this.menuService.getMenuAsTree(app.id).childrenTree || [];
    }

    appIcon(app) {
        if (app.webIconData) {
            return { image: app.webIconData };
        }
        if (app.webIcon) {
            const [iconClass, iconColor] = app.webIcon.split(",");
            return { iconClass, iconColor };
        }
        return {};
    }

    getMenuItemHref(menu) {
        const url = `/odoo/${menu.actionPath || "action-" + menu.actionID}`;
        const mode = this.debugMode.toString();
        return mode ? `${url}?debug=${mode}` : url;
    }

    isAvailable(menu) {
        return (
            !this.offlinePlugin.isOffline() ||
            !menu.actionID ||
            this.offlinePlugin.isAvailableOffline(menu.actionID)
        );
    }

    containsActive(menu) {
        const activeId = this.state.activeMenuId;
        if (!activeId) {
            return false;
        }
        return menu.childrenTree.some(
            (child) => child.id === activeId || this.containsActive(child)
        );
    }

    isGroupOpen(menu) {
        const choice = this.state.groups[menu.id];
        return choice === undefined ? this.containsActive(menu) : choice;
    }

    // -------------------------------------------------------------------------
    // Active entry
    // -------------------------------------------------------------------------

    /**
     * The active entry is the menu of the current app whose action is the root
     * of the breadcrumbs, preferring the entry the user clicked when several
     * menus open the same action.
     */
    syncActiveMenu() {
        const app = this.currentApp;
        if (!app) {
            this.state.activeMenuId = null;
            return;
        }
        const rootAction = router.current.actionStack?.[0]?.action;
        const candidates = rootAction
            ? this.menuService
                  .getAll()
                  .filter(
                      (m) =>
                          m.appID === app.id &&
                          m.id !== app.id &&
                          (m.actionID === rootAction ||
                              (m.actionPath && m.actionPath === rootAction))
                  )
            : [];
        const active =
            candidates.find((m) => m.id === this.clickedMenuId) ||
            candidates[0] ||
            // e.g. an action opening a record directly: the URL has no action
            this.menuService.getMenu(this.clickedMenuId) ||
            this.menuService.getMenu(this.state.activeMenuId);
        this.state.activeMenuId =
            active && active.appID === app.id && active.id !== app.id ? active.id : null;
    }

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    async onMenuClick(ev, menu) {
        // ctrl/cmd-click is left to the browser (see WebClient.onGlobalClick)
        ev.preventDefault();
        await this.selectMenu(menu);
    }

    async selectMenu(menu) {
        this.clickedMenuId = menu.id;
        this.sidebar.mobileOpen = false;
        await this.menuService.selectMenu(menu);
    }

    railState(app) {
        if (!this.railStates[app.id]) {
            this.railStates[app.id] = useDropdownState();
        }
        return this.railStates[app.id];
    }

    /**
     * Collapsed rail: the first click opens the app menus, a second click on
     * the same icon while they are open opens the app.
     */
    async onRailClick(ev, app) {
        ev.preventDefault();
        const state = this.railState(app);
        if (state.isOpen) {
            state.close();
            await this.selectMenu(app);
        } else {
            for (const other of Object.values(this.railStates)) {
                if (other !== state && other.isOpen) {
                    other.close();
                }
            }
            state.open();
        }
    }

    toggleGroup(menu) {
        this.state.groups[menu.id] = !this.isGroupOpen(menu);
    }

    toggle() {
        toggleSidebar(this.ui.isSmall);
    }

    close() {
        this.sidebar.mobileOpen = false;
    }
}
