"use strict";
// helpful links:
// https://github.com/mdn/webextensions-examples/blob/master/favourite-colour/options.js
// https://github.com/crazymousethief/container-plus/blob/master/context.js
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities/ContextualIdentity

let initialLoadingComplete = false;

/**
 * All configuration options for this web extension are stored in this object.
 * @typedef {Object} Configuration
 * @property {boolean} windowStayOpenState - Keeps the window open while the user clicks on a container tab.
 * @property {boolean} deleteContainersOnClick
 * @property {boolean} setDefaultUrlsOnClick
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
 * @property {boolean} deleteContainersOnClick
 * @property {boolean} setDefaultUrlsOnClick
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
     * deleteContainersOnClick triggers deletion of contextual identities
     * (containers) upon clicking a container tab result.
     * @type {boolean}
     * @default
     */
    deleteContainersOnClick: false,

    /**
     * setDefaultUrlsOnClick will prompt the user to set a default URL for
     * each container tab result if set to true.
     * @type {boolean}
     * @default
     */
    setDefaultUrlsOnClick: false,

    /**
     * containerDefaultUrls is a key-value pair of container ID's to
     * default URLs to open for each container ID.
     * @example {"container-name-01":"https://site.com"}
     * @type {object}
     * @default
     */
    containerDefaultUrls: {},
};


/**
 * This is the set of classes to assign to a container list item that is not
 * currently being hovered over. Assign to `element.className` for a given element.
 * @constant
 * @type {string}
 * @default
 */
const containerListItemInactiveClassNames = 'list-group-item container-list-item d-flex justify-content-space-between align-items-center';

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
 * The `<div>` ID of the container list. This is where all of the queried containers will go.
 * @constant
 * @type {string}
 * @default
 */
const CONTAINER_LIST_DIV_ID = 'container-list';

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
 * @returns {Element} An HTML element containing text that represents the
 * container's name and default URL, if defined.
 */
const buildContainerLabelElement = (context) => {
    const containerLabelElement = document.createElement('span');
    containerLabelElement.className = 'container-list-text px-3';
    containerLabelElement.innerText = `${context.name}`;
    const contextDefaultUrl = config.containerDefaultUrls[context.cookieStoreId.toString() || ""];
    if (contextDefaultUrl) {
        containerLabelElement.innerHTML = `${context.name.substr(0, 25)} <br/> ${contextDefaultUrl.substr(0, 25)} `;
    }
    addEmptyEventListenersToElement(containerLabelElement);

    return containerLabelElement;
};

/**
 * Adds click and other event handlers to a container list item HTML element.
 * @param {Element} liElement The container list item that will receive all event listeners
 * @param {ContextualIdentity[]} filteredResults A list of the currently filtered set of browser.contextualIdentities
 * @param {ContextualIdentity} context The contextualIdentity that this list item will represent
 * @returns {string} Any error message, or empty string if no errors occurred.
 */
const applyEventListenersToContainerListItem = (liElement, filteredResults, context) => {
    try {
        liElement.addEventListener('mouseover', (event) => {
            if (config.deleteContainersOnClick) {
                event.target.className = containerListItemActiveDangerClassNames;
            } else {
                event.target.className = containerListItemActiveClassNames;
            }
        });
        liElement.addEventListener('mouseleave', (event) => {
            event.target.className = containerListItemInactiveClassNames;
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
            if (config.deleteContainersOnClick) {
                event.target.className = containerListItemActiveDangerClassNames;
            } else {
                event.target.className = containerListItemActiveClassNames;
            }
        });
        liElement.addEventListener('blur', (event) => {
            event.target.className = containerListItemInactiveClassNames;
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
 * @returns {Element} An HTML element with event listeners, formatted with css as a bootstrap list item.
 */
const buildContainerListItem = (filteredResults, context) => {
    const liElement = document.createElement('li');
    liElement.className = "list-group-item d-flex justify-content-space-between align-items-center";

    const containerIconHolderElement = buildContainerIconElement(context);
    const containerLabelElement = buildContainerLabelElement(context);

    if (config.deleteContainersOnClick) {
        const divElement = document.createElement('div');
        divElement.className = "d-flex justify-content-center align-items-center align-content-center"
        addEmptyEventListenersToElement(divElement);
        divElement.appendChild(containerIconHolderElement);
        liElement.appendChild(divElement);
    } else {
        liElement.appendChild(containerIconHolderElement);
    }

    liElement.appendChild(containerLabelElement);

    const err = applyEventListenersToContainerListItem(liElement, filteredResults, context);
    if (err) {
        console.error(`encountered error building list item for context ${context.name}: ${err}`)
    }

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
const setWarningText = (message) => {
    document.querySelector("#warningText").innerHTML = message;
};

/**
 * When toggling the "Delete mode" option, this will set the help text accordingly.
 * @returns {void}
 */
const setDeletionWarningText = () => {
    if (config.deleteContainersOnClick) {
        setWarningText("Warning: Will delete containers that you click");
        return;
    }

    setWarningText("");
}

/**
 * When toggling the "Set Default URLs" option, this will set the help text accordingly.
 * @returns {void}
 */
const setUrlWarningText = () => {
    if (config.setDefaultUrlsOnClick) {
        setWarningText("URLs do not affect multi-account container preferences.");
        return;
    }
    setWarningText("");
}

/**
 * Sets a message inside the "summary" text element, such as "Showing x/y containers"
 * @param {string} message The HTML string to put inside the summary text element.
 * @returns {void}
 */
const setSummaryText = (message) => {
    document.querySelector("#summaryText").innerHTML = message;
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
 * Asks if the user wants to delete a single container, and executes if the user says so.
 * TODO: For unit testability, convert to an asynchronous function.
 * @param {ContextualIdentity} contextToDelete The `contextualIdentity` to possibly be deleted.
 * @returns {void}
 */
const deleteSingleContainer = (contextToDelete) => {
    if (confirm(`Are you sure you want to delete the container ${contextToDelete.name}?`)) {
        browser.contextualIdentities.remove(contextToDelete.cookieStoreId).then(
            (deletedContext) => {
                if (!deletedContext) {
                    setWarning("Container not found.");
                    return;
                }
                setWarningText(`Deleted container ${deletedContext.name}`);
            },
            (error) => {
                if (error) {
                    alert(`Error deleting container ${contextToDelete.name}: ${error}`);
                }
            }
        );
    }
};

/**
 * Asks if the user wants to delete multiple containers, and executes if the user says so.
 * TODO: For unit testability, convert to an asynchronous function.
 * @param {ContextualIdentity[]} contextsToDelete The `contextualIdentity` array to possibly be deleted.
 * @returns {void}
 */
const deleteMultipleContainers = (contextsToDelete) => {
    let dialogStr = `Are you sure you want to delete the following containers?\n\n`;
    contextsToDelete.forEach((contextToDelete) => {
        // build confirmation dialog first
        dialogStr += `${contextToDelete.name}\n`;
    });

    if (confirm(dialogStr)) {
        // delete every context
        let deletedContexts = [];
        contextsToDelete.forEach((contextToDelete) => {
            browser.contextualIdentities.remove(contextToDelete.cookieStoreId).then(
                (context) => {
                    console.log(`deleted ${context.name}`);
                    deletedContexts.push(context);
                    setWarningText(`Deleted ${deletedContexts.length}/${contextsToDelete.length} containers`);
                },
                (error) => {
                    if (error) {
                        alert(`Error deleting container ${context.name}: ${error}`);
                    }
                }
            );
        });
    }
};

/**
 * Requests a default URL from the user, and assigns that URL to every provided `contextualIdentity`.
 * TODO: easy refactor opportunity w/ setSingleDefaultUrl
 * @param {ContextualIdentity[]} contextsToSetDefaultUrls The `contextualIdentity` array whose default URLs will be updated.
 * @returns {void}
 */
const setMultipleDefaultUrls = (contextsToSetDefaultUrls) => {
    const userInputUrl = prompt(`What should the default URL be for ${contextsToSetDefaultUrls.length} containers?\n\nType "none" (without quotes) to clear the saved default URL value(s).`);
    if (userInputUrl) {
        contextsToSetDefaultUrls.forEach((contextToSetDefaultUrl) => {
            if (userInputUrl === "none") {
                delete config.containerDefaultUrls[contextToSetDefaultUrl.cookieStoreId.toString()];
                return;
            }
            config.containerDefaultUrls[contextToSetDefaultUrl.cookieStoreId.toString()] = userInputUrl;
        });
        writeContainerDefaultUrlsToStorage();
    }
};

/**
 * Requests a default URL from the user, and assigns that URL to the provided `contextualIdentity`.
 * TODO: easy refactor opportunity w/ setMultipleDefaultUrls
 * @param {ContextualIdentity} contextToSetDefaultUrl The `contextualIdentity` whose default URL will be updated.
 * @returns {void}
 */
const setSingleDefaultUrl = (contextToSetDefaultUrl) => {
    const userInputUrl = prompt(`What should the default URL be for the ${contextToSetDefaultUrl.name} container?\n\nType "none" (without quotes) to clear the saved default URL value.`);
    if (userInputUrl) {
        if (userInputUrl === "none") {
            delete config.containerDefaultUrls[contextToSetDefaultUrl.cookieStoreId.toString()]
        } else {
            config.containerDefaultUrls[contextToSetDefaultUrl.cookieStoreId.toString()] = userInputUrl;
        }
        writeContainerDefaultUrlsToStorage();
    }
};

/**
 * Opens multiple container tabs according to controllable conditions.
 * @param {ContextualIdentity[]} contextsToOpenAsContainers The `contextualIdentity` array that will each open as a container tab.
 * @param {boolean} openAsPinnedTab Whether or not to open as a pinned tab.
 * @returns {void}
 */
const openMultipleContexts = (contextsToOpenAsContainers, openAsPinnedTab) => {
    if (contextsToOpenAsContainers.length < 10 || confirm(`Are you sure you want to open ${contextsToOpenAsContainers.length} container tabs?`)) {
        contextsToOpenAsContainers.forEach((contextToOpenAsContainer) => {
            const urlToOpen = config.containerDefaultUrls[contextToOpenAsContainer.cookieStoreId.toString() || ""];
            browser.tabs.create(
                {
                    "cookieStoreId": contextToOpenAsContainer.cookieStoreId,
                    "pinned": openAsPinnedTab,
                    "url": urlToOpen
                });
        });
    }
};

/**
 * Opens a single container tab according to controllable conditions.
 * @param {ContextualIdentity[]} contextToOpenAsContainer The `contextualIdentity` that will open as a container tab.
 * @param {boolean} openAsPinnedTab Whether or not to open as a pinned tab.
 * @returns {void}
 */
const openSingleContext = (contextToOpenAsContainer, openAsPinnedTab) => {
    openMultipleContexts([contextToOpenAsContainer], openAsPinnedTab);
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
    let shouldOpenPinnedTab = false;
    let shouldExecuteOnAllResults = false;
    if (event) {
        if (event.getModifierState('Control')) {
            shouldOpenPinnedTab = true;
        }
        if (event.getModifierState('Shift')) {
            shouldExecuteOnAllResults = true;
        }
    }

    // decision tree
    if (config.setDefaultUrlsOnClick && shouldExecuteOnAllResults) {
        setMultipleDefaultUrls(filteredContexts);
    } else if (config.setDefaultUrlsOnClick && !shouldExecuteOnAllResults) {
        setSingleDefaultUrl(singleContext)
    } else if (config.deleteContainersOnClick && shouldExecuteOnAllResults) {
        deleteMultipleContainers(filteredContexts);
    } else if (!config.deleteContainersOnClick && shouldExecuteOnAllResults) {
        openMultipleContexts(filteredContexts, shouldOpenPinnedTab);
    } else if (config.deleteContainersOnClick && !shouldExecuteOnAllResults) {
        deleteSingleContainer(singleContext);
    } else if (!config.deleteContainersOnClick && !shouldExecuteOnAllResults) {
        openSingleContext(singleContext, shouldOpenPinnedTab);
    }

    // decide to close the extension or not at the last step
    if (config.windowStayOpenState === false) {
        window.close();
    } else {
        filterContainers();
    }
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
 * Applies the user's search query, and updates the list of containers accordingly.
 * @param {Event} event The event that called this function, such as a key press or mouse click
 * @returns {void}
 */
const filterContainers = (event) => {
    if (event) {
        event.preventDefault();
    }
    // retrieve the search query from the user
    const userQuery = document.querySelector("#searchContainerInput").value.trim().toLowerCase();

    // now query the contextual identities
    const filteredResults = [];
    browser.contextualIdentities.query({}).then((contexts) => {
        if (contexts) {
            const containerList = document.getElementById(CONTAINER_LIST_DIV_ID);

            // prepare by clearing out the old query's HTML output
            removeExistingContainerListGroupElement(containerList);
            // now build its successor
            const ulElement = buildContainerListGroupElement();

            contexts.forEach((context) => {
                if (!userQuery || context.name.toLowerCase().indexOf(userQuery) !== -1 || checkDefaultUrlsForUserQuery(context, userQuery)) {
                    const liElement = buildContainerListItem(filteredResults, context);
                    ulElement.appendChild(liElement);
                    filteredResults.push(context);
                }
            })

            containerList.appendChild(ulElement);
            setSummaryText(`Showing ${filteredResults.length}/${contexts.length} containers. <br/>Tip: Shift+Click to execute against every shown result`);
            if (event) {
                if (event.key === 'Enter') {
                    containerClickHandler(filteredResults, filteredResults[0], event);
                }
                event.preventDefault();
            }
        }
    }, (error) => {
        console.error(`failed to query contextual identities: ${error}`);
    })

    if (!initialLoadingComplete) {
        initialLoadingComplete = true;
        document.querySelector("#listOfContainersRow").className = "row border-bottom mt-3"
    }
}

/**
 * Retrieves extension settings from browser storage and persists them to
 * the `config` object, as well as setting the state of a few HTML elements.
 * @param {object} data The data from calling `browser.storage.local.get()`
 * @returns {void}
 */
const processExtensionSettings = (data) => {
    if (data) {
        // sets the "stay open" config setting
        config.windowStayOpenState = data.windowStayOpenState === true;

        // updates the HTML element (checkbox) for the "stay open" config setting
        document.querySelector("#closePopupOnClick").checked = config.windowStayOpenState;

        // sets the "delete containers on click" config setting
        config.deleteContainersOnClick = data.deleteContainersOnClick === true;

        // updates HTML elements for "delete containers on click" setting
        document.querySelector("#deleteContainersOnClick").checked = config.deleteContainersOnClick;
        setDeletionWarningText();

        // applies container default URLs to config object, if they exist
        if (data.containerDefaultUrls) {
            config.containerDefaultUrls = data.containerDefaultUrls;
        }

        // sets the "set default URLs on click" config setting
        config.setDefaultUrlsOnClick = data.setDefaultUrlsOnClick === true;

        // updates the "set default URLs on click" HTML elements
        document.querySelector("#setDefaultUrlsOnClick").checked = config.setDefaultUrlsOnClick;
    }
};

/**
 * Initializes the extension data upon document load, intended to be added as
 * a callback for the event listener `DOMContentLoaded`.
 * @param {Event?} event The event that called this function, such as a key press or mouse click
 * @returns {void}
 */
const initializeDocument = (event) => {
    // initialize the "stay open" boolean state
    browser.storage.local.get((data) => {
        processExtensionSettings(data);
        filterContainers();
        focusSearchBox();
    });

    // prevents the Search button from causing page navigation/popup flashes
    document.querySelector("#searchContainerForm").addEventListener("submit", (event) => { event.preventDefault(); });

    // probably the most important event to add, this ensures that
    // key events toggle filtering
    document.querySelector("#searchContainerInput").addEventListener("keyup", filterContainers);

    // when clicking the "stay open" checkbox, this toggles the config state
    document.querySelector("#closePopupOnClick").addEventListener("click", () => {
        config.windowStayOpenState = !config.windowStayOpenState;
        browser.storage.local.set({ "windowStayOpenState": config.windowStayOpenState });
    });

    // when clicking the "set default URLs" checkbox, this toggles the config state
    document.querySelector("#setDefaultUrlsOnClick").addEventListener("click", () => {
        config.deleteContainersOnClick = false;
        config.setDefaultUrlsOnClick = !config.setDefaultUrlsOnClick;
        browser.storage.local.set({
            "deleteContainersOnClick": config.deleteContainersOnClick,
            "setDefaultUrlsOnClick": config.setDefaultUrlsOnClick,
        });
        // updates HTML elements for "delete containers on click" setting
        document.querySelector("#deleteContainersOnClick").checked = config.deleteContainersOnClick;
        // updates the "set default URLs on click" HTML elements
        document.querySelector("#setDefaultUrlsOnClick").checked = config.setDefaultUrlsOnClick;
        setUrlWarningText();
    });

    // when clicking the "delete containers on click" checkbox, this toggles the config state
    document.querySelector("#deleteContainersOnClick").addEventListener("click", () => {
        config.deleteContainersOnClick = !config.deleteContainersOnClick;
        config.setDefaultUrlsOnClick = false;
        browser.storage.local.set({
            "deleteContainersOnClick": config.deleteContainersOnClick,
            "setDefaultUrlsOnClick": config.setDefaultUrlsOnClick,
        });
        // updates HTML elements for "delete containers on click" setting
        document.querySelector("#deleteContainersOnClick").checked = config.deleteContainersOnClick;
        // updates the "set default URLs on click" HTML elements
        document.querySelector("#setDefaultUrlsOnClick").checked = config.setDefaultUrlsOnClick;
        setDeletionWarningText();
    });
}

// start everything up upon content load
document.addEventListener('DOMContentLoaded', initializeDocument);
