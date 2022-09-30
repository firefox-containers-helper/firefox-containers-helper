import { ExtensionConfig, SelectedContextIndex } from "src/types";
import { containerListItemSelectedClassNames, containerListItemInactiveClassNames } from "./classes";
import { containerListItemUrlLabelInverted, containerListItemUrlLabel, MODES } from "./constants";
import { getCurrentTabOverrideUrl } from "./helpers";
import {
    addEmptyEventListenersToElement, applyEventListenersToContainerListItem,
} from './events';
import { showAlert } from "./modals";

/**
 * As part of rebuilding the filtered list of containers, this function
 * assembles a list group element.
 *
 * TODO: make the `containerListGroup` ID use consistent naming conventions
 * @returns The `<ul>` list group element that will hold the child `<li>` container list items.
 */
export const buildContainerListGroupElement = (): HTMLElement => {
    const ulElement = document.createElement('ul');
    ulElement.id = 'containerListGroup';
    ulElement.className = "list-group";
    return ulElement;
};


/**
 * Sets the proper class names for filtered contexts that are either selected
 * or not
 */
export const setSelectedListItemClassNames = (selected: SelectedContextIndex) => {
    const keys = Object.keys(selected);
    for (let i = 0; i < keys.length; i++) {
        const liElement = document.getElementById(`filtered-context-${i}-li`);
        const urlLabel = document.getElementById(`filtered-context-${i}-url-label`);
        if (selected[i] === 1) {
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
export const buildContainerIconElement = (context: browser.contextualIdentities.ContextualIdentity): HTMLElement => {
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
export const buildContainerLabelElement = (
    context: browser.contextualIdentities.ContextualIdentity,
    i: number,
    currentTab: browser.tabs.Tab,
    actualCurrentUrl: string,
    config: ExtensionConfig,
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
export const buildEmptyContainerLabelElement = (label: string): HTMLElement => {
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
 * Assembles an HTML element that contains an entire container list item.
 * @param filteredResults A list of the currently filtered set of browser.contextualIdentities
 * @param context The contextualIdentity that this list item will represent
 * @param i The index of this contextualIdentity within the filteredResults array
 * @param currentTab The currently active tab. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
 * @param actualCurrentUrl The URL that the current tab is supposed to be loading.
 * @returns An HTML element with event listeners, formatted with css as a bootstrap list item.
 */
export const buildContainerListItem = (
    filteredResults: browser.contextualIdentities.ContextualIdentity[],
    context: browser.contextualIdentities.ContextualIdentity,
    i: number,
    currentTab: browser.tabs.Tab,
    actualCurrentUrl: string,
    mode: MODES,
    config: ExtensionConfig,
    containerClickHandler: any, // TODO: create type def for containerClickHandler
) => {
    const liElement = document.createElement('li');
    liElement.className = "list-group-item d-flex justify-content-space-between align-items-center";

    const containerIconHolderElement = buildContainerIconElement(context);
    const containerLabelElement = buildContainerLabelElement(context, i, currentTab, actualCurrentUrl, config);

    if (mode === MODES.DELETE || mode === MODES.REFRESH) {
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

    const err = applyEventListenersToContainerListItem(
        liElement,
        filteredResults,
        context,
        i,
        config,
        containerClickHandler,
    );
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
export const buildEmptyContainerListItem = (i: number): HTMLElement => {
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
 * In preparation for rebuilding the filtered list of containers, this function
 * finds and deletes the container list group elements.
 * @param containerListElement The empty (by default, before population) `<div>` on the `popup.html` page that holds the entire container list element collection. Retrieve by using document.getElementById(CONTAINER_LIST_DIV_ID)
 */
export const removeExistingContainerListGroupElement = (containerListElement: HTMLElement) => {
    const list = document.getElementById('containerListGroup');
    if (!list) {
        return;
    }

    containerListElement.removeChild(list);
};