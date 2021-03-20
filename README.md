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
  - [Tips](#tips)
    - [Container naming convention suggestions](#container-naming-convention-suggestions)
  - [FAQ](#faq)
  - [Warnings](#warnings)
  - [Future Features](#future-features)
  - [Community](#community)
    - [Supporting the Project](#supporting-the-project)
  - [Repository source code update](#repository-source-code-update)
  - [Attributions](#attributions)

## Who is this intended for?

If you're like me and you care deeply about your web browsing privacy, you may be creating a large amount of containers for your browsing, even multiple containers for the same sites.

If this is you, and if you've also struggled to scroll through your long list of containers without reprieve or do other bulk interactions with the multi-account containers extension, then this extension is for you. It will enable you to quickly filter all of your containers and open a new one quickly, or do other things (continue reading).

With [Total Cookie Protection](https://blog.mozilla.org/security/2021/02/23/total-cookie-protection/), the use case for containers has been reduced a bit (this is a good thing; containers are extra effort that we shouldn't need to expend in the first place - privacy by default is the way to go). However, containers are still very useful for having multiple identities for a single site, or for having complete control over each tab's browsing context. This extension still complements [Temporary Containers](https://addons.mozilla.org/en-US/firefox/addon/temporary-containers/) and other extensions quite well.

## Features

* **Container search capability** - filters your containers as you type.
  * Press `enter` to open the first result in the list (or the only result, if just one result remains).
  * Simultaneously press `ctrl` and either `click` or `enter` to open the result(s) in a pinned state.
  * Combine above shortcuts with `shift` to open all filtered containers at once.
* **Set a Default URL for containers** - Any time you use this extension to open a tab, you can configure the tab to open a specific URL by default.
  * The URL settings are stored as part of the extension itself, and are independent of the Multi-Account Containers addon. It will not affect any existing settings, and will not change the behavior of which URLs are opened in which containers by default.
  * Similar to above, press `shift` to bulk-set-default URLs for the current query.
* **Sticky Popup** - If you want, you can check this box to keep the extension open while you click on different results (to open many containers) for your search. This mode feels very powerful to use.
* **Set Name/Icon/Color mode** - Allows you to quickly set one or more containers' icon, color, or name quickly.
* **Find and Replace mode** - Allows you to perform a find and replace on container names or default URLs.
* **Duplication mode** - Allows you to duplicate one or more containers returned by a search query.
  * Note: Duplication mode currently does not copy the default open-in-URL capability for multi-account containers, but it does duplicate default URLs defined for containers within this extension. (This extension currently does not have the capability to access information about default open-in-URLs for containers, which is stored in the extension settings for the multi-account containers extension storage in your browser's settings)
* **Deletion mode** - When checked, you can click on a container to delete it. This method of deletion is a bit quicker than the multi-account containers extension. You will be prompted for deletion more than once.
  * **Caution: This can delete all of your containers if you're not careful.**
  * Similar to above, press `shift` to bulk-delete containers returned by a query.
* **Keyboard shortcut** to open the popup window is `alt+shift+D` (configurable, on Mac it is `Command+Shift+E`). It will immediately focus the search box, so you can quickly filter for a container, press enter, and go.
* **Dark and Light mode** - respects your system's dark/light mode setting, thanks to [KerfuffleV2](https://github.com/charles-m-knox/firefox-containers-helper/issues?q=is%3Apr+author%3AKerfuffleV2) in [PR #8](https://github.com/charles-m-knox/firefox-containers-helper/pull/8)
  * Note: On my Ubuntu system, changing Firefox's theme isn't enough, I had to change my entire theme from a dark theme to a light theme to switch the preference
* **Select Mode** - Like you'd intuitively expect, you can enable Select Mode press `Ctrl+Click` (`Cmd+Click` on Mac) to specifically select a couple results from the list, as well as `Ctrl+Shift+Click` (`Cmd+Shift+Click` on Mac) to traverse a range of containers.
* **Container Quick-Add** - Allows you to quickly add a new container based on what you have typed into the filter text box. Defaults to a circle icon and the toolbar color.

## Examples and Screenshots

This section contains some recordings and walkthroughs of use cases for this extension. Hopefully, it helps clarify ways to leverage this extension as best as possible for readers.

If any of this is confusing, remember the basics:

* Press `shift` and click/enter to act on ALL results (bulk open tab/delete container/set URL action)
* Press `ctrl` and click/enter a result to open as pinned tab(s)
  * Note that entering *Select Mode* will change the behavior of `ctrl+click` (`Cmd+Click` on Mac) to specifically select one container from the list, or multiple if `shift` is also held

### v0.0.11 Examples

In v0.0.11, the features introduced were:

* **Dark and Light mode** - [Bootstrap dark mode](https://github.com/vinorodrigues/bootstrap-dark) which respects your system theme preference
  * Note: On my Ubuntu system, changing Firefox's theme wasn't enough, I had to change my entire theme from a dark theme to a light theme to switch the preference
* **Select Mode** - Allows you to precisely select only a couple results from the list by first enabling the mode and then pressing `Ctrl+Click` (`Cmd+Click` on Mac), or multiple by pressing `Ctrl+Shift+Click`
* **Configurable Keyboard Shortcut** - Allows you to change the keyboard shortcut for showing the extension popup window, which is by default `Alt+Shift+D` (on Mac it is `Command+Shift+E`). This fixes [#4](https://github.com/charles-m-knox/firefox-containers-helper/issues/4)
* **Container Quick-Add** - Allows you to quickly add a new container based on what you have typed into the filter text box. Defaults to a circle icon and the toolbar color

*See [`CHANGELOG.md`](./CHANGELOG.md) for more changes.*

#### v0.0.11 Live Example

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

### v0.0.10 Examples

In v0.0.10, the features introduced were:

* **Name Replace mode** - Replaces a string in every matched container name
* **URL Replace mode** - Replaces a string in every matched container URL
* **Set Color mode** - Updates the color of all matched containers
* **Set Icon mode** - Updates the icon of all matched containers

*See [`CHANGELOG.md`](./CHANGELOG.md) for more changes.*

#### v0.0.10 Live Example

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

#### v0.0.10 Screenshots

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

### v0.0.3 Examples

In v0.0.3, the features introduced were:

* renaming mode
* duplication mode
* minor UI/workflow/UX improvements

*See [`CHANGELOG.md`](./CHANGELOG.md) for more changes.*

#### v0.0.3 Live example

In this example, the following actions are taken:

* Setting the default URL for the Personal container by checking "Set Default URL" mode.
* Duplicating the Personal container.
* Renaming the newly duplicated Personal container to Mozilla
* Searching for `Mozilla`, to retrieve all containers with default URLs (or names) containing `Mozilla`
* Duplicating all containers whose default URL (or name) contains `Mozilla`
* Opening all containers whose default URL (or name) contains `Mozilla` as pinned tabs (using the `ctrl+shift` keys and clicking)
* Deleting all containers whose default URL (or name) contains `Mozilla` (using the `shift` key and clicking)

![v0.0.3 usage example](readme-assets/v0.0.3/example_v0.0.3.gif)

#### v0.0.3 Screenshots

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

#### v0.0.2 Basic example (short example)

In this first example, a search is done for the `personal` container, and then a click on it to open a `Personal` tab.

This is the most basic usage of the extension. Start by using the extension this way, and then move on to more power-user-friendly methods, as shown next.

After that, the next search is performed for `work`, and since it's the only result that comes up, the `enter` key can be pressed to immediately open that result. Additionally, since the `ctrl` key was held down, the `Work` tab is opened as a pinned tab. *No URLs are associated with these containers yet - keep reading to see examples.*

![Basic usage example showing search and click, and pinning a tab using ctrl+enter](readme-assets/v0.0.2/example01.gif)

In summary:

* Search for a container and click the result to open a tab.
* If only one result is returned by a search, `enter` can be pressed to open that container.
  * *Note: `Enter` actually just opens the first item in the list, so this will work for many results too*
* Pressing `ctrl` while clicking on a container (or pressing `enter`) will open the result(s) as pinned.

#### v0.0.2 Longer example

In this example, the first actions taken are:

* Quickly opening a few tabs by simply clicking around, while the `Stay Open` option is checked (if unchecked, the extension popup disappears.)
* Setting the default URL for a few tabs by checking the `Set Default URL` checkbox, and clicking on one tab at a time to set the URL of each tab.
* Demonstrating opening these tabs with their default URLs

![Longer example showing Stay Open and Set Default URL interactions](readme-assets/v0.0.2/example02.gif)

#### v0.0.2 Setting multiple URLs simultaneously

In this example, a query of `test` is performed, and a default URL of `https://duckduckgo.com` is set for all 4 results.

Then, all 4 results are opened simultaneously by pressing `Shift+Enter`.

![Longer example showing Stay Open and Set Default URL interactions](readme-assets/v0.0.2/example03.gif)

#### v0.0.2 Opening multiple URLs simultaneously

In this example, a query of `duckduckgo` is performed, and since multiple containers have `duckduckgo` contained within their default URL setting, pressing `ctrl+shift+enter` opens all 4 results at each of their own set default URL as pinned tabs.

![Querying part of a URL and pressing ctrl+enter to open all queried URLs in their containers](readme-assets/v0.0.2/example04.gif)

#### v0.0.2 Bulk deletion of containers

In this example, a query of `test` is performed. The `Delete Mode` is then checked by the user before pressing enter or any other inputs. This mode causes any click or enter keystroke to request deletion of the container (will prompt users before deletion). Next, the user presses `shift+enter`, which triggers bulk deletion of all resulting containers (after being prompted).

![Bulk deletion by doing a search and pressing shift+enter, and confirming the prompt](readme-assets/v0.0.2/example05.gif)

## Tips

*Make sure to read all of the features before perusing the tips to get the most out of the extension.*

### Container naming convention suggestions

It may be worth considering using certain naming conventions for your containers to help perform bulk actions, such as:

```
finance-bankA
finance-bankB
*email-gmail
*email-protonmail
email-tutanota
dev-github-personal
dev-github-work
dev-gitlab-personal
dev-gitlab-work
social-reddit-personal
social-reddit-public
social-reddit-work
*chat-discord-personal
chat-discord-work
*chat-slack-work
chat-slack-personal
media-streaming-netflix
media-streaming-plex
media-streaming-hulu
*media-streaming-spotify
google-personal
google-work
duckduckgo-ddg
```

The containers starting with `*` could be considered as permanently pinned tabs, so you can do a quick search for `*` and press `ctrl+shift+enter` to get the results. Note that sometimes URL's can have a `*` character, so you may want to experiment with what character works best for quickly filtering your preferred pinned tabs.

## FAQ

* When duplicating an existing container, does it also duplicate cookies and other session information?
  * No, it creates a fresh container with only the same basic metadata as the original container, such as color/name/icon.

## Warnings

This container management extension is dangerously powerful. If you're not careful, you can delete all of your containers by turning on "Delete Mode", pressing `shift+enter`, and pressing "OK" to the prompts. At this time, the extension doesn't support undoing operations or rolling back commands. You've been warned!

**Major warning:** if you delete all the extension on your browser that leverage containers, Firefox *will* reset them all. I discovered this the hard way when releasing v0.0.11-v0.0.14 - it caused a bit of panic when I was debugging and kept seeing my containers getting blown away.

## Future Features

Open to suggestions.

* **Sorting** - Sort results according to criteria
* **Container Import/Export** - This will be a bit tricky though, since this extension doesn't have control over url-to-container associations made in the multi-account containers extension.
* **Saved searches** - Saving the results and possibly binding to a keystroke might be useful.
* **Favorite/Tagged containers** - Adding a "star" capability to certain tabs so that you can filter them easier. For now, a workaround is using the naming conventions suggested in the [tips](#tips) section.
* **Bulk regular expression actions** - Actions on containers from search results according to regular expressions might be useful.
* **Metrics** - Track simple interaction data (locally only, privacy is important) so you can look back on your interactions with containers.
* **Accessibility** Need to conform to accessibility standards.

## Community

If you have suggestions, please feel free to voice them on GitHub. Thank you for using my extension and reading this far!

### Supporting the Project

You can support the author directly [here](https://charlesmknox.com/about), and you can see supporters of the project [here](https://charlesmknox.com/about). The extension itself includes a "Donate" link as well. I am very appreciative of the community feedback and support I've received so far.

## Repository source code update

This repository used to be hosted on GitLab. For all releases before and including v0.0.10, please use the [GitLab releases page](https://gitlab.com/icode331/firefox-containers-helper), or use the [official Firefox Addons Store URL](https://addons.mozilla.org/addon/containers-helper).

## Attributions

This software uses Bootstrap. See the license [here](https://github.com/twbs/bootstrap/blob/main/LICENSE).

It also is packaged with a variant of Bootstrap from [here](https://github.com/vinorodrigues/bootstrap-dark/releases/tag/v0.0.9), released under the MIT License.
