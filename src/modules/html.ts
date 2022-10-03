import { getSetting } from "./config";
import { CONF, helpTextMessages, MODES } from "./constants";

/**
 * Sets a message inside the "warning" text element.
 * @param message The HTML string to put inside the warning text element.
 */
export const help = (message: string) => {
    let msg = message;
    if (!message) {
        // TODO: make this more clean
        const rngHelpMsgIndex = parseInt((Math.random() * helpTextMessages.length).toString(), 10) || 0;
        msg = helpTextMessages[rngHelpMsgIndex];
    }

    const helpText = document.getElementById('helpText') as HTMLSpanElement;
    if (!helpText) return;

    helpText.innerText = msg;
};

/**
 * Sets a message inside the "summary" text element, such as "Showing x/y containers"
 * @param message The HTML string to put inside the summary text element.
 */
export const bottomHelp = (message: string) => {
    const summary = document.getElementById('summaryText');
    if (!summary) return;

    summary.innerText = message;
}

/**
 * Sets focus to the search box. Should be called often, especially on popup.
 */
export const focusSearchBox = () => {
    const search = document.getElementById('searchContainerInput');
    if (!search) return;

    search.focus();
}

/**
 * Based on the currently selected mode, set a helpful message to show
 * to the user.
 */
export const helpful = async (mode?: MODES) => {
    if (!mode) mode = await getSetting(CONF.mode) as MODES;

    switch (mode) {
        case MODES.SET_URL:
            help("URLs are only set for this extension.");
            break;
        case MODES.SET_NAME:
            help("You will be prompted for a new name.")
            break;
        case MODES.REPLACE_IN_URL:
        case MODES.REPLACE_IN_NAME:
            help("You will be prompted for find & replace strings.")
            break;
        case MODES.SET_ICON:
            help("You will be prompted for a new icon.")
            break;
        case MODES.SET_COLOR:
            help("You will be prompted for a new color.")
            break;
        case MODES.DUPLICATE:
            help("Duplicates containers, URLs; not cookies")
            break;
        case MODES.DELETE:
            help("Warning: Will delete containers that you click");
            break;
        case MODES.REFRESH:
            help("Warning: Will delete and recreate containers");
            break;
        default:
            help("");
            break;
    }
};
