/** The functions in this file generally are meant to be used only with
 * the preferences page. The preferences page doesn't exclusively use the
 * `config.ts` functions because it directly modifies and parses configuration
 * options and loads/saves them. Avoid using these elsewhere.
 */
import { showConfirm } from './modals';
import { ContainerDefaultURL, ContextualIdentityWithURL } from '../types';
import { getSetting, setSettings } from './config';
import { CONF } from './constants';

export const bulkImport = async (str: string): Promise<ContextualIdentityWithURL[]> => {
    try {
        const contexts = JSON.parse(str) as ContextualIdentityWithURL[];

        // start by validating input

        if (!Array.isArray(contexts)) throw 'Input must be valid JSON, and it must be an array of objects.';

        if (!contexts?.length) return [];

        for (const context of contexts) {
            if (!context.name) throw `A value lacks a container name: ${JSON.stringify(context)}`;
        }

        const s = contexts.length === 1 ? '' : 's';

        const q = `Please confirm that you'd like to add ${contexts.length} container${s}.`

        const proceed = await showConfirm(q, 'Add Containers?')

        if (!proceed) return [];

        // begin import

        const imported: ContextualIdentityWithURL[] = [];

        const urls = await getSetting(CONF.containerDefaultUrls) as ContainerDefaultURL;

        for (const context of contexts) {
            const c: browser.contextualIdentities._CreateDetails = {
                name: context.name,
                icon: context.icon || 'circle',
                color: context.color || 'toolbar',
            }

            const cc = await browser.contextualIdentities.create(c);

            const i: ContextualIdentityWithURL = {
                ...cc,
            }

            if (context?.defaultUrl) {
                urls[cc.cookieStoreId] = context.defaultUrl;
                i.defaultUrl = context.defaultUrl;
            }

            imported.push(i);
        }

        // push default URLs to storage
        await setSettings({ containerDefaultUrls: urls });

        return imported;
    } catch (err) {
        throw `bulk import failure: ${err}`;
    }
}

export const bulkExport = async (): Promise<ContextualIdentityWithURL[]> => {
    try {
        const urls = await getSetting(CONF.containerDefaultUrls) as ContainerDefaultURL;

        const contexts = await browser.contextualIdentities.query({});

        const results: ContextualIdentityWithURL[] = [];

        for (const context of contexts) {
            const r: ContextualIdentityWithURL = { ...context };

            if (urls[context.cookieStoreId]) {
                r.defaultUrl = urls[context.cookieStoreId];
            }

            results.push(r);
        }

        return results;
    } catch (err) {
        throw `bulk export failure: ${err}`;
    }

}