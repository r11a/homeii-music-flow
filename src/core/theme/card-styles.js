import sheet0 from "./sheets/foundation.js";
import sheet1 from "./sheets/compact.js";
import sheet2 from "./sheets/player.js";
import sheet3 from "./sheets/voice.js";
import sheet4 from "./sheets/menus.js";
import sheet5 from "./sheets/library.js";
import sheet6 from "./sheets/queue-groups.js";
import sheet7 from "./sheets/settings.js";
import sheet8 from "./sheets/responsive.js";
import sheet9 from "./sheets/studio.js";
import sheet10 from "./sheets/queue-layout.js";
import sheet11 from "./sheets/players.js";
import sheet12 from "./sheets/discovery.js";
import sheet13 from "./sheets/screensaver.js";
import sheet14 from "./sheets/library-detail.js";
import { interfaceStyles } from "./interface.js";
import { immersivePlayerStyles } from "./sheets/immersive-player.js";

// Keep the original cascade order; each sheet owns a bounded presentation area.
export function buildCardStyles(options) {
  return [
    sheet0(options),
    sheet1(options),
    sheet2(options),
    sheet3(options),
    sheet4(options),
    sheet5(options),
    sheet6(options),
    sheet7(options),
    sheet8(options),
    sheet9(options),
    sheet10(options),
    sheet11(options),
    sheet12(options),
    sheet13(options),
    sheet14(options),
    interfaceStyles,
    immersivePlayerStyles,
  ].join("");
}
