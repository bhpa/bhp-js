import { tx, wallet } from "../../../bhp-core/lib";
import { checkProperty } from "./common";
import { ManagedApiBasicConfig } from "./types";

function addSignature(transaction: tx.Transaction, signature: string): void {
  transaction.scripts.push(tx.Witness.deserialize(signature));
}

/**
 * Signs a transaction within the config object.
 * @param config - Configuration object.
 * @return Configuration object.
 */
export async function signTx<
  T extends ManagedApiBasicConfig<tx.BaseTransaction>
>(config: T): Promise<T> {
  checkProperty(config, "signingFunction", "tx");
  const signatures = await config.signingFunction!(
    config.tx!.serialize(false),
    config.account!.publicKey
  );
  if (signatures instanceof Array) {
    signatures.forEach(sig => {
      addSignature(config.tx!, sig);
    });
  } else {
    addSignature(config.tx!, signatures);
  }

  return config;
}

export function signWithPrivateKey(
  privateKey: string
): (tx: string, publicKey: string) => Promise<string | string[]> {
  const pubKey = new wallet.Account(privateKey).publicKey;
  return async (txString: string, publicKey?: string) => {
    const sig = wallet.sign(txString, privateKey);
    const witness = tx.Witness.fromSignature(sig, publicKey || pubKey);
    return witness.serialize();
  };
}

/**
 * Signs a transaction within the config object.
 * @param config - Configuration object.
 * @param priKeys - private keys.
 * @return tx hex string.
 */
export function signTxByPriKey(
  config: tx.ContractTransaction,
  priKeys: string[]
): string {  
  let txHex: string = config!.serialize(false);
  priKeys.forEach(p => {
    const pubKey = new wallet.Account(p).publicKey;
    const sig = wallet.sign(txHex, p);
    config.addWitness(tx.Witness.fromSignature(sig, pubKey));
  });
  return config!.serialize(true);
}
