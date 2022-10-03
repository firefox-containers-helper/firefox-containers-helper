import { MODES, UrlMatchTypes } from './modules/constants';

/**
 * `containerDefaultUrls` is a key-value pair of container ID's to
 * default URLs to open for each container ID.
 *
 * @example {"container-name-01":"https://site.com"}
 */
export interface ContainerDefaultURL {
    [name: string]: string;
}

export interface ContextualIdentityWithURL extends browser.contextualIdentities.ContextualIdentity {
    defaultUrl?: string;
}

/**
 * `selectedContextIndices` keeps track of every context that is selected
 * in selection mode - this is simply an object with every key as a counter,
 * and every value as a 1 or 0 depending on whether or not the corresponding
 * filtered context (container) is selected. Any time the filtered array
 * changes, this array should be completely reset, since the mappings
 * will be inaccurate.
 *
 * @example {0: 1, 1: 1, 2: 0, 3: 1}
 */
export interface SelectedContextIndex {
    [key: number]: number;
}

/**
 * All configuration options for this web extension are stored in this object.
 * Note: If this gets updated, please update the `CONF` enum
 * in constants.ts to include any new or deleted keys.
 */
export interface ExtensionConfig {
    /**
     * windowStayOpenState is what keeps the window open while the user
     * clicks on a container tab.
     *
     * Defaults to `true`.
     */
    windowStayOpenState: boolean;

    /**
     * selectionMode is what allows the user to individually click or
     * shift+click to select ranges of containers from the list.
     *
     * Defaults to `false`.
     *
     */
    selectionMode: boolean,

    /**
     * sort is what allows containers in the filtered list to be sorted.
     */
    sort: string,

    /**
     * openCurrentPage will force every filtered container to open the current
     * tab's URL.
     *
     * Defaults to `false`.
     *
     */
    openCurrentPage: boolean,

    /**
     * mode is the current mode the user is operating in, such as
     * deleteContainersOnClick or setDefaultUrlsOnClick.
     *
     * Defaults to `openOnClick`
     *
     */
    mode: MODES,

    /**
     * lastQuery is the last thing that the user entered in the search box
     *
     * Default is an empty string.
     *
     */
    lastQuery: string,

    containerDefaultUrls: ContainerDefaultURL,

    selectedContextIndices: SelectedContextIndex,

    /**
     * lastSelectedContextIndex keeps track of the item that was last selected
     *
     * Defaults to `-1`
     *
     */
    lastSelectedContextIndex: number,

    /**
     * alwaysGetSync controls whether or not the settings are always loaded
     * from Firefox sync, or from local storage (default false)
     *
     * Defaults to `false`.
     *
     */
    alwaysGetSync: boolean,

    /**
     * alwaysSetSync controls whether or not the settings are always pushed
     * to Firefox sync as well to local storage (always).
     *
     * Defaults to `false`.
     *
     */
    alwaysSetSync: boolean,

    /**
     * neverConfirmOpenNonHttpUrls controls whether or not users get prompted
     * to open a URL that doesn't start with http:// or https://.
     *
     * Defaults to `false`.
     *
     */
    neverConfirmOpenNonHttpUrls: boolean,

    /**
     * neverConfirmSaveNonHttpUrls controls whether or not users get prompted
     * to save a URL that doesn't start with http:// or https://.
     *
     * Defaults to `false`.
     *
     */
    neverConfirmSaveNonHttpUrls: boolean,

    /**
     * openCurrentTabUrlOnMatch will open the current tab's URL if a container
     * tab's default URL domain matches the current tab's URL. Can be configured
     * to match a couple different things.
     *
     * See the URL() object for things that can match.
     *
     * Defaults to an empty string.
     */
    openCurrentTabUrlOnMatch: UrlMatchTypes,
}

/**
 * This is the type definition for the primary action handler that is triggered
 * when the user hits enter or clicks to open containers. This function is
 * `act` and was previously named `containerClickHandler`.
 *
 * @see `act()` function in ``modules/lib.ts`
 */
export type ActHandler = (
    filtered: browser.contextualIdentities.ContextualIdentity[],
    clicked: browser.contextualIdentities.ContextualIdentity,
    event: MouseEvent | KeyboardEvent,
) => Promise<void>;
