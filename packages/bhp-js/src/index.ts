import apiPlugin from "../../bhp-api/lib";
import * as bhpCore from "../../bhp-core/lib";
import brcPlugin from "../../bhp-brc5/lib";

const bhpWithApi = apiPlugin(bhpCore);
const bhpJs = brcPlugin(bhpWithApi);

export const {
  api,
  brc5,
  settings,
  sc,
  rpc,
  wallet,
  CONST,
  u,
  tx,
  logging
} = bhpJs;
import defaultNetworks from "./networks";
const bootstrap: {
  [net: string]: Partial<bhpCore.rpc.NetworkJSON>;
} = defaultNetworks;
Object.keys(bootstrap).map(key => {
  settings.networks[key] = new rpc.Network(bootstrap[
    key
  ] as bhpCore.rpc.NetworkJSON);
});

/**
 * Semantic path for creation of a resource.
 */
const create = {
  account: (k: string) => new wallet.Account(k),
  privateKey: wallet.generatePrivateKey,
  signature: wallet.generateSignature,
  wallet: (k: bhpCore.wallet.WalletJSON) => new wallet.Wallet(k),
  claimTx: () => new tx.ClaimTransaction(),
  contractTx: () => new tx.ContractTransaction(),
  invocationTx: () => new tx.InvocationTransaction(),
  stateTx: () => new tx.StateTransaction(),
  contractParam: (type: keyof typeof sc.ContractParamType, value: any) =>
    new sc.ContractParam(type, value),
  script: sc.createScript,
  scriptBuilder: () => new sc.ScriptBuilder(),
  deployScript: (args: any) => sc.generateDeployScript(args),
  rpcClient: (net: string, version: string) => new rpc.RPCClient(net, version),
  query: (req: bhpCore.rpc.RPCRequest) => new rpc.Query(req),
  network: (net: Partial<bhpCore.rpc.NetworkJSON>) => new rpc.Network(net),
  stringStream: (str?: string) => new u.StringStream(str),
  fixed8: (i?: string | number) => new u.Fixed8(i)
};

/**
 * Semantic path for verification of a type.
 */
const is = {
  address: wallet.isAddress,
  publicKey: wallet.isPublicKey,
  encryptedKey: wallet.isBRC2,
  privateKey: wallet.isPrivateKey,
  wif: wallet.isWIF,
  scriptHash: wallet.isScriptHash
};

/**
 * Semantic path for deserialization of object.
 */
const deserialize = {
  attribute: tx.TransactionAttribute.deserialize,
  input: tx.TransactionInput.deserialize,
  output: tx.TransactionOutput.deserialize,
  script: tx.Witness.deserialize,
  tx: tx.Transaction.deserialize
};

/**
 * Semantic path for signing using private key.
 */
const sign = {
  hex: wallet.sign,
  message: (msg: string, privateKey: string) => {
    const hex = u.str2hexstring(msg);
    return wallet.sign(hex, privateKey);
  }
};

/**
 * Semantic path for verifying signatures using public key.
 */
const verify = {
  hex: wallet.verify,
  message: (msg: string, sig: string, publicKey: string) => {
    const hex = u.str2hexstring(msg);
    return wallet.verify(hex, sig, publicKey);
  }
};

export default {
  sendAsset: api.sendAsset,
  claimGas: api.claimGas,
  doInvoke: api.doInvoke,
  setupVote: api.setupVote,
  makeTransaction: api.makeTransaction,
  create,
  deserialize,
  is,
  sign,
  verify,
  encrypt: {
    privateKey: wallet.encrypt
  },
  decrypt: {
    privateKey: wallet.decrypt
  },
  add: {
    network: (network: bhpCore.rpc.Network, override = false) => {
      if (override && settings.networks[network.name]) {
        return false;
      }
      settings.networks[network.name] = network;
      return true;
    }
  },
  remove: {
    network: (name: string): boolean => {
      if (settings.networks[name]) {
        delete settings.networks[name];
        return true;
      }
      return false;
    }
  },
  u,
  CONST
};
