import { ExtensionConfig } from '../types';
import { CONF, MODES, SettingsTypes, SORT_MODE_NONE, UrlMatchTypes } from './constants';

let cached: Partial<ExtensionConfig> = {};
let cacheLocal: Partial<ExtensionConfig> = {};
let cacheSync: Partial<ExtensionConfig> = {};

/**
 * Returns all settings, depending on whether the user prefers Sync or not.
 */
export const getSettings = async (): Promise<ExtensionConfig> => {
    const local = await browser.storage.local.get() as ExtensionConfig;
    const sync = await browser.storage.sync.get() as ExtensionConfig;

    const preferSync = sync.alwaysGetSync || local.alwaysGetSync;

    const settings = preferSync ? sync : local;

    cached = { ...settings };
    cacheLocal = { ...local };
    cacheSync = { ...sync };

    return settings;
}

/**
 * Returns only sync settings. Do not use unless you specifically need them,
 * such as on the Preferences page.
 *
 * Prefer to use the `getSettings` where possible, since it automatically
 * determines whether or not to use sync/local.
 */
export const getSyncSettings = async (): Promise<ExtensionConfig> => {
    return await browser.storage.sync.get() as ExtensionConfig;
}

/**
 * Returns only local settings. Do not use unless you specifically need them,
 * such as on the Preferences page.
 *
 * Prefer to use the `getSettings` where possible, since it automatically
 * determines whether or not to use sync/local.
 */
export const getLocalSettings = async (): Promise<ExtensionConfig> => {
    return await browser.storage.local.get() as ExtensionConfig;
}

/**
 * Saves only sync settings. Do not use unless you specifically need them,
 * such as on the Preferences page.
 *
 * Prefer to use the `getSettings` where possible, since it automatically
 * determines whether or not to use sync/local.
 */
export const setSyncSettings = async (updates: Partial<ExtensionConfig>) => {
    await browser.storage.sync.set(updates);
}

/**
 * Saves only local settings. Do not use unless you specifically need them,
 * such as on the Preferences page.
 *
 * Prefer to use the `getSettings` where possible, since it automatically
 * determines whether or not to use sync/local.
 */
export const setLocalSettings = async (updates: Partial<ExtensionConfig>) => {
    await browser.storage.local.set(updates);
}

/**
 * Retrieves a setting from the extension config.
 *
 * If either the `local` or Firefox Sync extension storage has
 * `alwaysGetSync` set to true, then settings will always come from
 * Firefox Sync.
 */
export const getSetting = async (setting: CONF, type?: SettingsTypes): Promise<unknown> => {
    // queries against the browser.storage API might be slow, so use
    // cached results if possible - note that the cached object does
    // get updated automatically any setting is changed, so generally it
    // will always be up to date
    if (setting in cached) return cached[setting];

    // some of the settings that might create difficulties validating cached
    // settings are only accessible in the Preferences page. Those can't be
    // typically modified when the popup is open, but there is a risk of someone
    // modifying the Preferences values if the popup is opened in a dedicated
    // tab for a long time.
    switch (type) {
        case SettingsTypes.Local: {
            if (setting in cacheLocal) return cacheLocal[setting];
            const l = await browser.storage.local.get(setting);
            return l[setting];
        }
        case SettingsTypes.Sync: {
            if (setting in cacheSync) return cacheSync[setting];
            const s = await browser.storage.sync.get(setting);
            return s[setting];
        }
        default:
            break;
    }

    const local = await browser.storage.local.get(setting) as Partial<ExtensionConfig>;
    const sync = await browser.storage.sync.get(setting) as Partial<ExtensionConfig>;

    const preferSync = local.alwaysGetSync || sync.alwaysGetSync;

    const settings = preferSync ? sync : local;

    if (!settings[setting]) {
        return null;
    }

    return settings[setting];
}

/**
 * Pushes settings to the extension config.
 *
 * If either the `local` or Firefox Sync extension storage has
 * `alwaysSetSync` set to true, then settings will always go to local AND
 * Firefox Sync.
 */
export const setSettings = async (updates: Partial<ExtensionConfig>) => {
    const sync = await getSetting(CONF.alwaysSetSync, SettingsTypes.Sync) as boolean === true;
    const local = await getSetting(CONF.alwaysSetSync, SettingsTypes.Local) as boolean === true;

    await browser.storage.local.set(updates);

    if (sync || local) {
        await browser.storage.sync.set(updates);
    }

    // refresh the cache any time this function is called
    await getSettings();
}

/** Generates a template initial extension config. */
export const getInitialConfig = (): ExtensionConfig => {
    const config: ExtensionConfig = {
        windowStayOpenState: true,
        selectionMode: false,
        sort: SORT_MODE_NONE,
        openCurrentPage: false,
        mode: MODES.OPEN,
        lastQuery: "",
        containerDefaultUrls: {},
        selectedContextIndices: {},
        lastSelectedContextIndex: -1,
        alwaysGetSync: false,
        alwaysSetSync: false,
        neverConfirmOpenNonHttpUrls: false,
        neverConfirmSaveNonHttpUrls: false,
        openCurrentTabUrlOnMatch: UrlMatchTypes.empty,
    };
    return config;
}

/** Ensures that at a fresh config is set, if
 * there isn't an existing config.
 */
export const ensureConfig = async () => {
    const settings = await getSettings();

    const mergedSettings = {
        ...getInitialConfig(),
        ...settings,
    };

    cached = { ...mergedSettings };

    await setSettings(mergedSettings);
}
