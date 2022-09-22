import { MODES, UrlMatchTypes } from './modules/constants';

/**
 * A contextual identity represents a container definition.
 * The following documentation was copied from the Mozilla documentation on 11/19/2020.
 * This typedef documentation uses text that is largely the property of Mozilla and is not intended to infringe on any of the licenses of MDN or Mozilla.
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities/ContextualIdentity
 */
export interface ContextualIdentity {
    /** The cookie store ID for the identity. Since contextual identities don't share cookie stores, this serves as a unique identifier.*/
    cookieStoreId: string;

    /** The color for the identity. This will be shown in tabs belonging to this identity. The value "toolbar" represents a theme-dependent color.  Identities with color "toolbar" will be displayed in the same color as text in the toolbar (corresponding to the theme key "toolbar_field_text").*/
    color: string;

    /** A hex code representing the exact color used for the identity. For example: "#37adff". In the special case of the "toolbar" color, colorCode is always "#7c7c7d", regardless of the displayed color.*/
    colorCode: string;

    /** The name of an icon for the identity. This will be shown in the URL bar for tabs belonging to this identity. The following values are valid:*/
    icon: string;

    /** A full resource:// URL pointing to the identity's icon. For example: "resource://usercontext-content/fingerprint.svg".*/
    iconUrl: string;

    /** Name of the identity. This will be shown in the URL bar for tabs belonging to this identity. Note that names don't have to be unique.*/
    name: string;
}

/**
 * `containerDefaultUrls` is a key-value pair of container ID's to
 * default URLs to open for each container ID.
 * Example:
 *
 * `{"container-name-01":"https://site.com"}`
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
 * filtered context (container) is selected
 * @example {0: 1, 1: 1, 2: 0, 3: 1}
 */
export interface SelectedContextIndex {
    [key: number]: number;
}

/**
 * All configuration options for this web extension are stored in this object.
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
};