# Odoo Sidebar

A left navigation sidebar for the Odoo back-end (web client), built with
Odoo's own components and styles.

- Lists the apps and, under the open app, its menus and sub-menus
  (collapsible groups). The active entry is highlighted, also when a record
  is opened from it.
- Can be collapsed into a rail of app icons (the choice is kept in the
  browser). In the rail, a first click on an icon opens the app menus, a
  second click on the same icon opens the app.
- On small screens it becomes an off-canvas panel, hidden by default and
  opened from the top bar.
- The top bar keeps the toggle button, the app name, the systray and the
  user menu; the duplicated app and section menus are removed.
- Uses the `menu` service, OWL components (`Dropdown`, `DropdownItem`) and
  the Odoo / Bootstrap SCSS variables only (no hard-coded colours), so it
  follows the light and dark colour schemes.

## Versions

One branch per Odoo version: `20.0`, `19.0`.

## Installation

1. Copy the `gloobal_backend_sidebar` folder into an addons path of your
   Odoo instance.
2. Update the apps list and install **Gloobal Backend Sidebar**
   (`-i gloobal_backend_sidebar`).

The module only depends on `web`. Translations: French.

## Licence

LGPL-3. Author: [Gloobal](https://github.com/gloobal-io).
