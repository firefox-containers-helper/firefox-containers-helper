import { ExtensionConfig } from "src/types";
import { containerListItemActiveDangerClassNames, containerListItemActiveClassNames, containerListItemSelectedClassNames, containerListItemInactiveClassNames } from "./classes";
import { getSetting } from "./config";
import { MODES, containerListItemUrlLabelInverted, containerListItemUrlLabel, CONF } from "./constants";
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

export const addEmptyEventListeners = (elements: HTMLElement[]) => {
    for (let i = 0; i < elements.length; i++) {
        addEmptyEventListenersToElement(elements[i]);
    }
}

/**
 * Adds click and other event handlers to a container list item HTML element.
 * @param li The container list item that will receive all event listeners
 * @param filteredResults A list of the currently filtered set of browser.contextualIdentities
 * @param context The contextualIdentity that this list item will represent
 * @param i The index of this contextualIdentity within the filteredResults array
 * @returns Any error message, or empty string if no errors occurred.
 */
export const setEventListeners = async (
    li: HTMLLIElement,
    filteredResults: browser.contextualIdentities.ContextualIdentity[],
    context: browser.contextualIdentities.ContextualIdentity,
    i: number,
    containerClickHandler: any, // TODO: create type def for containerClickHandler
) => {
    try {
        const urlLabelId = `filtered-context-${i}-url-label`;

        const mouseOver = async (event: MouseEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            const mode = await getSetting(CONF.mode);

            if (mode === MODES.DELETE || mode === MODES.REFRESH) {
                target.className = containerListItemActiveDangerClassNames;
                return;
            }

            target.className = containerListItemActiveClassNames;

            const urlLabel = document.getElementById(urlLabelId) as HTMLSpanElement;
            if (urlLabel) urlLabel.className = containerListItemUrlLabelInverted;
        };

        const mouseLeave = async (event: MouseEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            const urlLabel = document.getElementById(urlLabelId) as HTMLSpanElement;

            const selected = await getSetting(CONF.selectedContextIndices);

            if (isContextSelected(i, selected)) {
                target.className = containerListItemSelectedClassNames;
                if (urlLabel) urlLabel.className = containerListItemUrlLabelInverted;

                return;
            }

            target.className = containerListItemInactiveClassNames;

            if (urlLabel) urlLabel.className = containerListItemUrlLabel;
        }

        const onClick = (event: MouseEvent) => containerClickHandler(filteredResults, context, event);

        const keyDown = async (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                containerClickHandler(filteredResults, context, event);
            }
        }

        const onFocus = async (event: Event) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            const mode = await getSetting(CONF.mode);

            if (mode === MODES.DELETE || mode === MODES.REFRESH) {
                target.className = containerListItemActiveDangerClassNames;
                return;
            }

            target.className = containerListItemActiveClassNames;

            const urlLabel = document.getElementById(urlLabelId) as HTMLSpanElement;
            if (urlLabel) urlLabel.className = containerListItemUrlLabel;
        }

        const onBlur = async (event: FocusEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            const selected = await getSetting(CONF.selectedContextIndices);

            if (isContextSelected(i, selected)) {
                target.className = containerListItemSelectedClassNames;
                return;
            }

            target.className = containerListItemInactiveClassNames;

            const urlLabel = document.getElementById(urlLabelId) as HTMLSpanElement;
            if (urlLabel) urlLabel.className = containerListItemUrlLabel;
        }

        li.addEventListener('mouseover', mouseOver);
        li.addEventListener('mouseleave', mouseLeave);
        li.addEventListener('click', onClick);
        li.addEventListener('keydown', keyDown);
        li.addEventListener('onfocus', onFocus);
        li.addEventListener('blur', onBlur);
    } catch (e) {
        throw `failed to apply an event listener: ${JSON.stringify(e)}`;
    }
};
