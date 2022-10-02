import { ExtensionConfig } from '../types';
import { CONF, MODES, SORT_MODE_NONE, UrlMatchTypes } from './constants';

let cached: Partial<ExtensionConfig> = {};

/**
 * Returns all settings, depending on whether the user prefers Sync or not.
 */
export const getSettings = async (): Promise<ExtensionConfig> => {
    const local = await browser.storage.local.get() as ExtensionConfig;
    const sync = await browser.storage.sync.get() as ExtensionConfig;

    const preferSync = local.alwaysGetSync || sync.alwaysGetSync;

    const settings = preferSync ? sync : local;

    cached = { ...settings };

    return settings;
}

/**
 * Retrieves a setting from the extension config.
 *
 * If either the `local` or Firefox Sync extension storage has
 * `alwaysGetSync` set to true, then settings will always come from
 * Firefox Sync.
 */
export const getSetting = async (setting: CONF): Promise<any> => {
    // queries against the browser.storage API are very slow, so use
    // cached results if possible - note that the cached object does
    // get updated automatically any setting is changed, so generally it
    // will always be up to date
    if (setting in cached) return cached[setting];

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
    // first, determine if we need to push the setting to both sync/local
    // or just local

    const local = (await browser.storage.local.get(CONF.alwaysSetSync) as unknown) === true;
    const sync = (await browser.storage.sync.get(CONF.alwaysSetSync) as unknown) === true;

    const toSync = local || sync;

    await browser.storage.local.set(updates);

    if (toSync) {
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
