# Archive

This document contains historical screenshots/captures of the extension that are fun to look back on. Moving older content here helps keep the top-level `README.md` clean.

## Table of Contents

- [Archive](#archive)
  - [Table of Contents](#table-of-contents)
  - [v0.0.25 Screenshot](#v0025-screenshot)
  - [v0.0.24 Screenshot](#v0024-screenshot)
  - [v0.0.18 Screenshots](#v0018-screenshots)
  - [v0.0.16 Screenshots](#v0016-screenshots)
  - [v0.0.11 Examples](#v0011-examples)
    - [v0.0.11 Live Example](#v0011-live-example)
  - [v0.0.10 Examples](#v0010-examples)
    - [v0.0.10 Live Example](#v0010-live-example)
    - [v0.0.10 Screenshots](#v0010-screenshots)
  - [v0.0.3 Examples](#v003-examples)
    - [v0.0.3 Live example](#v003-live-example)
    - [v0.0.3 Screenshots](#v003-screenshots)
  - [v0.0.2 Examples](#v002-examples)
    - [v0.0.2 Basic example (short example)](#v002-basic-example-short-example)
    - [v0.0.2 Longer example](#v002-longer-example)
    - [v0.0.2 Setting multiple URLs simultaneously](#v002-setting-multiple-urls-simultaneously)
    - [v0.0.2 Opening multiple URLs simultaneously](#v002-opening-multiple-urls-simultaneously)
    - [v0.0.2 Bulk deletion of containers](#v002-bulk-deletion-of-containers)

## v0.0.25 Screenshot

In v0.0.25, the ability to sort the currently shown list of containers has been added. The sort methods are as follows:

* Sort by Container Name (asc/desc)
* Sort by Container URL (asc/desc)
* Default sort, and reversing the default sort
  * Containers can be reordered in other Firefox extensions, and have their own inherent sort.

**Important**: Sorting results does not actually modify the order of your containers. It just changes the order of the results shown in the extension popup.

![Sort the current view](readme-assets/v0.0.25/sortable.png)

## v0.0.24 Screenshot

In v0.0.24, the ability to open every filtered container with the current tab's URL was added:

![Override with the current tab's URL](readme-assets/v0.0.24/override_with_current_tab_url.png)

## v0.0.18 Screenshots

In v0.0.18, the features introduced were:

* **Container Import** from JSON, with the ability to bulk-create containers and simultaneously set `defaultUrl` values, facilitated by some cleverness with a text editor/spreadsheet. This feature can be accessed via the addon Preferences page.

Import containers section in the options page:

![Import containers](readme-assets/v0.0.18/import_containers.png)

## v0.0.16 Screenshots

In v0.0.16, the features introduced were:

* **Opt-in to Sync** - in the preferences page for the extension, you can fine tune the settings of the extension, and whether or not you want to push them to sync. To avoid conflicts for existing users, this is disabled by default, so you have to opt-in.
* **Container Export** as CSV or JSON, with import being added in [`v0.0.18`](#v0018-screenshots) useful for setting a large number of default URLs at once by combining the exported data with the local/sync settings, facilitated by some cleverness with a text editor/spreadsheet.

Settings section in the options page - dark mode:

![Settings](readme-assets/v0.0.16/sync_local_settings_dark.png)

Export containers section in the options page (the top of the screenshot is outdated now):

![Export containers](readme-assets/v0.0.16/export_containers.png)

## v0.0.11 Examples

In v0.0.11, the features introduced were:

* **Dark and Light mode** - [Bootstrap dark mode](https://github.com/vinorodrigues/bootstrap-dark) which respects your system theme preference
  * Note: On my Ubuntu system, changing Firefox's theme wasn't enough, I had to change my entire theme from a dark theme to a light theme to switch the preference
* **Select Mode** - Allows you to precisely select only a couple results from the list by first enabling the mode and then pressing `Ctrl+Click` (`Cmd+Click` on Mac), or multiple by pressing `Ctrl+Shift+Click`
* **Configurable Keyboard Shortcut** - Allows you to change the keyboard shortcut for showing the extension popup window, which is by default `Alt+Shift+D` (on Mac it is `Command+Shift+E`). This fixes [#4](https://github.com/cmcode-dev/firefox-containers-helper/issues/4)
* **Container Quick-Add** - Allows you to quickly add a new container based on what you have typed into the filter text box. Defaults to a circle icon and the toolbar color

*See [`CHANGELOG.md`](./CHANGELOG.md) for more changes.*

### v0.0.11 Live Example

In this example, a few features are showcased:

* First, notice the **dark mode theme**.
* **Multi-select** - Select and open multiple specific tabs using `Ctrl+Click` (`Cmd+Click` on Mac)
* **Multi-select over a range** - Select and open multiple specific tabs using `Ctrl+Shift+Click` (`Cmd+Shift+Click` on Mac)
* **Container quick-add** - Quickly add a bunch of containers by typing in a name into the search box

![v0.0.11 usage example](readme-assets/v0.0.11/v0.0.11.gif)

Additionally, a few screenshots:

![Multi-selection static image](readme-assets/v0.0.11/multi_selection.png)

![Dark mode for keyboard shortcuts](readme-assets/v0.0.11/keyboard_shortcuts_dark_larger.png)

![Light mode for keyboard shortcuts](readme-assets/v0.0.11/keyboard_shortcuts_light.png)

## v0.0.10 Examples

In v0.0.10, the features introduced were:

* **Name Replace mode** - Replaces a string in every matched container name
* **URL Replace mode** - Replaces a string in every matched container URL
* **Set Color mode** - Updates the color of all matched containers
* **Set Icon mode** - Updates the icon of all matched containers

*See [`CHANGELOG.md`](./CHANGELOG.md) for more changes.*

### v0.0.10 Live Example

In this example of the v0.0.10 release, the following actions are taken on all of the containers:

* `Open as Tab(s)` mode is used to open all of the containers shown.
* `Set Default URL` mode is used to set the URL for all containers shown.
* `Set Name` mode is used to set the name for all containers shown.
* `Set Color` mode is used to set the container's icon's color for all containers shown.
* `Set Icon` mode is used to set the container's icon for all containers shown.
* `Replace in Name` mode is used to replace a string found in all containers' name.
* `Replace in URL` mode is used to replace a string found in the containers' URL.
* `Duplicate` mode is used to duplicate all containers shown.
* `Delete` mode is used to delete all containers shown.

![v0.0.10 usage example](readme-assets/v0.0.10/example_v0.0.10.gif)

### v0.0.10 Screenshots

Here's how the extension looks when you click on it:

![v0.0.10 Main popup](readme-assets/v0.0.10/screenshot_main_v0.0.10.png)

All available modes in v0.0.10:

![v0.0.10 All modes](readme-assets/v0.0.10/screenshot_mode_list_v0.0.10.png)

Setting default container URLs by pressing the shift key and enter or clicking a container result, in v0.0.10:

![v0.0.10 Set default URL for multiple containers](readme-assets/v0.0.10/screenshot_mode_url_v0.0.10.png)

Default URLs applied in v0.0.10:

![v0.0.10 Main popup](readme-assets/v0.0.10/screenshot_main_urls_set_v0.0.10.png)

Changing the name of multiple containers at once in v0.0.10:

![v0.0.10 Set name for multiple containers](readme-assets/v0.0.10/screenshot_mode_set_name_v0.0.10.png)

Using find and replace in container URLs in v0.0.10 - this screen is preceded by two prompts (one for the "find" string, the other for the "replace" string):

![v0.0.10 Find and replace in container URLs](readme-assets/v0.0.10/screenshot_mode_replace_url_v0.0.10.png)

## v0.0.3 Examples

In v0.0.3, the features introduced were:

* renaming mode
* duplication mode
* minor UI/workflow/UX improvements

*See [`CHANGELOG.md`](./CHANGELOG.md) for more changes.*

### v0.0.3 Live example

In this example, the following actions are taken:

* Setting the default URL for the Personal container by checking "Set Default URL" mode.
* Duplicating the Personal container.
* Renaming the newly duplicated Personal container to Mozilla
* Searching for `Mozilla`, to retrieve all containers with default URLs (or names) containing `Mozilla`
* Duplicating all containers whose default URL (or name) contains `Mozilla`
* Opening all containers whose default URL (or name) contains `Mozilla` as pinned tabs (using the `ctrl+shift` keys and clicking)
* Deleting all containers whose default URL (or name) contains `Mozilla` (using the `shift` key and clicking)

![v0.0.3 usage example](readme-assets/v0.0.3/example_v0.0.3.gif)

### v0.0.3 Screenshots

Here's how the extension looks when you click on it:

![v0.0.3 Main popup](readme-assets/v0.0.3/screenshot_main_v0.0.3.png)

This screenshot has the "Set Default URL" mode enabled, and the user presses `Shift+Enter` to set a default user for all shown containers:

![v0.0.3 Bulk set URL](readme-assets/v0.0.3/screenshot_bulk_set_url_v0.0.3.png)

In this screenshot, the Rename mode is enabled, and again, `Shift+Enter` is pressed to rename all 4 shown containers to a name that can be further tweaked on an individual basis later, such as `chat-alias02-discord` or `chat-alias02-slack`:

![v0.0.3 Bulk rename](readme-assets/v0.0.3/screenshot_bulk_rename_v0.0.3.png)

In this screenshot, the user has switched to "Delete" mode, and then pressed `Shift+Enter` to be prompted to delete all 4 containers:

![v0.0.3 Bulk delete](readme-assets/v0.0.3/screenshot_bulk_delete_v0.0.3.png)

In this screenshot, the user switched to "Duplicate" mode, and clicked on the Shopping container. This duplicated the container without any prompt. If the `Shift` key is pressed, all containers shown will be duplicated after a confirmation prompt:

![v0.0.3 Duplicating one container](readme-assets/v0.0.3/screenshot_single_duplicate_v0.0.3.png)

In this screenshot, the user has switched back to "Rename" mode, searches for containers by the name or default URL of `amazon` (in the screenshot there are two containers that meet this criteria), and renames them to `shopping-amazon-`, in preparation for renaming them individually for specific users, i.e. `shopping-amazon-me` and `shopping-amazon-spouse`, for example.

![v0.0.3 Bulk rename based on URL search](readme-assets/v0.0.3/screenshot_bulk_rename_with_urls_v0.0.3.png)

In this screenshot, the user simply pressed `Ctrl+Shift+Enter` to open all 4 shown results as pinned container tabs, all of which are by default set to `https://mozilla.org` (note that this does not affect the multi-account containers extension's URL opening behavior):

![v0.0.3 Bulk pinned-tab opening](readme-assets/v0.0.3/screenshot_bulk_pinned_tab_url_open_v0.0.3.png)

## v0.0.2 Examples

The following examples demonstrate older functionality of this tool. Eventually these will be removed, but for now, it is more helpful to new users to see more working examples of the tool in action.

### v0.0.2 Basic example (short example)

In this first example, a search is done for the `personal` container, and then a click on it to open a `Personal` tab.

This is the most basic usage of the extension. Start by using the extension this way, and then move on to more power-user-friendly methods, as shown next.

After that, the next search is performed for `work`, and since it's the only result that comes up, the `enter` key can be pressed to immediately open that result. Additionally, since the `ctrl` key was held down, the `Work` tab is opened as a pinned tab. *No URLs are associated with these containers yet - keep reading to see examples.*

![Basic usage example showing search and click, and pinning a tab using ctrl+enter](readme-assets/v0.0.2/example01.gif)

In summary:

* Search for a container and click the result to open a tab.
* If only one result is returned by a search, `enter` can be pressed to open that container.
  * *Note: `Enter` actually just opens the first item in the list, so this will work for many results too*
* Pressing `ctrl` while clicking on a container (or pressing `enter`) will open the result(s) as pinned.

### v0.0.2 Longer example

In this example, the first actions taken are:

* Quickly opening a few tabs by simply clicking around, while the `Stay Open` option is checked (if unchecked, the extension popup disappears.)
* Setting the default URL for a few tabs by checking the `Set Default URL` checkbox, and clicking on one tab at a time to set the URL of each tab.
* Demonstrating opening these tabs with their default URLs

![Longer example showing Stay Open and Set Default URL interactions](readme-assets/v0.0.2/example02.gif)

### v0.0.2 Setting multiple URLs simultaneously

In this example, a query of `test` is performed, and a default URL of `https://duckduckgo.com` is set for all 4 results.

Then, all 4 results are opened simultaneously by pressing `Shift+Enter`.

![Longer example showing Stay Open and Set Default URL interactions](readme-assets/v0.0.2/example03.gif)

### v0.0.2 Opening multiple URLs simultaneously

In this example, a query of `duckduckgo` is performed, and since multiple containers have `duckduckgo` contained within their default URL setting, pressing `ctrl+shift+enter` opens all 4 results at each of their own set default URL as pinned tabs.

![Querying part of a URL and pressing ctrl+enter to open all queried URLs in their containers](readme-assets/v0.0.2/example04.gif)

### v0.0.2 Bulk deletion of containers

In this example, a query of `test` is performed. The `Delete Mode` is then checked by the user before pressing enter or any other inputs. This mode causes any click or enter keystroke to request deletion of the container (will prompt users before deletion). Next, the user presses `shift+enter`, which triggers bulk deletion of all resulting containers (after being prompted).

![Bulk deletion by doing a search and pressing shift+enter, and confirming the prompt](readme-assets/v0.0.2/example05.gif)
