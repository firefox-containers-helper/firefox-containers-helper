# Changelog

This changelog will be corrected in the future.

## v0.0.11

* dark mode and light mode added in https://github.com/charles-m-knox/firefox-containers-helper/pull/8
  * Thanks to https://github.com/KerfuffleV2 for this contribution!
* configurable keyboard shortcut added (see https://github.com/charles-m-knox/firefox-containers-helper/issues/4)

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