import { useState } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { NavBar } from "@web/webclient/navbar/navbar";
import { WebClient } from "@web/webclient/webclient";
import { GloobalSidebar } from "./sidebar/sidebar";
import { sidebarState, toggleSidebar } from "./sidebar/sidebar_state";

WebClient.components = { ...WebClient.components, GloobalSidebar };

patch(NavBar.prototype, {
    setup() {
        super.setup();
        this.gloobalSidebar = useState(sidebarState);
    },

    get gloobalSidebarToggleLabel() {
        return this.ui.isSmall ? _t("Open menu") : _t("Collapse or expand menu");
    },

    // Somehow a setter is needed in `patch()` to avoid an owl error.
    set gloobalSidebarToggleLabel(_) {},

    onGloobalSidebarToggle() {
        toggleSidebar(this.ui.isSmall);
    },
});
