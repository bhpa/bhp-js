import { sc, tx, u, wallet, CONST } from "../../../bhp-core/lib";
import { checkProperty } from "./common";
import {
  ClaimGasConfig,
  DoInvokeConfig,
  SendAssetConfig,
  SetupVoteConfig,
  MakeTransactionCofig
} from "./types";

export async function createClaimTx(
  config: ClaimGasConfig
): Promise<ClaimGasConfig> {
  checkProperty(config, "claims");
  config.tx = new tx.ClaimTransaction(config.override);
  config.tx.addClaims(config.claims!);
  return config as ClaimGasConfig;
}

export async function createContractTx(
  config: SendAssetConfig
): Promise<SendAssetConfig> {
  checkProperty(config, "balance", "intents");
  config.tx = new tx.ContractTransaction(
    Object.assign({ outputs: config.intents }, config.override)
  );
  config.tx.calculate(config.balance!, undefined, config.fees!);
  return config;
}

export async function createInvocationTx(
  config: DoInvokeConfig
): Promise<DoInvokeConfig> {
  checkProperty(config, "script");
  const processedScript =
    typeof config.script === "object"
      ? sc.createScript(config.script)
      : config.script;
  config.tx = new tx.InvocationTransaction(
    Object.assign(
      {
        outputs: config.intents || [],
        script: processedScript,
        gas: config.gas || 0
      },
      config.override
    )
  );
  config.tx.calculate(
    config.balance || new wallet.Balance(),
    undefined,
    config.fees
  );
  return config;
}

export async function createStateTx(
  config: SetupVoteConfig
): Promise<SetupVoteConfig> {
  const descriptors = [
    new tx.StateDescriptor({
      type: tx.StateType.Account,
      key: u.reverseHex(config.account.scriptHash),
      field: "Votes",
      value:
        u.int2hex(config.candidateKeys.length) + config.candidateKeys.join("")
    })
  ];
  config.tx = new tx.StateTransaction({ descriptors });
  return config;
}

export function makeTransactionFunction(
  config: MakeTransactionCofig
): MakeTransactionCofig {
  let txs: tx.ContractTransaction = new tx.ContractTransaction();
  txs = MakeTx(config, txs);
  txs = EstimateFee(config, txs);
  config.tx = txs;
  config.txHex = config.tx!.serialize(false);

  return signTxBhp(config, txs);
}

/**
 * @param config Configuration object.
 * @param txs ContractTransaction.
 * @return ContractTransaction.
 */
function MakeTx(
  config: MakeTransactionCofig,
  txs: tx.ContractTransaction
): tx.ContractTransaction {
  let assetUtxos: Array<tx.BhpUtxo> = new Array<tx.BhpUtxo>();
  let assetUtxosSum: number = 0;

  assetUtxos = findAssetUtxos(config, config.assetId, "");
  assetUtxos.forEach(p => { assetUtxosSum += p.value; });
  if (assetUtxosSum < config.value) {
    throw new Error(`makeTransactionFunction: ${config.assetId} utxo is not enough`);
  }

  let fee: number = 0;
  if (config.assetId == CONST.ASSET_ID["BHP"]) {
    if (assetUtxosSum == config.value) {
      throw new Error("makeTransactionFunction: txfee is not enough");
    }
    fee = CONST.Min_Tx_Fee;
  }

  let allValue = config.value + fee;
  let txCoins: Array<tx.BhpUtxo> = new Array<tx.BhpUtxo>();
  let txCoinsSum: number = 0;
  let i: number = 0;
  while (assetUtxos[i].value < allValue) {
    allValue -= assetUtxos[i].value;
    txCoins.push(assetUtxos[i]);
    i++;
  }
  if (allValue > 0) {
    txCoins.push(assetUtxos[i]);
  }

  txCoins.forEach(p => {
    txCoinsSum += p.value;
    txs.inputs.push(new tx.TransactionInput({
      prevHash: p.prevHash,
      prevIndex: p.prevIndex
    }));
  });

  txs.outputs.push(new tx.TransactionOutput({
    assetId: config.assetId,
    value: config.value,
    scriptHash: wallet.getScriptHashFromAddress(config.toAddress)
  }));

  if (txCoinsSum > (config.value + fee)) {
    txs.outputs.push(new tx.TransactionOutput({
      assetId: config.assetId,
      value: txCoinsSum - config.value - fee,
      scriptHash: wallet.getScriptHashFromAddress(config.changeAddress)
    }));
  }
  return txs;
}

/**
 * Function queries specify utxo for assetid.
 * @param config Configuration object.
 * @param assetId assetid.
 * @param address address.
 * @return utxos.
 */
function findAssetUtxos(
  config: MakeTransactionCofig,
  assetId: string,
  address: string
): tx.BhpUtxo[] {
  let assetUtxos: Array<tx.BhpUtxo> = new Array<tx.BhpUtxo>();
  if (address == "") {
    config.inputs.forEach(p => {
      if (p.assetId == assetId) {
        assetUtxos.push(p);
      }
    });
  }
  else {
    config.inputs.forEach(p => {
      if (p.assetId == assetId && p.address == address) {
        assetUtxos.push(p);
      }
    });
  }
  assetUtxos = assetUtxos.sort((a, b) => a.value - b.value);
  return assetUtxos;
}

/**
 * Function calculates token and share fees.
 * @param config Configuration object.
 * @param txs ContractTransaction.
 * @return ContractTransaction.
 */
function EstimateFee
  (
    config: MakeTransactionCofig,
    txs: tx.ContractTransaction
  ): tx.ContractTransaction {
  if (CONST.IS_BHP_FEE && config.assetId != CONST.ASSET_ID["BHP"] && config.assetId != CONST.ASSET_ID["GAS"]) {
    let fee: number = CONST.Min_Tx_Fee;
    let assetUtxos: Array<tx.BhpUtxo> = new Array<tx.BhpUtxo>();
    let assetUtxosSum: number = 0;
    assetUtxos = findAssetUtxos(config, CONST.ASSET_ID["BHP"], config.bhpFeeAddress);
    assetUtxos.forEach(p => { assetUtxosSum += p.value; });
    if (assetUtxosSum < fee) {
      throw new Error("makeTransactionFunction: txfee is not enough")
    }

    if (assetUtxosSum == fee) {
      assetUtxos.forEach(p => {
        txs.inputs.push(new tx.TransactionInput({
          prevHash: p.prevHash,
          prevIndex: p.prevIndex
        }));
      });
    }
    else {
      if (!config.bhpFeeAddress) {
        throw new Error("makeTransaction need bhpFeeAddress");
      }
      let txCoins: Array<tx.BhpUtxo> = new Array<tx.BhpUtxo>();
      let i: number = 0;
      let txCoinsSum: number = 0;
      let allValue = fee;
      while (assetUtxos[i].value < allValue) {
        allValue -= assetUtxos[i].value;
        txCoins.push(assetUtxos[i]);
        i++;
      }
      if (allValue > 0) {
        txCoins.push(assetUtxos[i]);
      }
      txCoins.forEach(p => {
        txCoinsSum += p.value;
        txs.inputs.push(new tx.TransactionInput({
          prevHash: p.prevHash,
          prevIndex: p.prevIndex
        }));
      });
      txs.outputs.push(new tx.TransactionOutput({
        assetId: CONST.ASSET_ID["BHP"],
        value: txCoinsSum - fee,
        scriptHash: wallet.getScriptHashFromAddress(config.bhpFeeAddress)
      }));
    }
  }
  return txs;
}

/**
 * Function to sign a ContractTransaction.
 * @param config Configuration object.
 * @param txs ContractTransaction.
 * @return Configuration object.
 */
function signTxBhp(
  config: MakeTransactionCofig,
  txs: tx.ContractTransaction
): MakeTransactionCofig {
  if (config.priKeys && config.priKeys.length != 0) {
    config.priKeys.forEach(p => {
      const pubKey = new wallet.Account(p).publicKey;
      const sig = wallet.sign(config.txHex, p);
      txs.addWitness(tx.Witness.fromSignature(sig, pubKey));
    });
    config.tx = txs;
    config.txHex = config.tx!.serialize(true);
  }
  return config;
}
