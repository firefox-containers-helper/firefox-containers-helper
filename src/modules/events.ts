import { ExtensionConfig } from "src/types";
import { containerListItemActiveDangerClassNames, containerListItemActiveClassNames, containerListItemSelectedClassNames, containerListItemInactiveClassNames } from "./classes";
import { MODES, containerListItemUrlLabelInverted, containerListItemUrlLabel } from "./constants";
import { isContextSelected } from "./helpers";

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
export const addEmptyEventListenersToElement = (element: HTMLElement) => {
    element.addEventListener('mouseover', haltingCallback);
    element.addEventListener('mouseleave', haltingCallback);
};

/**
 * Adds click and other event handlers to a container list item HTML element.
 * @param liElement The container list item that will receive all event listeners
 * @param filteredResults A list of the currently filtered set of browser.contextualIdentities
 * @param context The contextualIdentity that this list item will represent
 * @param i The index of this contextualIdentity within the filteredResults array
 * @returns Any error message, or empty string if no errors occurred.
 */
export const applyEventListenersToContainerListItem = (
    liElement: HTMLElement,
    filteredResults: browser.contextualIdentities.ContextualIdentity[],
    context: browser.contextualIdentities.ContextualIdentity,
    i: number,
    config: ExtensionConfig,
    containerClickHandler: any, // TODO: create type def for containerClickHandler
): string => {
    try {
        liElement.addEventListener('mouseover', (event: MouseEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            if (config.mode === MODES.DELETE || config.mode === MODES.REFRESH) {
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

            if (isContextSelected(i, config.selectedContextIndices)) {
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

            if (config.mode === MODES.DELETE || config.mode === MODES.REFRESH) {
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

            if (isContextSelected(i, config.selectedContextIndices)) {
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
