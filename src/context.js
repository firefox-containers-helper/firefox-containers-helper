"use strict";

let platformModifierKey = 'Ctrl'; // windows, linux
// https://stackoverflow.com/a/11752084
if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
    platformModifierKey = 'Cmd'; // mac
}

// helpful links:
// https://github.com/mdn/webextensions-examples/blob/master/favourite-colour/options.js
// https://github.com/crazymousethief/container-plus/blob/master/context.js
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities/ContextualIdentity

/**
 * All configuration options for this web extension are stored in this object.
 * @typedef {Object} Configuration
 * @property {boolean} windowStayOpenState
 * @property {string} mode
 * @property {Object} containerDefaultUrls
 */

/**
 * A contextual identity represents a container definition.
 * The following documentation was copied from the Mozilla documentation on 11/19/2020.
 * This typedef documentation uses text that is largely the property of Mozilla and is not intended to infringe on any of the licenses of MDN or Mozilla.
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities/ContextualIdentity
 * @typedef {Object} ContextualIdentity
 * @property {string} cookieStoreId The cookie store ID for the identity. Since contextual identities don't share cookie stores, this serves as a unique identifier.
 * @property {string} color The color for the identity. This will be shown in tabs belonging to this identity. The value "toolbar" represents a theme-dependent color.  Identities with color "toolbar" will be displayed in the same color as text in the toolbar (corresponding to the theme key "toolbar_field_text").
 * @property {string} colorCode A hex code representing the exact color used for the identity. For example: "#37adff". In the special case of the "toolbar" color, colorCode is always "#7c7c7d", regardless of the displayed color.
 * @property {string} icon The name of an icon for the identity. This will be shown in the URL bar for tabs belonging to this identity. The following values are valid:
 * @property {string} iconUrl A full resource:// URL pointing to the identity's icon. For example: "resource://usercontext-content/fingerprint.svg".
 * @property {string} name Name of the identity. This will be shown in the URL bar for tabs belonging to this identity. Note that names don't have to be unique.
 */

/**
 * All configuration options for this web extension are stored in this object.
 * @namespace
 * @property {boolean} windowStayOpenState
 * @property {string} mode
 * @property {string} lastQuery
 * @property {object} containerDefaultUrls
 */
const config = {
    /**
     * windowStayOpenState is what keeps the window open while the user
     * clicks on a container tab.
     * @type {boolean}
     * @default
     */
    windowStayOpenState: true,

    /**
     * selectionMode is what allows the user to individually click or
     * shift+click to select ranges of containers from the list.
     * @type {boolean}
     * @default
     */
    selectionMode: false,

    /**
     * mode is the current mode the user is operating in, such as
     * deleteContainersOnClick or setDefaultUrlsOnClick.
     * @type {string}
     * @default
     */
    mode: "openOnClick",


    /**
     * lastQuery is the last thing that the user entered in the search box
     * @type {string}
     * @default
     */
    lastQuery: "",


    /**
     * containerDefaultUrls is a key-value pair of container ID's to
     * default URLs to open for each container ID.
     * @example {"container-name-01":"https://site.com"}
     * @type {object}
     * @default
     */
    containerDefaultUrls: {},

    /**
     * selectedContextIndices keeps track of every context that is selected
     * in selection mode - this is simply an object with every key as a counter,
     * and every value as a 1 or 0 depending on whether or not the corresponding
     * filtered context (container) is selected
     * @example {0: 1, 1: 1, 2: 0, 3: 1}
     * @type {object}
     * @default
     */
    selectedContextIndices: {},

    /**
     * lastSelectedContextIndex keeps track of the item that was last selected
     * @example 3
     * @type {number}
     * @default
     */
    lastSelectedContextIndex: -1,

    /**
     * alwaysGetSync controls whether or not the settings are always loaded
     * from Firefox sync, or from local storage (default false)
     * @example false
     * @type {boolean}
     * @default
     */
    alwaysGetSync: false,

    /**
     * alwaysSetSync controls whether or not the settings are always pushed
     * to Firefox sync as well to local storage (always).
     * @example true
     * @type {boolean}
     * @default
     */
    alwaysSetSync: false,

    /**
     * neverConfirmOpenNonHttpUrls controls whether or not users get prompted
     * to open a URL that doesn't start with http:// or https://.
     * @example true
     * @type {boolean}
     * @default
     */
    neverConfirmOpenNonHttpUrls: false,

    /**
     * neverConfirmSaveNonHttpUrls controls whether or not users get prompted
     * to save a URL that doesn't start with http:// or https://.
     * @example true
     * @type {boolean}
     * @default
     */
    neverConfirmSaveNonHttpUrls: false,

    /**
     * openCurrentTabUrlOnMatch will open the current tab's URL if a container
     * tab's default URL domain matches the current tab's URL. Can be configured
     * to match a couple different things.
     * See the URL() object for things that can match.
     * @example "href"
     * @example "origin"
     * @example "host"
     * @example "hostname"
     * @example ""
     * @type {string}
     * @default
     */
    openCurrentTabUrlOnMatch: "",
};

/**
 * All functional modes.
 * TODO: jsdoc this as enum?
 * @constant
 * @type {object}
 * @default
 */
const MODES = {
    OPEN: "openOnClick",
    SET_URL: "setDefaultUrlsOnClick",
    SET_NAME: "renameOnClick",
    SET_COLOR: "setColorOnClick",
    SET_ICON: "setIconOnClick",
    REPLACE_IN_NAME: "replaceInNameOnClick",
    REPLACE_IN_URL: "replaceInUrlOnClick",
    DUPLICATE: "duplicateOnClick",
    DELETE: "deleteContainersOnClick",
}

/**
 * All allowable container (context) colors.
 * TODO: jsdoc this as enum?
 * @constant
 * @type {string[]}
 * @default
 */
const CONTEXT_COLORS = [
    "blue",
    "turquoise",
    "green",
    "yellow",
    "orange",
    "red",
    "pink",
    "purple",
    "toolbar",
];


/**
 * All allowable container (context) icons.
 * TODO: jsdoc this as enum?
 * @constant
 * @type {string[]}
 * @default
 */
const CONTEXT_ICONS = [
    "fingerprint",
    "briefcase",
    "dollar",
    "cart",
    "circle",
    "gift",
    "vacation",
    "food",
    "fruit",
    "pet",
    "tree",
    "chill",
    "fence",
];


/**
 * Random list of help messages to show in the Help Text area.
 * @constant
 * @type {string[]}
 * @default
 */
const helpTextMessages = [
    'Tip: Press Enter or click on a container below.',
    `Tip: Use ${platformModifierKey}(+Shift) to open pinned tab(s).`,
    'Tip: Shift+Click to execute against every shown result',
    'Tip: Bulk import/export containers via Preferences page.'
];

/**
 * This is the set of classes to assign to a container list item that is not
 * currently being hovered over. Assign to `element.className` for a given element.
 * @constant
 * @type {string}
 * @default
 */
const containerListItemInactiveClassNames = 'list-group-item container-list-item d-flex justify-content-space-between align-items-center';

/**
 * This is the set of classes to assign to a container list item that is not
 * currently being hovered over, but is selected via the selection mode.
 * Assign to `element.className` for a given element.
 * @constant
 * @type {string}
 * @default
 */
const containerListItemSelectedClassNames = 'list-group-item container-list-item d-flex justify-content-space-between align-items-center bg-secondary border-secondary text-white';

/**
 * This is the set of classes to assign to a container list item that is
 * currently being hovered over. Assign to `element.className` for a given element.
 * @constant
 * @type {string}
 * @default
 */
const containerListItemActiveClassNames = `${containerListItemInactiveClassNames} active cursor-pointer`;

/**
 * This is the set of classes to assign to a container list item that is
 * currently being hovered over, while the container management mode is set to
 * deletion mode. Assign to `element.className` for a given element.
 * @constant
 * @type {string}
 * @default
 */
const containerListItemActiveDangerClassNames = `${containerListItemActiveClassNames} bg-danger border-danger`;

/**
 * This is the set of classes to assign to a container list item url label that
 * is currently not being hovered over or selected.
 * Assign to `element.className` for a given element.
 * @constant
 * @type {string}
 * @default
 */
const containerListItemUrlLabel = `text-muted small`;

/**
 * This is the set of classes to assign to a container list item url label that
 * is currently being hovered over or selected
 * Assign to `element.className` for a given element.
 * @constant
 * @type {string}
 * @default
 */
const containerListItemUrlLabelInverted = `text-light small`;

/**
 * The `<div>` ID of the container list. This is where all of the queried containers will go.
 * @constant
 * @type {string}
 * @default
 */
const CONTAINER_LIST_DIV_ID = 'container-list';

/**
 * Quickly checks to see if a context is selected, via the selection mode
 * @param {number} i The index of a particular context within the array of filteredContexts
 * @returns {boolean} Whether or not the current context is selected
 */
const isContextSelected = (i) => {
    if (config.selectedContextIndices[i] === 1) {
        return true;
    }
    return false;
}

/**
 * Quickly checks to see if *any* context is selected, via the selection mode
 * @returns {boolean} Whether or not *any* current context is selected
 */
const isAnyContextSelected = () => {
    const keys = Object.keys(config.selectedContextIndices);
    for (let i = 0; i < keys.length; i++) {
        if (config.selectedContextIndices[keys[i]] === 1) {
            return true;
        }
    }
    return false;
}

/**
 * Sets the proper class names for filtered contexts that are either selected
 * or not
 * @returns {void} Nothing
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
 * @param {ContextualIdentity} context - The contextualIdentity that this icon element will represent
 * @returns {Element} An HTML element containing the colorized container icon for `context`.
 */
const buildContainerIconElement = (context) => {
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
 * @param {ContextualIdentity} context - The contextualIdentity that this text element will represent
 * @param {number} i The index of this contextualIdentity within the filteredResults array
 * @param {tab} currentTab The currently active tab. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
 * @param {string} actualCurrentUrl The URL that the current tab is supposed to be loading.
 * @returns {Element} An HTML element containing text that represents the
 * container's name and default URL, if defined.
 */
const buildContainerLabelElement = (context, i, currentTab, actualCurrentUrl) => {
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
            let currentUrl = currentTab.url;
            if (actualCurrentUrl) {
                currentUrl = actualCurrentUrl;
            }
            const overrideUrl = getCurrentTabOverrideUrl(contextDefaultUrl, currentUrl, false);
            if (overrideUrl && overrideUrl !== contextDefaultUrl) {
                containerUrlLabelElement.innerHTML = `<s>${contextDefaultUrl.substr(0, 40)}</s><br/>${config.openCurrentTabUrlOnMatch} match, will open in this URL:<br/>${overrideUrl.substr(0, 40)}`;
            } else {
                containerUrlLabelElement.innerText = `${contextDefaultUrl.substr(0, 40)}`;
            }
        } else {
            containerUrlLabelElement.innerText = `${contextDefaultUrl.substr(0, 40)}`;
        }
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
 * @returns {Element} An HTML element containing text that represents the
 * container's name and default URL, if defined.
 */
const buildEmptyContainerLabelElement = (label) => {
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
 * @param {Element} liElement The container list item that will receive all event listeners
 * @param {ContextualIdentity[]} filteredResults A list of the currently filtered set of browser.contextualIdentities
 * @param {ContextualIdentity} context The contextualIdentity that this list item will represent
 * @param {number} i The index of this contextualIdentity within the filteredResults array
 * @returns {string} Any error message, or empty string if no errors occurred.
 */
const applyEventListenersToContainerListItem = (liElement, filteredResults, context, i) => {
    try {
        liElement.addEventListener('mouseover', (event) => {
            if (config.mode === MODES.DELETE) {
                event.target.className = containerListItemActiveDangerClassNames;
            } else {
                event.target.className = containerListItemActiveClassNames;
                const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);
                if (urlLabel) {
                    urlLabel.className = containerListItemUrlLabelInverted;
                }
            }
        });
        liElement.addEventListener('mouseleave', (event) => {
            const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);
            if (isContextSelected(i)) {
                event.target.className = containerListItemSelectedClassNames;
                if (urlLabel) {
                    urlLabel.className = containerListItemUrlLabelInverted;
                }
            } else {
                event.target.className = containerListItemInactiveClassNames;
                if (urlLabel) {
                    urlLabel.className = containerListItemUrlLabel;
                }
            }
        });
        liElement.addEventListener('click', (event) => {
            containerClickHandler(filteredResults, context, event);
        });
        liElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                containerClickHandler(filteredResults, context, event);
            }
        });
        liElement.addEventListener('onfocus', (event) => {
            if (config.mode === MODES.DELETE) {
                event.target.className = containerListItemActiveDangerClassNames;
            } else {
                event.target.className = containerListItemActiveClassNames;
                const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);
                if (urlLabel) {
                    urlLabel.className = containerListItemUrlLabel;
                }
            }
        });
        liElement.addEventListener('blur', (event) => {
            if (isContextSelected(i)) {
                event.target.className = containerListItemSelectedClassNames;
            } else {
                event.target.className = containerListItemInactiveClassNames;
                const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);
                if (urlLabel) {
                    urlLabel.className = containerListItemUrlLabel;
                }
            }
        });

        return "";
    } catch (e) {
        return `failed to apply an event listener: ${JSON.stringify(e)}`;
    }
};

/**
 * Assembles an HTML element that contains an entire container list item.
 * @param {ContextualIdentity[]} filteredResults A list of the currently filtered set of browser.contextualIdentities
 * @param {ContextualIdentity} context The contextualIdentity that this list item will represent
 * @param {number} i The index of this contextualIdentity within the filteredResults array
 * @param {tab} currentTab The currently active tab. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
 * @param {string} actualCurrentUrl The URL that the current tab is supposed to be loading.
 * @returns {Element} An HTML element with event listeners, formatted with css as a bootstrap list item.
 */
const buildContainerListItem = (filteredResults, context, i, currentTab, actualCurrentUrl) => {
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
        console.error(`encountered error building list item for context ${context.name}: ${err}`)
    }

    return liElement;
};

/**
 * Assembles an HTML element that represents empty search results, but appears
 * similar to an actual search result.
 * @param {number} i A unique value that will make the class/id of the element unique
 * @returns {Element} An HTML element with event listeners, formatted with css as a bootstrap list item.
 */
const buildEmptyContainerListItem = (i) => {
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
 * @param {Event} event The event that was created when the user performed some interaction with the document.
 * @returns {void}
 */
const haltingCallback = (event) => {
    event.preventDefault();
    event.stopPropagation();
}

/**
 * When mousing over a list item, child elements can
 * mess up the way classes are set upon mouseover/mouseleave.
 * This fixes that by applying the haltingCallback event handler to a few
 * events such as mouseover and mouseleave.
 * @param {Element} element The HTML element that will receive generic event listeners.
 * @returns {void}
 */
const addEmptyEventListenersToElement = (element) => {
    element.addEventListener('mouseover', haltingCallback);
    element.addEventListener('mouseleave', haltingCallback);
};

/**
 * Sets a message inside the "warning" text element.
 * @param {string} message The HTML string to put inside the warning text element.
 * @returns {void}
 */
const setHelpText = (message) => {
    let msg = message;
    if (!message) {
        const rngHelpMsgIndex = parseInt(Math.random() * helpTextMessages.length, 10) || 0;
        msg = helpTextMessages[rngHelpMsgIndex];
    }
    document.querySelector("#helpText").innerText = msg;
};

/**
 * Sets a message inside the "summary" text element, such as "Showing x/y containers"
 * @param {string} message The HTML string to put inside the summary text element.
 * @returns {void}
 */
const setSummaryText = (message) => {
    document.querySelector("#summaryText").innerText = message;
}

/**
 * Sets focus to the search box. Should be called often, especially on popup.
 * @returns {void}
 */
const focusSearchBox = () => {
    document.querySelector("#searchContainerInput").focus();
}

/**
 * Persists container default URL configuration data to extension storage.
 * @returns {void}
 */
const writeContainerDefaultUrlsToStorage = () => {
    browser.storage.local.set({ "containerDefaultUrls": config.containerDefaultUrls });
    if (config.alwaysSetSync === true) {
        browser.storage.sync.set({ "containerDefaultUrls": config.containerDefaultUrls });
    }
}

/**
 * Actions to perform when an action is completed.
 * @param {string} currentUrl Optional, determines what URL should be
 * considered as "active" when filtering containers
 * @returns {void}
 */
const actionCompletedHandler = (currentUrl) => {
    // decide to close the extension or not at the last step
    if (config.windowStayOpenState === false) {
        window.close();
    } else {
        filterContainers(false, currentUrl);
    }
}

/**
 * Checks if a given container's `contextualIdentity` (`context`) has a default
 * URL value set in `config.containerDefaultUrls`.
 * @param {ContextualIdentity} context The context for a container, straight from `browser.contextualIdentities`
 * @param {string} userQuery The text that the user has searched for
 * @returns {boolean} Whether or not the container `context` has a default URL set
 */
const checkDefaultUrlsForUserQuery = (context, userQuery) => {
    const lookup = config.containerDefaultUrls[context.cookieStoreId.toString() || ""];
    if (lookup && lookup.toString().toLowerCase().indexOf(userQuery) !== -1) {
        return true;
    }
    return false;
}

/**
 * Asks if the user wants to delete multiple containers, and executes if the user says so.
 * TODO: For unit testability, convert to an asynchronous function.
 * @param {ContextualIdentity[]} contextsToDelete The `contextualIdentity` array to possibly be deleted.
 * @returns {void}
 */
const deleteMultipleContainers = (contextsToDelete) => {
    // selection mode can sometimes lead to contexts that don't exist,
    // so we will filter out contexts that are undefined
    let actualContextsToDelete = [];

    let dialogStr = `Are you sure you want to delete the following container(s)?\n\n`;
    contextsToDelete.forEach((contextToDelete) => {
        if (!contextToDelete) {
            return;
        }
        // build confirmation dialog first
        dialogStr += `${contextToDelete.name}\n`;
        actualContextsToDelete.push(contextToDelete);
    });

    if (actualContextsToDelete.length === 0) {
        alert(`There aren't any valid targets to delete, so there is nothing to do.`);
        return;
    }

    if (confirm(dialogStr) && confirm(`Are you absolutely sure you want to delete ${actualContextsToDelete.length} container(s)? This is not reversible.`)) {
        // delete every context
        let deletedContexts = [];
        actualContextsToDelete.forEach((contextToDelete, i, arr) => {
            browser.contextualIdentities.remove(contextToDelete.cookieStoreId).then(
                (context) => {
                    deletedContexts.push(context);
                    setHelpText(`Deleted ${deletedContexts.length}/${actualContextsToDelete.length} containers`);
                    resetSelectedContexts();
                },
                (error) => {
                    if (error) {
                        alert(`Error deleting container ${context.name}: ${error}`);
                    }
                }
            );
        });
        return;
    }
};

/**
 * Associates a default URL to each item in the `contextsToSetDefaultUrls`
 * parameter.
 * @param {ContextualIdentity[]} contextsToSetDefaultUrls The `contextualIdentity` array whose default URLs will be updated.
 * @returns {void}
 */
const setMultipleDefaultUrls = (contextsToSetDefaultUrls, urlToSet) => {
    contextsToSetDefaultUrls.forEach((contextToSetDefaultUrl) => {
        if (urlToSet === "none") {
            delete config.containerDefaultUrls[contextToSetDefaultUrl.cookieStoreId.toString()];
            return;
        }
        if (urlToSet && !config.neverConfirmSaveNonHttpUrls && urlToSet.indexOf(`https://`) !== 0 && urlToSet.indexOf(`http://`) !== 0) {
            if (!confirm('Warning: URL\'s should start with "http://" or "https://". Firefox likely will not correctly open pages otherwise. If you would like to proceed, please confirm.\n\nThis dialog can be disabled in the extension options page.')) {
                return;
            }
        }
        config.containerDefaultUrls[contextToSetDefaultUrl.cookieStoreId.toString()] = urlToSet;
    });
    writeContainerDefaultUrlsToStorage();
}

/**
 * Requests a default URL from the user, and assigns that URL to every provided `contextualIdentity`.
 * @param {ContextualIdentity[]} contextsToSetDefaultUrls The `contextualIdentity` array whose default URLs will be updated.
 * @returns {void}
 */
const setMultipleDefaultUrlsWithPrompt = (contextsToSetDefaultUrls) => {
    const userInputUrl = prompt(`What should the default URL be for ${contextsToSetDefaultUrls.length} container(s)?\n\nType "none" (without quotes) to clear the saved default URL value(s).`);
    if (userInputUrl) {
        setMultipleDefaultUrls(contextsToSetDefaultUrls, userInputUrl);
    }
};

// Determines whether or not to override the container's default URL with
// the current tab's URL, based on config.openCurrentTabUrlOnMatch
const getCurrentTabOverrideUrl = (urlToOpen, currentUrl, shouldLogErr) => {
    try {
        if (urlToOpen && currentUrl) {
            const parsedCurrentUrl = new URL(currentUrl);
            let parsedUrlToOpen = new URL(urlToOpen);
            // just determine the top level domain and the next level domain
            // using "tld" as a quick shorthand even though it's not technically correct
            const tldToOpen = parsedUrlToOpen.hostname.split('.').slice(-2).join('.').toLowerCase();
            const tldCurrent = parsedCurrentUrl.hostname.split('.').slice(-2).join('.').toLowerCase();
            switch (config.openCurrentTabUrlOnMatch) {
                case 'origin':
                    if (parsedCurrentUrl.origin.toLowerCase() === parsedUrlToOpen.origin.toLowerCase()) {
                        return currentUrl;
                    }
                    break;
                case 'host':
                    if (parsedCurrentUrl.host.toLowerCase() === parsedUrlToOpen.host.toLowerCase()) {
                        return currentUrl;
                    }
                    break;
                case 'domain':
                    if (tldToOpen === tldCurrent) {
                        return currentUrl;
                    }
                    break;
                case 'domain-port':
                    if (tldToOpen === tldCurrent && parsedCurrentUrl.port === parsedUrlToOpen.port) {
                        return currentUrl;
                    }
                    break;
                case 'hostname':
                    if (parsedCurrentUrl.hostname.toLowerCase() === parsedUrlToOpen.hostname.toLowerCase()) {
                        return currentUrl;
                    }
                    break;
                default:
                    break;
            }
        }
    } catch (err) {
        if (shouldLogErr) {
            console.log(
                `warning: origin/host/hostname match attempt didn't succeed, falling back to container default url; reason: ${err}`
            );
        }
    }

    return "";
}

/**
 * Opens multiple container tabs according to controllable conditions.
 * @param {ContextualIdentity[]} contextsToOpenAsContainers The `contextualIdentity` array that will each open as a container tab.
 * @param {boolean} openAsPinnedTab Whether or not to open as a pinned tab.
 * @param {tab} currentTab The currently active tab. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
 * @returns {void}
 */
const openMultipleContexts = (contextsToOpenAsContainers, openAsPinnedTab, currentTab) => {
    if (contextsToOpenAsContainers.length < 10 || confirm(`Are you sure you want to open ${contextsToOpenAsContainers.length} container tabs?`)) {
        contextsToOpenAsContainers.forEach((contextToOpenAsContainer) => {
            let urlToOpen = config.containerDefaultUrls[contextToOpenAsContainer.cookieStoreId.toString() || ""];
            if (urlToOpen && !config.neverConfirmOpenNonHttpUrls && urlToOpen.indexOf(`http://`) !== 0 && urlToOpen.indexOf(`https://`) !== 0) {
                if (!confirm(`Warning: The URL "${urlToOpen}" does not start with "http://" or "https://". This may cause undesirable behavior. Proceed to open a tab with this URL?\n\nThis dialog can be disabled in the extension options page.`)) {
                    return;
                }
            }

            // requested in
            // https://github.com/charles-m-knox/firefox-containers-helper/issues/29
            if (config.openCurrentTabUrlOnMatch) {
                const overriddenUrlToOpen = getCurrentTabOverrideUrl(urlToOpen, currentTab.url, true);
                if (overriddenUrlToOpen) {
                    urlToOpen = overriddenUrlToOpen;
                }
            }

            // don't even bother querying tabs if the tab url matching
            // configuration option isn't set
            browser.tabs.create(
                {
                    "cookieStoreId": contextToOpenAsContainer.cookieStoreId,
                    "pinned": openAsPinnedTab,
                    "url": urlToOpen
                }
            );
        });
    }
};

/**
 * Renames one or more contexts simultaneously.
 * @param {ContextualIdentity[]} contextsToRename The `contextualIdentities` to change.
 * @returns {void}
 */
const renameContexts = (contextsToRename) => {
    const userInput = prompt(`Rename ${contextsToRename.length} container(s) to:`);
    if (userInput) {
        if (userInput.length > 25) {
            alert('Container names must be no more than 25 characters.');
            return;
        }
        let updatedContexts = [];
        contextsToRename.forEach((contextToRename) => {
            browser.contextualIdentities.update(
                contextToRename.cookieStoreId,
                { "name": userInput }
            ).then(
                (updatedContext) => {
                    updatedContexts.push(updatedContext);
                    setHelpText(`Renamed ${updatedContexts.length} containers`);
                },
                (err) => {
                    if (err) {
                        alert(`Failed to update containers: ${JSON.stringify(err)}`);
                    }
                }
            );
        });
    };
};

/**
 * Updates one or more contexts simultaneously.
 * @param {ContextualIdentity[]} contextsToUpdate The `contextualIdentities` to change.
 * @param {string} fieldToUpdate The field to set for the context(s)
 * @param {string} valueToSet The value to assign to the context(s)' `fieldToUpdate` property
 * @returns {void}
 */
const updateContexts = (contextsToUpdate, fieldToUpdate, valueToSet) => {
    let updatedContexts = [];
    const newValues = {};
    newValues[fieldToUpdate] = valueToSet;
    contextsToUpdate.forEach((contextToUpdate) => {
        browser.contextualIdentities.update(
            contextToUpdate.cookieStoreId,
            newValues
        ).then(
            (updatedContext) => {
                updatedContexts.push(updatedContext);
                setHelpText(`Updated ${updatedContexts.length} containers`);
            },
            (err) => {
                if (err) {
                    alert(`Failed to update containers: ${JSON.stringify(err)}`);
                }
            }
        );
    });
};

/**
 * Sets the color of one or more contexts simultaneously.
 * @param {ContextualIdentity[]} contextsToUpdate The `contextualIdentities` to change.
 * @returns {void}
 */
const setColorForContexts = (contextsToUpdate) => {
    const msg = `Choose a color for ${contextsToUpdate.length} containers from the following list:\n\n${CONTEXT_COLORS.join("\n")}`;
    const newColor = prompt(msg);
    if (newColor && CONTEXT_COLORS.indexOf(newColor) !== -1) {
        updateContexts(contextsToUpdate, "color", newColor);
    }
};

/**
 * Sets the icon of one or more contexts simultaneously.
 * @param {ContextualIdentity[]} contextsToUpdate The `contextualIdentities` to change.
 * @returns {void}
 */
const setIconForContexts = (contextsToUpdate) => {
    const msg = `Choose an icon for ${contextsToUpdate.length} containers from the following list:\n\n${CONTEXT_ICONS.join("\n")}`;
    const newIcon = prompt(msg);
    if (newIcon && CONTEXT_ICONS.indexOf(newIcon) !== -1) {
        updateContexts(contextsToUpdate, "icon", newIcon);
    }
};

/**
 * Executes a find & replace against either a container name or predefined URL.
 * @param {ContextualIdentity[]} contextsToUpdate The `contextualIdentities` to change.
 * @param {string} fieldToUpdate The field to set for the context(s)
 * @param {string} valueToSet The value to assign to the context(s)' `fieldToUpdate` property
 * @returns {void}
 */
const findReplaceNameInContexts = (contextsToUpdate) => {
    const findStr = prompt(`(1/3) What case-sensitive string in ${contextsToUpdate.length} container name(s) would you like to search for?`);
    if (!findStr) return;
    const replaceStr = prompt("(2/3) What string would you like to replace it with?");
    if (findStr && replaceStr !== null) {
        const userConfirm = confirm(`(3/3) Replace the case-sensitive string "${findStr}" with "${replaceStr}" in the name of ${contextsToUpdate.length} container(s)?`);
        if (userConfirm) {
            let updatedContexts = [];
            setHelpText(`Updated ${updatedContexts.length} containers`); // in case the operation fails
            contextsToUpdate.forEach((contextToUpdate) => {
                // if we want to add case-insensitivity back later, uncomment this
                // const lowerContextName = contextToUpdate.name.toLowerCase();
                // if (lowerContextName.indexOf(findStr) !== -1) {
                if (contextToUpdate.name.indexOf(findStr) !== -1) {
                    const newNameStr = contextToUpdate.name.replaceAll(findStr, replaceStr);
                    browser.contextualIdentities.update(
                        contextToUpdate.cookieStoreId,
                        { "name": newNameStr }
                    ).then(
                        (updatedContext) => {
                            updatedContexts.push(updatedContext);
                            setHelpText(`Updated ${updatedContexts.length} containers`);
                        },
                        (err) => {
                            if (err) {
                                alert(`Failed to update containers: ${JSON.stringify(err)}`);
                            }
                        }
                    );
                }
            });
        }
    }
};


/**
 * Executes a find & replace against either a container name or predefined URL.
 * @param {ContextualIdentity[]} contextsToUpdate The `contextualIdentities` to change.
 * @returns {void}
 */
const findReplaceUrlInContexts = (contextsToUpdate) => {
    const findStr = prompt(`(1/3) What case-insensitive string in ${contextsToUpdate.length} container default URL(s) would you like to search for?`);
    if (!findStr) return;
    const replaceStr = prompt("(2/3) What string would you like to replace it with?");
    if (findStr && replaceStr !== null) {
        const userConfirm = confirm(`(3/3) Replace the case-insensitive string "${findStr}" with "${replaceStr}" in the default URL of ${contextsToUpdate.length} container(s)?`);
        if (userConfirm) {
            let updatedContexts = [];
            setHelpText(`Updated ${updatedContexts.length} containers`);
            contextsToUpdate.forEach((contextToUpdate) => {
                // retrieve the lowercase URL for the container by first
                // retrieving its unique ID
                const contextId = contextToUpdate.cookieStoreId;
                const defaultUrlForContext = config.containerDefaultUrls[contextId];
                // check if there is actually a default URL set for this container
                if (defaultUrlForContext) {
                    // there is a default URL, so proceed to find, replace &
                    // update it
                    const lowerContextUrl = defaultUrlForContext.toLowerCase();
                    if (lowerContextUrl.indexOf(findStr) !== -1) {
                        const newUrlStr = lowerContextUrl.replaceAll(findStr, replaceStr);
                        config.containerDefaultUrls[contextId] = newUrlStr;
                        updatedContexts.push(contextToUpdate);
                    }
                }
            });
            // only update storage if needed
            if (updatedContexts.length > 0) {
                writeContainerDefaultUrlsToStorage();
                setHelpText(`Updated ${updatedContexts.length} containers`);
            }
        }
    }
};

/**
 * Duplicates one or more contexts.
 * @param {ContextualIdentity[]} contextsToDuplicate The `contextualIdentities` to duplicate.
 * @returns {void}
 */
const duplicateContexts = (contextsToDuplicate) => {
    if (contextsToDuplicate.length <= 1 || confirm(`Are you sure you want to duplicate ${contextsToDuplicate.length} containers?`)) {
        let createdContexts = [];
        contextsToDuplicate.forEach((contextToDuplicate) => {
            const newContext = {
                color: contextToDuplicate.color,
                icon: contextToDuplicate.icon,
                name: contextToDuplicate.name
            };
            browser.contextualIdentities.create(newContext).then(
                (createdContext) => {
                    createdContexts.push(createdContext);
                    // if the containers have default URL associations, we need to update those too
                    const urlToSet = config.containerDefaultUrls[contextToDuplicate.cookieStoreId] || "none";
                    setMultipleDefaultUrls([createdContext], urlToSet);
                    setHelpText(`Duplicated ${createdContexts.length} containers`);
                    resetSelectedContexts();
                },
                (err) => {
                    if (err) {
                        alert(`Failed to duplicate one or more containers: ${JSON.stringify(err)}`);
                    }
                }
            );
        });
    };
};

/**
 * Adds a brand new context (container).
 * @returns {void}
 */
const addContext = () => {
    if (config.lastQuery) {
        const newContext = {
            color: "toolbar",
            icon: "circle",
            name: config.lastQuery,
        };
        browser.contextualIdentities.create(newContext).then(
            (createdContext) => {
                filterContainers();
                setHelpText(`Added a container named ${config.lastQuery}`);
                resetSelectedContexts();
            },
            (err) => {
                if (err) {
                    alert(`Failed to create a container named ${config.lastQuery}: ${JSON.stringify(err)}`);
                }
            }
        );
    } else {
        alert("You must specify a container name in the input field.")
    }
};


/**
 * Empties out the list of contexts to act on when the "selection mode" is
 * enabled. A precursor to this is that the config option should have been
 *  set before executing this function.
 * @returns {void}
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
 * @param {ContextualIdentity[]} filteredResults A list of the currently filtered set of `browser.contextualIdentities`
 * @param {ContextualIdentity} context The `contextualIdentity` associated with this handler, assume that a user clicked on a specific container to open if this is defined
 * @param {Event} event The event that called this function, such as a key press or mouse click
 * @returns {void}
 */
const containerClickHandler = (filteredContexts, singleContext, event) => {
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

    let contextsToActOn = [];
    if (isAnyContextSelected()) {
        const keys = Object.keys(config.selectedContextIndices);
        for (let i = 0; i < keys.length; i++) {
            if (config.selectedContextIndices[i] === 1) {
                contextsToActOn.push(filteredContexts[i]);
            }
        }
    } else {
        // determine how many containers to modify
        if (shiftModifier) {
            filteredContexts.forEach((filteredContext) => {
                contextsToActOn.push(filteredContext);
            });
        } else {
            if (singleContext) {
                contextsToActOn.push(singleContext);
            } else {
                contextsToActOn.push(filteredContexts[0]);
            }
        }
    }

    browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
        for (let tab of tabs) {
            if (tab.active) {
                let navigatedUrl = '';
                // decision tree
                switch (config.mode) {
                    case MODES.SET_NAME:
                        renameContexts(contextsToActOn);
                        break;
                    case MODES.DELETE:
                        deleteMultipleContainers(contextsToActOn);
                        break;
                    case MODES.SET_URL:
                        setMultipleDefaultUrlsWithPrompt(contextsToActOn);
                        break;
                    case MODES.SET_COLOR:
                        setColorForContexts(contextsToActOn);
                        break;
                    case MODES.SET_ICON:
                        setIconForContexts(contextsToActOn);
                        break;
                    case MODES.REPLACE_IN_NAME:
                        findReplaceNameInContexts(contextsToActOn);
                        break;
                    case MODES.REPLACE_IN_URL:
                        findReplaceUrlInContexts(contextsToActOn);
                        break;
                    case MODES.DUPLICATE:
                        duplicateContexts(contextsToActOn);
                        break;
                    case MODES.OPEN:
                        // the following code exists because in sticky popup mode,
                        // the current tab url changes to blank at first, and
                        // filterContainers() will not show the URL overrides.
                        // So we have to look at the last container in the array
                        // and force filterContainers() to treat that URL as the
                        // active tab URL
                        if (contextsToActOn.length && contextsToActOn[contextsToActOn.length - 1]?.cookieStoreId) {
                            navigatedUrl = config.containerDefaultUrls[contextsToActOn[contextsToActOn.length - 1].cookieStoreId.toString() || ""];
                            // TODO: this is refactorable logic copy/pasted from openMultipleContexts
                            if (config.openCurrentTabUrlOnMatch) {
                                const overriddenUrlToOpen = getCurrentTabOverrideUrl(navigatedUrl, tab.url, false);
                                if (overriddenUrlToOpen) {
                                    navigatedUrl = overriddenUrlToOpen;
                                }
                            }
                        }
                        openMultipleContexts(contextsToActOn, ctrlModifier, tab);
                        break;
                    default:
                        break;
                }
                actionCompletedHandler(navigatedUrl);
                break;
            }
        }
    });

};

/**
 * In preparation for rebuilding the filtered list of containers, this function
 * finds and deletes the container list group elements.
 * @param {Element} containerListElement The empty (by default, before population) `<div>` on the `popup.html` page that holds the entire container list element collection. Retrieve by using document.getElementById(CONTAINER_LIST_DIV_ID)
 * @returns {void}
 */
const removeExistingContainerListGroupElement = (containerListElement) => {
    const existingUlElement = document.getElementById('containerListGroup');
    if (existingUlElement) {
        try {
            containerListElement.removeChild(existingUlElement);
        } catch (ex) {
            console.error(`failed to remove existing list element from document: ${ex}`);
        }
    }
};

/**
 * As part of rebuilding the filtered list of containers, this function
 * assembles a list group element.
 *
 * TODO: make the `containerListGroup` ID use consistent naming conventions
 * @returns {Element} The `<ul>` list group element that will hold the child `<li>` container list items.
 */
const buildContainerListGroupElement = () => {
    const ulElement = document.createElement('ul');
    ulElement.id = 'containerListGroup';
    ulElement.className = "list-group";
    return ulElement;
};

/**
 * Checks if a user input string matches a container name using a rudimentary
 * search algorithm.
 * @param {string} contextName The lowercase name of the `contextualIdentity` to run the search query against
 * @param {string} userQuery A string that the user entered as a search term
 * @returns {boolean} Whether or not a name and query should be included as part of the search results
 */
const isUserQueryContextNameMatch = (contextName, userQuery) => {
    if (contextName.indexOf(userQuery) !== -1) {
        return true;
    }
    return false;
};

/**
 * Applies the user's search query, and updates the list of containers accordingly.
 * @param {Event} event The event that called this function, such as a key press or mouse click
 * @param {string} actualTabUrl When in sticky popup mode, when opening a new URL, the new tab page might not be loaded yet, so the tab query returns an empty URL. actualTabUrl allows a URL to be passed in in advance, so that the extension can properly show URL overrides in the UI.
 * @returns {void}
 */
const filterContainers = (event, actualTabUrl) => {
    if (event) {
        event.preventDefault();
    }
    // retrieve the search query from the user
    const userQuery = document.querySelector("#searchContainerInput").value.trim().toLowerCase();

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

    // now query the contextual identities
    const filteredResults = [];
    browser.contextualIdentities.query({}).then((contexts) => {
        browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
            for (let tab of tabs) {
                if (tab.active) {
                    if (Array.isArray(contexts)) {
                        const containerList = document.getElementById(CONTAINER_LIST_DIV_ID);

                        // prepare by clearing out the old query's HTML output
                        removeExistingContainerListGroupElement(containerList);
                        // now build its successor
                        const ulElement = buildContainerListGroupElement();

                        const lowerCaseUserQuery = userQuery.toLowerCase();

                        contexts.forEach((context, i) => {
                            const lowerCaseContextName = context.name.toLowerCase();

                            if (!userQuery || isUserQueryContextNameMatch(lowerCaseContextName, lowerCaseUserQuery) || checkDefaultUrlsForUserQuery(context, lowerCaseUserQuery)) {
                                const liElement = buildContainerListItem(filteredResults, context, filteredResults.length, tab, actualTabUrl);
                                ulElement.appendChild(liElement);
                                filteredResults.push(context);
                            }
                        });
                        if (filteredResults.length === 0) {
                            const liElement = buildEmptyContainerListItem(0);
                            ulElement.append(liElement);
                        }

                        containerList.appendChild(ulElement);
                        setSummaryText(`Showing ${filteredResults.length}/${contexts.length} containers.`);
                        if (event) {
                            if (event.key === 'Enter' && filteredResults.length > 0) {
                                containerClickHandler(filteredResults, filteredResults[0], event);
                            }
                            event.preventDefault();
                        }
                    }
                    setSelectedListItemClassNames();
                    break;
                }
            }
        });
    }, (error) => {
        console.error(`failed to query contextual identities: ${error}`);
    })
}

/**
 * When a user checks a checkbox, this function toggles that value in the
 * `config` object, as well as setting all of the other mutually exclusive
 * options to `false`. It will also update the UI checkboxes to reflect the
 * values. See `mutuallyExclusiveConfigOptions`.
 * @param {string} parameter The `config` key to toggle.
 * @returns {void}
 */
const setConfigParam = (parameter) => {
    // start by toggling the intended config parameter
    config[parameter] = !config[parameter];

    const extensionStorageConfigStore = {};
    extensionStorageConfigStore[parameter] = config[parameter];

    document.querySelector(`#${parameter}`).checked = config[parameter];
    browser.storage.local.set(extensionStorageConfigStore);
    if (config.alwaysSetSync === true) {
        browser.storage.sync.set(extensionStorageConfigStore);
    }
}

/**
 * Retrieves extension settings from browser storage and persists them to
 * the `config` object, as well as setting the state of a few HTML elements.
 * @param {object} data The data from calling `browser.storage.local.get()`
 * @returns {void}
 */
const processExtensionSettings = (data) => {
    // checks if *any* settings have been defined
    Object.keys(config).forEach((configKey) => {
        if (data[configKey] !== undefined) {
            config[configKey] = data[configKey];
        }
        // this switch/case block is for doing tasks specific to each config
        // key, such as updating UI elements
        switch (configKey) {
            case "mode":
                document.getElementById(`modeSelect`).value = config[configKey];
                break;
            case "windowStayOpenState":
                document.getElementById(`windowStayOpenState`).checked = config[configKey];
            case "selectionMode":
                document.getElementById(`selectionMode`).checked = config[configKey];
            case "containerDefaultUrls":
                // do nothing at this time, because there are no special
                // UI elements to update
                break;
            case "lastQuery":
                document.getElementById("searchContainerInput").value = config[configKey];
            default:
                break;
        }
    });
};

/**
 * Based on the currently selected mode, set a helpful message to show
 * to the user.
 * @returns {void}
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
 * @param {string} newMode The mode to set.
 * @returns {void}
 */
const setMode = (newMode) => {
    config.mode = newMode;

    // push to storage
    browser.storage.local.set({ mode: config.mode });
    if (config.alwaysSetSync === true) {
        browser.storage.sync.set({ mode: config.mode });
    }

    showModeHelpMessage();
};

/**
 * Initializes the extension data upon document load, intended to be added as
 * a callback for the event listener `DOMContentLoaded`.
 * @param {Event?} event The event that called this function, such as a key press or mouse click
 * @returns {void}
 */
const initializeDocument = (event) => {
    browser.storage.sync.get((data) => {
        // if there is data available in sync, process it first
        if (data.alwaysSetSync === true) {
            // done
            processExtensionSettings(data);
            showModeHelpMessage();
            filterContainers();
            if (config.selectionMode) {
                setHelpText(`${platformModifierKey}+Click to select 1; ${platformModifierKey}+Shift+Click for a range`);
            }
            focusSearchBox();
        } else {
            // if the user explicitly does not want to use sync,
            // then get the local storage data
            browser.storage.local.get((data) => {
                if (data) {
                    processExtensionSettings(data);
                    showModeHelpMessage();
                    filterContainers();
                    if (config.selectionMode) {
                        setHelpText(`${platformModifierKey}+Click to select 1; ${platformModifierKey}+Shift+Click for a range`);
                    }
                    focusSearchBox();
                }
            });
        }
    });

    // prevents the Search button from causing page navigation/popup flashes
    document.querySelector("#searchContainerForm").addEventListener("submit", (event) => { event.preventDefault(); });

    // probably the most important event to add, this ensures that
    // key events toggle filtering
    document.querySelector("#searchContainerInput").addEventListener("keyup", filterContainers);

    document.querySelector("#windowStayOpenState").addEventListener("click", () => {
        setConfigParam("windowStayOpenState");
    });
    document.querySelector("#selectionMode").addEventListener("click", () => {
        setConfigParam("selectionMode");
        resetSelectedContexts();
        setSelectedListItemClassNames();
        if (config.selectionMode) {
            setHelpText(`${platformModifierKey}+Click to select 1; ${platformModifierKey}+Shift+Click for a range`);
        } else {
            showModeHelpMessage();
        }
    });
    document.querySelector("#addNewContainer").addEventListener("click", (event) => {
        addContext();
    });

    document.querySelector("#modeSelect").addEventListener("change", (event) => {
        setMode(event.target.value);
        event.preventDefault();
    });
}

// start everything up upon content load
document.addEventListener('DOMContentLoaded', initializeDocument);
