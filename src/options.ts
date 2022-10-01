import { checkDirty, getCleanSettings } from "./modules/helpers";
import { showAlert, showConfirm } from "./modules/modals";
import { ContextualIdentityWithURL, ExtensionConfig } from "./types";

// https://github.com/mdn/webextensions-examples/blob/60ce50b10ee66f6d706b0715909e756e4bdba63d/commands/options.js
// https://github.com/mdn/webextensions-examples/blob/60ce50b10ee66f6d706b0715909e756e4bdba63d/commands/options.html
const commandName = '_execute_browser_action';

var localSettings: ExtensionConfig | any = {};
var syncSettings: ExtensionConfig | any = {};

/** Update the UI: set the value of the shortcut text box. */
const updateUI = async () => {
    const shortcutEl = document.getElementById('shortcut');
    if (!shortcutEl) {
        await showAlert('Error: Element with ID shortcut is not present.', 'HTML Error');
        return;
    }

    const shortcut = shortcutEl as HTMLInputElement;

    let commands = await browser.commands.getAll();
    for (const command of commands) {
        if (command.name === commandName && command.shortcut) {
            shortcut.value = command.shortcut;
            return;
        }
    }

    await showAlert('Warning: A keyboard shortcut may not be set correctly.', 'Keyboard Shortcut');
}

/** Update the shortcut based on the value in the text box. */
const updateShortcut = async () => {
    const shortcutEl = document.getElementById('shortcut');
    if (!shortcutEl) {
        await showAlert('Error: Element with ID shortcut is not present.', 'HTML Error');
        return;
    }

    const shortcut = shortcutEl as HTMLInputElement;

    try {
        await browser.commands.update({
            name: commandName,
            shortcut: shortcut.value,
        });
    } catch (err) {
        if (err) {
            await showAlert(`Failed to set the keyboard shortcut: ${JSON.stringify(err)}`, 'Keyboard Shortcut Error');
            return;
        }

        await showAlert(`Failed to set the keyboard shortcut due to an unknown error.`, 'Keyboard Shortcut Error');
        return;
    }
}

/**
 * Reset the shortcut and update the textbox.
 */
const resetShortcut = async (cmd: string) => {
    try {
        await browser.commands.reset(cmd);
        await updateUI();
    } catch (err) {
        if (err) {
            await showAlert(`Failed to reset the keyboard shortcut: ${JSON.stringify(err)}`, 'Keyboard Shortcut Error');
            return;
        }

        await showAlert(`Failed to reset the keyboard shortcut due to an unknown error.`, 'Keyboard Shortcut Error');
        return;
    }
}

// This is a shameless copy of deep equality comparison from StackOverflow.
// Disclaimer: Deep equality is impossible to completely assess. Also,
// I've written my own deep equality implementations in JavaScript before,
// but it's smarter and more pragmatic to crowd source, so long as
// the code is reviewed and passes test cases.
// https://stackoverflow.com/a/16788517
const objectEquals = (x: any, y: any): boolean => {
    'use strict';

    if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    // after this just checking type of one would be enough
    if (x.constructor !== y.constructor) { return false; }
    // if they are functions, they should exactly refer to same one (because of closures)
    if (x instanceof Function) { return x === y; }
    // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    if (x instanceof RegExp) { return x === y; }
    if (x === y || x.valueOf() === y.valueOf()) { return true; }
    if (Array.isArray(x) && x.length !== y.length) { return false; }

    // if they are dates, they must had equal valueOf
    if (x instanceof Date) { return false; }

    // if they are strictly equal, they both need to be object at least
    if (!(x instanceof Object)) { return false; }
    if (!(y instanceof Object)) { return false; }

    // recursive object equality check
    var p = Object.keys(x);
    return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
        p.every(function (i) { return objectEquals(x[i], y[i]); });
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
    if (!syncValidationText) return;

    let className = `badge badge-${color} mt-4`;

    syncValidationText.innerText = msg;
    syncValidationText.className = className;
}

const setSaveSettingsButtonsDisabled = async (disabled: boolean) => {
    const btnSaveLocalEl = document.getElementById('btnSaveLocal');
    const btnSaveSyncEl = document.getElementById('btnSaveSync');

    if (!btnSaveLocalEl) {
        await showAlert('The btnSaveLocal element is not present.', 'HTML Error');
        return;
    }
    if (!btnSaveSyncEl) {
        await showAlert('The btnSaveSync element is not present.', 'HTML Error');
        return;
    }

    const btnSaveLocal = btnSaveLocalEl as HTMLButtonElement;
    const btnSaveSync = btnSaveSyncEl as HTMLButtonElement;

    btnSaveLocal.disabled = disabled;
    btnSaveSync.disabled = disabled;
}

const validateLocalSettings = async (settings?: any): Promise<boolean> => {
    try {
        if (!settings) {
            const localSettingsTextAreaEl = document.getElementById('localSettingsTextArea');
            if (!localSettingsTextAreaEl) {
                await showAlert('The localSettingsTextArea element is not present.', 'HTML Error');
                return false;
            }

            const localSettingsTextArea = localSettingsTextAreaEl as HTMLTextAreaElement;

            settings = localSettingsTextArea.value;
        }

        localSettings = JSON.parse(settings);

        setValidationText('Local settings are valid JSON.', 'primary');

        await setSaveSettingsButtonsDisabled(false);

        await checkSettingsAreEqual();

        return true;
    } catch (e) {
        setValidationText('Invalid local settings JSON.', 'danger');
        await setSaveSettingsButtonsDisabled(true);
        return false;
    }
}

const onChangeLocalSettings = (e: KeyboardEvent) => {
    if (!e) return;
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    if (target.value) {
        validateLocalSettings(target.value);
    }
}

const checkSettingsAreEqual = async () => {
    let result = false;
    if (localSettings && syncSettings) {
        result = objectEquals(localSettings, syncSettings);
    }
    result ?
        setValidationText('Local/sync settings match!', 'success') :
        setValidationText('Local/sync settings do not match.', 'danger');

    return result;
}

const resetLocalSettings = async () => {
    try {
        const data = await browser.storage.local.get();

        localSettings = { ...data };

        validateLocalSettings(JSON.stringify(data));

        const localSettingsEl = document.getElementById('localSettingsTextArea');
        if (!localSettingsEl) {
            await showAlert('The localSettingsTextArea element is not present.', 'HTML Error');
            return;
        }

        const localSettingsTxt = localSettingsEl as HTMLTextAreaElement;

        localSettingsTxt.value = JSON.stringify(data);
    } catch (err) {
        if (err) {
            await showAlert(`Failed to retrieve browser storage data: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to retrieve browser storage data due to an unknown error.`, 'Settings Error');
        return;
    }
}

const resetButtonClick = () => {
    resetLocalSettings();
}

const refreshSyncSettings = async () => {
    try {
        const data = await browser.storage.sync.get();
        syncSettings = { ...data };

        await checkSettingsAreEqual();

        const syncSettingsTextAreaEl = document.getElementById('syncSettingsTextArea');
        const alwaysSetSyncEl = document.getElementById('alwaysSetSync');
        const alwaysGetSyncEl = document.getElementById('alwaysGetSync');
        const neverConfirmForOpeningNonHttpUrlsEl = document.getElementById('neverConfirmForOpeningNonHttpUrls');
        const neverConfirmForSavingNonHttpUrlsEl = document.getElementById('neverConfirmForSavingNonHttpUrls');
        const openCurrentTabUrlOnMatchSelectEl = document.getElementById('openCurrentTabUrlOnMatchSelect');

        if (!syncSettingsTextAreaEl) {
            throw 'syncSettingsTextArea element is not present.';
        }
        if (!alwaysSetSyncEl) {
            throw 'alwaysSetSync element is not present.';
        }
        if (!alwaysGetSyncEl) {
            throw 'alwaysGetSync element is not present.';
        }
        if (!neverConfirmForOpeningNonHttpUrlsEl) {
            throw 'neverConfirmForOpeningNonHttpUrls element is not present.';
        }
        if (!neverConfirmForSavingNonHttpUrlsEl) {
            throw 'neverConfirmForSavingNonHttpUrls element is not present.';
        }
        if (!openCurrentTabUrlOnMatchSelectEl) {
            throw 'openCurrentTabUrlOnMatchSelect element is not present.';
        }

        const syncSettingsTextArea = syncSettingsTextAreaEl as HTMLTextAreaElement;
        const alwaysSetSync = alwaysSetSyncEl as HTMLInputElement;
        const alwaysGetSync = alwaysGetSyncEl as HTMLInputElement;
        const neverConfirmForOpeningNonHttpUrls = neverConfirmForOpeningNonHttpUrlsEl as HTMLInputElement;
        const neverConfirmForSavingNonHttpUrls = neverConfirmForSavingNonHttpUrlsEl as HTMLInputElement;
        const openCurrentTabUrlOnMatchSelect = openCurrentTabUrlOnMatchSelectEl as HTMLInputElement;

        syncSettingsTextArea.value = JSON.stringify(data);
        alwaysSetSync.checked = data.alwaysSetSync;
        alwaysGetSync.checked = data.alwaysGetSync;
        neverConfirmForOpeningNonHttpUrls.checked = data.neverConfirmOpenNonHttpUrls;
        neverConfirmForSavingNonHttpUrls.checked = data.neverConfirmSaveNonHttpUrls;
        openCurrentTabUrlOnMatchSelect.value = data.openCurrentTabUrlOnMatch;
    } catch (err) {
        if (err) {
            await showAlert(`Failed to retrieve browser storage data: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to retrieve browser storage data due to an unknown error.`, 'Settings Error');
        return;
    }
}

const btnRefreshSyncClick = () => {
    refreshSyncSettings();
    validateLocalSettings();
}

const getLocalSettingsTextArea = async (): Promise<HTMLTextAreaElement | void> => {
    const localSettingsTextAreaEl = document.getElementById('localSettingsTextArea');
    if (!localSettingsTextAreaEl) {
        await showAlert('The localSettingsTextArea HTML element is not present.', 'HTML Error');
        return;
    }
    const localSettingsTextArea = localSettingsTextAreaEl as HTMLTextAreaElement;

    return localSettingsTextArea;
}

/**
 * Attempts to parse the local input settings text area. Shows modals upon parse
 * failure, so there's no need to show modals upon failure elsewhere, although
 * this honestly is not an optimal choice and should be updated later.
 */
const getConfigFromLocalSettingsTextArea = async (): Promise<ExtensionConfig | void> => {
    const localSettingsTextArea = await getLocalSettingsTextArea();

    if (!localSettingsTextArea) return;

    try {
        const valid = validateLocalSettings(localSettingsTextArea.value);
        if (!valid) {
            await showAlert('The provided local settings do not appear to be valid.', 'Invalid Settings');
            return;
        }
        const settings = JSON.parse(localSettingsTextArea.value) as ExtensionConfig;

        return settings;
    } catch (err) {
        if (err) {
            await showAlert(`Failed get settings from Local Settings text area: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed get settings from Local Settings text area due to an unknown error.`, 'Settings Error');
        return;
    }
}

const saveLocalSettings = async () => {
    try {
        const settings = await getConfigFromLocalSettingsTextArea();

        if (!settings) return;

        await browser.storage.local.set(settings);

        await showAlert('Successfully saved local settings.', 'Success');
        return;
    } catch (err) {
        if (err) {
            await showAlert(`Failed to save local settings: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to save local settings due to an unknown error.`, 'Settings Error');
        return;
    }
}

/**
 * `saveSyncSettings` is identical to `saveLocalSettings`, except it saves to sync
 * instead of local - it even has to validate the user input correctly before
 * saving.
 */
const saveSyncSettings = async () => {
    const localSettingsTextAreaEl = document.getElementById('localSettingsTextArea');
    if (!localSettingsTextAreaEl) {
        await showAlert('The localSettingsTextArea HTML element is not present.', 'HTML Error');
        return;
    }

    const localSettingsTextArea = localSettingsTextAreaEl as HTMLTextAreaElement;

    try {
        const valid = validateLocalSettings(localSettingsTextArea.value);
        if (!valid) {
            await showAlert('The provided local settings do not appear to be valid.', 'Invalid Settings');
            return;
        }
        const settings = JSON.parse(localSettingsTextArea.value);

        await browser.storage.sync.set(settings);

        refreshSyncSettings();
        validateLocalSettings();

        await showAlert('Successfully saved local settings to sync.', 'Success');
        return;
    } catch (err) {
        if (err) {
            await showAlert(`Failed to save sync settings: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to save sync settings due to an unknown error.`, 'Settings Error');
        return;
    }
}

const btnSaveLocalClick = async () => {
    await saveLocalSettings();
    await checkSettingsAreEqual();
}

const btnSaveSyncClick = async () => {
    await saveSyncSettings();
    await checkSettingsAreEqual();
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

    localSettings = { ...cleaned };
    localSettingsTextArea.value = JSON.stringify(localSettings);

    const s = removed.length === 1 ? '' : 's';

    const save = await showConfirm(`Cleaned up ${removed.length} orphaned URL association${s}. You can view the new configuration in the Local Settings text field. Would you like to save to the local config now?`, 'Cleaning Success');

    if (!save) return;

    await btnSaveLocalClick();
}

/**
 * TODO: Refactor this since it's nearly identical to `toggleAlwaysGetSyncSettings`
 */
const toggleAlwaysSetSyncSettings = async () => {
    const checkboxEl = document.getElementById("alwaysSetSync");
    if (!checkboxEl) {
        await showAlert('The alwaysSetSyncCheckbox HTML element is not present.', 'HTML Error');
        return;
    }

    const checkbox = checkboxEl as HTMLInputElement;

    try {
        await browser.storage.local.set({ "alwaysSetSync": checkbox.checked });

        await browser.storage.sync.set({ "alwaysSetSync": checkbox.checked });

        resetLocalSettings();
        refreshSyncSettings();
    } catch (err) {
        if (err) {
            await showAlert(`Failed to toggle the 'always set sync settings' option: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to toggle the 'always set sync settings' option due to an unknown error.`, 'Settings Error');
        return;
    }
}

/**
 * TODO: Refactor this since it's nearly identical to `toggleAlwaysSetSyncSettings`
 */
const toggleAlwaysGetSyncSettings = async () => {
    const checkboxEl = document.getElementById("alwaysGetSync");
    if (!checkboxEl) {
        await showAlert('The alwaysGetSyncCheckbox HTML element is not present.', 'HTML Error');
        return;
    }

    const checkbox = checkboxEl as HTMLInputElement;

    try {
        await browser.storage.local.set({ "alwaysGetSync": checkbox.checked });

        await browser.storage.sync.set({ "alwaysGetSync": checkbox.checked });

        resetLocalSettings();
        refreshSyncSettings();
    } catch (err) {
        if (err) {
            await showAlert(`Failed to toggle the 'always get sync settings' option: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to toggle the 'always get sync settings' option due to an unknown error.`, 'Settings Error');
        return;
    }
}

/**
 * TODO: Refactor this since it's nearly identical to `toggleAlwaysSetSyncSettings`
 */
const toggleNeverConfirmOpenNonHttpUrlsSettings = async () => {
    const checkboxEl = document.getElementById("neverConfirmForOpeningNonHttpUrls");
    if (!checkboxEl) {
        await showAlert('The neverConfirmForOpeningNonHttpUrls HTML element is not present.', 'HTML Error');
        return;
    }

    const checkbox = checkboxEl as HTMLInputElement;

    try {
        await browser.storage.local.set({ "neverConfirmOpenNonHttpUrls": checkbox.checked });

        await browser.storage.sync.set({ "neverConfirmOpenNonHttpUrls": checkbox.checked });

        resetLocalSettings();
        refreshSyncSettings();
    } catch (err) {
        if (err) {
            await showAlert(`Failed to toggle the 'require HTTP or HTTPS on open' option: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to toggle the 'require HTTP or HTTPS on open' option due to an unknown error.`, 'Settings Error');
        return;
    }
}

/**
 * TODO: Refactor this since it's nearly identical to `toggleAlwaysSetSyncSettings`
 */
const toggleNeverConfirmSavingNonHttpUrlsSettings = async () => {
    const checkboxEl = document.getElementById("neverConfirmForSavingNonHttpUrls");
    if (!checkboxEl) {
        await showAlert('The neverConfirmForSavingNonHttpUrls HTML element is not present.', 'HTML Error');
        return;
    }

    const checkbox = checkboxEl as HTMLInputElement;

    try {
        await browser.storage.local.set({ "neverConfirmSaveNonHttpUrls": checkbox.checked });

        await browser.storage.sync.set({ "neverConfirmSaveNonHttpUrls": checkbox.checked });

        resetLocalSettings();
        refreshSyncSettings();
    } catch (err) {
        if (err) {
            await showAlert(`Failed to toggle the 'require HTTP or HTTPS on save' option: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to toggle the 'require HTTP or HTTPS on save' option due to an unknown error.`, 'Settings Error');
        return;
    }
}
const openCurrentTabUrlOnMatchSelectChange = async (event: Event) => {
    const selectEl = document.getElementById("openCurrentTabUrlOnMatchSelect");
    if (!selectEl) {
        await showAlert('The openCurrentTabUrlOnMatchSelect HTML element is not present.', 'HTML Error');
        return;
    }

    if (!event) {
        await showAlert('The event information is not present for the openCurrentTabUrlOnMatch select callback.', 'Error');
        return;
    }

    if (!event.target) {
        await showAlert('The event target information is not present for the openCurrentTabUrlOnMatch select callback.', 'Error');
        return;
    }

    const select = event.target as HTMLSelectElement;

    try {
        await browser.storage.local.set({ "openCurrentTabUrlOnMatch": select.value });

        await browser.storage.sync.set({ "openCurrentTabUrlOnMatch": select.value });

        resetLocalSettings();
        refreshSyncSettings();
    } catch (err) {
        if (err) {
            await showAlert(`Failed to toggle the 'require HTTP or HTTPS' option: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to toggle the 'require HTTP or HTTPS' option due to an unknown error.`, 'Settings Error');
        return;
    }
}

const btnLoadFromSyncClick = async () => {
    try {
        const data = await browser.storage.sync.get();

        if (!data) {
            await showAlert('No data was retrieved from storage.', 'Warning');
            return;
        }

        await browser.storage.local.set(data);

        resetLocalSettings();
        refreshSyncSettings();
    } catch (err) {
        if (err) {
            await showAlert(`Failed to load settings from sync: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to load settings from sync due to an unknown error.`, 'Settings Error');
        return;
    }
}

const btnResetLocalSettingsClick = async () => {
    const question = "Are you sure you want to reset local settings? You may not be able to undo this.";

    if (!await showConfirm(question, 'Reset local settings?')) return;

    await browser.storage.local.clear();

    resetLocalSettings();
}

const btnResetSyncSettingsClick = async () => {
    const question = "Are you sure you want to reset sync settings? You may not be able to undo this.";

    if (!await showConfirm(question, 'Reset sync settings?')) return;

    await browser.storage.sync.clear();

    refreshSyncSettings();
}

const btnExportContainersClick = async () => {
    await exportContainers();
}

const exportContainers = async (alertIfNone: boolean = true) => {
    try {
        const config = await browser.storage.local.get();

        const contexts: ContextualIdentityWithURL[] = await browser.contextualIdentities.query({});

        // assemble the default url for each context
        for (let i = 0; i < contexts.length; i++) {
            contexts[i].defaultUrl = "";
            if (config.containerDefaultUrls &&
                config.containerDefaultUrls[contexts[i].cookieStoreId.toString()]) {
                contexts[i].defaultUrl = config.containerDefaultUrls[contexts[i].cookieStoreId.toString()];
            }
        }

        const textareaEl = document.getElementById('containersExportAsJSON');
        if (!textareaEl) {
            await showAlert('The containersExportAsJSON textarea HTML element is not present.', 'HTML Error');
            return;
        }

        const textarea = textareaEl as HTMLTextAreaElement;
        textarea.value = JSON.stringify(contexts);

        if (!contexts.length) {
            if (alertIfNone) await showAlert('There are no containers to export.', 'Info');
            return;
        }

        // build csv
        const keys = Object.keys(contexts[0]);
        keys.sort();
        const keysQuotes = keys.map((key) => `"${key}"`)
        const rows = contexts.map((context) => {
            return keys.map((key) => {
                return `"${(context as any)[key]}"`;
            }).join(",");
        })

        const csvEl = document.getElementById('containersExportAsCSV');
        if (!csvEl) {
            await showAlert('The containersExportAsCSV textarea HTML element is not present.', 'HTML Error');
            return;
        }

        const csv = csvEl as HTMLTextAreaElement;

        csv.value = `${keysQuotes.join(",")}\n${rows.join("\n")}`;
    } catch (err) {
        if (err) {
            await showAlert(`Failed to export containers: ${JSON.stringify(err)}`, 'Export Error');
            return;
        }

        await showAlert(`Failed to export containers due to an unknown error.`, 'Export Error');
        return;
    }
}

const btnImportContainersClick = async () => {
    const textImportEl = document.getElementById('containersImportAsJSON');
    if (!textImportEl) {
        await showAlert('The containersImportAsJSON textarea HTML element is not present.', 'HTML Error');
        return;
    }

    const textImport = textImportEl as HTMLTextAreaElement;

    let containers = "";
    try {
        containers = JSON.parse(textImport.value);
    } catch (err) {
        if (err) {
            await showAlert(`Failed to parse the import containers text field as JSON: ${JSON.stringify(err)}`, 'Import Error');
            return;
        }

        await showAlert(`Failed to parse the import containers text field as JSON due to an unknown error.`, 'Import Error');
        return;
    }

    if (!Array.isArray(containers)) {
        await showAlert('The "Import Containers" text input field must be valid JSON, and it must be an array of objects.', 'Import Error');
        return;
    }

    if (containers.length === 0) {
        await showAlert(`The "Import Containers" text input field is valid, but you provided an empty array, so there's nothing to do.`, 'Import Error');
        return;
    }

    // validate that each container has a name
    for (const container of containers) {
        if (!container.name) {
            await showAlert(`There is a problem with the containers you attempted to import. The following container does not have the required 'name' field: ${JSON.stringify(container)}`, 'Import Error');
            return;
        }
    }

    if (!await showConfirm(`Please confirm that you'd like to add ${containers.length} containers.`, 'Add Containers?')) {
        return;
    }

    const msgs: string[] = [];

    try {
        // retrieve the extension configuration from storage
        const config = await browser.storage.local.get();

        for (const container of containers) {
            const toCreate: browser.contextualIdentities._CreateDetails = {
                name: container.name,
                icon: container.icon ? container.icon : "circle",
                color: container.color ? container.color : "toolbar",
            };

            const created = await browser.contextualIdentities.create(toCreate);

            if (!config.containerDefaultUrls) {
                config.containerDefaultUrls = {};
            }

            if (container.defaultUrl) {
                // associate the default URL
                config.containerDefaultUrls[created.cookieStoreId.toString()] = container.defaultUrl;
                msgs.push(`Imported container ${created.name} with a default URL.`);
            } else {
                msgs.push(`Imported container ${created.name}.`);
            }
        }

        // TODO: this is a duplicate of the function writeContainerDefaultUrlsToStorage
        //       from context.js, please refactor
        browser.storage.local.set({ "containerDefaultUrls": config.containerDefaultUrls });
        if (config.alwaysSetSync === true) {
            browser.storage.sync.set({ "containerDefaultUrls": config.containerDefaultUrls });
        }

        if (msgs.length <= 5) {
            await showAlert(msgs.join('\n'), 'Completed');
            return;
        }

        await showAlert('The import finished.', 'Completed');
        return;
    } catch (err) {
        if (err) {
            await showAlert(`Failed to create a container: ${JSON.stringify(err)}`, 'Settings Error');
            return;
        }

        await showAlert(`Failed to create a container due to an unknown error.`, 'Settings Error');
        return;
    }
};

const makeBiggerClick = async () => {
    const optionsMainDivEl = document.getElementById('optionsMainDiv');

    if (!optionsMainDivEl) {
        await showAlert('The optionsMainDiv HTML element is not present.', 'HTML Error');
        return;
    }

    const optionsMainDiv = optionsMainDivEl as HTMLDivElement;

    optionsMainDiv.className = "options-main-div-bigger";
};

/**
 * Initializes the extension data upon document load, intended to be added as
 * a callback for the event listener `DOMContentLoaded`.
 */
const initializeDocument = async () => {
    await resetLocalSettings();

    await refreshSyncSettings();

    await exportContainers(false);

    await updateUI();

    const localSettingsTextAreaEl = document.getElementById('localSettingsTextArea');
    const updateEl = document.getElementById('update');
    const resetEl = document.getElementById('reset');
    const btnResetLocalEl = document.getElementById('btnResetLocal');
    const btnSaveLocalEl = document.getElementById('btnSaveLocal');
    const btnSaveSyncEl = document.getElementById('btnSaveSync');
    const btnRefreshSyncEl = document.getElementById('btnRefreshSync');
    const btnLoadFromSyncEl = document.getElementById('btnLoadFromSync');
    const alwaysSetSyncEl = document.getElementById('alwaysSetSync');
    const alwaysGetSyncEl = document.getElementById('alwaysGetSync');
    const btnResetLocalSettingsEl = document.getElementById('btnResetLocalSettings');
    const btnResetSyncSettingsEl = document.getElementById('btnResetSyncSettings');
    const btnExportContainersEl = document.getElementById('btnExportContainers');
    const btnImportContainersJSONEl = document.getElementById('btnImportContainersJSON');
    const neverConfirmForOpeningNonHttpUrlsEl = document.getElementById('neverConfirmForOpeningNonHttpUrls');
    const neverConfirmForSavingNonHttpUrlsEl = document.getElementById('neverConfirmForSavingNonHttpUrls');
    const openCurrentTabUrlOnMatchSelectEl = document.getElementById('openCurrentTabUrlOnMatchSelect');
    const btnCleanLocalEl = document.getElementById('btnCleanLocal');
    const makeBiggerEl = document.getElementById('makeBigger');

    const htmlErr = 'HTML Error';

    if (!localSettingsTextAreaEl) {
        await showAlert('The localSettingsTextArea HTML element is not present.', htmlErr);
        return;
    }
    if (!updateEl) {
        await showAlert('The update HTML element is not present.', htmlErr);
        return;
    }
    if (!resetEl) {
        await showAlert('The reset HTML element is not present.', htmlErr);
        return;
    }
    if (!btnResetLocalEl) {
        await showAlert('The btnResetLocal HTML element is not present.', htmlErr);
        return;
    }
    if (!btnSaveLocalEl) {
        await showAlert('The btnSaveLocal HTML element is not present.', htmlErr);
        return;
    }
    if (!btnSaveSyncEl) {
        await showAlert('The btnSaveSync HTML element is not present.', htmlErr);
        return;
    }
    if (!btnRefreshSyncEl) {
        await showAlert('The btnRefreshSync HTML element is not present.', htmlErr);
        return;
    }
    if (!btnLoadFromSyncEl) {
        await showAlert('The btnLoadFromSync HTML element is not present.', htmlErr);
        return;
    }
    if (!alwaysSetSyncEl) {
        await showAlert('The alwaysSetSync HTML element is not present.', htmlErr);
        return;
    }
    if (!alwaysGetSyncEl) {
        await showAlert('The alwaysGetSync HTML element is not present.', htmlErr);
        return;
    }
    if (!btnResetLocalSettingsEl) {
        await showAlert('The btnResetLocalSettings HTML element is not present.', htmlErr);
        return;
    }
    if (!btnResetSyncSettingsEl) {
        await showAlert('The btnResetSyncSettings HTML element is not present.', htmlErr);
        return;
    }
    if (!btnExportContainersEl) {
        await showAlert('The btnExportContainers HTML element is not present.', htmlErr);
        return;
    }
    if (!btnImportContainersJSONEl) {
        await showAlert('The btnImportContainersJSON HTML element is not present.', htmlErr);
        return;
    }
    if (!neverConfirmForOpeningNonHttpUrlsEl) {
        await showAlert('The neverConfirmForOpeningNonHttpUrls HTML element is not present.', htmlErr);
        return;
    }
    if (!neverConfirmForSavingNonHttpUrlsEl) {
        await showAlert('The neverConfirmForSavingNonHttpUrls HTML element is not present.', htmlErr);
        return;
    }
    if (!openCurrentTabUrlOnMatchSelectEl) {
        await showAlert('The openCurrentTabUrlOnMatchSelect HTML element is not present.', htmlErr);
        return;
    }
    if (!btnCleanLocalEl) {
        await showAlert('The btnCleanLocal HTML element is not present.', htmlErr);
        return;
    }
    if (!makeBiggerEl) {
        await showAlert('The makeBigger HTML element is not present.', htmlErr);
        return;
    }

    const localSettingsTextArea = localSettingsTextAreaEl as HTMLTextAreaElement;
    const update = updateEl as HTMLButtonElement;
    const reset = resetEl as HTMLButtonElement;
    const btnResetLocal = btnResetLocalEl as HTMLButtonElement;
    const btnSaveLocal = btnSaveLocalEl as HTMLButtonElement;
    const btnSaveSync = btnSaveSyncEl as HTMLButtonElement;
    const btnRefreshSync = btnRefreshSyncEl as HTMLButtonElement;
    const btnLoadFromSync = btnLoadFromSyncEl as HTMLButtonElement;
    const alwaysSetSync = alwaysSetSyncEl as HTMLInputElement;
    const alwaysGetSync = alwaysGetSyncEl as HTMLInputElement;
    const btnResetLocalSettings = btnResetLocalSettingsEl as HTMLButtonElement;
    const btnResetSyncSettings = btnResetSyncSettingsEl as HTMLButtonElement;
    const btnExportContainers = btnExportContainersEl as HTMLButtonElement;
    const btnImportContainersJSON = btnImportContainersJSONEl as HTMLButtonElement;
    const neverConfirmForOpeningNonHttpUrls = neverConfirmForOpeningNonHttpUrlsEl as HTMLInputElement;
    const neverConfirmForSavingNonHttpUrls = neverConfirmForSavingNonHttpUrlsEl as HTMLInputElement;
    const openCurrentTabUrlOnMatchSelect = openCurrentTabUrlOnMatchSelectEl as HTMLSelectElement;
    const btnCleanLocal = btnCleanLocalEl as HTMLSelectElement;
    const makeBigger = makeBiggerEl as HTMLAnchorElement;

    localSettingsTextArea.addEventListener('keyup', onChangeLocalSettings);
    update.addEventListener('click', updateShortcut);
    reset.addEventListener('click', () => { resetShortcut(commandName); });
    btnResetLocal.addEventListener('click', resetButtonClick);
    btnSaveLocal.addEventListener('click', btnSaveLocalClick);
    btnSaveSync.addEventListener('click', btnSaveSyncClick);
    btnRefreshSync.addEventListener('click', btnRefreshSyncClick);
    btnLoadFromSync.addEventListener('click', btnLoadFromSyncClick);
    alwaysSetSync.addEventListener('click', toggleAlwaysSetSyncSettings);
    alwaysGetSync.addEventListener('click', toggleAlwaysGetSyncSettings);
    btnResetLocalSettings.addEventListener('click', btnResetLocalSettingsClick);
    btnResetSyncSettings.addEventListener('click', btnResetSyncSettingsClick);
    btnExportContainers.addEventListener('click', btnExportContainersClick);
    btnImportContainersJSON.addEventListener('click', btnImportContainersClick);
    neverConfirmForOpeningNonHttpUrls.addEventListener('click', toggleNeverConfirmOpenNonHttpUrlsSettings);
    neverConfirmForSavingNonHttpUrls.addEventListener('click', toggleNeverConfirmSavingNonHttpUrlsSettings);
    openCurrentTabUrlOnMatchSelect.addEventListener('change', openCurrentTabUrlOnMatchSelectChange);
    btnCleanLocal.addEventListener('click', btnCleanLocalClick);

    makeBigger.addEventListener('click', makeBiggerClick);

    // check if the config is dirty

    if (!localSettings) return;

    const dirty = await checkDirty(localSettings);

    if (dirty <= 0) return;

    const s = dirty === 1 ? '' : 's';

    const cleanUp = await showConfirm(
        `Warning: There are ${dirty} orphaned container/URL association${s} in the config. You can request a cleanup of the extension's saved settings. It is recommended to proceed so that the extension can consume less storage space and operate more efficiently. Would you like to begin the cleanup? You will be prompted with more information.`,
        'Clean Up Config?',
    );

    if (!cleanUp) return;

    await btnCleanLocalClick();
}

document.addEventListener('DOMContentLoaded', initializeDocument);
