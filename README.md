# Firefox Containers Helper

<img align="right" src="src/icons/icon_cube.png">

Firefox multi-account containers are for power users. So is this extension. This extension adds bulk container interactivity features missing from the Mozilla Multi-Account Containers extension.

This extension is intended to *augment* the Multi-Account Containers extension in Firefox.

This readme contains extensive information about the extension and it aims to bootstrap new users into using the extension effectively.

## Table of Contents

- [Firefox Containers Helper](#firefox-containers-helper)
  - [Table of Contents](#table-of-contents)
  - [Who is this intended for?](#who-is-this-intended-for)
  - [Features](#features)
  - [Examples and Screenshots](#examples-and-screenshots)
    - [v0.0.3 Examples](#v003-examples)
      - [Live example](#live-example)
      - [Screenshots](#screenshots)
    - [v0.0.2 Examples](#v002-examples)
      - [(Outdated) Basic example (short example)](#outdated-basic-example-short-example)
      - [(Outdated) Longer example](#outdated-longer-example)
      - [(Outdated) Setting multiple URLs simultaneously](#outdated-setting-multiple-urls-simultaneously)
      - [(Outdated) Opening multiple URLs simultaneously](#outdated-opening-multiple-urls-simultaneously)
      - [(Outdated) Bulk deletion of containers](#outdated-bulk-deletion-of-containers)
  - [Tips](#tips)
    - [Container naming convention suggestions](#container-naming-convention-suggestions)
  - [Warnings](#warnings)
  - [Future Features](#future-features)
  - [Community](#community)
  - [Attributions](#attributions)

## Who is this intended for?

If you're like me and you care deeply about your web browsing privacy, you may be creating a large amount of containers for your browsing, even multiple containers for the same sites.

If this is you, and if you've also struggled to scroll through your long list of containers without reprieve or do other bulk interactions with the multi-account containers extension, then this extension is for you. It will enable you to quickly filter all of your containers and open a new one quickly, or do other things (continue reading).

## Features

* **Container search capability** - filters your containers as you type.
  * Press `enter` to open the first result in the list (or the only result, if just one result remains).
  * Simultaneously press `ctrl` and either `click` or `enter` to open the container in a pinned state.
  * Combine above shortcuts with `shift` to open all filtered containers at once.
* **Set a Default URL for containers** - Any time you use this extension to open a tab, you can configure the tab to open a specific URL by default.
  * The URL settings are stored as part of the extension itself, and are independent of the Multi-Account Containers addon. It will not affect any existing settings, and will not change the behavior of which URLs are opened in which containers by default.
  * Similar to above, press `shift` to bulk-set-default URLs for the current query.
* **Stay open mode** - If you want, you can check this box to keep the extension open while you click on different results (to open many containers) for your search. This mode feels very powerful to use.
* **Deletion mode** - When checked, you can click on a container to delete it. This method of deletion is a bit quicker than the multi-account containers extension. You will be prompted for deletion. **Caution: This can delete all of your containers if you're not careful.**
  * Similar to above, press `shift` to bulk-delete containers returned by a query.
* **Rename mode** - Allows you to quickly rename one or more containers.
* **Duplication mode** - Allows you to duplicate one or more containers returned by a search query.
  * Note: Duplication mode currently does not copy the default open-in-URL capability for multi-account containers, but it does duplicate default URLs defined for containers within this extension. (This extension currently does not have the capability to access information about default open-in-URLs for containers)
* **Keyboard shortcut** to open the popup window is `alt+shift+D`. It will immediately focus the search box, so you can quickly filter for a container, press enter, and go.

## Examples and Screenshots

This section contains some recordings and walkthroughs of use cases for this extension. Hopefully, it helps clarify ways to leverage this extension as best as possible for readers.

If any of this is confusing, remember the basics:

* Press `shift` and click/enter to act on ALL results (bulk open tab/delete container/set URL action)
* Press `ctrl` and click/enter a result to open as pinned tab(s)

### v0.0.3 Examples

In v0.0.3, the features introduced were:

* renaming mode
* duplication mode
* minor UI/workflow/UX improvements

#### Live example

In this example, the following actions are taken:

* Setting the default URL for the Personal container by checking "Set Default URL" mode.
* Duplicating the Personal container.
* Renaming the newly duplicated Personal container to Mozilla
* Searching for `Mozilla`, to retrieve all containers with default URLs (or names) containing `Mozilla`
* Duplicating all containers whose default URL (or name) contains `Mozilla`
* Opening all containers whose default URL (or name) contains `Mozilla` as pinned tabs (using the `ctrl+shift` keys and clicking)
* Deleting all containers whose default URL (or name) contains `Mozilla` (using the `shift` key and clicking)

![v0.0.3 usage example](readme-assets/v0.0.3/example_v0.0.3.gif)

#### Screenshots

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

### v0.0.2 Examples

The following examples demonstrate older functionality of this tool. Eventually these will be removed, but for now, it is more helpful to new users to see more working examples of the tool in action.

#### (Outdated) Basic example (short example)

In this first example, a search is done for the `personal` container, and then a click on it to open a `Personal` tab.

This is the most basic usage of the extension. Start by using the extension this way, and then move on to more power-user-friendly methods, as shown next.

After that, the next search is performed for `work`, and since it's the only result that comes up, the `enter` key can be pressed to immediately open that result. Additionally, since the `ctrl` key was held down, the `Work` tab is opened as a pinned tab. *No URLs are associated with these containers yet - keep reading to see examples.*

![Basic usage example showing search and click, and pinning a tab using ctrl+enter](readme-assets/v0.0.2/example01.gif)

In summary:

* Search for a container and click the result to open a tab.
* If only one result is returned by a search, `enter` can be pressed to open that container.
  * *Note: `Enter` actually just opens the first item in the list, so this will work for many results too*
* Pressing `ctrl` while clicking on a container (or pressing `enter`) will open the result(s) as pinned.

#### (Outdated) Longer example

In this example, the first actions taken are:

* Quickly opening a few tabs by simply clicking around, while the `Stay Open` option is checked (if unchecked, the extension popup disappears.)
* Setting the default URL for a few tabs by checking the `Set Default URL` checkbox, and clicking on one tab at a time to set the URL of each tab.
* Demonstrating opening these tabs with their default URLs

![Longer example showing Stay Open and Set Default URL interactions](readme-assets/v0.0.2/example02.gif)

#### (Outdated) Setting multiple URLs simultaneously

In this example, a query of `test` is performed, and a default URL of `https://duckduckgo.com` is set for all 4 results.

Then, all 4 results are opened simultaneously by pressing `Shift+Enter`.

![Longer example showing Stay Open and Set Default URL interactions](readme-assets/v0.0.2/example03.gif)

#### (Outdated) Opening multiple URLs simultaneously

In this example, a query of `duckduckgo` is performed, and since multiple containers have `duckduckgo` contained within their default URL setting, pressing `ctrl+shift+enter` opens all 4 results at each of their own set default URL as pinned tabs.

![Querying part of a URL and pressing ctrl+enter to open all queried URLs in their containers](readme-assets/v0.0.2/example04.gif)

#### (Outdated) Bulk deletion of containers

In this example, a query of `test` is performed. The `Delete Mode` is then checked by the user before pressing enter or any other inputs. This mode causes any click or enter keystroke to request deletion of the container (will prompt users before deletion). Next, the user presses `shift+enter`, which triggers bulk deletion of all resulting containers (after being prompted).

![Bulk deletion by doing a search and pressing shift+enter, and confirming the prompt](readme-assets/v0.0.2/example05.gif)

## Tips

*Make sure to read all of the features before perusing the tips to get the most out of the extension.*

### Container naming convention suggestions

It may be worth considering using certain naming conventions for your containers, such as:

```
finance-bankA
finance-bankB
email-gmail
email-protonmail
email-tutanota
dev-github-personal
dev-github-work
dev-gitlab-personal
dev-gitlab-work
social-reddit-personal
social-reddit-professional
social-reddit-work
chat-discord-personal
chat-discord-work
chat-slack-work
chat-slack-personal
media-streaming-netflix
media-streaming-plex
media-streaming-hulu
media-streaming-spotify
google-personal
google-work
duckduckgo-ddg
```

Then, you can filter on your containers easily and perform bulk actions.

## Warnings

This container management extension is dangerously powerful. If you're not careful, you can delete all of your containers by turning on "Delete Mode", pressing `shift+enter`, and pressing "OK" to the prompt. At this time, the extension doesn't support undoing operations or rolling back commands. You've been warned!

## Future Features

* **Container Import/Export** - Very much needed feature that I want to implement next. This will be a bit tricky though, since this extension doesn't have control over url-to-container associations made in the multi-account containers extension.
* **Saved searches** - Saving the results and possibly binding to a keystroke might be useful.
* **Favorite/Tagged containers** - Adding a "star" capability to certain tabs so that you can filter them easier. For now, a workaround is using the naming conventions suggested in the [tips](#tips) section.
* **Bulk regular expression actions** - Actions on containers from search results according to regular expressions might be useful.
* **Metrics** - Track simple interaction data (locally only, privacy is important) so you can look back on your interactions with containers.

## Community

If you have suggestions, please feel free to voice them on GitLab. Thank you for using my extension and reading this far!

## Attributions

This software uses Bootstrap. See the license [here](https://github.com/twbs/bootstrap/blob/main/LICENSE).
