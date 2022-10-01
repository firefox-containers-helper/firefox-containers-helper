import { ContainerDefaultURL, ExtensionConfig, SelectedContextIndex } from 'src/types';
import { getSetting, getSettings, setSettings } from './config';
import { CONF, CONTEXT_COLORS, CONTEXT_ICONS, CONTAINER_LIST_DIV_ID, MODES, SORT_MODE_NAME_ASC, SORT_MODE_NAME_DESC, SORT_MODE_NONE, SORT_MODE_NONE_REVERSE, SORT_MODE_URL_ASC, SORT_MODE_URL_DESC, PlatformModifierKey, UrlMatchTypes, SortModes } from './constants';
import { reflectSelected, removeExistingContainerListGroupElement, buildContainerListGroupElement, buildContainerListItem, buildContainerListItemEmpty } from './elements';
import { getCurrentTabOverrideUrl, isAnyContextSelected, isUserQueryContextNameMatch, queryUrls } from './helpers';
import { bottomHelp, help, helpful } from './html';
import { showAlert, showPrompt, showConfirm } from './modals';

/**
 * Asks if the user wants to delete multiple containers, and executes if the user says so.
 * @param contexts The `contextualIdentity` array to possibly be deleted.
 * @param prompt If false, no modals are shown.
 * @return number The number of deleted containers
 */
export const del = async (contexts: browser.contextualIdentities.ContextualIdentity[], prompt: boolean = true): Promise<number> => {
    // selection mode can sometimes lead to contexts that don't exist,
    // so we will filter out contexts that are undefined
    const toDelete: browser.contextualIdentities.ContextualIdentity[] = [];

    const containers = `container${contexts.length === 1 ? '' : 's'}`;

    let deleteAllStr = `Are you sure you want to delete ${contexts.length} ${containers}?\n\n`;

    // limit the dialog to only showing so many lines
    const maxLines = 5;
    for (let i = 0; i < Math.min(maxLines, contexts.length); i++) {
        const ctx = contexts[i];

        if (!ctx) {
            continue;
        }

        // build confirmation dialog first
        deleteAllStr += `${ctx.name}\n`;
        toDelete.push(ctx);
    }

    if (contexts.length > maxLines) {
        deleteAllStr += `\n...${contexts.length - maxLines} more not shown.`;
    }

    if (toDelete.length === 0) {
        showAlert(
            `There aren't any valid targets to delete, so there is nothing to do.`,
            'Nothing to Delete',
        );

        return 0;
    }

    if (prompt && !await showConfirm(deleteAllStr, 'Delete Containers?')) return 0;

    const deleteLenStr = `Are you absolutely sure you want to delete ${contexts.length} ${containers}? This is not reversible.`;

    if (prompt && !await showConfirm(deleteLenStr, 'Confirm Delete?')) return 0;

    // proceed to delete every provided context
    const deleted = [];

    const urls = await getSetting(CONF.containerDefaultUrls) as ContainerDefaultURL;

    let changed = false;

    for (const context of contexts) {
        try {
            const d = await browser.contextualIdentities.remove(context.cookieStoreId);

            if (urls[context.cookieStoreId]) {
                delete urls[context.cookieStoreId];
                changed = true;
            }

            deleted.push(d);

            help(`Deleted ${deleted.length}/${contexts.length} ${containers}`);
        } catch (err) {
            throw `Error deleting container ${context.name} (id: ${context.cookieStoreId}): ${err}`;
        } finally {
            // note that despite the performance hit, it is critical to save
            // the settings each iteration of the loop. If we instead decide
            // to only save after the loop is completed (which is faster),
            // the user might decide to close the popup window before the loop
            // is done, and we would have:
            // - deleted all of the containers leading up to the closure
            // - not persisted any default URL's to the settings
            // However, it _is_ possible to rely on the Orphan Cleanup process
            // offered in the options page to do this automatically. But, since
            // (as of 2022-10-01) this is still a new feature, the more stable
            // choice is to take the performance hit and do it right each time,
            // then automate the cleanup later.
            if (changed) {
                await setSettings({ containerDefaultUrls: urls });
            }
        }
    }

    if (prompt) {
        await showAlert(`Deleted ${deleted.length}/${contexts.length} ${containers}.`, 'Completed');
    }

    await deselect();

    return deleted.length;
};

/** Associates a default URL to each container. */
export const setUrls = async (
    contexts: browser.contextualIdentities.ContextualIdentity[],
    url: string,
    allowAnyProtocol: boolean = false,
    updateHelp: boolean = true,
) => {
    if (!url) {
        await showAlert('Please provide a non-empty URL, or type "none" without quotes to clear URL values.', 'Invalid Input');
        return;
    }

    const clear = url === "none";
    const requireHTTP = !await getSetting(CONF.neverConfirmSaveNonHttpUrls);
    const noHTTPS = url.indexOf(`https://`) !== 0;
    const noHTTP = url.indexOf(`http://`) !== 0;
    const question = 'Warning: URL\'s should start with "http://" or "https://". Firefox likely will not correctly open pages otherwise. If you would like to proceed, please confirm.\n\nThis dialog can be disabled in the extension preferences page.';

    if (!allowAnyProtocol && requireHTTP && noHTTPS && noHTTP && !await showConfirm(question, 'Allow Any Protocol?')) return;

    const s = contexts.length === 1 ? '' : 's';

    const urls = await getSetting(CONF.containerDefaultUrls);

    let changed = false;

    try {
        let i = 0; // just for consistency
        for (const context of contexts) {
            i++;

            const m = `Updated URL for ${i}/${contexts.length} container${s}`;

            if (clear) {
                delete urls[context.cookieStoreId];
                changed = true;

                if (updateHelp) help(m);

                continue;
            }

            urls[context.cookieStoreId] = url;
            changed = true;

            if (updateHelp) help(m);
        }
    } catch (e) {
        throw `setUrls threw error: ${e}`;
    } finally {
        if (changed) {
            await setSettings({ containerDefaultUrls: urls });
        }
    }
}

/**
 * Requests a default URL from the user, and assigns that URL to every given container.
 */
export const setUrlsPrompt = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const one = contexts.length === 1;

    const s = one ? '' : 's';

    const question = `What should the default URL be for ${contexts.length} container${s}?\n\nType "none" (without quotes) to clear the saved default URL value${s}.`;

    let prefill = '';

    if (one) {
        const urls = await getSetting(CONF.containerDefaultUrls);
        const context = contexts[0];
        const contextUrl = urls[context.cookieStoreId];
        if (urls[context.cookieStoreId]) {
            prefill = contextUrl;
        }
    }

    const url = await showPrompt(question, 'Provide URL', prefill);

    if (!url) return;

    await setUrls(contexts, url);
};

/**
 * Opens multiple container tabs according to controllable conditions.
 * @param contexts The `contextualIdentity` array that will each open as a container tab.
 * @param pinned Whether or not to open as a pinned tab.
 * @param tab The currently active tab. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
 */
export const open = async (
    contexts: browser.contextualIdentities.ContextualIdentity[],
    pinned: boolean,
    tab: browser.tabs.Tab,
) => {
    const question = `Are you sure you want to open ${contexts.length} container tabs?`;
    const isMany = contexts.length >= 10;

    if (isMany && !await showConfirm(question, 'Open Many?')) return;

    if (contexts.length === 0) return;

    let shouldPrompt = true;

    const requireHTTP = !await getSetting(CONF.neverConfirmSaveNonHttpUrls);
    const useCurrentTabUrl = await getSetting(CONF.openCurrentTabUrlOnMatch) as UrlMatchTypes;
    const openCurrentPage = await getSetting(CONF.openCurrentPage) as boolean;
    const urls = await getSetting(CONF.containerDefaultUrls) as ContainerDefaultURL;

    for (const context of contexts) {
        let url = urls[context.cookieStoreId] || "";

        // requested in
        // https://github.com/cmcode-dev/firefox-containers-helper/issues/29
        if (useCurrentTabUrl && tab.url) {
            const overrideUrl = getCurrentTabOverrideUrl(url, tab.url, useCurrentTabUrl);
            if (overrideUrl) {
                url = overrideUrl;
            }
        }

        // requested in
        // https://github.com/cmcode-dev/firefox-containers-helper/issues/31
        if (tab.url && openCurrentPage) {
            url = tab.url;
        }

        // don't even bother querying tabs if the "tab url matching"
        // configuration option isn't set
        const newTab: Partial<browser.tabs.Tab> = {
            "cookieStoreId": context.cookieStoreId,
            "pinned": pinned,
        };

        try {
            const empty = url === "";
            const noHTTPS = url.indexOf(`https://`) !== 0;
            const noHTTP = url.indexOf(`http://`) !== 0;

            if (shouldPrompt && !empty && requireHTTP && noHTTPS && noHTTP) {
                const q = `Warning: The URL "${url}" does not start with "http://" or "https://". This may cause undesirable behavior. Proceed to open a tab with this URL?\n\nThis dialog can be disabled in the extension preferences page.`;
                if (!await showConfirm(q, 'Allow Any Protocol?')) return;
                // only need to prompt the user once
                shouldPrompt = false;
            }

            if (!empty) {
                newTab.url = url;
            }

            await browser.tabs.create(newTab);
        } catch (err) {
            throw `Failed to open container '${context.name}' (id ${context.cookieStoreId}) with URL ${url}: ${err}`;
        }
    }
};

/**
 * Renames one or more contexts.
 * @param contexts The containers to change
 */
export const rename = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const one = contexts.length === 1;

    const s = one ? '' : 's';

    const prefill = one ? contexts[0].name : '';

    const rename = await showPrompt(`Rename ${contexts.length} container${s} to:`, 'Rename', prefill);
    if (!rename) return;

    const updated: browser.contextualIdentities.ContextualIdentity[] = [];

    for (const context of contexts) {
        try {
            const update = await browser.contextualIdentities.update(
                context.cookieStoreId,
                { "name": rename }
            );

            updated.push(update);

            help(`Renamed ${updated.length} containers`);
        } catch (err) {
            throw `Failed to rename container ${context.name} (id ${context.cookieStoreId}): ${err}`;
        }
    }
};

/**
 * Updates one or more contexts simultaneously.
 * @param contexts The containers to change
 * @param key The field to set for the contexts
 * @param value The value to assign to the contexts' `key` property
 */
export const update = async (contexts: browser.contextualIdentities.ContextualIdentity[], key: string, value: string) => {
    const updated: browser.contextualIdentities.ContextualIdentity[] = [];

    const updates: browser.contextualIdentities._UpdateDetails | any = {};
    updates[key] = value;

    for (const context of contexts) {
        try {
            const update = await browser.contextualIdentities.update(
                context.cookieStoreId,
                updates
            );

            updated.push(update);

            help(`Updated ${updated.length} containers`);
        } catch (err) {
            throw `Failed to update container ${context.name} (id: ${context.cookieStoreId}): ${err}`;
        }
    }
};

/** Sets the color of one or more contexts simultaneously. */
export const setColors = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const one = contexts.length === 1;
    const s = one ? '' : 's';

    const prefill = one ? contexts[0].color : '';

    const msg = `Choose a color for ${contexts.length} container${s} from the following list:\n\n${CONTEXT_COLORS.join(", ")}`;
    const color = await showPrompt(msg, 'Choose Color', prefill);
    if (!color) {
        // TODO: !color is indistinguishable from the user pressing "cancel" at prompt
        // showAlert('Please provide a non-empty, valid color value.', 'Invalid Color');
        return;
    }

    if (CONTEXT_COLORS.indexOf(color) === -1) {
        await showAlert(`The value ${color} is not a valid container color.`, 'Invalid Color');
        return;
    }

    await update(contexts, "color", color);
};

/** Sets the icon of one or more contexts simultaneously. */
export const setIcons = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const one = contexts.length === 1;
    const s = one ? '' : 's';

    const prefill = one ? contexts[0].icon : '';

    const msg = `Choose an icon for ${contexts.length} container${s} from the following list:\n\n${CONTEXT_ICONS.join(", ")}`;
    const icon = await showPrompt(msg, 'Choose Icon', prefill);

    if (!icon) {
        return;
    }

    if (CONTEXT_ICONS.indexOf(icon) === -1) {
        await showAlert(`The value ${icon} is not a valid container icon.`, 'Invalid Icon');
        return;
    }

    await update(contexts, "icon", icon);
};

/**
 * Executes a find & replace against either a container name or predefined URL.
 * @param contexts The `contextualIdentities` to change.
 * @param fieldToUpdate The field to set for the contexts
 * @param valueToSet The value to assign to the context' `fieldToUpdate` property
 */
export const replaceInName = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const one = contexts.length === 1;
    const s = one ? '' : 's';

    const prefill = one ? contexts[0].name : '';

    const q1 = `(1/3) What case-sensitive string in ${contexts.length} container name${s} would you like to search for?`;

    const find = await showPrompt(q1, 'Search String', prefill);
    if (!find) return;

    const q2 = '(2/3) What string would you like to replace it with?';
    const replace = await showPrompt(q2, 'Replace String', prefill);

    if (!find || replace === null) return;

    const q3 = `(3/3) Replace the case-sensitive string "${find}" with "${replace}" in the name of ${contexts.length} container${s}?`;

    const proceed = await showConfirm(q3, 'Confirm');

    if (!proceed) return;

    const updated = [];

    help(`Updated ${updated.length} containers`); // in case the operation fails

    try {
        for (const context of contexts) {
            // if we want to add case-insensitivity back later, uncomment this
            // const lowerContextName = contextToUpdate.name.toLowerCase();
            // if (lowerContextName.indexOf(findStr) !== -1) {
            // }

            if (context.name.indexOf(find) === -1) continue;

            const rename = context.name.replaceAll(find, replace);

            const update = await browser.contextualIdentities.update(
                context.cookieStoreId,
                { "name": rename }
            );

            updated.push(update);

            help(`Updated ${updated.length} containers`);
        };
    } catch (err) {
        throw `Failed to rename container${s}: ${err}`
    }
}

/**
 * Executes a find & replace against either a container name or predefined URL.
 * @param contexts The `contextualIdentities` to change.
 */
export const replaceInUrls = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const one = contexts.length === 1;
    const s = one ? '' : 's';

    let prefill = '';

    const urls = await getSetting(CONF.containerDefaultUrls);
    if (one) {
        const context = contexts[0];
        const contextUrl = urls[context.cookieStoreId];
        if (urls[context.cookieStoreId]) {
            prefill = contextUrl;
        }
    }

    const q1 = `(1/3) What case-insensitive string in ${contexts.length} container default URL${s}} would you like to search for?`;

    const find = await showPrompt(q1, 'Search String', prefill);
    if (!find) return;

    const q2 = '(2/3) What string would you like to replace it with?';

    const replace = await showPrompt(q2, 'Replace String', prefill);
    if (!find || replace === null) return;

    const q3 = `(3/3) Replace the case-insensitive string "${find}" with "${replace}" in the default URL of ${contexts.length} container${s}}?`

    const proceed = await showConfirm(q3, 'Confirm URL Replace');

    if (!proceed) return;

    const updated = [];

    help(`Updated ${updated.length} containers`); // in case the operation fails

    let changed = false;

    try {
        for (const context of contexts) {
            // retrieve the lowercase URL for the container by first
            // retrieving its unique ID
            const contextId = context.cookieStoreId;

            const url = urls[contextId];

            // check if there is actually a default URL set for this container
            if (!url) continue;

            // there is a default URL, so proceed to find, replace & update it
            const lowered = url.toLowerCase();

            if (lowered.indexOf(find) === -1) continue;

            const newUrlStr = lowered.replaceAll(find, replace);

            urls[contextId] = newUrlStr;
            changed = true;

            updated.push(context);

            help(`Updated ${updated.length} containers`);
        }
    } catch (err) {
        throw `Failed to rename container URL${s}}: ${err}`;
    } finally {
        if (changed) await setSettings({ containerDefaultUrls: urls });
    }
};

/**
 * Duplicates one or more contexts.
 * @param prompt If false, no modals are shown.
 */
export const duplicate = async (contexts: browser.contextualIdentities.ContextualIdentity[], prompt: boolean = true): Promise<number> => {
    const s = contexts.length === 1 ? '' : 's';

    const question = `Are you sure you want to duplicate ${contexts.length} containers?`;

    // only ask if there are multiple containers to duplicate
    if (contexts.length > 1 && prompt && !await showConfirm(question, 'Confirm Duplicate')) return 0;

    let duplicated: browser.contextualIdentities.ContextualIdentity[] = [];

    // if the containers have default URL associations, we need to update those too
    const urls = await getSetting(CONF.containerDefaultUrls) as ContainerDefaultURL;

    for (const context of contexts) {
        const newContext = {
            color: context.color,
            icon: context.icon,
            name: context.name
        };

        try {
            const created = await browser.contextualIdentities.create(newContext);
            duplicated.push(created);


            const urlToSet = urls[context.cookieStoreId] || "none";

            // TODO: consider allowing setUrls to accept a mapping of inputs,
            // such as:
            // cookieStoreId: "https://url.com"
            await setUrls([created], urlToSet, true, false);
        } catch (err) {
            throw `error when duplicating container ${context.name}: ${err}`;
        } finally {
            help(`Duplicated ${duplicated.length}/${contexts.length} container${s}`);
            if (duplicated.length) {
                // when duplicating, the selected containers need to be deselected,
                // since the indices have changed
                await deselect();
            }
        }
    }

    return duplicated.length;
};

/** Adds a brand new context (container). */
export const add = async () => {
    // make sure not to use config.lastQuery here, because it gets trimmed/
    // lowercased. This was a bug identified in:
    // https://github.com/cmcode-dev/firefox-containers-helper/issues/37
    const searchInputEl = document.getElementById('searchContainerInput');
    if (!searchInputEl) {
        await showAlert("You must specify a container name in the input field.", 'No Name Provided');
        return;
    }

    const containerName = (searchInputEl as HTMLInputElement).value;
    if (!containerName) {
        await showAlert("An invalid new container name has been provided.", 'Invalid Name Provided');
        return;
    }

    // TODO: create helper function for this
    const newContext = {
        color: "toolbar",
        icon: "circle",
        name: containerName,
    };

    try {
        const created = await browser.contextualIdentities.create(newContext);

        await filter();

        help(`Added a container named ${created.name}`);

        await deselect();
    } catch (err) {
        throw `Failed to create a container named ${containerName}: ${err}`;
    }
};

/** Duplicates and then deletes containers. */
export const refresh = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const s = contexts.length === 1 ? '' : 's';

    const msg = `Delete and re-create ${contexts.length} container${s}? Basic properties, such as color, URL, name, and icon are kept, but not cookies or other site information. The ordering of the container${s} may not be preserved. This will operate in two steps: duplicate, then delete.`;
    const title = 'Delete and Re-create?';
    const confirmed = await showConfirm(msg, title);

    if (!confirmed) return;

    const msg2 = `This is a destructive action and will delete actual cookie and other related site data for ${contexts.length} container${s}! Are you absolutely sure?`;
    const really = await showConfirm(msg2, 'Really Delete and Re-create?');

    if (!really) return;

    const duplicated = await duplicate(contexts, false);
    const refreshed = await del(contexts, false);

    const s1 = refreshed === 1 ? '' : 's';

    const done = `Deleted ${duplicated} and re-created ${refreshed} container${s1}.`;

    help(done);
    await showAlert(done, 'Deleted and Recreated');
};


/**
 * Empties out the list of contexts to act on when the "selection mode" is
 * enabled, and persists the change to the configuration.
 */
export const deselect = async () => {
    const updates: Partial<ExtensionConfig> = {
        selectedContextIndices: {},
        lastSelectedContextIndex: 0,
    };

    await setSettings(updates);
};


/**
 * Actions to perform when an action is completed.
 * @param currentUrl Optional, determines what URL should be considered as
 * "active" when filtering containers
 */
export const actionCompletedHandler = async (currentUrl: string) => {
    const stay = await getSetting(CONF.windowStayOpenState) as boolean;

    // decide to close the extension or not at the last step
    if (!stay) {
        window.close();
        return;
    }

    filter(null, currentUrl);
}

/**
 * Adds click and other event handlers to a container list item HTML element.
 *
 * TODO: This is the most important function and should definitely be broken down
 * and unit tested.
 *
 * @param filteredResults A list of the currently filtered set of `browser.contextualIdentities`
 * @param context The `contextualIdentity` associated with this handler, assume that a user clicked on a specific container to open if this is defined
 * @param event The event that called this function, such as a key press or mouse click
 */
export const containerClickHandler = async (
    filtered: browser.contextualIdentities.ContextualIdentity[],
    clicked: browser.contextualIdentities.ContextualIdentity,
    event: MouseEvent | KeyboardEvent,
) => {
    // start by processing a few options based on event data
    let ctrlModifier = false;
    let shiftModifier = false;
    if (event) {
        if (event.getModifierState('Control') || event.getModifierState('Meta')) {
            ctrlModifier = true;
        }
        if (event.getModifierState('Shift')) {
            shiftModifier = true;
        }
    }

    const selectionMode = await getSetting(CONF.selectionMode) as boolean;
    const selected = await getSetting(CONF.selectedContextIndices) as SelectedContextIndex;
    const prev = await getSetting(CONF.lastSelectedContextIndex) as number;

    // if "selectionMode" has been turned on...
    if (selectionMode && ctrlModifier) {

        // determine the index of the context that was selected
        for (let i = 0; i < filtered.length; i++) {

            // initialize the the list of indices if there isn't a value there
            if (selected[i] !== 1 && selected[i] !== 0) {
                selected[i] = 0;
            }

            // take note of the currently selected index
            if (filtered[i].cookieStoreId === clicked.cookieStoreId) {

                await setSettings({ lastSelectedContextIndex: i });

                // toggle the currently selected index unless the shift key is pressed
                if (!shiftModifier) {
                    if (selected[i] === 1) {
                        selected[i] = 0;
                    } else {
                        selected[i] = 1;
                    }
                } else {
                    // if shift+ctrl is pressed, then invert the current
                    // selection, and then also set the rest of the
                    // range from the last click to the same value
                    let newVal = 0;
                    if (selected[i] === 1) {
                        newVal = 0;
                    } else {
                        newVal = 1;
                    }
                    if (prev < i) {
                        for (let j = prev; j <= i; j++) {
                            selected[j] = newVal;
                        }
                    } else if (prev > i) {
                        for (let j = prev; j >= i; j--) {
                            selected[j] = newVal;
                        }
                    } else {
                        selected[i] = newVal;
                    }
                }
            }
        }

        await setSettings({ selectedContextIndices: selected });

        reflectSelected(selected);

        return;
    }

    let contexts: browser.contextualIdentities.ContextualIdentity[] = [];
    if (isAnyContextSelected(selected)) {
        const keys = Object.keys(selected);
        for (let i = 0; i < keys.length; i++) {
            if (selected[i] === 1) {
                contexts.push(filtered[i]);
            }
        }
    } else {
        // determine how many containers to modify
        if (shiftModifier) {
            contexts.push(...filtered);
        } else {
            clicked ? contexts.push(clicked) : contexts.push(filtered[0]);
        }
    }

    try {
        const tabs = await browser.tabs.query({ currentWindow: true, active: true });
        for (const tab of tabs) {
            if (!tab.active) continue;

            let navigatedUrl = '';

            // decision tree
            const mode = await getSetting(CONF.mode) as MODES;
            switch (mode) {
                case MODES.SET_NAME:
                    await rename(contexts);
                    break;
                case MODES.DELETE:
                    await del(contexts);
                    await deselect();
                    break;
                case MODES.REFRESH:
                    await refresh(contexts);
                    await deselect();
                    break;
                case MODES.SET_URL:
                    await setUrlsPrompt(contexts);
                    break;
                case MODES.SET_COLOR:
                    await setColors(contexts);
                    break;
                case MODES.SET_ICON:
                    await setIcons(contexts);
                    break;
                case MODES.REPLACE_IN_NAME:
                    await replaceInName(contexts);
                    break;
                case MODES.REPLACE_IN_URL:
                    await replaceInUrls(contexts);
                    break;
                case MODES.DUPLICATE:
                    await duplicate(contexts);
                    await deselect();
                    break;
                case MODES.OPEN:
                    // the following code exists because in sticky popup mode,
                    // the current tab url changes to blank at first, and
                    // filter() will not show the URL overrides.
                    // So we have to look at the last container in the array
                    // and force filter() to treat that URL as the
                    // active tab URL
                    if (!contexts.length) {
                        await showAlert('There are no containers to open.', 'Warning');
                        await actionCompletedHandler(navigatedUrl);
                        return;
                    }

                    // validate that each container has a cookie store ID
                    for (const context of contexts) {
                        if (!context?.cookieStoreId) {
                            await showAlert(`A container you attempted to open has an invalid configuration: ${JSON.stringify(context)}`, 'Cannot Open Container');
                            await actionCompletedHandler(navigatedUrl);
                            return;
                        }
                    }

                    const last = contexts[contexts.length - 1];

                    const urls = await getSetting(CONF.containerDefaultUrls) as ContainerDefaultURL;
                    const openCurrentTabUrlOnMatch = await getSetting(CONF.openCurrentTabUrlOnMatch) as UrlMatchTypes;

                    // the last container opened will be used as the last URL;
                    // this will be passed into the actionCompletedHandler. I had
                    // to choose something to put here, and the last URL makes the
                    // most sense.
                    navigatedUrl = urls[last.cookieStoreId];

                    // TODO: this is refactorable logic copy/pasted from open()
                    if (openCurrentTabUrlOnMatch && tab.url) {
                        const overriddenUrlToOpen = getCurrentTabOverrideUrl(
                            navigatedUrl,
                            tab.url,
                            openCurrentTabUrlOnMatch,
                        );

                        if (overriddenUrlToOpen) {
                            navigatedUrl = overriddenUrlToOpen;
                        }
                    }

                    // override the URL if the user has elected to open the current page
                    // for all filtered tabs
                    const openCurrentPage = await getSetting(CONF.openCurrentPage) as boolean;
                    if (openCurrentPage && tab.url) {
                        navigatedUrl = tab.url;
                    }

                    await open(contexts, ctrlModifier, tab);
                    break;
                default:
                    break;
            }
            await actionCompletedHandler(navigatedUrl);
            break;
        }
    } catch (err) {
        await showAlert(
            `Failed to execute action on one or more containers: ${err}`,
            'Execution Error',
        )
        return;

    }
};

/**
 * Applies the user's search query, and updates the list of containers accordingly.
 * @param event The event that called this function, such as a key press or mouse click
 * @param actualTabUrl When in sticky popup mode, when opening a new URL, the new tab page might not be loaded yet, so the tab query returns an empty URL. actualTabUrl allows a URL to be passed in in advance, so that the extension can properly show URL overrides in the UI.
 */
export const filter = async (
    event?: Event | KeyboardEvent | MouseEvent | null,
    actualTabUrl?: string | null,
) => {
    if (event) event.preventDefault();

    // retrieve the search query from the user
    const searchInput = document.getElementById("searchContainerInput") as HTMLInputElement;
    const userQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (userQuery !== await getSetting(CONF.lastQuery)) {
        // the query has changed, so reset any items the user has selected
        await deselect();
    }

    await setSettings({ lastQuery: userQuery });

    try {
        const contexts = await browser.contextualIdentities.query({});
        const tabs = await browser.tabs.query({ currentWindow: true, active: true });
        for (const tab of tabs) {
            if (!tab.active) continue;

            if (!Array.isArray(contexts)) {
                reflectSelected(await getSetting(CONF.selectedContextIndices));
                break;
            }

            const results: browser.contextualIdentities.ContextualIdentity[] = [];

            const containerList = document.getElementById(CONTAINER_LIST_DIV_ID) as HTMLDivElement;
            if (!containerList) {
                throw `Failed to find ${CONTAINER_LIST_DIV_ID} HTML element`;
            }

            // prepare by clearing out the old query's HTML output
            removeExistingContainerListGroupElement(containerList);

            // now build its successor
            const ul = buildContainerListGroupElement();

            const lowerCaseUserQuery = userQuery.toLowerCase();

            // in order to enable sorting, we have to do multiple
            // passes at the contexts array.

            // first, apply filtering directly:
            const urls = await getSetting(CONF.containerDefaultUrls) as ContainerDefaultURL;
            for (const context of contexts) {
                const lowerCaseContextName = context.name.toLowerCase();
                const queryNameMatch = isUserQueryContextNameMatch(lowerCaseContextName, lowerCaseUserQuery);
                const queryUrlMatch = queryUrls(context, lowerCaseUserQuery, urls);
                const emptyQuery = !userQuery;

                if (emptyQuery || queryNameMatch || queryUrlMatch) {
                    results.push(context);
                }
            }

            // second, sort according to the user-configured sort:
            const sort = await getSetting(CONF.sort) as SortModes;

            results.sort((a: browser.contextualIdentities.ContextualIdentity, b: browser.contextualIdentities.ContextualIdentity) => {
                const urlA: string = (urls[a.cookieStoreId] || "").toLowerCase();
                const urlB: string = (urls[b.cookieStoreId] || "").toLowerCase();
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                switch (sort) {
                    case SORT_MODE_NAME_ASC:
                        return nameA.localeCompare(nameB);
                    case SORT_MODE_NAME_DESC:
                        return nameB.localeCompare(nameA);
                    case SORT_MODE_URL_ASC:
                        return urlA.localeCompare(urlB);
                    case SORT_MODE_URL_DESC:
                        return urlB.localeCompare(urlA);
                    case SORT_MODE_NONE:
                    default:
                        return 0;
                }
            })

            if (sort === SORT_MODE_NONE_REVERSE) {
                results.reverse();
            }

            // finally, propagate the sorted results to the UI:
            const mode = await getSetting(CONF.mode) as MODES;

            for (let i = 0; i < results.length; i++) {
                const context = results[i];

                const li = await buildContainerListItem(
                    results,
                    context,
                    i,
                    tab,
                    actualTabUrl || "",
                    mode,
                    containerClickHandler,
                );
                ul.appendChild(li);
            }

            if (results.length === 0) {
                const li = buildContainerListItemEmpty(0);
                ul.append(li);
            }

            containerList.appendChild(ul);

            bottomHelp(`Showing ${results.length}/${contexts.length} containers.`);

            if (event) {
                try {
                    const keyboardEvent = event as KeyboardEvent;
                    if (keyboardEvent.key === 'Enter' && results.length > 0) {
                        containerClickHandler(results, results[0], keyboardEvent);
                    }
                } catch (err) {
                    console.log('keyboard event assertion or key code check did not succeed; this is probably fine');
                }

                event.preventDefault();
            }

            reflectSelected(await getSetting(CONF.selectedContextIndices));

            break;
        }
    } catch (err) {
        await showAlert(`Failed to filter the list of containers: ${err}`, 'Filter Error');
        return;
    }
}

/**
 * When a user checks a checkbox, this function toggles that value in the
 * `config` object, as well as setting all of the other mutually exclusive
 * options to `false`. It will also update the UI checkboxes to reflect the
 * values.
 *
 * @param key The `ExtensionConfig` key to toggle.
 */
export const toggleConfigFlag = async (key: CONF) => {
    const el = document.getElementById(`${key}`);
    if (!el) {
        await showAlert(`A checkbox with ID ${key} could not be found.`, 'Config Update Error');
        return;
    }

    const checkbox = el as HTMLInputElement;

    const original = await getSetting(key) as boolean;

    const updates: any = {};

    updates[key] = !original;

    await setSettings(updates as Partial<ExtensionConfig>);

    // retrieve the value from storage after it has been set to confirm that
    // it was pushed successfully, to accurately reflect its value in the UI
    const updated = await getSetting(key) as boolean;

    checkbox.checked = updated;
}

/**
 * Retrieves extension settings from browser storage and reflects their values
 * in UI elements.
 */
export const reflectSettings = async () => {
    const modeSelectEl = document.getElementById('modeSelect');
    const sortModeSelectEl = document.getElementById('sortModeSelect');
    const windowStayOpenStateEl = document.getElementById('windowStayOpenState');
    const selectionModeEl = document.getElementById('selectionMode');
    const openCurrentPageEl = document.getElementById('openCurrentPage');
    const searchContainerInputEl = document.getElementById('searchContainerInput');

    if (!modeSelectEl) {
        throw 'The modeSelect element could not be found.';
    }
    if (!sortModeSelectEl) {
        throw 'The sortModeSelect element could not be found.';
    }
    if (!windowStayOpenStateEl) {
        throw 'The windowStayOpenState element could not be found.';
    }
    if (!selectionModeEl) {
        throw 'The selectionMode element could not be found.';
    }
    if (!openCurrentPageEl) {
        throw 'The openCurrentPage element could not be found.';
    }
    if (!searchContainerInputEl) {
        throw 'The searchContainerInput element could not be found.';
    }

    const modeSelect = modeSelectEl as HTMLSelectElement;
    const sortModeSelect = sortModeSelectEl as HTMLSelectElement;
    const windowStayOpenState = windowStayOpenStateEl as HTMLInputElement;
    const selectionMode = selectionModeEl as HTMLInputElement;
    const openCurrentPage = openCurrentPageEl as HTMLInputElement;
    const searchContainerInput = searchContainerInputEl as HTMLInputElement;

    const settings = await getSettings();

    for (const key of Object.keys(settings)) {
        switch (key) {
            case CONF.mode:
                modeSelect.value = settings[key] as string;
                break;
            case CONF.sort:
                sortModeSelect.value = settings[key] as string;
                break;
            case CONF.windowStayOpenState:
                windowStayOpenState.checked = settings[key] as boolean;
                break;
            case CONF.selectionMode:
                selectionMode.checked = settings[key] as boolean;
                break;
            case CONF.openCurrentPage:
                openCurrentPage.checked = settings[key] as boolean;
                break;
            case CONF.lastQuery:
                searchContainerInput.value = settings[key] as string;
                break;
            case CONF.containerDefaultUrls: // no UI elements for this currently
            default:
                break;
        }
    }
};

/**
 * When the user changes the current mode, this function sets the stored
 * configuration value accordingly.
 * @param mode The mode to set.
 */
export const setMode = async (mode: string | MODES) => {
    switch (mode) {
        case MODES.OPEN:
        case MODES.SET_URL:
        case MODES.SET_NAME:
        case MODES.SET_COLOR:
        case MODES.SET_ICON:
        case MODES.REPLACE_IN_NAME:
        case MODES.REPLACE_IN_URL:
        case MODES.DUPLICATE:
        case MODES.DELETE:
        case MODES.REFRESH:
            await setSettings({ mode: mode });
            break;
        default:
            await showAlert(`Invalid mode '${mode}'.`, 'Invalid Mode');
            return;
    }

    await helpful();
};

/**
 * When the user changes the current sort mode, this function sets the stored
 * configuration value accordingly.
 * @param mode The mode to set.
 */
export const setSortMode = async (mode: string | SortModes) => {
    switch (mode) {
        case SortModes.NameAsc:
        case SortModes.NameDesc:
        case SortModes.None:
        case SortModes.NoneReverse:
        case SortModes.UrlAsc:
        case SortModes.UrlDesc:
            await setSettings({ sort: mode });
            break;
        default:
            await showAlert(`Invalid sort mode '${mode}'.`, 'Invalid Sort Mode');
            return;
    }
};
