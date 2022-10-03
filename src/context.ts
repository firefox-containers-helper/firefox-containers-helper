import { ensureConfig, getSetting, getSettings } from './modules/config';
import { PlatformModifierKey, CONF } from './modules/constants';
import { checkDirty } from "./modules/helpers";
import { help, focusSearchBox, helpful } from './modules/html';
import { filter } from './modules/lib';
import { showAlert } from './modules/modals';
import { setHandlers } from './modules/handlers';
import { reflectSettings } from './modules/elements';

/**
 * Initializes the extension data upon document load, intended to be added as
 * a callback for the event listener `DOMContentLoaded`.
 */
const init = async () => {
    if (!document) return;

    try {
        await ensureConfig();

        await reflectSettings();

        await filter();

        if (await getSetting(CONF.selectionMode) as boolean === true) {
            help(`${PlatformModifierKey}+Click to select 1; ${PlatformModifierKey}+Shift+Click for a range`);
        } else {
            await helpful();
        }

        await setHandlers();

        focusSearchBox();

        // check if the config is dirty
        const settings = await getSettings();
        if (!settings) return;

        const dirty = await checkDirty(settings);
        if (dirty <= 0) return;

        const s = dirty === 1 ? '' : 's';
        const msg = `Cleanup needed, visit Preferences (${dirty} orphan${s})`;

        help(msg);
    } catch (err) {
        const msg = 'Failed to initialize page';
        const title = 'Initialization Error';
        if (err) {
            await showAlert(`${msg} due to error: ${err}`, title);
            return;
        }

        await showAlert(`${msg} due to an unknown error.`, title);
    }
}

document.addEventListener('DOMContentLoaded', async () => { init(); });
