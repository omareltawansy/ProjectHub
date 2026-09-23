// Props that make a non-button element (e.g. a selectable card that contains its
// own buttons) behave like a button for keyboard and screen-reader users.
export function activatableProps(onActivate, { selected } = {}) {
  return {
    role: 'button',
    tabIndex: 0,
    'aria-pressed': selected,
    onClick: onActivate,
    onKeyDown: (e) => {
      // Ignore keys bubbling up from buttons/inputs inside the card.
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate(e);
      }
    },
  };
}
