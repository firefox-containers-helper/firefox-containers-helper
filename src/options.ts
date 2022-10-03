import { getLocalSettings, getSyncSettings, setLocalSettings, setSettings, setSyncSettings } from "./modules/config";
import { checkDirty, getCleanSettings, objectEquals } from "./modules/helpers";
import { bulkExport, bulkImport } from './modules/preferences';
import { showAlert, showConfirm } from "./modules/modals";
import { ExtensionConfig } from "./types";
import { UrlMatchTypes } from "./modules/constants";

// https://github.com/mdn/webextensions-examples/blob/60ce50b10ee66f6d706b0715909e756e4bdba63d/commands/options.js
// https://github.com/mdn/webextensions-examples/blob/60ce50b10ee66f6d706b0715909e756e4bdba63d/commands/options.html
const commandName = '_execute_browser_action';

/**
 * Reflects the saved value for the keyboard shortcut to show the popup.
 */
const reflectKeyboardShortcut = async () => {
    const shortcutEl = document.getElementById('shortcut');
    if (!shortcutEl) {
        await showAlert('Error: Element with ID shortcut is not present.', 'HTML Error');
        return;
    }

    const shortcut = shortcutEl as HTMLInputElement;

    const commands = await browser.commands.getAll();
    for (const command of commands) {
        if (command.name === commandName && command.shortcut) {
            shortcut.value = command.shortcut;
            return;
        }
    }

    await showAlert('Warning: A keyboard shortcut may not be set correctly.', 'Keyboard Shortcut');
}

/**
 * Sets the validation text.
 *
 * @param msg
 * @param color Bootstrap color class
 */
const setValidationText = (msg: string, color: string) => {
    if (!msg || !color) return;

    const syncValidationText = document.getElementById('syncValidationText');
    if (!syncValidationText) throw 'The syncValidationText element is not present.';

    const className = `badge badge-${color} mt-4`;

    syncValidationText.innerText = msg;
    syncValidationText.className = className;
}

const setSaveSettingsButtonsDisabled = async (disabled: boolean) => {
    const btnSaveLocal = document.getElementById('btnSaveLocal') as HTMLButtonElement;
    const btnSaveSync = document.getElementById('btnSaveSync') as HTMLButtonElement;

    if (!btnSaveLocal) throw 'The btnSaveLocal element is not present.';
    if (!btnSaveSync) throw 'The btnSaveSync element is not present.';

    btnSaveLocal.disabled = disabled;
    btnSaveSync.disabled = disabled;
}

/**
 * Parses the text in the local settings text area into JSON, and updates
 * the UI if it succeed or fails to parse.
 */
const canParseLocal = async (settings?: string): Promise<boolean> => {
    try {
        if (!settings) {
            const text = document.getElementById('localSettingsTextArea') as HTMLTextAreaElement;
            if (!text) throw 'The localSettingsTextArea element is not present.';

            settings = text.value;
        }

        JSON.parse(settings);

        setValidationText('Local settings are valid JSON.', 'primary');

        await setSaveSettingsButtonsDisabled(false);

        await checkSettingsEqual();

        return true;
    } catch (e) {
        setValidationText('Invalid local settings JSON.', 'danger');
        await setSaveSettingsButtonsDisabled(true);
        return false;
    }
}

/**
 * Checks if the saved local and sync settings are equal to each other, and
 * updates UI elements according to the result.
 */
const checkSettingsEqual = async (): Promise<boolean> => {
    const sync = await getSyncSettings();
    const local = await getLocalSettings();

    const equal = objectEquals(sync, local);

    if (!equal) {
        setValidationText('Local/sync settings do not match.', 'danger');
        return equal;
    }

    setValidationText('Local/sync settings match!', 'success');
    return equal;
}

/**
 * Retrieves the extension's locally saved settings, and updates the UI to
 * reflect them.
 */
const reflectLocalSettings = async (): Promise<ExtensionConfig> => {
    try {
        const local = await getLocalSettings();

        const str = JSON.stringify(local);

        await canParseLocal(str);

        const txt = document.getElementById('localSettingsTextArea') as HTMLTextAreaElement;

        const alwaysSetSync = document.getElementById('alwaysSetSync') as HTMLInputElement;
        const alwaysGetSync = document.getElementById('alwaysGetSync') as HTMLInputElement;
        const neverConfirmForOpeningNonHttpUrls = document.getElementById('neverConfirmForOpeningNonHttpUrls') as HTMLInputElement;
        const neverConfirmForSavingNonHttpUrls = document.getElementById('neverConfirmForSavingNonHttpUrls') as HTMLInputElement;
        const openCurrentTabUrlOnMatchSelect = document.getElementById('openCurrentTabUrlOnMatchSelect') as HTMLInputElement;

        if (!txt) throw 'The localSettingsTextArea element is not present.';
        if (!alwaysSetSync) throw 'alwaysSetSync element is not present.';
        if (!alwaysGetSync) throw 'alwaysGetSync element is not present.';
        if (!neverConfirmForOpeningNonHttpUrls) throw 'neverConfirmForOpeningNonHttpUrls element is not present.';
        if (!neverConfirmForSavingNonHttpUrls) throw 'neverConfirmForSavingNonHttpUrls element is not present.';
        if (!openCurrentTabUrlOnMatchSelect) throw 'openCurrentTabUrlOnMatchSelect element is not present.';

        txt.value = str;
        alwaysSetSync.checked = local.alwaysSetSync;
        alwaysGetSync.checked = local.alwaysGetSync;
        neverConfirmForOpeningNonHttpUrls.checked = local.neverConfirmOpenNonHttpUrls;
        neverConfirmForSavingNonHttpUrls.checked = local.neverConfirmSaveNonHttpUrls;
        openCurrentTabUrlOnMatchSelect.value = local.openCurrentTabUrlOnMatch;

        return local;
    } catch (err) {
        throw `Failed to reflect local settings: ${err}`;
    }
}

/**
 * Retrieves the extension's saved sync settings, and updates the UI to
 * reflect them.
 */
const reflectSyncSettings = async (): Promise<ExtensionConfig> => {
    try {
        const sync = await getSyncSettings();

        await checkSettingsEqual();

        const syncSettingsTextArea = document.getElementById('syncSettingsTextArea') as HTMLTextAreaElement;

        if (!syncSettingsTextArea) throw 'syncSettingsTextArea element is not present.';

        syncSettingsTextArea.value = JSON.stringify(sync);

        return sync;
    } catch (err) {
        throw `Error reflecting sync settings: ${err}`;
    }
}

const getLocalSettingsTextArea = async (): Promise<HTMLTextAreaElement | void> => {
    const localSettingsTextAreaEl = document.getElementById('localSettingsTextArea');
    if (!localSettingsTextAreaEl) throw 'The localSettingsTextArea HTML element is not present.';

    const localSettingsTextArea = localSettingsTextAreaEl as HTMLTextAreaElement;

    return localSettingsTextArea;
}

/**
 * Attempts to parse the local input settings text area. Shows modals upon parse
 * failure, so there's no need to show modals upon failure elsewhere, although
 * this honestly is not an optimal choice and should be updated later.
 */
const getConfigFromLocalSettingsTextArea = async (): Promise<ExtensionConfig | void> => {
    try {
        const local = await getLocalSettingsTextArea();

        if (!local) return;

        const valid = await canParseLocal(local.value);

        if (!valid) throw 'The provided local settings do not appear to be valid.';

        const settings = JSON.parse(local.value) as ExtensionConfig;

        return settings;
    } catch (err) {
        throw `Failed get settings from Local Settings text area: ${err}`
    }
}

const saveLocalSettings = async () => {
    const settings = await getConfigFromLocalSettingsTextArea();

    if (!settings) return;

    await setLocalSettings(settings);
}

/**
 * `saveSyncSettings` is identical to `saveLocalSettings`, except it saves to sync
 * instead of local - it even has to validate the user input correctly before
 * saving.
 */
const saveSyncSettings = async () => {
    const text = document.getElementById('localSettingsTextArea') as HTMLTextAreaElement;

    if (!text) throw 'The localSettingsTextArea HTML element is not present.';

    const valid = canParseLocal(text.value);

    if (!valid) throw 'The provided local settings do not appear to be valid.';

    const settings = JSON.parse(text.value) as ExtensionConfig;

    await setSyncSettings(settings);

    await reflectSyncSettings();
    await canParseLocal();
}

const onChangeLocalSettings = async (e: KeyboardEvent) => {
    if (!e) return;
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    if (!target?.value) return;

    await canParseLocal(target.value);
}

/**
 * Previously named `exportContainers`, this function retrieves all containers
 * and updates the bulk export text area to reflect their JSON contents,
 * including their `defaultUrl` values.
 */
const reflectContexts = async () => {
    try {
        const contexts = await bulkExport();

        const textareaEl = document.getElementById('containersExportAsJSON') as HTMLTextAreaElement;
        if (!textareaEl) throw 'The containersExportAsJSON textarea HTML element is not present.';

        const textarea = textareaEl;
        textarea.value = JSON.stringify(contexts);
    } catch (err) {
        throw `failed to reflect contexts: ${err}`;
    }
}

const btnImportContainersClick = async () => {
    try {
        const txt = document.getElementById('containersImportAsJSON') as HTMLTextAreaElement;
        if (!txt) throw 'The containersImportAsJSON textarea HTML element is not present.';

        const imported = await bulkImport(txt.value);

        const s = imported.length === 1 ? '' : 's';

        await reflectLocalSettings();

        await showAlert(`Imported ${imported.length} container${s}.`, 'Bulk Import');
    } catch (err) {
        await showAlert(`Error during bulk import: ${err}`, 'Bulk Import Error');
    }
};

/**
 * Reset the shortcut and update the text box.
 */
const resetShortcut = async (cmd: string) => {
    try {
        await browser.commands.reset(cmd);
        await reflectKeyboardShortcut();
    } catch (err) {
        await showAlert(`Failed to reset the keyboard shortcut: ${err}`, 'Keyboard Shortcut Error');
    }
}

/** Update the shortcut based on the value in the text box. */
const btnUpdateShortcutClick = async () => {
    try {
        const shortcutEl = document.getElementById('shortcut');
        if (!shortcutEl) throw 'Error: Element with ID "shortcut" is not present.';

        const shortcut = shortcutEl as HTMLInputElement;

        await browser.commands.update({
            name: commandName,
            shortcut: shortcut.value,
        });
    } catch (err) {
        await showAlert(`Failed to set the keyboard shortcut: ${err}`, 'Keyboard Shortcut Error');
    }
}

const btnResetLocalClick = async () => {
    try {
        await reflectLocalSettings();
    } catch (err) {
        await showAlert(`Failed to reset local settings: ${err}`, 'Reset Error');
    }
}

const btnRefreshSyncClick = async () => {
    try {
        await reflectSyncSettings();
        await canParseLocal();
    } catch (err) {
        await showAlert(`Failed to refresh sync settings: ${err}`, 'Refresh Error');
    }
}

const btnSaveLocalClick = async () => {
    try {
        await saveLocalSettings();
        await checkSettingsEqual();
    } catch (err) {
        await showAlert(`Failed to save local settings: ${err}`, 'Settings Error');
    }
}

const btnSaveSyncClick = async () => {
    try {
        if (!await showConfirm('Are you sure you want to overwrite your sync settings with your current local settings? This will overwrite values, but will not unset values.', 'Risky Operation')) return;
        await saveSyncSettings();
        await checkSettingsEqual();
        await showAlert('Successfully saved local settings to sync storage.', 'Success');
    } catch (err) {
        await showAlert(`Failed to save sync settings: ${err}`, 'Settings Error');
    }
}

/**
 * Asks the user if they want to clean up the config, and then proceeds to
 * remove any default URL's from the config that do not map to any existing
 * containers.
 */
const btnCleanLocalClick = async () => {
    const proceed = await showConfirm(
        `Sometimes, a container gets deleted, but its URL association within Containers Helper might stay configured. This can stack up over time, and the extension's settings can exceed Firefox Sync quota. This requires a cleanup - generally, this is safe, but if you have important old URLs stored in the Local Settings text field, please copy/paste them to a safe place before continuing, because they will be removed. You will also be given the chance to save the cleaned-up configuration immediately, or continue to edit it. Note that this will also de-select any selected containers from the popup list of containers. If you have more than 1000 cleanup targets, this may take a moment. Proceed?`,
        'Clean Up Config?'
    )

    if (!proceed) return;

    const settings = await getConfigFromLocalSettingsTextArea();

    if (!settings) return;

    const [cleaned, removed] = await getCleanSettings(settings);

    const localSettingsTextArea = await getLocalSettingsTextArea();

    if (!localSettingsTextArea) return;

    localSettingsTextArea.value = JSON.stringify(cleaned);

    const s = removed.length === 1 ? '' : 's';

    const save = await showConfirm(`Cleaned up ${removed.length} orphaned URL association${s}. You can view the new configuration in the Local Settings text field. Would you like to save to the local config now?`, 'Cleaning Success');

    if (!save) return;

    await btnSaveLocalClick();
}

/**
 * Upon toggling a checkbox, the value of that checkbox is propagated to sync
 * and to local storage. Also pushes all other boolean-valued checkboxes.
 */
const toggleOptionCheckbox = async () => {
    try {
        const checkboxSet = document.getElementById("alwaysSetSync") as HTMLInputElement;
        const checkboxGet = document.getElementById("alwaysGetSync") as HTMLInputElement;
        const checkboxProtocolOpen = document.getElementById("neverConfirmForOpeningNonHttpUrls") as HTMLInputElement;
        const checkboxProtocolSave = document.getElementById("neverConfirmForSavingNonHttpUrls") as HTMLInputElement;
        if (!checkboxSet) throw 'The alwaysSetSyncCheckbox HTML element is not present.';
        if (!checkboxGet) throw 'The alwaysGetSyncCheckbox HTML element is not present.';
        if (!checkboxProtocolOpen) throw 'The neverConfirmForOpeningNonHttpUrls HTML element is not present.';
        if (!checkboxProtocolSave) throw 'The neverConfirmForSavingNonHttpUrls HTML element is not present.';


        // these two values are always pushed to firefox sync
        // and stored locally
        const special: Partial<ExtensionConfig> = {
            alwaysSetSync: checkboxSet.checked,
            alwaysGetSync: checkboxGet.checked,
        }

        const update: Partial<ExtensionConfig> = {
            neverConfirmOpenNonHttpUrls: checkboxProtocolOpen.checked,
            neverConfirmSaveNonHttpUrls: checkboxProtocolSave.checked,
        }

        await setLocalSettings(special);
        await setSyncSettings(special);

        await setSettings(update);

        await reflectLocalSettings();
        await reflectSyncSettings();
    } catch (err) {
        await showAlert(`Failed to toggle option to always get/set to sync: ${err}`, 'Settings Error');
    }
}

const onChangeUrlMatchType = async (event: Event) => {
    try {
        const select = document.getElementById("openCurrentTabUrlOnMatchSelect") as HTMLSelectElement;

        if (!select) throw 'The openCurrentTabUrlOnMatchSelect HTML element is not present.';
        if (!event) throw 'The event information is not present for the openCurrentTabUrlOnMatch select callback.';
        if (!event.target) throw 'The event target information is not present for the openCurrentTabUrlOnMatch select callback.';

        const update: Partial<ExtensionConfig> = {
            openCurrentTabUrlOnMatch: select.value as UrlMatchTypes,
        };

        await setSettings(update);

        await reflectLocalSettings();
        await reflectSyncSettings();
    } catch (err) {
        await showAlert(`Failed to change URL match type: ${err}`, 'Settings Error');
    }
}

const btnLoadFromSyncClick = async () => {
    try {
        const sync = await getSyncSettings();

        if (!sync) throw 'No sync data was retrieved.';

        if (!await showConfirm('Are you sure you want to overwrite your local settings with sync settings? This will overwrite values, but will not unset values.', 'Risky Operation')) return;

        await setLocalSettings(sync);

        await reflectLocalSettings();
        await reflectSyncSettings();

        await showAlert('Successfully saved sync settings to local storage.', 'Success');
    } catch (err) {
        await showAlert(`Failed to load settings from sync: ${err}`, 'Settings Error');
    }
}

const btnResetLocalSettingsClick = async () => {
    try {
        const question = "Are you sure you want to reset local settings? You may not be able to undo this.";

        if (!await showConfirm(question, 'Reset local settings?')) return;

        await browser.storage.local.clear();

        await reflectLocalSettings();
    } catch (err) {
        await showAlert(`Failed to clear local settings: ${err}`, 'Clear Settings Error');
    }
}

const btnResetSyncSettingsClick = async () => {
    try {
        const question = "Are you sure you want to reset sync settings? You may not be able to undo this.";

        if (!await showConfirm(question, 'Reset sync settings?')) return;

        await browser.storage.sync.clear();

        await reflectSyncSettings();
    } catch (err) {
        await showAlert(`Failed to clear sync settings: ${err}`, 'Clear Settings Error');
    }
}

const btnExportContainersClick = async () => {
    try {
        await reflectContexts();
    } catch (err) {
        await showAlert(`Failed to export containers: ${err}`, 'Export Error');
    }
}

/**
 * Initializes the extension data upon document load, intended to be added as
 * a callback for the event listener `DOMContentLoaded`.
 */
const init = async () => {
    try {
        const local = await reflectLocalSettings();

        await reflectSyncSettings();

        await reflectContexts();

        await reflectKeyboardShortcut();

        const localSettingsTextArea = document.getElementById('localSettingsTextArea') as HTMLTextAreaElement;
        const update = document.getElementById('update') as HTMLButtonElement;
        const reset = document.getElementById('reset') as HTMLButtonElement;
        const btnResetLocal = document.getElementById('btnResetLocal') as HTMLButtonElement;
        const btnSaveLocal = document.getElementById('btnSaveLocal') as HTMLButtonElement;
        const btnSaveSync = document.getElementById('btnSaveSync') as HTMLButtonElement;
        const btnRefreshSync = document.getElementById('btnRefreshSync') as HTMLButtonElement;
        const btnLoadFromSync = document.getElementById('btnLoadFromSync') as HTMLButtonElement;
        const alwaysSetSync = document.getElementById('alwaysSetSync') as HTMLInputElement;
        const alwaysGetSync = document.getElementById('alwaysGetSync') as HTMLInputElement;
        const btnResetLocalSettings = document.getElementById('btnResetLocalSettings') as HTMLButtonElement;
        const btnResetSyncSettings = document.getElementById('btnResetSyncSettings') as HTMLButtonElement;
        const btnExportContainers = document.getElementById('btnExportContainers') as HTMLButtonElement;
        const btnImportContainersJSON = document.getElementById('btnImportContainersJSON') as HTMLButtonElement;
        const neverConfirmForOpeningNonHttpUrls = document.getElementById('neverConfirmForOpeningNonHttpUrls') as HTMLInputElement;
        const neverConfirmForSavingNonHttpUrls = document.getElementById('neverConfirmForSavingNonHttpUrls') as HTMLInputElement;
        const openCurrentTabUrlOnMatchSelect = document.getElementById('openCurrentTabUrlOnMatchSelect') as HTMLSelectElement;
        const btnCleanLocal = document.getElementById('btnCleanLocal') as HTMLSelectElement;

        if (!localSettingsTextArea) throw 'The localSettingsTextArea HTML element is not present.';
        if (!update) throw 'The update HTML element is not present.';
        if (!reset) throw 'The reset HTML element is not present.';
        if (!btnResetLocal) throw 'The btnResetLocal HTML element is not present.';
        if (!btnSaveLocal) throw 'The btnSaveLocal HTML element is not present.';
        if (!btnSaveSync) throw 'The btnSaveSync HTML element is not present.';
        if (!btnRefreshSync) throw 'The btnRefreshSync HTML element is not present.';
        if (!btnLoadFromSync) throw 'The btnLoadFromSync HTML element is not present.';
        if (!alwaysSetSync) throw 'The alwaysSetSync HTML element is not present.';
        if (!alwaysGetSync) throw 'The alwaysGetSync HTML element is not present.';
        if (!btnResetLocalSettings) throw 'The btnResetLocalSettings HTML element is not present.';
        if (!btnResetSyncSettings) throw 'The btnResetSyncSettings HTML element is not present.';
        if (!btnExportContainers) throw 'The btnExportContainers HTML element is not present.';
        if (!btnImportContainersJSON) throw 'The btnImportContainersJSON HTML element is not present.';
        if (!neverConfirmForOpeningNonHttpUrls) throw 'The neverConfirmForOpeningNonHttpUrls HTML element is not present.';
        if (!neverConfirmForSavingNonHttpUrls) throw 'The neverConfirmForSavingNonHttpUrls HTML element is not present.';
        if (!openCurrentTabUrlOnMatchSelect) throw 'The openCurrentTabUrlOnMatchSelect HTML element is not present.';
        if (!btnCleanLocal) throw 'The btnCleanLocal HTML element is not present.';

        localSettingsTextArea.addEventListener('keyup', onChangeLocalSettings);
        update.addEventListener('click', btnUpdateShortcutClick);
        reset.addEventListener('click', () => { resetShortcut(commandName); });
        btnResetLocal.addEventListener('click', btnResetLocalClick);
        btnSaveLocal.addEventListener('click', btnSaveLocalClick);
        btnSaveSync.addEventListener('click', btnSaveSyncClick);
        btnRefreshSync.addEventListener('click', btnRefreshSyncClick);
        btnLoadFromSync.addEventListener('click', btnLoadFromSyncClick);
        alwaysSetSync.addEventListener('click', toggleOptionCheckbox);
        alwaysGetSync.addEventListener('click', toggleOptionCheckbox);
        btnResetLocalSettings.addEventListener('click', btnResetLocalSettingsClick);
        btnResetSyncSettings.addEventListener('click', btnResetSyncSettingsClick);
        btnExportContainers.addEventListener('click', btnExportContainersClick);
        btnImportContainersJSON.addEventListener('click', btnImportContainersClick);
        neverConfirmForOpeningNonHttpUrls.addEventListener('click', toggleOptionCheckbox);
        neverConfirmForSavingNonHttpUrls.addEventListener('click', toggleOptionCheckbox);
        openCurrentTabUrlOnMatchSelect.addEventListener('change', onChangeUrlMatchType);
        btnCleanLocal.addEventListener('click', btnCleanLocalClick);

        // check if the config is dirty

        if (!local) return;

        const dirty = await checkDirty(local);

        if (dirty <= 0) return;

        const s = dirty === 1 ? '' : 's';
        const are = dirty === 1 ? 'is' : 'are';

        const cleanUp = await showConfirm(
            `Warning: There ${are} ${dirty} orphaned container/URL association${s} in the config. You can request a cleanup of the extension's saved settings. It is recommended to proceed so that the extension can consume less storage space and operate more efficiently. Would you like to begin the cleanup? You will be prompted with more information.`,
            'Clean Up Config?',
        );

        if (!cleanUp) return;

        await btnCleanLocalClick();
    } catch (err) {
        await showAlert(`Failed to initialize: ${err}`, 'Initialization Error');
    }
}

document.addEventListener('DOMContentLoaded', init);
