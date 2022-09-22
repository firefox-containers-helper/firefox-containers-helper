export const CLASS_ELEMENT_HIDE = 'element-hide';
export const CLASS_ELEMENT_SHOW = 'element-show';

/**
 * This is the set of classes to assign to a container list item that is not
 * currently being hovered over. Assign to `element.className` for a given element.
 */
export const containerListItemInactiveClassNames = 'list-group-item container-list-item d-flex justify-content-space-between align-items-center';

/**
 * This is the set of classes to assign to a container list item that is not
 * currently being hovered over, but is selected via the selection mode.
 * Assign to `element.className` for a given element.
 */
export const containerListItemSelectedClassNames = 'list-group-item container-list-item d-flex justify-content-space-between align-items-center bg-secondary border-secondary text-white';

/**
 * This is the set of classes to assign to a container list item that is
 * currently being hovered over. Assign to `element.className` for a given element.
 */
export const containerListItemActiveClassNames = `${containerListItemInactiveClassNames} active cursor-pointer`;

/**
 * This is the set of classes to assign to a container list item that is
 * currently being hovered over, while the container management mode is set to
 * deletion mode. Assign to `element.className` for a given element.
 */
export const containerListItemActiveDangerClassNames = `${containerListItemActiveClassNames} bg-danger border-danger`;
