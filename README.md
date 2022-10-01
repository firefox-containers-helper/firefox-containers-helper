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
  - [Tips](#tips)
    - [Container naming convention suggestions](#container-naming-convention-suggestions)
  - [FAQ](#faq)
  - [Warnings](#warnings)
  - [Community](#community)
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
  * Sort the list of containers shown in the extension popup by their name, default URL, or the default sort order.
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
* **Refresh mode** - Quickly allows you to delete & re-create any or all of your containers at once, which allows you to quickly purge cookies and other site data for your favorite containers.
* **Keyboard shortcut** to open the popup window is `alt+shift+D` (configurable, on Mac it is `Command+Shift+E`). It will immediately focus the search box, so you can quickly filter for a container, press enter, and go.
* **Dark and Light mode** - respects your system's dark/light mode setting, thanks to [KerfuffleV2](https://github.com/cmcode-dev/firefox-containers-helper/issues?q=is%3Apr+author%3AKerfuffleV2) in [PR #8](https://github.com/cmcode-dev/firefox-containers-helper/pull/8)
  * Note: On my Ubuntu system, changing Firefox's theme isn't enough, I had to change my entire theme from a dark theme to a light theme to switch the preference
* **Select Mode** - Like you'd intuitively expect, you can enable Select Mode press `Ctrl+Click` (`Cmd+Click` on Mac) to specifically select a couple results from the list, as well as `Ctrl+Shift+Click` (`Cmd+Shift+Click` on Mac) to traverse a range of containers.
* **Container Quick-Add** - Allows you to quickly add a new container based on what you have typed into the filter text box. Defaults to a circle icon and the toolbar color.
* **Opt-in to Synchronize using Firefox Sync** - Using the updated Preferences section, you can set the Firefox Sync settings or modify the local settings by editing them as JSON.
* **Container Import/Export** - Using the Preferences section, you can use JSON to import and export containers, and set default URLs for them. This can make your life easier if you're migrating between devices and want to carry over all of your containers, for example.
* **Quickly Open Current Page in Other Containers** - Disabled by default - enable this in the addon settings page. You can automatically open the current page in other containers whose domains/hosts/origins match your current tab's URL's domain/host/origin. Read more in the addon settings page.
* **Open the current tab's page in all containers** - Allows you to check a box and open the current URL in every filtered container, if you'd like.

## Examples and Screenshots

This section contains some recordings and walkthroughs of use cases for this extension. Hopefully, it helps clarify ways to leverage this extension as best as possible for readers.

If any of this is confusing, remember the basics:

* Press `shift` and click/enter to act on ALL results (bulk open tab/delete container/set URL action)
* Press `ctrl` and click/enter a result to open as pinned tab(s)
  * Note that entering *Select Mode* will change the behavior of `ctrl+click` (`Cmd+Click` on Mac) to specifically select one container from the list, or multiple if `shift` is also held

For now, this section has been migrated to [](./readme-assets/README.md) as an archive, but screenshots and recordings will be added soon.

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

1. This container management extension is dangerously powerful. If you're not careful, you can delete all of your containers by turning on "Delete Mode", pressing `shift+enter`, and pressing "OK" to the prompts. At this time, the extension doesn't support undoing operations or rolling back commands. You've been warned!
1. **Major warning:** If you delete all the extensions on your browser that leverage containers, Firefox might reset your entire container configuration to the stock default set of 4 containers: Personal, Banking, Shopping, and Work.
1. **A note about Firefox Sync**: You may eventually hit a Firefox Sync quota if you have something like 100+ containers without periodically cleanup the config using the cleanup feature. Hitting quota causes problems when saving URLs and doing other things in the extension.
2. **Removing this extension** will cause any settings that are not pushed to Firefox Sync to be lost upon reinstallation of the extension. Make sure to use the Preferences page to copy/paste your configuration before uninstalling the extension, if needed.

## Community

If you have suggestions, please feel free to voice them on GitHub. Thank you for using my extension and reading this far!

## Attributions

This software uses Bootstrap. See the license [here](https://github.com/twbs/bootstrap/blob/main/LICENSE).

It also is packaged with a variant of Bootstrap from [here](https://github.com/vinorodrigues/bootstrap-dark), released under the MIT License.
