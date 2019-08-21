import * as _Bhp from "../../bhp-core/lib";
import * as brc5 from "./plugin";

function bundle<T extends typeof _Bhp>(
  bhpCore: T
): T & { brc5: typeof brc5 } {
  return { ...(bhpCore as any), brc5: brc5 };
}

export default bundle;
export * from "./plugin";
