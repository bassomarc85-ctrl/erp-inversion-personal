@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  font-variant-numeric: tabular-nums;
}

::selection {
  background-color: theme("colors.accent");
  color: theme("colors.base");
}

:focus-visible {
  outline: 2px solid theme("colors.accentlight");
  outline-offset: 2px;
}
