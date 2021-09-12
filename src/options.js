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
    let className = `badge badge-${bootstrapColorClass} mt-4`;
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
        const neverConfirmOpenNonHttpUrls = document.getElementById('neverConfirmForOpeningNonHttpUrls');
        if (neverConfirmOpenNonHttpUrls) {
            neverConfirmOpenNonHttpUrls.checked = data.neverConfirmOpenNonHttpUrls;
        }
        const neverConfirmSaveNonHttpUrls = document.getElementById('neverConfirmForSavingNonHttpUrls');
        if (neverConfirmSaveNonHttpUrls) {
            neverConfirmSaveNonHttpUrls.checked = data.neverConfirmSaveNonHttpUrls;
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

const toggleNeverConfirmOpenNonHttpUrlsSettings = (event) => {
    const neverConfirmOpenCheckbox = document.getElementById("neverConfirmForOpeningNonHttpUrls");
    if (neverConfirmOpenCheckbox) {
        neverConfirmOpenNonHttpUrls = neverConfirmOpenCheckbox.checked;
        browser.storage.local.set({
            "neverConfirmOpenNonHttpUrls": neverConfirmOpenNonHttpUrls,
        });
        browser.storage.sync.set({
            "neverConfirmOpenNonHttpUrls": neverConfirmOpenNonHttpUrls,
        });
    }
    resetLocalSettings();
    refreshSyncSettings();
}

const toggleNeverConfirmSavingNonHttpUrlsSettings = (event) => {
    const neverConfirmSaveCheckbox = document.getElementById("neverConfirmForSavingNonHttpUrls");
    if (neverConfirmSaveCheckbox) {
        neverConfirmSaveNonHttpUrls = neverConfirmSaveCheckbox.checked;
        browser.storage.local.set({
            "neverConfirmSaveNonHttpUrls": neverConfirmSaveNonHttpUrls,
        });
        browser.storage.sync.set({
            "neverConfirmSaveNonHttpUrls": neverConfirmSaveNonHttpUrls,
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

const btnExportContainersClick = (event) => {
    // retrieve the extension configuration from storage
    browser.storage.local.get((data) => {
        const config = data;

        browser.contextualIdentities.query({}).then((contexts) => {
            // assemble the default url for each context
            for (let i = 0; i < contexts.length; i++) {
                contexts[i].defaultUrl = "";
                if (config.containerDefaultUrls && config.containerDefaultUrls[contexts[i].cookieStoreId.toString()]) {
                    contexts[i].defaultUrl = config.containerDefaultUrls[contexts[i].cookieStoreId.toString()];
                }
            }
            const contextsJSON = JSON.stringify(contexts);
            const containersExportAsJSON = document.getElementById('containersExportAsJSON');
            if (containersExportAsJSON) {
                containersExportAsJSON.value = contextsJSON;
            }
            if (contexts.length > 0) {
                // build csv
                const keys = Object.keys(contexts[0]);
                keys.sort();
                const keysQuotes = keys.map((key) => {
                    return `"${key}"`;
                })
                rows = contexts.map((context) => {
                    return keys.map((key) => {
                        return `"${context[key]}"`;
                    }).join(",");
                })
                const containersExportAsCSV = document.getElementById('containersExportAsCSV');
                if (containersExportAsCSV) {
                    containersExportAsCSV.value = `${keysQuotes.join(",")}\n${rows.join("\n")}`;
                }
            }
        });
    });
}

const btnImportContainersClick = (event) => {
    const containersImportAsJSON = document.getElementById('containersImportAsJSON');
    let containersToImport = "";
    try {
        containersToImport = JSON.parse(containersImportAsJSON.value);
    } catch (e) {
        if (e) {
            alert(`Failed to parse input containers JSON string: ${JSON.stringify(e)}`);
        } else {
            alert(`Failed to parse input containers JSON string.`);
        }
        return;
    }

    if (!Array.isArray(containersToImport)) {
        alert('The "Import Containers" text input field must be valid JSON, and it must be an array of objects.');
        return;
    }

    if (containersToImport.length === 0) {
        alert(`The "Import Containers" text input field is valid, but you provided an empty array, so there's nothing to do.`);
        return;
    }

    // validate that each container has a name
    for (let i = 0; i < containersToImport.length; i++) {
        if (!containersToImport[i].name) {
            alert(`There is a problem with the containers you attempted to input. The container at index ${i} does not have a name, which is a required field, in order to create the container.`);
            return;
        }
    }

    if (!confirm(`Please confirm that you'd like to add ${containersToImport.length} containers.`)) {
        return;
    }

    // retrieve the extension configuration from storage
    browser.storage.local.get((data) => {
        let alertMessage = '';

        const config = data;

        // create each container, then, after creation, associate the default URL
        for (let i = 0; i < containersToImport.length; i++) {
            const newContainer = {
                name: containersToImport[i].name,
                icon: containersToImport[i].icon ? containersToImport[i].icon : "circle",
                color: containersToImport[i].color ? containersToImport[i].color : "toolbar",
            };

            browser.contextualIdentities.create(newContainer).then(
                (createdContext) => {
                    if (!config.containerDefaultUrls) {
                        config.containerDefaultUrls = {};
                    }
                    if (containersToImport[i].defaultUrl) {
                        // associate the default URL
                        config.containerDefaultUrls[createdContext.cookieStoreId.toString()] = containersToImport[i].defaultUrl;
                        alertMessage += `Imported container ${createdContext.name} with a default URL.\n`;
                    } else {
                        alertMessage += `Imported container ${createdContext.name}.\n`;
                    }

                    // if this is the last container, then take care of the final
                    // chores
                    if (i === containersToImport.length - 1) {
                        // TODO: this is a duplicate of the function writeContainerDefaultUrlsToStorage
                        //       from context.js, please refactor
                        browser.storage.local.set({ "containerDefaultUrls": config.containerDefaultUrls });
                        if (config.alwaysSetSync === true) {
                            browser.storage.sync.set({ "containerDefaultUrls": config.containerDefaultUrls });
                        }

                        if (alertMessage) {
                            alert(alertMessage);
                        }
                    }
                },
                (err) => {
                    if (err) {
                        alertMessage += `Failed to create a container named ${newContainer.name}: ${JSON.stringify(err)}\n`;
                    }
                }
            )
        }
    });
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

    btnExportContainersClick();

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
    document.querySelector('#btnExportContainers').addEventListener('click', btnExportContainersClick);
    document.querySelector('#btnImportContainersJSON').addEventListener('click', btnImportContainersClick);
    document.querySelector('#neverConfirmForOpeningNonHttpUrls').addEventListener('click', toggleNeverConfirmOpenNonHttpUrlsSettings);
    document.querySelector('#neverConfirmForSavingNonHttpUrls').addEventListener('click', toggleNeverConfirmSavingNonHttpUrlsSettings);

}

document.addEventListener('DOMContentLoaded', initializeDocument);
