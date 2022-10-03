import { ActHandler, SelectedContextIndex } from "src/types";
import { CLASSES_CONTAINER_LI_URL_LABEL_INVERTED, CLASSES_CONTAINER_LI_URL_LABEL, CLASSES_CONTAINER_LI_ACTIVE_DANGER, CLASSES_CONTAINER_LI_ACTIVE, CLASSES_CONTAINER_LI_SELECTED, CLASSES_CONTAINER_LI_INACTIVE } from "./classes";
import { getSetting } from "./config";
import { MODES, CONF } from "./constants";
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
 * @param filtered A list of the currently filtered set of browser.contextualIdentities
 * @param context The contextualIdentity that this list item will represent
 * @param i The index of this contextualIdentity within the filteredResults array
 * @returns Any error message, or empty string if no errors occurred.
 */
export const setEventListeners = async (
    li: HTMLLIElement,
    filtered: browser.contextualIdentities.ContextualIdentity[],
    context: browser.contextualIdentities.ContextualIdentity,
    i: number,
    actHandler: ActHandler,
) => {
    try {
        const urlLabelId = `filtered-context-${i}-url-label`;

        const mouseOver = async (event: MouseEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            const mode = await getSetting(CONF.mode);

            if (mode === MODES.DELETE || mode === MODES.REFRESH) {
                target.className = CLASSES_CONTAINER_LI_ACTIVE_DANGER;
                return;
            }

            target.className = CLASSES_CONTAINER_LI_ACTIVE;

            const urlLabel = document.getElementById(urlLabelId) as HTMLSpanElement;
            if (urlLabel) urlLabel.className = CLASSES_CONTAINER_LI_URL_LABEL_INVERTED;
        };

        const mouseLeave = async (event: MouseEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            const urlLabel = document.getElementById(urlLabelId) as HTMLSpanElement;

            const selected = await getSetting(CONF.selectedContextIndices) as SelectedContextIndex;

            if (isContextSelected(i, selected)) {
                target.className = CLASSES_CONTAINER_LI_SELECTED;
                if (urlLabel) urlLabel.className = CLASSES_CONTAINER_LI_URL_LABEL_INVERTED;

                return;
            }

            target.className = CLASSES_CONTAINER_LI_INACTIVE;

            if (urlLabel) urlLabel.className = CLASSES_CONTAINER_LI_URL_LABEL;
        }

        const onClick = (event: MouseEvent) => actHandler(filtered, context, event);

        const keyDown = async (event: KeyboardEvent) => {
            console.debug(`keydown`, event);
            if (event.key === 'Enter') {
                actHandler(filtered, context, event);
            }
        }

        const onFocus = async (event: Event) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            const mode = await getSetting(CONF.mode);

            if (mode === MODES.DELETE || mode === MODES.REFRESH) {
                target.className = CLASSES_CONTAINER_LI_ACTIVE_DANGER;
                return;
            }

            target.className = CLASSES_CONTAINER_LI_ACTIVE;

            const urlLabel = document.getElementById(urlLabelId) as HTMLSpanElement;
            if (urlLabel) urlLabel.className = CLASSES_CONTAINER_LI_URL_LABEL;
        }

        const onBlur = async (event: FocusEvent) => {
            if (!event || !event.target) return;

            const target = event.target as HTMLElement;

            const selected = await getSetting(CONF.selectedContextIndices) as SelectedContextIndex;

            if (isContextSelected(i, selected)) {
                target.className = CLASSES_CONTAINER_LI_SELECTED;
                return;
            }

            target.className = CLASSES_CONTAINER_LI_INACTIVE;

            const urlLabel = document.getElementById(urlLabelId) as HTMLSpanElement;
            if (urlLabel) urlLabel.className = CLASSES_CONTAINER_LI_URL_LABEL;
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

/**
 * Determines if `ctrl` and if `shift` are individually pressed.
 *
 * @returns Two booleans in order: `ctrlModifier` and `shiftModifier`.
 */
export const getModifiers = (event?: MouseEvent | KeyboardEvent): [boolean, boolean] => {
    if (!event) return [false, false];

    let ctrl = false;
    let shift = false;

    if (event.getModifierState('Control') || event.getModifierState('Meta')) {
        ctrl = true;
    }
    if (event.getModifierState('Shift')) {
        shift = true;
    }

    return [ctrl, shift];
}


/**
 * Warning: `beforeunload` events are not fired for an extension popup
 */
const unloader = async (event: BeforeUnloadEvent) => {
    if (!event) return;

    const msg = 'Are you sure you want to leave this page? An action is still in progress.';

    event.preventDefault();

    // unfortunately, the browser doesn't support showing a custom modal
    // and reacting; you have to use event.returnValue. But if that ever
    // changes, it would look a  bit like this:
    // const proceed = await showConfirm(msg, 'Still Processing');

    event.returnValue = msg;

};

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
 *
 * Warning: `beforeunload` events are not fired for an extension popup
 */
export const preventUnload = () => {
    window.addEventListener('beforeunload', unloader);
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
 *
 * Warning: `beforeunload` events are not fired for an extension popup
 */
export const relieveUnload = () => {
    try {
        window.removeEventListener('beforeunload', unloader)
    } catch {
        // do nothing
    }
}
