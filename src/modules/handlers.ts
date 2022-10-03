import { SelectedContextIndex } from "src/types";
import { getSetting } from "./config";
import { CONF, PlatformModifierKey } from "./constants";
import { reflectSelected } from "./elements";
import { help, helpful } from "./html";
import { toggleConfigFlag, filter, add, setMode, setSortMode, deselect } from "./lib";

const stayOpenToggle = async (/* _: MouseEvent */) => {
    await toggleConfigFlag(CONF.windowStayOpenState);
}

const selectionModeToggle = async (/* _: MouseEvent */) => {
    await toggleConfigFlag(CONF.selectionMode);

    reflectSelected(await getSetting(CONF.selectedContextIndices) as SelectedContextIndex);

    if (await getSetting(CONF.selectionMode)) {
        help(`${PlatformModifierKey}+Click to select 1; ${PlatformModifierKey}+Shift+Click for a range`);
        return;
    }

    await helpful();
}

const openCurrentPageToggle = async (/* _: MouseEvent */) => {
    await toggleConfigFlag(CONF.openCurrentPage);

    if (await getSetting(CONF.openCurrentPage)) {
        help(`Every container will open your current tab's URL.`);
    } else {
        await helpful();
    }

    await filter();
}

const addClick = async (/* _: MouseEvent */) => { await add(); };

const modeChange = async (event: Event) => {
    if (!event.target) return;

    const target = event.target as HTMLSelectElement;

    await setMode(target.value);

    event.preventDefault();
}

const sortChange = async (event: Event) => {
    if (!event.target) return;

    const target = event.target as HTMLSelectElement;

    await setSortMode(target.value);

    await deselect();

    await filter();

    event.preventDefault();
}

const searchKeyUp = (event: KeyboardEvent) => { filter(event); };

const searchSubmit = (submitEvent: SubmitEvent) => { submitEvent.preventDefault(); };

/** Sets HTML event handlers for all interactive components. */
export const setHandlers = async () => {
    const searchContainerForm = document.getElementById('searchContainerForm');
    const searchContainerInput = document.getElementById('searchContainerInput');
    const windowStayOpenState = document.getElementById('windowStayOpenState');
    const selectionMode = document.getElementById('selectionMode');
    const openCurrentPage = document.getElementById('openCurrentPage');
    const addNewContainer = document.getElementById('addNewContainer');
    const modeSelect = document.getElementById('modeSelect');
    const sortModeSelect = document.getElementById('sortModeSelect');

    if (!searchContainerForm) throw `The HTML element searchContainerForm is not available.`;
    if (!searchContainerInput) throw `The HTML element searchContainerInput is not available.`;
    if (!windowStayOpenState) throw `The HTML element windowStayOpenState is not available.`;
    if (!selectionMode) throw `The HTML element selectionMode is not available.`;
    if (!openCurrentPage) throw `The HTML element openCurrentPage is not available.`;
    if (!addNewContainer) throw `The HTML element addNewContainer is not available.`;
    if (!modeSelect) throw `The HTML element modeSelect is not available.`;
    if (!sortModeSelect) throw `The HTML element sortModeSelect is not available.`;

    // prevents the Search button from causing page navigation/popup flashes
    (searchContainerForm as HTMLFormElement).addEventListener("submit", searchSubmit);
    (searchContainerInput as HTMLInputElement).addEventListener("keyup", searchKeyUp);
    (windowStayOpenState as HTMLInputElement).addEventListener("click", stayOpenToggle);
    (selectionMode as HTMLInputElement).addEventListener("click", selectionModeToggle);
    (openCurrentPage as HTMLInputElement).addEventListener("click", openCurrentPageToggle);
    (addNewContainer as HTMLInputElement).addEventListener("click", addClick);
    (modeSelect as HTMLSelectElement).addEventListener("change", modeChange);
    (sortModeSelect as HTMLSelectElement).addEventListener("change", sortChange);
}
