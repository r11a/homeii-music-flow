import section0 from "./sheets/classic-shell.js";
import section1 from "./sheets/classic-library.js";
import section2 from "./sheets/classic-fullscreen.js";
import section3 from "./sheets/classic-dialogs.js";
import section4 from "./sheets/classic-now-playing.js";

export function classicStyles(options) { return section0(options) + section1 + section2 + section3(options) + section4; }
