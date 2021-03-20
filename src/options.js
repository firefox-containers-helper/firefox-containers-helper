// https://github.com/mdn/webextensions-examples/blob/60ce50b10ee66f6d706b0715909e756e4bdba63d/commands/options.js
// https://github.com/mdn/webextensions-examples/blob/60ce50b10ee66f6d706b0715909e756e4bdba63d/commands/options.html
const commandName = '_execute_browser_action';

var localSettings = {};
var syncSettings = {};

/**
 * Update the UI: set the value of the shortcut textbox.
 */
async function updateUI() {
    let commands = await browser.commands.getAll();
    for (command of commands) {
        if (command.name === commandName) {
            document.querySelector('#shortcut').value = command.shortcut;
        }
    }
}

/**
 * Update the shortcut based on the value in the textbox.
 */
async function updateShortcut() {
    await browser.commands.update({
        name: commandName,
        shortcut: document.querySelector('#shortcut').value
    });
}

/**
 * Reset the shortcut and update the textbox.
 */
async function resetShortcut() {
    await browser.commands.reset(commandName);
    updateUI();
}

// This is a shameless copy of deep equality comparison from StackOverflow.
// Disclaimer: Deep equality is impossible to completely asses. Also,
// I've written my own deep equality implementations in JavaScript before,
// but it's smarter and more pragmatic to crowd source, so long as
// the code is reviewed and passes test cases.
// https://stackoverflow.com/a/16788517
function objectEquals(x, y) {
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

const setValidationText = (messageStr, bootstrapColorClass) => {
    if (!messageStr || !bootstrapColorClass) return;

    const syncValidationText = document.getElementById('syncValidationText');
    if (!syncValidationText) return;
    let className = `badge badge-${bootstrapColorClass} mt-2`;
    syncValidationText.innerText = messageStr;
    syncValidationText.className = className;
}

const setSaveSettingsButtonsDisabled = (disabled) => {
    const btnSaveLocal = document.getElementById('btnSaveLocal');
    const btnSaveSync = document.getElementById('btnSaveSync');
    btnSaveLocal.disabled = disabled;
    btnSaveSync.disabled = disabled;
}

const validateLocalSettings = (localSettingsJSON) => {
    try {
        let input = localSettingsJSON;
        if (!input) {
            const localSettingsTextArea = document.getElementById('localSettingsTextArea');
            if (localSettingsTextArea) {
                input = localSettingsTextArea.value;
            } else {
                return false;
            }
        }
        localSettings = JSON.parse(input);
        setValidationText('Local settings are valid JSON.', 'primary');
        setSaveSettingsButtonsDisabled(false);
        checkSettingsAreEqual();
        return true;
    } catch (e) {
        setValidationText('Invalid local settings JSON.', 'danger');
        setSaveSettingsButtonsDisabled(true);
        return false;
    }
}

const onChangeLocalSettings = (e) => {
    if (e && e.target && e.target.value) {
        validateLocalSettings(e.target.value);
    }
}

const checkSettingsAreEqual = () => {
    let result = false;
    if (localSettings && syncSettings) {
        result = objectEquals(localSettings, syncSettings);
    }
    result ?
        setValidationText('Local/sync settings match!', 'success') :
        setValidationText('Local/sync settings do not match.', 'danger');

    return result;
}

const resetLocalSettings = () => {
    browser.storage.local.get((data) => {
        localSettings = data;
        validateLocalSettings(JSON.stringify(data));
        const localSettingsTextArea = document.getElementById('localSettingsTextArea');
        if (localSettingsTextArea) {
            localSettingsTextArea.value = JSON.stringify(data);
        }
    });
}

const resetButtonClick = (event) => {
    resetLocalSettings();
}

const refreshSyncSettings = () => {
    browser.storage.sync.get((data) => {
        syncSettings = data;
        checkSettingsAreEqual();
        const syncSettingsTextArea = document.getElementById('syncSettingsTextArea');
        if (syncSettingsTextArea) {
            syncSettingsTextArea.value = JSON.stringify(data);
        }
        const alwaysSetSync = document.getElementById('alwaysSetSync');
        if (alwaysSetSync) {
            alwaysSetSync.checked = data.alwaysSetSync;
        }
        const alwaysGetSync = document.getElementById('alwaysGetSync');
        if (alwaysGetSync) {
            alwaysGetSync.checked = data.alwaysGetSync;
        }
    });
}

const btnRefreshSyncClick = (event) => {
    refreshSyncSettings();
    validateLocalSettings();
}

const saveLocalSettings = () => {
    let userInputLocalSettings = "";
    const localSettingsTextArea = document.getElementById('localSettingsTextArea');
    if (localSettingsTextArea) {
        userInputLocalSettings = localSettingsTextArea.value;
        if (validateLocalSettings(userInputLocalSettings) === true) {
            browser.storage.local.set(JSON.parse(userInputLocalSettings)).then(
                (newSettings) => {
                    console.log(`set new local settings: ${newSettings}`);
                }
            );
        }
    }
}

// saveSyncSettings is identical to saveLocalSettings, except it saves to sync
// instead of local - it even has to validate the user input correctly before
// saving.
const saveSyncSettings = () => {
    let userInputLocalSettings = "";
    const localSettingsTextArea = document.getElementById('localSettingsTextArea');
    if (localSettingsTextArea) {
        userInputLocalSettings = localSettingsTextArea.value;
        if (validateLocalSettings(userInputLocalSettings) === true) {
            browser.storage.sync.set(JSON.parse(userInputLocalSettings)).then(
                (newSettings) => {
                    console.log(`set new sync settings: ${newSettings}`);
                    refreshSyncSettings();
                    validateLocalSettings();
                }
            );
        }
    }
}

const btnSaveLocalClick = (event) => {
    saveLocalSettings();
    checkSettingsAreEqual();
}

const btnSaveSyncClick = (event) => {
    saveSyncSettings();
    checkSettingsAreEqual();
}

const toggleAlwaysSetSyncSettings = (event) => {
    const alwaysSetSyncCheckbox = document.getElementById("alwaysSetSync");
    if (alwaysSetSyncCheckbox) {
        alwaysSetSync = alwaysSetSyncCheckbox.checked;
        browser.storage.local.set({
            "alwaysSetSync": alwaysSetSync,
        });
        browser.storage.sync.set({
            "alwaysSetSync": alwaysSetSync,
        });
    }
    resetLocalSettings();
    refreshSyncSettings();
}

const toggleAlwaysGetSyncSettings = (event) => {
    const alwaysGetSyncCheckbox = document.getElementById("alwaysGetSync");
    if (alwaysGetSyncCheckbox) {
        alwaysGetSync = alwaysGetSyncCheckbox.checked;
        browser.storage.local.set({
            "alwaysGetSync": alwaysGetSync,
        });
        browser.storage.sync.set({
            "alwaysGetSync": alwaysGetSync,
        });
    }
    resetLocalSettings();
    refreshSyncSettings();
}

const btnLoadFromSyncClick = (event) => {
    // save sync settings to local storage
    browser.storage.sync.get((data) => {
        if (data) {
            browser.storage.local.set(data).then(result => {
                resetLocalSettings();
                refreshSyncSettings();
            })
        }
    });
}

const btnResetLocalSettingsClick = (event) => {
    if (confirm("Are you sure you want to reset local settings?")) {
        browser.storage.local.clear();
        resetLocalSettings();
    }
}
const btnResetSyncSettingsClick = (event) => {
    if (confirm("Are you sure you want to reset sync settings?")) {
        browser.storage.sync.clear();
        refreshSyncSettings();
    }
}

/**
 * Initializes the extension data upon document load, intended to be added as
 * a callback for the event listener `DOMContentLoaded`.
 * @param {Event?} event The event that called this function, such as a key press or mouse click
 * @returns {void}
 */
const initializeDocument = (event) => {
    resetLocalSettings();

    refreshSyncSettings();

    updateUI();

    document.querySelector('#localSettingsTextArea').addEventListener('keyup', onChangeLocalSettings);
    document.querySelector('#update').addEventListener('click', updateShortcut);
    document.querySelector('#reset').addEventListener('click', resetShortcut);
    document.querySelector('#btnResetLocal').addEventListener('click', resetButtonClick);
    document.querySelector('#btnSaveLocal').addEventListener('click', btnSaveLocalClick);
    document.querySelector('#btnSaveSync').addEventListener('click', btnSaveSyncClick);
    document.querySelector('#btnRefreshSync').addEventListener('click', btnRefreshSyncClick);
    document.querySelector('#btnLoadFromSync').addEventListener('click', btnLoadFromSyncClick);
    document.querySelector('#alwaysSetSync').addEventListener('click', toggleAlwaysSetSyncSettings);
    document.querySelector('#alwaysGetSync').addEventListener('click', toggleAlwaysGetSyncSettings);
    document.querySelector('#btnResetLocalSettings').addEventListener('click', btnResetLocalSettingsClick);
    document.querySelector('#btnResetSyncSettings').addEventListener('click', btnResetSyncSettingsClick);
}

document.addEventListener('DOMContentLoaded', initializeDocument);
