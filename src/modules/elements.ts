
/**
 * As part of rebuilding the filtered list of containers, this function
 * assembles a list group element.
 *
 * TODO: make the `containerListGroup` ID use consistent naming conventions
 * @returns The `<ul>` list group element that will hold the child `<li>` container list items.
 */
export const buildContainerListGroupElement = (): HTMLElement => {
    const ulElement = document.createElement('ul');
    ulElement.id = 'containerListGroup';
    ulElement.className = "list-group";
    return ulElement;
};