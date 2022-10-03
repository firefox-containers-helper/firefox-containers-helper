export const CLASS_ELEMENT_HIDE = 'element-hide';
export const CLASS_ELEMENT_SHOW = 'element-show';

/**
 * This is the set of classes to assign to a container list item that is not
 * currently being hovered over. Assign to `element.className` for a given element.
 */
export const CLASSES_CONTAINER_LI_INACTIVE = 'list-group-item container-list-item d-flex justify-content-space-between align-items-center';

/**
 * This is the set of classes to assign to a container list item that is not
 * currently being hovered over, but is selected via the selection mode.
 * Assign to `element.className` for a given element.
 */
export const CLASSES_CONTAINER_LI_SELECTED = 'list-group-item container-list-item d-flex justify-content-space-between align-items-center bg-secondary border-secondary text-white';

/**
 * This is the set of classes to assign to a container list item that is
 * currently being hovered over. Assign to `element.className` for a given element.
 */
export const CLASSES_LI_ACTIVE = `${CLASSES_CONTAINER_LI_INACTIVE} active cursor-pointer`;

/**
 * This is the set of classes to assign to a container list item that is
 * currently being hovered over, while the container management mode is set to
 * deletion mode. Assign to `element.className` for a given element.
 */
export const CLASSES_CONTAINER_LI_ACTIVE_DANGER = `${CLASSES_LI_ACTIVE} bg-danger border-danger`;

export const CLASSES_CONTAINER_DIV = 'container-list-text d-flex flex-column justify-content-center align-items-baseline px-3';

export const CLASSES_CONTAINER_LI = 'list-group-item d-flex justify-content-space-between align-items-center';

export const CLASSES_CONTAINER_LI_DIV_DESTRUCTIVE = 'd-flex justify-content-center align-items-center align-content-center';
