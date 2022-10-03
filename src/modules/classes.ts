export const CLASS_ELEMENT_HIDE = 'element-hide';
export const CLASS_ELEMENT_SHOW = 'element-show';

const LI_BASE = 'list-group-item d-flex justify-content-space-between align-items-center container-list-item m-0 p-2';

export const CLASSES_CONTAINER_LI = `${LI_BASE}`;

export const CLASSES_CONTAINER_ICON = ``;
export const CLASSES_CONTAINER_ICON_DIV = `icon mx-2 pr-2`;


export const CLASSES_CONTAINER_ICON_EMPTY_TEXT = 'mono-16';

/**
 * An empty set of results shows differently from the typical container list
 * items.
 */
export const CLASSES_CONTAINER_LI_EMPTY = 'list-group-item d-flex justify-content-space-between align-items-center'

/**
 * This is the set of classes to assign to a container list item that is not
 * currently being hovered over. Assign to `element.className` for a given element.
 */
export const CLASSES_CONTAINER_LI_INACTIVE = `${LI_BASE}`;

/**
 * This is the set of classes to assign to a container list item that is not
 * currently being hovered over, but is selected via the selection mode.
 * Assign to `element.className` for a given element.
 */
export const CLASSES_CONTAINER_LI_SELECTED = `${LI_BASE} bg-secondary border-secondary text-white`;

/**
 * This is the set of classes to assign to a container list item that is
 * currently being hovered over. Assign to `element.className` for a given element.
 */
export const CLASSES_CONTAINER_LI_ACTIVE = `${CLASSES_CONTAINER_LI_INACTIVE} active cursor-pointer`;

/**
 * This is the set of classes to assign to a container list item that is
 * currently being hovered over, while the container management mode is set to
 * deletion mode. Assign to `element.className` for a given element.
 */
export const CLASSES_CONTAINER_LI_ACTIVE_DANGER = `${CLASSES_CONTAINER_LI_ACTIVE} bg-danger border-danger`;

export const CLASSES_CONTAINER_DIV = 'container-list-text d-flex flex-column justify-content-center align-items-baseline px-0 pr-1';

export const CLASSES_CONTAINER_DIV_DESTRUCTIVE = 'd-flex justify-content-center align-items-center align-content-center';

/**
 * This is the set of classes to assign to a container list item url label that
 * is currently not being hovered over or selected.
 * Assign to `element.className` for a given element.
 */
export const CLASSES_CONTAINER_LI_URL_LABEL = `text-muted small`;

/**
 * This is the set of classes to assign to a container list item url label that
 * is currently being hovered over or selected
 * Assign to `element.className` for a given element.
 */
export const CLASSES_CONTAINER_LI_URL_LABEL_INVERTED = `text-light small`;
