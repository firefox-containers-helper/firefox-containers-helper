## Objects

<dl>
<dt><a href="#config">config</a> : <code>object</code></dt>
<dd><p>All configuration options for this web extension are stored in this object.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#mutuallyExclusiveConfigOptions">mutuallyExclusiveConfigOptions</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Each of these values represents a key in the <code>config</code> object that,
when set to <code>true</code>, will require all other values to be false</p>
</dd>
<dt><a href="#helpTextMessages">helpTextMessages</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Random list of help messages to show in the Help Text area.</p>
</dd>
<dt><a href="#containerListItemInactiveClassNames">containerListItemInactiveClassNames</a> : <code>string</code></dt>
<dd><p>This is the set of classes to assign to a container list item that is not
currently being hovered over. Assign to <code>element.className</code> for a given element.</p>
</dd>
<dt><a href="#containerListItemActiveClassNames">containerListItemActiveClassNames</a> : <code>string</code></dt>
<dd><p>This is the set of classes to assign to a container list item that is
currently being hovered over. Assign to <code>element.className</code> for a given element.</p>
</dd>
<dt><a href="#containerListItemActiveDangerClassNames">containerListItemActiveDangerClassNames</a> : <code>string</code></dt>
<dd><p>This is the set of classes to assign to a container list item that is
currently being hovered over, while the container management mode is set to
deletion mode. Assign to <code>element.className</code> for a given element.</p>
</dd>
<dt><a href="#CONTAINER_LIST_DIV_ID">CONTAINER_LIST_DIV_ID</a> : <code>string</code></dt>
<dd><p>The <code>&lt;div&gt;</code> ID of the container list. This is where all of the queried containers will go.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#buildContainerIconElement">buildContainerIconElement(context)</a> ⇒ <code>Element</code></dt>
<dd><p>Assembles an HTML element that contains the colorized container icon for a given container.</p>
</dd>
<dt><a href="#buildContainerLabelElement">buildContainerLabelElement(context)</a> ⇒ <code>Element</code></dt>
<dd><p>Assembles an HTML element that contains a text label for a given container.</p>
</dd>
<dt><a href="#applyEventListenersToContainerListItem">applyEventListenersToContainerListItem(liElement, filteredResults, context)</a> ⇒ <code>string</code></dt>
<dd><p>Adds click and other event handlers to a container list item HTML element.</p>
</dd>
<dt><a href="#buildContainerListItem">buildContainerListItem(filteredResults, context)</a> ⇒ <code>Element</code></dt>
<dd><p>Assembles an HTML element that contains an entire container list item.</p>
</dd>
<dt><a href="#haltingCallback">haltingCallback(event)</a> ⇒ <code>void</code></dt>
<dd><p>When mousing over a list item, child elements can
mess up the way classes are set upon mouseover/mouseleave.
This fixes that.</p>
</dd>
<dt><a href="#addEmptyEventListenersToElement">addEmptyEventListenersToElement(element)</a> ⇒ <code>void</code></dt>
<dd><p>When mousing over a list item, child elements can
mess up the way classes are set upon mouseover/mouseleave.
This fixes that by applying the haltingCallback event handler to a few
events such as mouseover and mouseleave.</p>
</dd>
<dt><a href="#setHelpText">setHelpText(message)</a> ⇒ <code>void</code></dt>
<dd><p>Sets a message inside the &quot;warning&quot; text element.</p>
</dd>
<dt><a href="#setDeletionWarningText">setDeletionWarningText()</a> ⇒ <code>void</code></dt>
<dd><p>When toggling the &quot;Delete mode&quot; option, this will set the help text accordingly.</p>
</dd>
<dt><a href="#setUrlWarningText">setUrlWarningText()</a> ⇒ <code>void</code></dt>
<dd><p>When toggling the &quot;Set Default URLs&quot; option, this will set the help text accordingly.</p>
</dd>
<dt><a href="#setSummaryText">setSummaryText(message)</a> ⇒ <code>void</code></dt>
<dd><p>Sets a message inside the &quot;summary&quot; text element, such as &quot;Showing x/y containers&quot;</p>
</dd>
<dt><a href="#focusSearchBox">focusSearchBox()</a> ⇒ <code>void</code></dt>
<dd><p>Sets focus to the search box. Should be called often, especially on popup.</p>
</dd>
<dt><a href="#writeContainerDefaultUrlsToStorage">writeContainerDefaultUrlsToStorage()</a> ⇒ <code>void</code></dt>
<dd><p>Persists container default URL configuration data to extension storage.</p>
</dd>
<dt><a href="#actionCompletedHandler">actionCompletedHandler()</a> ⇒ <code>void</code></dt>
<dd><p>Actions to perform when an action is completed.</p>
</dd>
<dt><a href="#checkDefaultUrlsForUserQuery">checkDefaultUrlsForUserQuery(context, userQuery)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if a given container&#39;s <code>contextualIdentity</code> (<code>context</code>) has a default
URL value set in <code>config.containerDefaultUrls</code>.</p>
</dd>
<dt><a href="#deleteMultipleContainers">deleteMultipleContainers(contextsToDelete)</a> ⇒ <code>void</code></dt>
<dd><p>Asks if the user wants to delete multiple containers, and executes if the user says so.
TODO: For unit testability, convert to an asynchronous function.</p>
</dd>
<dt><a href="#setMultipleDefaultUrls">setMultipleDefaultUrls(contextsToSetDefaultUrls)</a> ⇒ <code>void</code></dt>
<dd><p>Associates a default URL to each item in the <code>contextsToSetDefaultUrls</code>
parameter.</p>
</dd>
<dt><a href="#setMultipleDefaultUrlsWithPrompt">setMultipleDefaultUrlsWithPrompt(contextsToSetDefaultUrls)</a> ⇒ <code>void</code></dt>
<dd><p>Requests a default URL from the user, and assigns that URL to every provided <code>contextualIdentity</code>.</p>
</dd>
<dt><a href="#openMultipleContexts">openMultipleContexts(contextsToOpenAsContainers, openAsPinnedTab)</a> ⇒ <code>void</code></dt>
<dd><p>Opens multiple container tabs according to controllable conditions.</p>
</dd>
<dt><a href="#renameContexts">renameContexts(contextsToRename)</a> ⇒ <code>void</code></dt>
<dd><p>Renames one or more contexts simultaneously.</p>
</dd>
<dt><a href="#duplicateContexts">duplicateContexts(contextsToDuplicate)</a> ⇒ <code>void</code></dt>
<dd><p>Duplicates one or more contexts.</p>
</dd>
<dt><a href="#containerClickHandler">containerClickHandler(filteredResults, context, event)</a> ⇒ <code>void</code></dt>
<dd><p>Adds click and other event handlers to a container list item HTML element.</p>
</dd>
<dt><a href="#removeExistingContainerListGroupElement">removeExistingContainerListGroupElement(containerListElement)</a> ⇒ <code>void</code></dt>
<dd><p>In preparation for rebuilding the filtered list of containers, this function
finds and deletes the container list group elements.</p>
</dd>
<dt><a href="#buildContainerListGroupElement">buildContainerListGroupElement()</a> ⇒ <code>Element</code></dt>
<dd><p>As part of rebuilding the filtered list of containers, this function
assembles a list group element.</p>
<p>TODO: make the <code>containerListGroup</code> ID use consistent naming conventions</p>
</dd>
<dt><a href="#isUserQueryContextNameMatch">isUserQueryContextNameMatch(contextName, userQueryArray)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if a user input string matches a container name using a somewhat
intuitive search algorithm.</p>
</dd>
<dt><a href="#filterContainers">filterContainers(event)</a> ⇒ <code>void</code></dt>
<dd><p>Applies the user&#39;s search query, and updates the list of containers accordingly.</p>
</dd>
<dt><a href="#processExtensionSettings">processExtensionSettings(data)</a> ⇒ <code>void</code></dt>
<dd><p>Retrieves extension settings from browser storage and persists them to
the <code>config</code> object, as well as setting the state of a few HTML elements.</p>
</dd>
<dt><a href="#setConfigParam">setConfigParam(parameter)</a> ⇒ <code>void</code></dt>
<dd><p>When a user checks a checkbox, this function toggles that value in the
<code>config</code> object, as well as setting all of the other mutually exclusive
options to <code>false</code>. It will also update the UI checkboxes to reflect the
values. See <code>mutuallyExclusiveConfigOptions</code>.</p>
</dd>
<dt><a href="#initializeDocument">initializeDocument(event)</a> ⇒ <code>void</code></dt>
<dd><p>Initializes the extension data upon document load, intended to be added as
a callback for the event listener <code>DOMContentLoaded</code>.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Configuration">Configuration</a> : <code>Object</code></dt>
<dd><p>All configuration options for this web extension are stored in this object.</p>
</dd>
<dt><a href="#ContextualIdentity">ContextualIdentity</a> : <code>Object</code></dt>
<dd><p>A contextual identity represents a container definition.
The following documentation was copied from the Mozilla documentation on 11/19/2020.
This typedef documentation uses text that is largely the property of Mozilla and is not intended to infringe on any of the licenses of MDN or Mozilla.
<a href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities/ContextualIdentity">https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities/ContextualIdentity</a></p>
</dd>
</dl>

<a name="config"></a>

## config : <code>object</code>
All configuration options for this web extension are stored in this object.

**Kind**: global namespace  
**Properties**

| Name | Type |
| --- | --- |
| windowStayOpenState | <code>boolean</code> | 
| deleteContainersOnClick | <code>boolean</code> | 
| setDefaultUrlsOnClick | <code>boolean</code> | 
| renameOnClick | <code>boolean</code> | 
| duplicateOnClick | <code>boolean</code> | 
| containerDefaultUrls | <code>object</code> | 


* [config](#config) : <code>object</code>
    * [.windowStayOpenState](#config.windowStayOpenState) : <code>boolean</code>
    * [.deleteContainersOnClick](#config.deleteContainersOnClick) : <code>boolean</code>
    * [.setDefaultUrlsOnClick](#config.setDefaultUrlsOnClick) : <code>boolean</code>
    * [.renameOnClick](#config.renameOnClick) : <code>boolean</code>
    * [.duplicateOnClick](#config.duplicateOnClick) : <code>boolean</code>
    * [.containerDefaultUrls](#config.containerDefaultUrls) : <code>object</code>

<a name="config.windowStayOpenState"></a>

### config.windowStayOpenState : <code>boolean</code>
windowStayOpenState is what keeps the window open while the user
clicks on a container tab.

**Kind**: static property of [<code>config</code>](#config)  
**Default**: <code>true</code>  
<a name="config.deleteContainersOnClick"></a>

### config.deleteContainersOnClick : <code>boolean</code>
deleteContainersOnClick triggers deletion of contextual identities
(containers) upon clicking a container tab result.

**Kind**: static property of [<code>config</code>](#config)  
**Default**: <code>false</code>  
<a name="config.setDefaultUrlsOnClick"></a>

### config.setDefaultUrlsOnClick : <code>boolean</code>
setDefaultUrlsOnClick will prompt the user to set a default URL for
each container tab result if set to true.

**Kind**: static property of [<code>config</code>](#config)  
**Default**: <code>false</code>  
<a name="config.renameOnClick"></a>

### config.renameOnClick : <code>boolean</code>
renameOnClick will allow the user to quickly rename a container on click.

**Kind**: static property of [<code>config</code>](#config)  
**Default**: <code>false</code>  
<a name="config.duplicateOnClick"></a>

### config.duplicateOnClick : <code>boolean</code>
duplicateOnClick will allow the user to quickly duplicate a container
on click.

**Kind**: static property of [<code>config</code>](#config)  
**Default**: <code>false</code>  
<a name="config.containerDefaultUrls"></a>

### config.containerDefaultUrls : <code>object</code>
containerDefaultUrls is a key-value pair of container ID's to
default URLs to open for each container ID.

**Kind**: static property of [<code>config</code>](#config)  
**Default**: <code>{}</code>  
**Example**  
```js
{"container-name-01":"https://site.com"}
```
<a name="mutuallyExclusiveConfigOptions"></a>

## mutuallyExclusiveConfigOptions : <code>Array.&lt;string&gt;</code>
Each of these values represents a key in the `config` object that,
when set to `true`, will require all other values to be false

**Kind**: global constant  
**Default**: <code>[&quot;deleteContainersOnClick&quot;,&quot;duplicateOnClick&quot;,&quot;renameOnClick&quot;,&quot;setDefaultUrlsOnClick&quot;]</code>  
<a name="helpTextMessages"></a>

## helpTextMessages : <code>Array.&lt;string&gt;</code>
Random list of help messages to show in the Help Text area.

**Kind**: global constant  
**Default**: <code>[&quot;Tip: Use ctrl to open pinned tab(s).&quot;,&quot;Tip: Shift+Click to execute against every shown result&quot;]</code>  
<a name="containerListItemInactiveClassNames"></a>

## containerListItemInactiveClassNames : <code>string</code>
This is the set of classes to assign to a container list item that is not
currently being hovered over. Assign to `element.className` for a given element.

**Kind**: global constant  
**Default**: <code>&quot;list-group-item container-list-item d-flex justify-content-space-between align-items-center&quot;</code>  
<a name="containerListItemActiveClassNames"></a>

## containerListItemActiveClassNames : <code>string</code>
This is the set of classes to assign to a container list item that is
currently being hovered over. Assign to `element.className` for a given element.

**Kind**: global constant  
<a name="containerListItemActiveDangerClassNames"></a>

## containerListItemActiveDangerClassNames : <code>string</code>
This is the set of classes to assign to a container list item that is
currently being hovered over, while the container management mode is set to
deletion mode. Assign to `element.className` for a given element.

**Kind**: global constant  
<a name="CONTAINER_LIST_DIV_ID"></a>

## CONTAINER\_LIST\_DIV\_ID : <code>string</code>
The `<div>` ID of the container list. This is where all of the queried containers will go.

**Kind**: global constant  
**Default**: <code>&quot;container-list&quot;</code>  
<a name="buildContainerIconElement"></a>

## buildContainerIconElement(context) ⇒ <code>Element</code>
Assembles an HTML element that contains the colorized container icon for a given container.

**Kind**: global function  
**Returns**: <code>Element</code> - An HTML element containing the colorized container icon for `context`.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>ContextualIdentity</code>](#ContextualIdentity) | The contextualIdentity that this icon element will represent |

<a name="buildContainerLabelElement"></a>

## buildContainerLabelElement(context) ⇒ <code>Element</code>
Assembles an HTML element that contains a text label for a given container.

**Kind**: global function  
**Returns**: <code>Element</code> - An HTML element containing text that represents the
container's name and default URL, if defined.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>ContextualIdentity</code>](#ContextualIdentity) | The contextualIdentity that this text element will represent |

<a name="applyEventListenersToContainerListItem"></a>

## applyEventListenersToContainerListItem(liElement, filteredResults, context) ⇒ <code>string</code>
Adds click and other event handlers to a container list item HTML element.

**Kind**: global function  
**Returns**: <code>string</code> - Any error message, or empty string if no errors occurred.  

| Param | Type | Description |
| --- | --- | --- |
| liElement | <code>Element</code> | The container list item that will receive all event listeners |
| filteredResults | [<code>Array.&lt;ContextualIdentity&gt;</code>](#ContextualIdentity) | A list of the currently filtered set of browser.contextualIdentities |
| context | [<code>ContextualIdentity</code>](#ContextualIdentity) | The contextualIdentity that this list item will represent |

<a name="buildContainerListItem"></a>

## buildContainerListItem(filteredResults, context) ⇒ <code>Element</code>
Assembles an HTML element that contains an entire container list item.

**Kind**: global function  
**Returns**: <code>Element</code> - An HTML element with event listeners, formatted with css as a bootstrap list item.  

| Param | Type | Description |
| --- | --- | --- |
| filteredResults | [<code>Array.&lt;ContextualIdentity&gt;</code>](#ContextualIdentity) | A list of the currently filtered set of browser.contextualIdentities |
| context | [<code>ContextualIdentity</code>](#ContextualIdentity) | The contextualIdentity that this list item will represent |

<a name="haltingCallback"></a>

## haltingCallback(event) ⇒ <code>void</code>
When mousing over a list item, child elements can
mess up the way classes are set upon mouseover/mouseleave.
This fixes that.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | The event that was created when the user performed some interaction with the document. |

<a name="addEmptyEventListenersToElement"></a>

## addEmptyEventListenersToElement(element) ⇒ <code>void</code>
When mousing over a list item, child elements can
mess up the way classes are set upon mouseover/mouseleave.
This fixes that by applying the haltingCallback event handler to a few
events such as mouseover and mouseleave.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Element</code> | The HTML element that will receive generic event listeners. |

<a name="setHelpText"></a>

## setHelpText(message) ⇒ <code>void</code>
Sets a message inside the "warning" text element.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The HTML string to put inside the warning text element. |

<a name="setDeletionWarningText"></a>

## setDeletionWarningText() ⇒ <code>void</code>
When toggling the "Delete mode" option, this will set the help text accordingly.

**Kind**: global function  
<a name="setUrlWarningText"></a>

## setUrlWarningText() ⇒ <code>void</code>
When toggling the "Set Default URLs" option, this will set the help text accordingly.

**Kind**: global function  
<a name="setSummaryText"></a>

## setSummaryText(message) ⇒ <code>void</code>
Sets a message inside the "summary" text element, such as "Showing x/y containers"

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The HTML string to put inside the summary text element. |

<a name="focusSearchBox"></a>

## focusSearchBox() ⇒ <code>void</code>
Sets focus to the search box. Should be called often, especially on popup.

**Kind**: global function  
<a name="writeContainerDefaultUrlsToStorage"></a>

## writeContainerDefaultUrlsToStorage() ⇒ <code>void</code>
Persists container default URL configuration data to extension storage.

**Kind**: global function  
<a name="actionCompletedHandler"></a>

## actionCompletedHandler() ⇒ <code>void</code>
Actions to perform when an action is completed.

**Kind**: global function  
<a name="checkDefaultUrlsForUserQuery"></a>

## checkDefaultUrlsForUserQuery(context, userQuery) ⇒ <code>boolean</code>
Checks if a given container's `contextualIdentity` (`context`) has a default
URL value set in `config.containerDefaultUrls`.

**Kind**: global function  
**Returns**: <code>boolean</code> - Whether or not the container `context` has a default URL set  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>ContextualIdentity</code>](#ContextualIdentity) | The context for a container, straight from `browser.contextualIdentities` |
| userQuery | <code>string</code> | The text that the user has searched for |

<a name="deleteMultipleContainers"></a>

## deleteMultipleContainers(contextsToDelete) ⇒ <code>void</code>
Asks if the user wants to delete multiple containers, and executes if the user says so.
TODO: For unit testability, convert to an asynchronous function.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| contextsToDelete | [<code>Array.&lt;ContextualIdentity&gt;</code>](#ContextualIdentity) | The `contextualIdentity` array to possibly be deleted. |

<a name="setMultipleDefaultUrls"></a>

## setMultipleDefaultUrls(contextsToSetDefaultUrls) ⇒ <code>void</code>
Associates a default URL to each item in the `contextsToSetDefaultUrls`
parameter.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| contextsToSetDefaultUrls | [<code>Array.&lt;ContextualIdentity&gt;</code>](#ContextualIdentity) | The `contextualIdentity` array whose default URLs will be updated. |

<a name="setMultipleDefaultUrlsWithPrompt"></a>

## setMultipleDefaultUrlsWithPrompt(contextsToSetDefaultUrls) ⇒ <code>void</code>
Requests a default URL from the user, and assigns that URL to every provided `contextualIdentity`.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| contextsToSetDefaultUrls | [<code>Array.&lt;ContextualIdentity&gt;</code>](#ContextualIdentity) | The `contextualIdentity` array whose default URLs will be updated. |

<a name="openMultipleContexts"></a>

## openMultipleContexts(contextsToOpenAsContainers, openAsPinnedTab) ⇒ <code>void</code>
Opens multiple container tabs according to controllable conditions.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| contextsToOpenAsContainers | [<code>Array.&lt;ContextualIdentity&gt;</code>](#ContextualIdentity) | The `contextualIdentity` array that will each open as a container tab. |
| openAsPinnedTab | <code>boolean</code> | Whether or not to open as a pinned tab. |

<a name="renameContexts"></a>

## renameContexts(contextsToRename) ⇒ <code>void</code>
Renames one or more contexts simultaneously.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| contextsToRename | [<code>Array.&lt;ContextualIdentity&gt;</code>](#ContextualIdentity) | The `contextualIdentities` to change. |

<a name="duplicateContexts"></a>

## duplicateContexts(contextsToDuplicate) ⇒ <code>void</code>
Duplicates one or more contexts.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| contextsToDuplicate | [<code>Array.&lt;ContextualIdentity&gt;</code>](#ContextualIdentity) | The `contextualIdentities` to duplicate. |

<a name="containerClickHandler"></a>

## containerClickHandler(filteredResults, context, event) ⇒ <code>void</code>
Adds click and other event handlers to a container list item HTML element.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filteredResults | [<code>Array.&lt;ContextualIdentity&gt;</code>](#ContextualIdentity) | A list of the currently filtered set of `browser.contextualIdentities` |
| context | [<code>ContextualIdentity</code>](#ContextualIdentity) | The `contextualIdentity` associated with this handler, assume that a user clicked on a specific container to open if this is defined |
| event | <code>Event</code> | The event that called this function, such as a key press or mouse click |

<a name="removeExistingContainerListGroupElement"></a>

## removeExistingContainerListGroupElement(containerListElement) ⇒ <code>void</code>
In preparation for rebuilding the filtered list of containers, this function
finds and deletes the container list group elements.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| containerListElement | <code>Element</code> | The empty (by default, before population) `<div>` on the `popup.html` page that holds the entire container list element collection. Retrieve by using document.getElementById(CONTAINER_LIST_DIV_ID) |

<a name="buildContainerListGroupElement"></a>

## buildContainerListGroupElement() ⇒ <code>Element</code>
As part of rebuilding the filtered list of containers, this function
assembles a list group element.

TODO: make the `containerListGroup` ID use consistent naming conventions

**Kind**: global function  
**Returns**: <code>Element</code> - The `<ul>` list group element that will hold the child `<li>` container list items.  
<a name="isUserQueryContextNameMatch"></a>

## isUserQueryContextNameMatch(contextName, userQueryArray) ⇒ <code>boolean</code>
Checks if a user input string matches a container name using a somewhat
intuitive search algorithm.

**Kind**: global function  
**Returns**: <code>boolean</code> - Whether or not a name and query should be included as part of the search results  

| Param | Type | Description |
| --- | --- | --- |
| contextName | <code>string</code> | The lowercase name of the `contextualIdentity` to run the search query against |
| userQueryArray | <code>Array.&lt;string&gt;</code> | An array of strings built by splitting the lowercase user query string based on space characters |

<a name="filterContainers"></a>

## filterContainers(event) ⇒ <code>void</code>
Applies the user's search query, and updates the list of containers accordingly.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | The event that called this function, such as a key press or mouse click |

<a name="processExtensionSettings"></a>

## processExtensionSettings(data) ⇒ <code>void</code>
Retrieves extension settings from browser storage and persists them to
the `config` object, as well as setting the state of a few HTML elements.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | The data from calling `browser.storage.local.get()` |

<a name="setConfigParam"></a>

## setConfigParam(parameter) ⇒ <code>void</code>
When a user checks a checkbox, this function toggles that value in the
`config` object, as well as setting all of the other mutually exclusive
options to `false`. It will also update the UI checkboxes to reflect the
values. See `mutuallyExclusiveConfigOptions`.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| parameter | <code>string</code> | The `config` key to toggle. |

<a name="setConfigParam..extensionStorageConfigStore"></a>

### setConfigParam~extensionStorageConfigStore : [<code>Configuration</code>](#Configuration)
we have to build out an object that will be pushed to the extension
config storage for persistence
TODO: test/determine if we can just push the config object
to the store without negative consequences

**Kind**: inner constant of [<code>setConfigParam</code>](#setConfigParam)  
<a name="initializeDocument"></a>

## initializeDocument(event) ⇒ <code>void</code>
Initializes the extension data upon document load, intended to be added as
a callback for the event listener `DOMContentLoaded`.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | The event that called this function, such as a key press or mouse click |

<a name="Configuration"></a>

## Configuration : <code>Object</code>
All configuration options for this web extension are stored in this object.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| windowStayOpenState | <code>boolean</code> | 
| deleteContainersOnClick | <code>boolean</code> | 
| setDefaultUrlsOnClick | <code>boolean</code> | 
| renameContainersOnClick | <code>boolean</code> | 
| duplicateOnClick | <code>boolean</code> | 
| containerDefaultUrls | <code>Object</code> | 

<a name="ContextualIdentity"></a>

## ContextualIdentity : <code>Object</code>
A contextual identity represents a container definition.
The following documentation was copied from the Mozilla documentation on 11/19/2020.
This typedef documentation uses text that is largely the property of Mozilla and is not intended to infringe on any of the licenses of MDN or Mozilla.
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities/ContextualIdentity

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cookieStoreId | <code>string</code> | The cookie store ID for the identity. Since contextual identities don't share cookie stores, this serves as a unique identifier. |
| color | <code>string</code> | The color for the identity. This will be shown in tabs belonging to this identity. The value "toolbar" represents a theme-dependent color.  Identities with color "toolbar" will be displayed in the same color as text in the toolbar (corresponding to the theme key "toolbar_field_text"). |
| colorCode | <code>string</code> | A hex code representing the exact color used for the identity. For example: "#37adff". In the special case of the "toolbar" color, colorCode is always "#7c7c7d", regardless of the displayed color. |
| icon | <code>string</code> | The name of an icon for the identity. This will be shown in the URL bar for tabs belonging to this identity. The following values are valid: |
| iconUrl | <code>string</code> | A full resource:// URL pointing to the identity's icon. For example: "resource://usercontext-content/fingerprint.svg". |
| name | <code>string</code> | Name of the identity. This will be shown in the URL bar for tabs belonging to this identity. Note that names don't have to be unique. |

