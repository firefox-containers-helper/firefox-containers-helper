import { showAlert, showConfirm, showPrompt } from "./modules/modals";
import { ExtensionConfig } from './types';
import {
    CONTEXT_ICONS,
    CONTEXT_COLORS,
    MODES,
    PlatformModifierKey,
    helpTextMessages,
    SORT_MODE_NAME_ASC,
    SORT_MODE_NAME_DESC,
    SORT_MODE_NONE,
    SORT_MODE_NONE_REVERSE,
    SORT_MODE_URL_ASC,
    SORT_MODE_URL_DESC,
    containerListItemUrlLabel,
    containerListItemUrlLabelInverted,
    CONTAINER_LIST_DIV_ID,
    UrlMatchTypes,
    SortModes,
} from './modules/constants';
import {
    containerListItemSelectedClassNames,
    containerListItemInactiveClassNames,
    containerListItemActiveDangerClassNames,
    containerListItemActiveClassNames
} from "./modules/classes";
import { getCurrentTabOverrideUrl } from "./modules/helpers";

let config: ExtensionConfig = {
    windowStayOpenState: true,
    selectionMode: false,
    sort: SORT_MODE_NONE,
    openCurrentPage: false,
    mode: MODES.OPEN,
    lastQuery: "",
    containerDefaultUrls: {},
    selectedContextIndices: {},
    lastSelectedContextIndex: -1,
    alwaysGetSync: false,
    alwaysSetSync: false,
    neverConfirmOpenNonHttpUrls: false,
    neverConfirmSaveNonHttpUrls: false,
    openCurrentTabUrlOnMatch: UrlMatchTypes.empty,
};

/**
 * Quickly checks to see if a context is selected, via the selection mode
 * @param i The index of a particular context within the array of filteredContexts
 * @returns Whether or not the current context is selected
 */
const isContextSelected = (i: number): boolean => {
    if (config.selectedContextIndices[i] === 1) {
        return true;
    }
    return false;
}

/**
 * Quickly checks to see if *any* context is selected, via the selection mode
 * @returns Whether or not *any* current context is selected
 */
const isAnyContextSelected = (): boolean => {
    const keys = Object.keys(config.selectedContextIndices);
    for (let i = 0; i < keys.length; i++) {
        const key = parseInt(keys[i], 10);
        if (config.selectedContextIndices[key] === 1) {
            return true;
        }
    }
    return false;
}

/**
 * Sets the proper class names for filtered contexts that are either selected
 * or not
 */
const setSelectedListItemClassNames = () => {
    const keys = Object.keys(config.selectedContextIndices);
    for (let i = 0; i < keys.length; i++) {
        const liElement = document.getElementById(`filtered-context-${i}-li`);
        const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);
        if (config.selectedContextIndices[i] === 1) {
            if (liElement) {
                liElement.className = containerListItemSelectedClassNames;
            }
            if (urlLabel) {
                urlLabel.className = containerListItemUrlLabelInverted;
            }
        } else {
            if (liElement) {
                liElement.className = containerListItemInactiveClassNames;
            }
            if (urlLabel) {
                urlLabel.className = containerListItemUrlLabel;
            }
        }
    }
}

/**
 * Assembles an HTML element that contains the colorized container icon for a given container.
 * context - The container that this icon element will represent
 * @returns An HTML element containing the colorized container icon for `context`.
 */
const buildContainerIconElement = (context: browser.contextualIdentities.ContextualIdentity): HTMLElement => {
    const containerIconHolderElement = document.createElement('div');
    containerIconHolderElement.className = 'icon';
    addEmptyEventListenersToElement(containerIconHolderElement);

    const containerIconElement = document.createElement('i');
    containerIconElement.style.backgroundImage = `url(${context.iconUrl})`;
    containerIconElement.style.filter = `drop-shadow(${context.colorCode} 16px 0)`;
    addEmptyEventListenersToElement(containerIconElement);

    containerIconHolderElement.appendChild(containerIconElement);

    return containerIconHolderElement;
};

/**
 * Assembles an HTML element that contains a text label for a given container.
 * context - The contextualIdentity that this text element will represent
 * @param i The index of this contextualIdentity within the filteredResults array
 * @param currentTab The currently active tab. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
 * @param actualCurrentUrl The URL that the current tab is supposed to be loading.
 * @returns An HTML element containing text that represents the
 * container's name and default URL, if defined.
 */
const buildContainerLabelElement = (
    context: browser.contextualIdentities.ContextualIdentity,
    i: number,
    currentTab: browser.tabs.Tab,
    actualCurrentUrl: string,
): HTMLElement => {
    const containerLabelDivHoldingElement = document.createElement('div');
    containerLabelDivHoldingElement.className = 'container-list-text d-flex flex-column justify-content-center align-items-baseline px-3';

    const containerLabelElement = document.createElement('span');
    containerLabelElement.innerText = `${context.name}`;

    const containerUrlLabelElement = document.createElement('span');
    containerUrlLabelElement.className = containerListItemUrlLabel;
    containerUrlLabelElement.id = `filtered-context-${i}-url-label`;
    const contextDefaultUrl = config.containerDefaultUrls[context.cookieStoreId.toString() || ""];
    if (contextDefaultUrl) {
        if (config.openCurrentTabUrlOnMatch && (currentTab || actualCurrentUrl)) {
            // if the current tab isn't loaded yet, the url might be empty,
            // but we are supposed to be navigating to a page
            let currentUrl = currentTab.url || "";
            if (actualCurrentUrl) {
                currentUrl = actualCurrentUrl;
            }
            const overrideUrl = getCurrentTabOverrideUrl(contextDefaultUrl, currentUrl, config.openCurrentTabUrlOnMatch);
            if (overrideUrl && overrideUrl !== contextDefaultUrl) {
                containerUrlLabelElement.innerHTML = `<s>${contextDefaultUrl.substr(0, 40)}</s><br/>${config.openCurrentTabUrlOnMatch} match, will open in this URL:<br/>${overrideUrl.substr(0, 40)}`;
            } else {
                containerUrlLabelElement.innerText = `${contextDefaultUrl.substr(0, 40)}`;
            }
        } else {
            containerUrlLabelElement.innerText = `${contextDefaultUrl.substr(0, 40)}`;
        }

    }

    // similar to the above - if the "openCurrentPage" config option has been selected,
    // then we should override all URL's, as a finality
    if (config.openCurrentPage && (currentTab || actualCurrentUrl)) {
        // TODO: bit of refactoring would be nice since I just copy/pasted
        // this from above

        // if the current tab isn't loaded yet, the url might be empty,
        // but we are supposed to be navigating to a page
        let currentUrl = currentTab.url || "";
        if (actualCurrentUrl) {
            currentUrl = actualCurrentUrl;
        }

        containerUrlLabelElement.innerHTML = `${currentUrl.substr(0, 40)}${currentUrl.length > 40 ? '...' : ''}`;
    }

    addEmptyEventListenersToElement(containerLabelElement);
    addEmptyEventListenersToElement(containerUrlLabelElement);
    addEmptyEventListenersToElement(containerLabelDivHoldingElement);

    containerLabelDivHoldingElement.appendChild(containerLabelElement);
    containerLabelDivHoldingElement.appendChild(containerUrlLabelElement);

    return containerLabelDivHoldingElement;
};

/**
 * Assembles an HTML element that contains a text label for empty search results.
 * @returns An HTML element containing text that represents the
 * container's name and default URL, if defined.
 */
const buildEmptyContainerLabelElement = (label: string): HTMLElement => {
    const containerLabelDivHoldingElement = document.createElement('div');
    containerLabelDivHoldingElement.className = 'container-list-text d-flex flex-column justify-content-center align-items-baseline px-3';

    const containerLabelElement = document.createElement('span');
    containerLabelElement.innerText = `${label}`;

    addEmptyEventListenersToElement(containerLabelElement);
    addEmptyEventListenersToElement(containerLabelDivHoldingElement);

    containerLabelDivHoldingElement.appendChild(containerLabelElement);

    return containerLabelDivHoldingElement;
};

/**
 * Adds click and other event handlers to a container list item HTML element.
 * @param liElement The container list item that will receive all event listeners
 * @param filteredResults A list of the currently filtered set of browser.contextualIdentities
 * @param context The contextualIdentity that this list item will represent
 * @param i The index of this contextualIdentity within the filteredResults array
 * @returns Any error message, or empty string if no errors occurred.
 */
const applyEventListenersToContainerListItem = (
    liElement: HTMLElement,
    filteredResults: browser.contextualIdentities.ContextualIdentity[],
    context: browser.contextualIdentities.ContextualIdentity,
    i: number,
): string => {
    try {
        liElement.addEventListener('mouseover', (event: MouseEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            if (config.mode === MODES.DELETE) {
                target.className = containerListItemActiveDangerClassNames;
                return;
            }

            target.className = containerListItemActiveClassNames;
            const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);
            if (urlLabel) {
                urlLabel.className = containerListItemUrlLabelInverted;
            }
        });
        liElement.addEventListener('mouseleave', (event: MouseEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);

            if (isContextSelected(i)) {
                target.className = containerListItemSelectedClassNames;
                if (urlLabel) {
                    urlLabel.className = containerListItemUrlLabelInverted;
                }

                return;
            }

            target.className = containerListItemInactiveClassNames;
            if (urlLabel) {
                urlLabel.className = containerListItemUrlLabel;
            }
        });
        liElement.addEventListener('click', (event: MouseEvent) => containerClickHandler(filteredResults, context, event));
        liElement.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                containerClickHandler(filteredResults, context, event);
            }
        });
        liElement.addEventListener('onfocus', (event: Event) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            if (config.mode === MODES.DELETE) {
                target.className = containerListItemActiveDangerClassNames;
                return;
            }

            target.className = containerListItemActiveClassNames;
            const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);
            if (urlLabel) {
                urlLabel.className = containerListItemUrlLabel;
            }
        });
        liElement.addEventListener('blur', (event: FocusEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            if (isContextSelected(i)) {
                target.className = containerListItemSelectedClassNames;
                return;
            }

            target.className = containerListItemInactiveClassNames;
            const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);
            if (urlLabel) {
                urlLabel.className = containerListItemUrlLabel;
            }
        });

        return "";
    } catch (e) {
        return `failed to apply an event listener: ${JSON.stringify(e)}`;
    }
};

/**
 * Assembles an HTML element that contains an entire container list item.
 * @param filteredResults A list of the currently filtered set of browser.contextualIdentities
 * @param context The contextualIdentity that this list item will represent
 * @param i The index of this contextualIdentity within the filteredResults array
 * @param currentTab The currently active tab. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
 * @param actualCurrentUrl The URL that the current tab is supposed to be loading.
 * @returns An HTML element with event listeners, formatted with css as a bootstrap list item.
 */
const buildContainerListItem = (
    filteredResults: browser.contextualIdentities.ContextualIdentity[],
    context: browser.contextualIdentities.ContextualIdentity,
    i: number,
    currentTab: browser.tabs.Tab,
    actualCurrentUrl: string,
) => {
    const liElement = document.createElement('li');
    liElement.className = "list-group-item d-flex justify-content-space-between align-items-center";

    const containerIconHolderElement = buildContainerIconElement(context);
    const containerLabelElement = buildContainerLabelElement(context, i, currentTab, actualCurrentUrl);

    if (config.mode === MODES.DELETE) {
        const divElement = document.createElement('div');
        divElement.className = "d-flex justify-content-center align-items-center align-content-center";
        divElement.id = `filtered-context-${i}-div`;
        addEmptyEventListenersToElement(divElement);
        divElement.appendChild(containerIconHolderElement);
        liElement.appendChild(divElement);
    } else {
        liElement.appendChild(containerIconHolderElement);
    }

    liElement.appendChild(containerLabelElement);

    containerIconHolderElement.id = `filtered-context-${i}-icon`;
    containerLabelElement.id = `filtered-context-${i}-label`;
    liElement.id = `filtered-context-${i}-li`;

    const err = applyEventListenersToContainerListItem(liElement, filteredResults, context, i);
    if (err) {
        // TODO: localization refactor
        showAlert(`encountered error building list item for container ${context.name}: ${err}`, 'Error');
    }

    return liElement;
};

/**
 * Assembles an HTML element that represents empty search results, but appears
 * similar to an actual search result.
 * @param i A unique value that will make the class/id of the element unique
 * @returns An HTML element with event listeners, formatted with css as a bootstrap list item.
 */
const buildEmptyContainerListItem = (i: number): HTMLElement => {
    const liElement = document.createElement('li');
    liElement.className = "list-group-item d-flex justify-content-space-between align-items-center";

    const labelElement = buildEmptyContainerLabelElement('No results');

    const xIconElement = document.createElement('span');
    xIconElement.className = 'mono-16';
    xIconElement.innerText = "x";

    liElement.appendChild(xIconElement);
    liElement.appendChild(labelElement);

    labelElement.id = `filtered-context-${i}-label`;
    liElement.id = `filtered-context-${i}-li`;

    return liElement;
};


/**
 * When mousing over a list item, child elements can
 * mess up the way classes are set upon mouseover/mouseleave.
 * This fixes that.
 * @param event The event that was created when the user performed some interaction with the document.
 */
const haltingCallback = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
}

/**
 * When mousing over a list item, child elements can
 * mess up the way classes are set upon mouseover/mouseleave.
 * This fixes that by applying the haltingCallback event handler to a few
 * events such as mouseover and mouseleave.
 * @param element The HTML element that will receive generic event listeners.
 */
const addEmptyEventListenersToElement = (element: HTMLElement) => {
    element.addEventListener('mouseover', haltingCallback);
    element.addEventListener('mouseleave', haltingCallback);
};

/**
 * Sets a message inside the "warning" text element.
 * @param message The HTML string to put inside the warning text element.
 */
const setHelpText = (message: string) => {
    let msg = message;
    if (!message) {
        // TODO: make this more clean
        const rngHelpMsgIndex = parseInt((Math.random() * helpTextMessages.length).toString(), 10) || 0;
        msg = helpTextMessages[rngHelpMsgIndex];
    }

    const helpTextEl = document.getElementById('helpText');
    if (!helpTextEl) return;

    helpTextEl.innerText = msg;
};

/**
 * Sets a message inside the "summary" text element, such as "Showing x/y containers"
 * @param message The HTML string to put inside the summary text element.
 */
const setSummaryText = (message: string) => {
    const summary = document.getElementById('summaryText');
    if (!summary) return;

    summary.innerText = message;
}

/**
 * Sets focus to the search box. Should be called often, especially on popup.
 */
const focusSearchBox = () => {
    const search = document.getElementById('searchContainerInput');
    if (!search) return;

    search.focus();
}

/**
 * Persists container default URL configuration data to extension storage.
 */
const writeContainerDefaultUrlsToStorage = async () => {
    try {
        await browser.storage.local.set({ "containerDefaultUrls": config.containerDefaultUrls });

        if (config.alwaysSetSync === true) {
            await browser.storage.sync.set({ "containerDefaultUrls": config.containerDefaultUrls });
        }
    } catch (err) {
        if (err) {
            showAlert(`Error saving container URLs: ${JSON.stringify(err)}`, 'Save Error');
            return;
        }
        showAlert(`An unknown error occurred when saving container URLs.`, 'Save Error');
        return;
    }
}

/**
 * Actions to perform when an action is completed.
 * @param currentUrl Optional, determines what URL should be
 * considered as "active" when filtering containers
 */
const actionCompletedHandler = (currentUrl: string) => {
    // decide to close the extension or not at the last step
    if (config.windowStayOpenState === false) {
        window.close();
        return;
    }

    filterContainers(null, currentUrl);
}

/**
 * Checks if a given container's `contextualIdentity` (`context`) has a default
 * URL value set in `config.containerDefaultUrls`.
 * @param context The context for a container, straight from `browser.contextualIdentities`
 * @param userQuery The text that the user has searched for
 * @returns Whether or not the container `context` has a default URL set
 */
const checkDefaultUrlsForUserQuery = (context: browser.contextualIdentities.ContextualIdentity, query: string) => {
    const lookup = config.containerDefaultUrls[context.cookieStoreId.toString() || ""];
    if (!lookup) return false;

    if (lookup.toString().toLowerCase().indexOf(query) !== -1) {
        return true;
    }

    return false;
}

/**
 * Asks if the user wants to delete multiple containers, and executes if the user says so.
 * @param contexts The `contextualIdentity` array to possibly be deleted.
 */
const deleteMultipleContainers = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    // selection mode can sometimes lead to contexts that don't exist,
    // so we will filter out contexts that are undefined
    const toDelete: browser.contextualIdentities.ContextualIdentity[] = [];

    let deleteAllStr = `Are you sure you want to delete ${contexts.length} container(s)?\n\n`;

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
        // TODO: localization refactor
        showAlert(
            `There aren't any valid targets to delete, so there is nothing to do.`,
            'Nothing to Delete',
        );

        return;
    }

    if (!await showConfirm(deleteAllStr, 'Delete Containers?')) return;

    const deleteLenStr = `Are you absolutely sure you want to delete ${toDelete.length} container(s)? This is not reversible.`;

    if (!await showConfirm(deleteLenStr, 'Confirm Delete?')) return;

    // proceed to delete every context
    const deleted = [];

    for (const context of toDelete) {
        try {
            const d = await browser.contextualIdentities.remove(context.cookieStoreId);
            deleted.push(d);

            setHelpText(`Deleted ${deleted.length}/${toDelete.length} container(s)`);

            // TODO: investigate if these needs to be called repeatedly or only just once
            resetSelectedContexts();
        } catch (err) {
            if (!err) {
                showAlert(
                    `An unknown error occurred when attempting to delete container ${context.name}.`,
                    'Deletion Error',
                )

                return;
            }

            showAlert(
                `Error deleting container ${context.name}: ${JSON.stringify(err)}`,
                'Deletion Error',
            );

            return;
        }
    }

    showAlert(`Deleted ${deleted.length}/${toDelete.length} container(s).`, 'Completed');
};

/** Associates a default URL to each container. */
const setMultipleDefaultUrls = async (contexts: browser.contextualIdentities.ContextualIdentity[], url: string) => {
    if (!url) {
        showAlert('Please provide a non-empty URL, or type "none" without quotes to clear URL values.', 'Invalid Input');
        return;
    }

    // TODO: localization refactor
    const clear = url === "none";
    const requireHTTP = !config.neverConfirmSaveNonHttpUrls;
    const noHTTPS = url.indexOf(`https://`) !== 0;
    const noHTTP = url.indexOf(`http://`) !== 0;
    // TODO: localization refactor
    const question = 'Warning: URL\'s should start with "http://" or "https://". Firefox likely will not correctly open pages otherwise. If you would like to proceed, please confirm.\n\nThis dialog can be disabled in the extension options page.';

    if (requireHTTP && noHTTPS && noHTTP && !await showConfirm(question, 'Allow Any Protocol?')) return;

    for (const context of contexts) {
        if (clear) {
            delete config.containerDefaultUrls[context.cookieStoreId.toString()];
            continue;
        }

        config.containerDefaultUrls[context.cookieStoreId.toString()] = url;
    }

    await writeContainerDefaultUrlsToStorage();
}

/**
 * Requests a default URL from the user, and assigns that URL to every given container.
 */
const setMultipleDefaultUrlsWithPrompt = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const question = `What should the default URL be for ${contexts.length} container(s)?\n\nType "none" (without quotes) to clear the saved default URL value(s).`;
    const url = await showPrompt(question, 'Provide URL');

    if (url) {
        await setMultipleDefaultUrls(contexts, url);
    }
};

/**
 * Opens multiple container tabs according to controllable conditions.
 * @param contexts The `contextualIdentity` array that will each open as a container tab.
 * @param pinned Whether or not to open as a pinned tab.
 * @param tab The currently active tab. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
 */
const openMultipleContexts = async (
    contexts: browser.contextualIdentities.ContextualIdentity[],
    pinned: boolean,
    tab: browser.tabs.Tab,
) => {
    const question = `Are you sure you want to open ${contexts.length} container tabs?`;
    const isMany = contexts.length >= 10;

    if (isMany && !await showConfirm(question, 'Open Many?')) return;

    if (contexts.length === 0) return;

    // TODO: refactor this into a friendly helper function
    const requireHTTP = !config.neverConfirmSaveNonHttpUrls;

    // iterate through the list to check if there is at least one URL that
    // uses a non-HTTP protocol
    // for (const context of contexts) {
    //     let url = config.containerDefaultUrls[context.cookieStoreId];

    //     const noHTTPS = url.indexOf(`https://`) !== 0;
    //     const noHTTP = url.indexOf(`http://`) !== 0;

    //     if (requireHTTP && noHTTPS && noHTTP) {
    //         const q = `Warning: The URL "${url}" does not start with "http://" or "https://". This may cause undesirable behavior. Proceed to open a tab with this URL?\n\nThis dialog can be disabled in the extension options page.`;
    //         if (!confirm(q)) return;
    //         break; // only need to prompt the user once
    //     }
    // }

    let shouldPrompt = true;

    for (const context of contexts) {
        let url = config.containerDefaultUrls[context.cookieStoreId] || "";

        // requested in
        // https://github.com/cmcode-dev/firefox-containers-helper/issues/29
        if (config.openCurrentTabUrlOnMatch && tab.url) {
            const overrideUrl = getCurrentTabOverrideUrl(url, tab.url, config.openCurrentTabUrlOnMatch);
            if (overrideUrl) {
                url = overrideUrl;
            }
        }

        // requested in
        // https://github.com/cmcode-dev/firefox-containers-helper/issues/31
        if (tab.url && config.openCurrentPage) {
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
                const q = `Warning: The URL "${url}" does not start with "http://" or "https://". This may cause undesirable behavior. Proceed to open a tab with this URL?\n\nThis dialog can be disabled in the extension options page.`;
                if (!await showConfirm(q, 'Allow Any Protocol?')) return;
                // only need to prompt the user once
                shouldPrompt = false;
            }

            if (!empty) {
                newTab.url = url;
            }

            await browser.tabs.create(newTab);
        } catch (err) {
            if (err) {
                // TODO: localization refactor
                showAlert(`Failed to open container '${context.name}' with URL ${url}: ${JSON.stringify(err)}`, 'Error Opening Tab');
                return;
            }
            // TODO: localization refactor
            showAlert(`Failed to open container '${context.name}' with URL ${url} due to an unknown error.`, 'Error Opening Tab');
            return;
        }
    }
};

/**
 * Renames one or more contexts.
 * @param contexts The containers to change
 */
const renameContexts = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const rename = await showPrompt(`Rename ${contexts.length} container(s) to:`, 'Rename');
    if (!rename) return;

    const updated: browser.contextualIdentities.ContextualIdentity[] = [];

    for (const context of contexts) {
        try {
            const update = await browser.contextualIdentities.update(
                context.cookieStoreId,
                { "name": rename }
            );

            updated.push(update);
            setHelpText(`Renamed ${updated.length} containers`);
        } catch (err) {
            if (err) {
                showAlert(`Failed to rename container ${context.name}: ${JSON.stringify(err)}`, 'Container Rename Error');
                return;
            }

            showAlert(`Failed to rename container ${context.name} due to an unknown error.`, 'Container Rename Error');
            return;
        }
    }
};

/**
 * Updates one or more contexts simultaneously.
 * @param contexts The container(s) to change
 * @param key The field to set for the context(s)
 * @param value The value to assign to the context(s)' `key` property
 */
const updateContexts = async (contexts: browser.contextualIdentities.ContextualIdentity[], key: string, value: string) => {
    const updated: browser.contextualIdentities.ContextualIdentity[] = [];

    const updates: any = {};
    updates[key] = value;

    for (const context of contexts) {
        try {
            const update = await browser.contextualIdentities.update(
                context.cookieStoreId,
                updates
            );
            updated.push(update);
            setHelpText(`Updated ${updated.length} containers`);
        } catch (err) {
            if (err) {
                showAlert(`Failed to update container ${context.name}: ${JSON.stringify(err)}`, 'Container Update Error');
                return;
            }
            showAlert(`Failed to update container ${context.name} due to an unknown error.`, 'Container Update Error');
            return;
        }
    }
};

/** Sets the color of one or more contexts simultaneously. */
const setColorForContexts = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const msg = `Choose a color for ${contexts.length} containers from the following list:\n\n${CONTEXT_COLORS.join("\n")}`;
    const color = await showPrompt(msg, 'Choose Color');
    if (!color) {
        // TODO: !color is indistinguishable from the user pressing "cancel" at prompt
        // showAlert('Please provide a non-empty, valid color value.', 'Invalid Color');
        return;
    }

    if (CONTEXT_COLORS.indexOf(color) === -1) {
        showAlert(`The value ${color} is not a valid container color.`, 'Invalid Color');
        return;
    }

    await updateContexts(contexts, "color", color);
};

/** Sets the icon of one or more contexts simultaneously. */
const setIconForContexts = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const msg = `Choose an icon for ${contexts.length} containers from the following list:\n\n${CONTEXT_ICONS.join("\n")}`;
    const icon = await showPrompt(msg, 'Choose Icon');

    if (!icon) {
        // TODO: !icon is indistinguishable from the user pressing "cancel" at prompt
        // showAlert('Please provide a non-empty, valid icon value.', 'Invalid Icon');
        return;
    }

    if (CONTEXT_ICONS.indexOf(icon) === -1) {
        showAlert(`The value ${icon} is not a valid container icon.`, 'Invalid Icon');
        return;
    }

    await updateContexts(contexts, "icon", icon);
};

/**
 * Executes a find & replace against either a container name or predefined URL.
 * @param contexts The `contextualIdentities` to change.
 * @param fieldToUpdate The field to set for the context(s)
 * @param valueToSet The value to assign to the context(s)' `fieldToUpdate` property
 */
const findReplaceNameInContexts = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const q1 = `(1/3) What case-sensitive string in ${contexts.length} container name(s) would you like to search for?`;


    const findStr = await showPrompt(q1, 'Search String');
    if (!findStr) return;

    const q2 = '(2/3) What string would you like to replace it with?';
    const replaceStr = await showPrompt(q2, 'Replace String');

    if (!findStr || replaceStr === null) return;

    const q3 = `(3/3) Replace the case-sensitive string "${findStr}" with "${replaceStr}" in the name of ${contexts.length} container(s)?`;

    const userConfirm = await showConfirm(q3, 'Confirm');

    if (!userConfirm) return;

    const updated = [];

    setHelpText(`Updated ${updated.length} containers`); // in case the operation fails

    try {
        for (const context of contexts) {
            // if we want to add case-insensitivity back later, uncomment this
            // const lowerContextName = contextToUpdate.name.toLowerCase();
            // if (lowerContextName.indexOf(findStr) !== -1) {
            // }

            if (context.name.indexOf(findStr) === -1) continue;

            const rename = context.name.replaceAll(findStr, replaceStr);

            const update = await browser.contextualIdentities.update(
                context.cookieStoreId,
                { "name": rename }
            );

            updated.push(update);

            setHelpText(`Updated ${updated.length} containers`);
        };
    } catch (err) {
        if (err) {
            showAlert(`Failed to rename container(s): ${JSON.stringify(err)}`, 'Rename Error');
            return;
        }

        showAlert(`Failed to rename container(s) due to an unknown error.`, 'Rename Error');
        return;
    }
}

/**
 * Executes a find & replace against either a container name or predefined URL.
 * @param contexts The `contextualIdentities` to change.
 */
const findReplaceUrlInContexts = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const q1 = `(1/3) What case-insensitive string in ${contexts.length} container default URL(s) would you like to search for?`;

    const findStr = await showPrompt(q1, 'Search String');
    if (!findStr) return;

    const q2 = '(2/3) What string would you like to replace it with?';

    const replaceStr = await showPrompt(q2, 'Replace String');
    if (!findStr || replaceStr === null) return;

    const q3 = `(3/3) Replace the case-insensitive string "${findStr}" with "${replaceStr}" in the default URL of ${contexts.length} container(s)?`

    const userConfirm = await showConfirm(q3, 'Confirm URL Replace');

    if (!userConfirm) return;

    const updated = [];

    setHelpText(`Updated ${updated.length} containers`); // in case the operation fails

    try {
        for (const context of contexts) {
            // retrieve the lowercase URL for the container by first
            // retrieving its unique ID
            const contextId = context.cookieStoreId;

            const defaultUrlForContext = config.containerDefaultUrls[contextId];

            // check if there is actually a default URL set for this container
            if (defaultUrlForContext) {
                // there is a default URL, so proceed to find, replace &
                // update it
                const lowered = defaultUrlForContext.toLowerCase();

                if (lowered.indexOf(findStr) !== -1) {
                    const newUrlStr = lowered.replaceAll(findStr, replaceStr);

                    config.containerDefaultUrls[contextId] = newUrlStr;

                    updated.push(context);
                }
            }
        }

        // only update storage if needed
        if (updated.length > 0) {
            writeContainerDefaultUrlsToStorage();
            setHelpText(`Updated ${updated.length} containers`);
        }
    } catch (err) {
        if (err) {
            showAlert(`Failed to rename container URL(s): ${JSON.stringify(err)}`, 'Rename Error');
            return;
        }

        showAlert(`Failed to rename container URL(s) due to an unknown error.`, 'Rename Error');
        return;
    }
};

/** Duplicates one or more contexts. */
const duplicateContexts = async (contexts: browser.contextualIdentities.ContextualIdentity[]) => {
    const question = `Are you sure you want to duplicate ${contexts.length} containers?`;

    // only ask if there are multiple containers to duplicate
    if (contexts.length > 1 && !await showConfirm(question, 'Confirm Duplicate')) return;

    let duplicated: browser.contextualIdentities.ContextualIdentity[] = [];
    for (const context of contexts) {
        const newContext = {
            color: context.color,
            icon: context.icon,
            name: context.name
        };

        try {
            const created = await browser.contextualIdentities.create(newContext);
            duplicated.push(created);

            // if the containers have default URL associations, we need to update those too
            const urlToSet = config.containerDefaultUrls[context.cookieStoreId] || "none";

            setMultipleDefaultUrls([created], urlToSet);

            setHelpText(`Duplicated ${duplicated.length} container(s)`);

            // when duplicating, the selected containers need to be deselected,
            // since the indices have changed
            resetSelectedContexts();
        } catch (err) {
            setHelpText(`Duplicated ${duplicated.length} container(s))`);
            if (!err) {
                // TODO: localization refactor
                showAlert(
                    `An unknown error occurred when attempting to duplicate the container ${context.name}.`,
                    'Duplication Error',
                )
                return;
            }
            // TODO: localization refactor
            showAlert(
                `An error occurred when attempting to duplicate the container ${context.name}: ${JSON.stringify(err)}`,
                'Duplication Error',
            )
            return;
        }
    }
};

/** Adds a brand new context (container). */
const addContext = async () => {
    // make sure not to use config.lastQuery here, because it gets trimmed/
    // lowercased. This was a bug identified in:
    // https://github.com/cmcode-dev/firefox-containers-helper/issues/37
    const searchInputEl = document.getElementById('searchContainerInput');
    if (!searchInputEl) {
        showAlert("You must specify a container name in the input field.", 'No Name Provided');
        return;
    }

    // TODO: check that the "as" assertion is valid
    const containerName = (searchInputEl as HTMLInputElement).value;
    if (!containerName) {
        showAlert("An invalid new container name has been provided.", 'Invalid Name Provided');
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
        filterContainers(null, null);
        setHelpText(`Added a container named ${containerName}`);
        resetSelectedContexts();
    } catch (err) {
        if (err) {
            // TODO: localization refactor
            showAlert(
                `Failed to create a container named ${containerName}: ${JSON.stringify(err)}`,
                'Creation Error',
            );
            return;
        }

        // TODO: localization refactor
        showAlert(
            `An unspecified error occurred when creating a container named ${containerName}.`,
            'Creation Error',
        );
    }
};


/**
 * Empties out the list of contexts to act on when the "selection mode" is
 * enabled. A precursor to this is that the config option should have been
 * set before executing this function.
 */
const resetSelectedContexts = () => {
    // reset selectedContextIndices if the selection mode has been turned on
    if (config.selectionMode) {
        config.selectedContextIndices = {};
        config.lastSelectedContextIndex = 0;
    }
};

/**
 * Adds click and other event handlers to a container list item HTML element.
 * @param filteredResults A list of the currently filtered set of `browser.contextualIdentities`
 * @param context The `contextualIdentity` associated with this handler, assume that a user clicked on a specific container to open if this is defined
 * @param event The event that called this function, such as a key press or mouse click
 */
const containerClickHandler = async (
    filteredContexts: browser.contextualIdentities.ContextualIdentity[],
    singleContext: browser.contextualIdentities.ContextualIdentity,
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

    // if "selectionMode" has been turned on...
    if (config.selectionMode && ctrlModifier) {
        const prevSelectedIndex = config.lastSelectedContextIndex;
        // determine the index of the context that was selected
        for (let i = 0; i < filteredContexts.length; i++) {
            // initialize the the list of indices if there isn't a value there
            if (config.selectedContextIndices[i] !== 1 && config.selectedContextIndices[i] !== 0) {
                config.selectedContextIndices[i] = 0;
            }
            // take note of the currently selected index
            if (filteredContexts[i].cookieStoreId === singleContext.cookieStoreId) {
                config.lastSelectedContextIndex = i;
                // toggle the currently selected index unless the shift key is pressed
                if (!shiftModifier) {
                    if (config.selectedContextIndices[i] === 1) {
                        config.selectedContextIndices[i] = 0;
                    } else {
                        config.selectedContextIndices[i] = 1;
                    }
                } else {
                    // if shift+ctrl is pressed, then invert the current
                    // selection, and then also set the rest of the
                    // range from the last click to the same value
                    let newVal = 0;
                    if (config.selectedContextIndices[i] === 1) {
                        newVal = 0;
                    } else {
                        newVal = 1;
                    }
                    if (prevSelectedIndex < i) {
                        for (let j = prevSelectedIndex; j <= i; j++) {
                            config.selectedContextIndices[j] = newVal;
                        }
                    } else if (prevSelectedIndex > i) {
                        for (let j = prevSelectedIndex; j >= i; j--) {
                            config.selectedContextIndices[j] = newVal;
                        }
                    } else {
                        config.selectedContextIndices[i] = newVal;
                    }
                }
            }
        }
        // push these values to the extension storage so that
        // the same exact settings come up next time
        browser.storage.local.set({
            "selectedContextIndices": config.selectedContextIndices,
            "lastSelectedContextIndex": config.lastSelectedContextIndex,
        });
        if (config.alwaysSetSync === true) {
            browser.storage.sync.set({
                "selectedContextIndices": config.selectedContextIndices,
                "lastSelectedContextIndex": config.lastSelectedContextIndex,
            });
        }
        setSelectedListItemClassNames();
        return;
    }

    let contexts: browser.contextualIdentities.ContextualIdentity[] = [];
    if (isAnyContextSelected()) {
        const keys = Object.keys(config.selectedContextIndices);
        for (let i = 0; i < keys.length; i++) {
            if (config.selectedContextIndices[i] === 1) {
                contexts.push(filteredContexts[i]);
            }
        }
    } else {
        // determine how many containers to modify
        if (shiftModifier) {
            filteredContexts.forEach((filteredContext) => {
                contexts.push(filteredContext);
            });
        } else {
            if (singleContext) {
                contexts.push(singleContext);
            } else {
                contexts.push(filteredContexts[0]);
            }
        }
    }

    try {

        const tabs = await browser.tabs.query({ currentWindow: true, active: true });
        for (const tab of tabs) {
            if (!tab.active) continue;

            let navigatedUrl = '';

            // decision tree
            switch (config.mode) {
                case MODES.SET_NAME:
                    await renameContexts(contexts);
                    break;
                case MODES.DELETE:
                    await deleteMultipleContainers(contexts);
                    resetSelectedContexts();
                    break;
                case MODES.SET_URL:
                    await setMultipleDefaultUrlsWithPrompt(contexts);
                    break;
                case MODES.SET_COLOR:
                    await setColorForContexts(contexts);
                    break;
                case MODES.SET_ICON:
                    await setIconForContexts(contexts);
                    break;
                case MODES.REPLACE_IN_NAME:
                    await findReplaceNameInContexts(contexts);
                    break;
                case MODES.REPLACE_IN_URL:
                    await findReplaceUrlInContexts(contexts);
                    break;
                case MODES.DUPLICATE:
                    await duplicateContexts(contexts);
                    resetSelectedContexts();
                    break;
                case MODES.OPEN:
                    // the following code exists because in sticky popup mode,
                    // the current tab url changes to blank at first, and
                    // filterContainers() will not show the URL overrides.
                    // So we have to look at the last container in the array
                    // and force filterContainers() to treat that URL as the
                    // active tab URL
                    if (!contexts.length) {
                        showAlert('There are no containers to open.', 'Warning');
                        actionCompletedHandler(navigatedUrl);
                        return;
                    }

                    // validate that each container has some sensible validity
                    for (const context of contexts) {
                        if (!context?.cookieStoreId) {
                            showAlert(`A container you attempted to open has an invalid configuration: ${JSON.stringify(context)}`, 'Cannot Open Container');
                            actionCompletedHandler(navigatedUrl);
                            return;
                        }
                    }

                    const last = contexts[contexts.length - 1];

                    // the last container opened will be used as the last URL;
                    // this will be passed into the actionCompletedHandler. I had
                    // to choose something to put here, and the last URL makes the
                    // most sense.
                    navigatedUrl = config.containerDefaultUrls[last.cookieStoreId];

                    // TODO: this is refactorable logic copy/pasted from openMultipleContexts
                    if (config.openCurrentTabUrlOnMatch && tab.url) {
                        const overriddenUrlToOpen = getCurrentTabOverrideUrl(
                            navigatedUrl,
                            tab.url,
                            config.openCurrentTabUrlOnMatch,
                        );

                        if (overriddenUrlToOpen) {
                            navigatedUrl = overriddenUrlToOpen;
                        }
                    }

                    // override the URL if the user has elected to open the current page
                    // for all filtered tabs
                    if (config.openCurrentPage && tab.url) {
                        navigatedUrl = tab.url;
                    }

                    await openMultipleContexts(contexts, ctrlModifier, tab);
                    break;
                default:
                    break;
            }
            actionCompletedHandler(navigatedUrl);
            break;
        }
    } catch (err) {
        if (err) {
            // TODO: localization refactor
            showAlert(
                `Failed to execute on one or more containers: ${JSON.stringify(err)}`,
                'Execution Error',
            )
            return;
        }

        // TODO: localization refactor
        showAlert(
            `Failed to execute on one or more containers due to an unknown error.`,
            'Execution Error',
        )
        return;
    }
};

/**
 * In preparation for rebuilding the filtered list of containers, this function
 * finds and deletes the container list group elements.
 * @param containerListElement The empty (by default, before population) `<div>` on the `popup.html` page that holds the entire container list element collection. Retrieve by using document.getElementById(CONTAINER_LIST_DIV_ID)
 */
const removeExistingContainerListGroupElement = (containerListElement: HTMLElement) => {
    const list = document.getElementById('containerListGroup');
    if (!list) {
        return;
    }

    containerListElement.removeChild(list);
};

/**
 * As part of rebuilding the filtered list of containers, this function
 * assembles a list group element.
 *
 * TODO: make the `containerListGroup` ID use consistent naming conventions
 * @returns The `<ul>` list group element that will hold the child `<li>` container list items.
 */
const buildContainerListGroupElement = (): HTMLElement => {
    const ulElement = document.createElement('ul');
    ulElement.id = 'containerListGroup';
    ulElement.className = "list-group";
    return ulElement;
};

/**
 * Checks if a user input string matches a container name using a rudimentary
 * search algorithm.
 * @param contextName The lowercase name of the `contextualIdentity` to run the search query against
 * @param userQuery A string that the user entered as a search term
 * @returns Whether or not a name and query should be included as part of the search results
 */
const isUserQueryContextNameMatch = (contextName: string, userQuery: string): boolean => {
    if (contextName.indexOf(userQuery) !== -1) {
        return true;
    }
    return false;
};

/**
 * Applies the user's search query, and updates the list of containers accordingly.
 * @param event The event that called this function, such as a key press or mouse click
 * @param actualTabUrl When in sticky popup mode, when opening a new URL, the new tab page might not be loaded yet, so the tab query returns an empty URL. actualTabUrl allows a URL to be passed in in advance, so that the extension can properly show URL overrides in the UI.
 */
const filterContainers = async (
    event: Event | KeyboardEvent | MouseEvent | null,
    actualTabUrl: string | null,
) => {
    if (event) {
        event.preventDefault();
    }

    // retrieve the search query from the user
    const searchInput = document.getElementById("searchContainerInput") as HTMLInputElement;
    const userQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (userQuery !== config.lastQuery) {
        // the query has changed, so reset any items the user has selected
        resetSelectedContexts();
    }

    // persist the last query to extension storage
    browser.storage.local.set({
        "lastQuery": userQuery,
        "selectedContextIndices": config.selectedContextIndices,
        "lastSelectedContextIndex": config.lastSelectedContextIndex,
    });
    if (config.alwaysSetSync === true) {
        browser.storage.sync.set({
            "lastQuery": userQuery,
            "selectedContextIndices": config.selectedContextIndices,
            "lastSelectedContextIndex": config.lastSelectedContextIndex,
        });
    }

    config.lastQuery = userQuery;

    try {
        const contexts = await browser.contextualIdentities.query({});
        const tabs = await browser.tabs.query({ currentWindow: true, active: true });
        for (const tab of tabs) {
            if (!tab.active) continue;

            if (!Array.isArray(contexts)) {
                setSelectedListItemClassNames();
                break;
            }

            const results: browser.contextualIdentities.ContextualIdentity[] = [];

            const containerList = document.getElementById(CONTAINER_LIST_DIV_ID);
            if (!containerList) {
                throw `Failed to find ${CONTAINER_LIST_DIV_ID} HTML element`;
            }

            // prepare by clearing out the old query's HTML output
            removeExistingContainerListGroupElement(containerList);

            // now build its successor
            const ulElement = buildContainerListGroupElement();

            const lowerCaseUserQuery = userQuery.toLowerCase();

            // in order to enable sorting, we have to do multiple
            // passes at the contexts array.

            // first, apply filtering directly:
            for (const context of contexts) {
                const lowerCaseContextName = context.name.toLowerCase();
                const queryNameMatch = isUserQueryContextNameMatch(lowerCaseContextName, lowerCaseUserQuery);
                const queryUrlMatch = checkDefaultUrlsForUserQuery(context, lowerCaseUserQuery);
                const emptyQuery = !userQuery;

                if (emptyQuery || queryNameMatch || queryUrlMatch) {
                    results.push(context);
                }
            }

            // second, sort according to the user-configured sort:
            results.sort((a: browser.contextualIdentities.ContextualIdentity, b: browser.contextualIdentities.ContextualIdentity) => {
                const urlA: string = (config.containerDefaultUrls[a.cookieStoreId.toString() || ""] || "").toLowerCase();
                const urlB: string = (config.containerDefaultUrls[b.cookieStoreId.toString() || ""] || "").toLowerCase();
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                switch (config.sort) {
                    case SORT_MODE_NAME_ASC:
                        return nameA.localeCompare(nameB);
                    case SORT_MODE_NAME_DESC:
                        return nameB.localeCompare(nameA);
                    case SORT_MODE_URL_ASC:
                        return urlA.localeCompare(urlB);
                    case SORT_MODE_URL_DESC:
                        return urlB.localeCompare(urlA);
                    default:
                        return 0;
                }
            })

            if (config.sort === SORT_MODE_NONE_REVERSE) {
                results.reverse();
            }

            // finally, propagate the sorted results to the UI:
            for (let i = 0; i < results.length; i++) {
                const context = results[i];

                const liElement = buildContainerListItem(
                    results,
                    context,
                    i,
                    tab,
                    actualTabUrl || ""
                );
                ulElement.appendChild(liElement);
            }

            if (results.length === 0) {
                const liElement = buildEmptyContainerListItem(0);
                ulElement.append(liElement);
            }

            containerList.appendChild(ulElement);

            setSummaryText(`Showing ${results.length}/${contexts.length} containers.`);

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
            setSelectedListItemClassNames();
            break;
        }
    } catch (err) {
        if (err) {
            showAlert(`Failed to filter the list of containers: ${JSON.stringify(err)}`, 'Filter Error');
            return;
        }

        showAlert(`Failed to filter the list of containers due to an unknown error.`, 'Filter Error');
        return;
    }
}

/**
 * When a user checks a checkbox, this function toggles that value in the
 * `config` object, as well as setting all of the other mutually exclusive
 * options to `false`. It will also update the UI checkboxes to reflect the
 * values. See `mutuallyExclusiveConfigOptions`.
 *
 * TODO: write this to be much more robust
 *
 * @param key The `config` key to toggle.
 */
const toggleConfigFlag = (key: string, conf: any): ExtensionConfig => {
    const el = document.getElementById(`${key}`);
    if (!el) {
        showAlert(`A checkbox with ID ${key} could not be found.`, 'Config Update Error');
        return conf;
    }

    const checkbox = el as HTMLInputElement;

    // start by toggling the intended config parameter
    conf[key] = !conf[key];

    const savedConfig: any = {};
    savedConfig[key] = conf[key];

    checkbox.checked = conf[key];

    browser.storage.local.set(savedConfig);

    if (config.alwaysSetSync === true) {
        browser.storage.sync.set(savedConfig);
    }

    return conf;
}

/**
 * Retrieves extension settings from browser storage and persists them to
 * the `config` object, as well as setting the state of a few HTML elements.
 * @param data The data from calling `browser.storage.local.get()`
 */
const processExtensionSettings = (data: any, conf: ExtensionConfig | any): ExtensionConfig => {
    const keys = Object.keys(conf);

    const modeSelectEl = document.getElementById('modeSelect');
    const sortModeSelectEl = document.getElementById('sortModeSelect');
    const windowStayOpenStateEl = document.getElementById('windowStayOpenState');
    const selectionModeEl = document.getElementById('selectionMode');
    const openCurrentPageEl = document.getElementById('openCurrentPage');
    const searchContainerInputEl = document.getElementById('searchContainerInput');

    const htmlError = 'HTML Error';

    if (!modeSelectEl) {
        showAlert('The modeSelect element could not be found.', htmlError);
        return conf;
    }
    if (!sortModeSelectEl) {
        showAlert('The sortModeSelect element could not be found.', htmlError);
        return conf;
    }
    if (!windowStayOpenStateEl) {
        showAlert('The windowStayOpenState element could not be found.', htmlError);
        return conf;
    }
    if (!selectionModeEl) {
        showAlert('The selectionMode element could not be found.', htmlError);
        return conf;
    }
    if (!openCurrentPageEl) {
        showAlert('The openCurrentPage element could not be found.', htmlError);
        return conf;
    }
    if (!searchContainerInputEl) {
        showAlert('The searchContainerInput element could not be found.', htmlError);
        return conf;
    }

    const modeSelect = modeSelectEl as HTMLSelectElement;
    const sortModeSelect = sortModeSelectEl as HTMLSelectElement;
    const windowStayOpenState = windowStayOpenStateEl as HTMLInputElement;
    const selectionMode = selectionModeEl as HTMLInputElement;
    const openCurrentPage = openCurrentPageEl as HTMLInputElement;
    const searchContainerInput = searchContainerInputEl as HTMLInputElement;

    // checks if *any* settings have been defined
    for (const key of keys) {
        if (data[key] !== undefined) {
            conf[key] = data[key];
        }

        // this switch/case block is for doing tasks specific to each conf
        // key, such as updating UI elements
        switch (key) {
            case "mode":
                modeSelect.value = conf[key];
                break;
            case "sort":
                sortModeSelect.value = conf[key];
                break;
            case "windowStayOpenState":
                windowStayOpenState.checked = conf[key];
                break;
            case "selectionMode":
                selectionMode.checked = conf[key];
                break;
            case "openCurrentPage":
                openCurrentPage.checked = conf[key];
                break;
            case "containerDefaultUrls":
                // do nothing at this time, because there are no special
                // UI elements to update
                break;
            case "lastQuery":
                searchContainerInput.value = conf[key];
                break;
            default:
                break;
        }
    }

    return conf;
};

/**
 * Based on the currently selected mode, set a helpful message to show
 * to the user.
 */
const showModeHelpMessage = () => {
    switch (config.mode) {
        case MODES.SET_URL:
            setHelpText("URLs do not affect multi-account container preferences.");
            break;
        case MODES.SET_NAME:
            setHelpText("You will be prompted for a new name, 25 character max.")
            break;
        case MODES.REPLACE_IN_URL:
        case MODES.REPLACE_IN_NAME:
            setHelpText("You will be prompted for find & replace strings.")
            break;
        case MODES.SET_ICON:
            setHelpText("You will be prompted for a new icon.")
            break;
        case MODES.SET_COLOR:
            setHelpText("You will be prompted for a new color.")
            break;
        case MODES.DUPLICATE:
            setHelpText("Duplicates container(s) and URLs, but not cookies etc.")
            break;
        case MODES.DELETE:
            setHelpText("Warning: Will delete containers that you click");
            break;
        default:
            setHelpText("");
            break;
    }
};

/**
 * When the user changes the current mode, this function sets the stored
 * configuration value accordingly.
 * @param mode The mode to set.
 */
const setMode = (mode: string | MODES) => {
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
            config.mode = mode;
            break;
        default:
            showAlert(`Invalid mode '${mode}'.`, 'Invalid Mode');
            return;
    }

    config.mode = mode;

    // push to storage
    browser.storage.local.set({ mode: config.mode });
    if (config.alwaysSetSync === true) {
        browser.storage.sync.set({ mode: config.mode });
    }

    showModeHelpMessage();
};

/**
 * When the user changes the current sort mode, this function sets the stored
 * configuration value accordingly.
 * @param mode The mode to set.
 */
const setSortMode = (mode: string | SortModes) => {
    switch (mode) {
        case SortModes.NameAsc:
        case SortModes.NameDesc:
        case SortModes.None:
        case SortModes.NoneReverse:
        case SortModes.UrlAsc:
        case SortModes.UrlDesc:
            config.sort = mode;
            break;
        default:
            showAlert(`Invalid sort mode '${mode}'.`, 'Invalid Sort Mode');
            return;
    }

    // push to storage
    browser.storage.local.set({ sort: config.sort });
    if (config.alwaysSetSync === true) {
        browser.storage.sync.set({ sort: config.sort });
    }
};

/**
 * Initializes the extension data upon document load, intended to be added as
 * a callback for the event listener `DOMContentLoaded`.
 */
const initializeDocument = () => {
    if (!document) return;

    browser.storage.sync.get((data: any) => {
        // if there is data available in sync, process it first
        if (data.alwaysSetSync === true) {
            // done
            config = processExtensionSettings(data, config);
            showModeHelpMessage();
            filterContainers(null, null);
            if (config.selectionMode) {
                setHelpText(`${PlatformModifierKey}+Click to select 1; ${PlatformModifierKey}+Shift+Click for a range`);
            }
            focusSearchBox();
        } else {
            // if the user explicitly does not want to use sync,
            // then get the local storage data
            browser.storage.local.get((data: any) => {
                if (data) {
                    config = processExtensionSettings(data, config);

                    showModeHelpMessage();

                    filterContainers(null, null);

                    if (config.selectionMode) {
                        setHelpText(`${PlatformModifierKey}+Click to select 1; ${PlatformModifierKey}+Shift+Click for a range`);
                    }
                    focusSearchBox();
                }
            });
        }
    });

    const searchContainerForm = document.getElementById('searchContainerForm');
    const searchContainerInput = document.getElementById('searchContainerInput');
    const windowStayOpenState = document.getElementById('windowStayOpenState');
    const selectionMode = document.getElementById('selectionMode');
    const openCurrentPage = document.getElementById('openCurrentPage');
    const addNewContainer = document.getElementById('addNewContainer');
    const modeSelect = document.getElementById('modeSelect');
    const sortModeSelect = document.getElementById('sortModeSelect');

    const htmlError = 'HTML Error';

    if (!searchContainerForm) {
        showAlert(`The HTML element searchContainerForm is not available.`, htmlError);
        return;
    }
    if (!searchContainerInput) {
        showAlert(`The HTML element searchContainerInput is not available.`, htmlError);
        return;
    }
    if (!windowStayOpenState) {
        showAlert(`The HTML element windowStayOpenState is not available.`, htmlError);
        return;
    }
    if (!selectionMode) {
        showAlert(`The HTML element selectionMode is not available.`, htmlError);
        return;
    }
    if (!openCurrentPage) {
        showAlert(`The HTML element openCurrentPage is not available.`, htmlError);
        return;
    }
    if (!addNewContainer) {
        showAlert(`The HTML element addNewContainer is not available.`, htmlError);
        return;
    }
    if (!modeSelect) {
        showAlert(`The HTML element modeSelect is not available.`, htmlError);
        return;
    }
    if (!sortModeSelect) {
        showAlert(`The HTML element sortModeSelect is not available.`, htmlError);
        return;
    }

    // prevents the Search button from causing page navigation/popup flashes
    searchContainerForm.addEventListener("submit", (event) => { event.preventDefault(); });

    // probably the most important event to add, this ensures that
    // key events toggle filtering
    searchContainerInput.addEventListener("keyup", () => { filterContainers(null, null); });

    windowStayOpenState.addEventListener("click", () => {
        config = toggleConfigFlag("windowStayOpenState", config);
    });
    selectionMode.addEventListener("click", () => {
        config = toggleConfigFlag("selectionMode", config);
        resetSelectedContexts();
        setSelectedListItemClassNames();
        if (config.selectionMode) {
            setHelpText(`${PlatformModifierKey}+Click to select 1; ${PlatformModifierKey}+Shift+Click for a range`);
        } else {
            showModeHelpMessage();
        }
    });
    openCurrentPage.addEventListener("click", () => {
        config = toggleConfigFlag("openCurrentPage", config);

        if (config.openCurrentPage) {
            setHelpText(`Every container will open your current tab's URL.`);
        } else {
            showModeHelpMessage();
        }

        filterContainers(null, null);
    });
    addNewContainer.addEventListener("click", () => {
        addContext();
    });

    (modeSelect as HTMLSelectElement).addEventListener("change", (event: Event) => {
        if (!event.target) return;

        const target = event.target as HTMLSelectElement;

        setMode(target.value);

        event.preventDefault();
    });

    (sortModeSelect as HTMLSelectElement).addEventListener("change", (event: Event) => {
        if (!event.target) return;

        const target = event.target as HTMLSelectElement;

        setSortMode(target.value);

        resetSelectedContexts();

        filterContainers(null, null);

        event.preventDefault();
    });
}

// start everything up upon content load
document.addEventListener('DOMContentLoaded', () => {
    // TODO: try to stop using a global 'config' object and write pure
    //       functions - this is where the initial config would be created:
    // let config: ExtensionConfig = {
    //     windowStayOpenState: true,
    //     selectionMode: false,
    //     sort: SORT_MODE_NONE,
    //     openCurrentPage: false,
    //     mode: MODES.OPEN,
    //     lastQuery: "",
    //     containerDefaultUrls: {},
    //     selectedContextIndices: {},
    //     lastSelectedContextIndex: -1,
    //     alwaysGetSync: false,
    //     alwaysSetSync: false,
    //     neverConfirmOpenNonHttpUrls: false,
    //     neverConfirmSaveNonHttpUrls: false,
    //     openCurrentTabUrlOnMatch: UrlMatchTypes.empty,
    // };
    initializeDocument();
});
