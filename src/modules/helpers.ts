import { CLASS_ELEMENT_HIDE, CLASS_ELEMENT_SHOW } from './classes';
import { UrlMatchTypes } from './constants';

/**
 * Reusable function to hide an HTML element.
 * @param el {HTMLElement | null} The element to hide
 */
export const hideElement = (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.remove(CLASS_ELEMENT_SHOW);
    el.classList.add(CLASS_ELEMENT_HIDE);
}

/**
 * Reusable function to show an HTML element.
 * @param el {HTMLElement | null} The element to show
 */
export const showElement = (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.add(CLASS_ELEMENT_SHOW);
    el.classList.remove(CLASS_ELEMENT_HIDE);
}


/**
 * Determines whether or not to override the container's default URL with
 * the current tab's URL, based on config.openCurrentTabUrlOnMatch
 *
 * TODO: move into helpers module and unit test this function
 *
 * @param {string} url The URL to open
 * @param {string} current The current tab's URL
 * @param {UrlMatchTypes} match The method to use for identifying url matches
 */
export const getCurrentTabOverrideUrl = (url: string, current: string, match: UrlMatchTypes): string => {
    try {
        if (!url || !current) return "";

        const currentURL = new URL(current);
        const urlURL = new URL(url);

        // just determine the top level domain and the next level domain
        // using "tld" as a quick shorthand even though it's not technically correct
        const urlTLD = urlURL.hostname.split('.').slice(-2).join('.').toLowerCase();
        const currentTLD = currentURL.hostname.split('.').slice(-2).join('.').toLowerCase();

        switch (match) {
            case UrlMatchTypes.origin:
                if (currentURL.origin.toLowerCase() === urlURL.origin.toLowerCase()) {
                    return current;
                }
                break;
            case UrlMatchTypes.host:
                if (currentURL.host.toLowerCase() === urlURL.host.toLowerCase()) {
                    return current;
                }
                break;
            case UrlMatchTypes.domain:
                if (urlTLD === currentTLD) {
                    return current;
                }
                break;
            case UrlMatchTypes.domainPort:
                if (urlTLD === currentTLD && currentURL.port === urlURL.port) {
                    return current;
                }
                break;
            case UrlMatchTypes.hostname:
                if (currentURL.hostname.toLowerCase() === urlURL.hostname.toLowerCase()) {
                    return current;
                }
                break;
            default:
                break;
        }
    } catch (err) {
        console.log(
            `warning: origin/host/hostname match attempt didn't succeed, ` +
            `falling back to container default url; reason: ${JSON.stringify(err)}`
        );
    }

    return "";
}
