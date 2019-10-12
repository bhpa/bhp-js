import * as _Bhp from "../../bhp-core/lib";
import * as plugin from "./plugin";
import { default as apiSettings } from "./settings";

function assignSettings(
  baseSettings: typeof _Bhp.settings,
  newSettings: { [k: string]: any }
): void {
  for (const key in newSettings) {
    if (!(key in baseSettings)) {
      Object.defineProperty(baseSettings, key, {
        get() {
          return newSettings[key];
        },
        set(val) {
          newSettings[key] = val;
        }
      });
    }
  }
}
function bundle<T extends typeof _Bhp>(
  bhpCore: T
): T & { api: typeof plugin } {
  assignSettings(bhpCore.settings, apiSettings);
  return { ...(bhpCore as any), api: plugin };
}

export default bundle;
export * from "./plugin";
