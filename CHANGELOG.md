# Changelog

This changelog contains all relevant changes between different versions of the extension.

## v0.1.2

* Adjusts the CSS styling and positioning of elements in the extension popup to respect 600px max height constraints
* Fixes scrolling on some environments
* When opening the popup in a new tab, the full width of the screen is used

## v0.1.1

* fix Enter key not working for triggering actions in popup (https://github.com/cmcode-dev/firefox-containers-helper/issues/44)

## v0.1.0

Significant rewrite of the extension, migrating from vanilla JS to TypeScript.

* Fixed verbiage in various places across the options page and extension popup
* Implemented "Confirm", "Prompt" and "Alert" modals instead of using the native JavaScript confirm() function
* Preferences page compatibility improvements
* Added "Refresh" function to allow for a faster way to delete & re-create an existing container or containers
  * Useful for quickly purging cookies without having to set up a container over again
* Added "Clean Up Orphans" to help clean up the config, with help text to show when it's needed
* Focus cancel/OK buttons in modals by default where necessary
* Stress-tested the extension and added suggestions/recommendations for extreme power users to the Preferences page
* Lots of other optimizations/fixes/improvements

Dev changes:

* Rewrote the extension in TypeScript. Uses webpack to compile the result.

## v0.0.28

* Container names no longer are limited to 25 characters. This was previously an API limitation that now seems to have been removed at some point, thank you Mozilla! As a result, the "Set Name" option now allows you to set a name longer than 25 characters. The "+" button did not have this same length check, so its behavior has not been changed.
* Replaced all javascript "alert" calls with proper modals. This is part of an incremental effort to replace all native JS dialogs such as "confirm", "prompt" and "alert" with proper CSS-enabled modals.
* Fix https://github.com/cmcode-dev/firefox-containers-helper/issues/40 - the Sort by URL Descending menu option is now correct.

## v0.0.27

* fixes https://github.com/cmcode-dev/firefox-containers-helper/issues/33 - in some scenarios, the selected items are preserved when they should be reset. Now, the behavior has been updated to de-select all containers when a delete or duplicate action takes place.

## v0.0.26

* the default sort was set to "URL ascending"; resetting it back to the default

## v0.0.25

* addresses some items from https://github.com/cmcode-dev/firefox-containers-helper/issues/37:
  * fixes issue with containers that are added via the `+` button having lowercase names
  * adds "soft" sorting by website asc/desc, container name asc/desc, or default unsorted/reverse
    * this does not actually change the sorting of your containers within Firefox; there is no API method that allows this that I'm aware of (see discussion in https://github.com/cmcode-dev/firefox-containers-helper/issues/37#issuecomment-1232317252)
* minor code fixes/cleanup

## v0.0.24

* adds "Override with current tab's URL" feature requested in https://github.com/cmcode-dev/firefox-containers-helper/issues/31
* adds warning to the Preferences page about firefox sync quota limitations

## v0.0.23

* more verbiage clarification in options page

## v0.0.22

* minor verbiage fix in options page

## v0.0.21

* adds an option to override the default URL for a container with the current tab's URL if its domain/hostname/origin/host matches the current tab's URL
  * requested in https://github.com/cmcode-dev/firefox-containers-helper/issues/29
* minor syntax adjustments

## v0.0.20

* fixes a regression introduced in`v0.0.19` where tabs without default URLs would not be able to open when the setting to ignore non-http/https values was unchecked
* updated verbiage in the options page to remove double-negatives from the ignore http/https prompt options explanations

## v0.0.19

* fixes an issue where users can enter URLs without the protocol, which causes the web extensions API to attempt to load a local file by the name of the URL provided by the user. Users will now be prompted to confirm if they enter a URL that does not have `http://` or `https://` in front of it.
  * users are also prompted when attempting to open a URL without the above two protocols
  * added a section in the Preferences/options page where users can choose to ignore this dialog

## v0.0.18

* adds ability to import containers by providing a JSON array. This feature is accessible via the Addon Preferences page.
  * also includes ability to set default URLs for the containers
* fixed an issue with `undefined` container targets being passed to a request to delete multiple containers
* updated verbiage in the Export Containers section
* updated the Export Containers functionality to include the default URL for containers

## v0.0.17

* fixes [#22](https://github.com/cmcode-dev/firefox-containers-helper/issues/22) by enforcing a minimum search list height
* "No results" text added to the container list if there are no filtered results
* bug fix: no longer allows the enter key to trigger the selected action on the filtered containers, if there are no filtered containers

## v0.0.16

* adds container JSON/CSV export feature in the options page
  * allows you to use an external editor (spreadsheet/text editor) to help manage your containers at a larger scale
    * complete import/export is not implemented! the feature is mainly useful for setting a large number of default URLs for containers
* adds the ability to control whether or not settings are saved over Firefox Sync, or simply locally
  * resolves [#3](https://github.com/cmcode-dev/firefox-containers-helper/issues/3)
  * to access this, visit the Extension Preferences page
  * by default, sync is **opt-in**, you have to enable it in order for the settings to be pushed to sync.
    * settings will continue to persist locally otherwise
  * had to specify the extensions UUID in `manifest.json`, see [here](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/#when-do-you-need-an-add-on-id)
* fix the awkward css styling for default url labels that are either selected or currently hovered over - gray on gray is not visible 😰
* add `1.` through `9.` to the prefix of the mode selection menu to make power users even more powerful (you can just press `3` on your keyboard to get the action you want)

## v0.0.15

* fix [#14](https://github.com/cmcode-dev/firefox-containers-helper/issues/14), to use non-localized AMO links
* fix [#15](https://github.com/cmcode-dev/firefox-containers-helper/issues/15), to enable Mac support for anything that uses the `Ctrl` key modifier to allow the `Meta` (`Cmd` key) modifier to work as well
* minor change: set text color to white when items are selected; previously text was black and the background highlight color was also dark gray, making it hard to see
* on Mac, the default shortcut key (`Alt+Shift+D`) is overridden by a built-in shortcut, so the new shortcut key on Mac is `Command+Shift+E`. You can change this if you want.

## v0.0.12-v0.0.14

* fix [#11](https://github.com/cmcode-dev/firefox-containers-helper/issues/11), the indexing for multi-select was using the total number of containers instead of the filtered number of containers 😰
* re-add "+" button for containers since it's actually fine
* added stern warning to the readme about NEVER disabling or deleting all of your container extensions in Firefox, or else they'll get completely reset

## v0.0.11

* dark mode and light mode added in [#8](https://github.com/cmcode-dev/firefox-containers-helper/pull/8)
  * Thanks to https://github.com/KerfuffleV2 for this contribution!
* configurable keyboard shortcut added (see [#4](https://github.com/cmcode-dev/firefox-containers-helper/issues/4))
* adds *Select Mode*, as requested by a project supporter!
  * resolves [#6](https://github.com/cmcode-dev/firefox-containers-helper/issues/6)
* fix [#9](https://github.com/cmcode-dev/firefox-containers-helper/issues/9)... no longer drops all casing to lowercase when using "replace in name" mode, sorry about that!
* "replace in name" used to be case-insensitive, but I believe it's better to have case-sensitive replacing
  * Please file an issue and talk with me if you disagree or believe there should be a better approach! Thank you! 🙂
* added a small "Donate" link to my personal site with my personal avatar, I appreciate your support everyone 🙂
* added a simple "+" button to quickly add a new container based on the user's current input, this was requested [here](https://www.reddit.com/r/firefox/comments/m0fvwy/the_multiaccount_containers_addon_is_awesome_but/gq8wqig?utm_source=share&utm_medium=web2x&context=3)

## v0.0.10

* new modes added:
  * Name Replace mode - Replaces a string in every matched container name
  * URL Replace mode - Replaces a string in every matched container URL
  * Set Color mode - Updates the color of all matched containers
  * Set Icon mode - Updates the icon of all matched containers
* use a dropdown field for selecting the current mode instead of checkboxes
* keep track of last query between popup close/open
* change "Stay Open" checkbox label to "Sticky Popup"
* simplified UI by removing buttons and labels
* provider better help messages

## v0.0.9

* revert change in `v0.0.7` to ignore spaces in search
  * behavior is search-exact for what you type, may revisit later

## v0.0.8

* revert change in `v0.0.7` to ignore `-_` characters when searching
  * search function still splits by spaces though

## v0.0.7

* ignore spaces and trim `-_` characters when searching
* add extra confirmation prompt for deleting containers

## v0.0.6

* fix url to readme in extension popup
* add faq in `README.md`

## v0.0.5

* small cleanup

## v0.0.4

* extension packaging and signing methodology

## v0.0.3

* renaming mode
* duplication mode
* more refactoring
* documentation auto-generation

## v0.0.2

* core features established
* refactor of code
* default url setting capability

## v0.0.1

* initial release