

let platformModifierKey = 'Ctrl'; // windows, linux
// https://stackoverflow.com/a/11752084
if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
    platformModifierKey = 'Cmd'; // mac
}

export const PlatformModifierKey = platformModifierKey;

/**
 * All allowable container (context) icons.
 *
 * TODO: provide a link to the firefox documentation
 */
export const CONTEXT_ICONS = [
    "fingerprint",
    "briefcase",
    "dollar",
    "cart",
    "circle",
    "gift",
    "vacation",
    "food",
    "fruit",
    "pet",
    "tree",
    "chill",
    "fence",
];

/** All functional modes that allow the user to interact with containers. */
export enum MODES {
    OPEN = "openOnClick",
    SET_URL = "setDefaultUrlsOnClick",
    SET_NAME = "renameOnClick",
    SET_COLOR = "setColorOnClick",
    SET_ICON = "setIconOnClick",
    REPLACE_IN_NAME = "replaceInNameOnClick",
    REPLACE_IN_URL = "replaceInUrlOnClick",
    DUPLICATE = "duplicateOnClick",
    DELETE = "deleteContainersOnClick",
    REFRESH = "refreshOnClick",
}

/** All keys for the ExtensionConfiguration interface. */
export enum CONF {
    windowStayOpenState = 'windowStayOpenState',
    selectionMode = 'selectionMode',
    sort = 'sort',
    openCurrentPage = 'openCurrentPage',
    mode = 'mode',
    lastQuery = 'lastQuery',
    containerDefaultUrls = 'containerDefaultUrls',
    selectedContextIndices = 'selectedContextIndices',
    lastSelectedContextIndex = 'lastSelectedContextIndex',
    alwaysGetSync = 'alwaysGetSync',
    alwaysSetSync = 'alwaysSetSync',
    neverConfirmOpenNonHttpUrls = 'neverConfirmOpenNonHttpUrls',
    neverConfirmSaveNonHttpUrls = 'neverConfirmSaveNonHttpUrls',
    openCurrentTabUrlOnMatch = 'openCurrentTabUrlOnMatch',
}


/** All allowable container (context) colors. */
export const CONTEXT_COLORS = [
    "blue",
    "turquoise",
    "green",
    "yellow",
    "orange",
    "red",
    "pink",
    "purple",
    "toolbar",
];

/** Random list of help messages to show in the Help Text area. */
export const helpTextMessages = [
    'Tip: Press Enter or click on a container below.',
    `Tip: Use ${platformModifierKey}(+Shift) to open pinned tabs.`,
    'Tip: Shift+Click operates on every result.',
    'Tip: Visit Preferences for bulk import/export.'
];

export const SORT_MODE_NAME_ASC = 'name-a';
export const SORT_MODE_NAME_DESC = 'name-d';
export const SORT_MODE_URL_ASC = 'url-a';
export const SORT_MODE_URL_DESC = 'url-d';
export const SORT_MODE_NONE = 'none';
export const SORT_MODE_NONE_REVERSE = 'none-r';

export enum SortModes {
    NameAsc = 'name-a',
    NameDesc = 'name-d',
    None = 'url-a',
    NoneReverse = 'url-d',
    UrlAsc = 'none',
    UrlDesc = 'none-r',
}

export enum UrlMatchTypes {
    origin = 'origin',
    host = 'host',
    domain = 'domain',
    domainPort = 'domain-port',
    hostname = 'hostname',
    empty = "",
}

/**
 * The `<div>` ID of the container list. This is where all of the queried
 * containers will go.
 */
export const CONTAINER_LIST_DIV_ID = 'container-list';

/** The ID of the container list <ul> element. */
export const CONTAINER_LIST_GROUP_ID = 'containerListGroup';

/** Firefox Sync vs local storage. */
export enum SettingsTypes {
    Local = 'local',
    Sync = 'sync',
}
