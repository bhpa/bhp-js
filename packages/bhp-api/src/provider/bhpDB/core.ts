import { logging, u, wallet } from "../../../../bhp-core/lib";
import axios from "axios";
import { settings as internalSettings } from "../../settings";
import {
  filterHttpsOnly,
  findGoodNodesFromHeight,
  getBestUrl,
  PastTransaction,
  RpcNode
} from "../common";
import {
  BhpDbBalance,
  BhpDbClaims,
  BhpDbHistory,
  BhpDbNode
} from "./responses";
const log = logging.default("api");

/**
 * Returns an appropriate RPC endpoint retrieved from a bhpDB endpoint.
 * @param url - URL of a bhpDB service.
 * @returns URL of a good RPC endpoint.
 */
export async function getRPCEndpoint(url: string): Promise<string> {
  const response = await axios.get(url + "/v2/network/nodes");
  const data = response.data.nodes as BhpDbNode[];
  let nodes = data
    .filter(d => d.status)
    .map(d => ({ height: d.block_height, url: d.url } as RpcNode));

  if (internalSettings.httpsOnly) {
    nodes = filterHttpsOnly(nodes);
  }
  const goodNodes = findGoodNodesFromHeight(nodes);
  const bestRPC = await getBestUrl(goodNodes);
  return bestRPC;
}

/**
 * Get balances of BHP and GAS for an address
 * @param url - URL of a bhpDB service.
 * @param address - Address to check.
 * @return  Balance of address
 */
export async function getBalance(
  url: string,
  address: string
): Promise<wallet.Balance> {
  const response = await axios.get(url + "/v2/address/balance/" + address);
  const data = response.data as BhpDbBalance;
  const bal = new wallet.Balance({ net: url, address } as wallet.BalanceLike);
  if (data.BHP.balance > 0) {
    bal.addAsset("BHP", data.BHP);
  }
  if (data.GAS.balance > 0) {
    bal.addAsset("GAS", data.GAS);
  }
  log.info(`Retrieved Balance for ${address} from bhpDB ${url}`);
  return bal;
}

/**
 * Get amounts of available (spent) and unavailable claims.
 * @param url - URL of a bhpDB service.
 * @param address - Address to check.
 * @return An object with available and unavailable GAS amounts.
 */
export async function getClaims(
  url: string,
  address: string
): Promise<wallet.Claims> {
  const response = await axios.get(url + "/v2/address/claims/" + address);
  const data = response.data as BhpDbClaims;
  const claims = data.claims.map(c => {
    return {
      claim: new u.Fixed8(c.claim || 0).div(100000000),
      index: c.index,
      txid: c.txid,
      start: c.start || 0,
      end: c.end || 0,
      value: c.value
    };
  });
  log.info(`Retrieved Claims for ${address} from bhpDB ${url}`);
  return new wallet.Claims({
    net: url,
    address,
    claims
  } as wallet.ClaimsLike);
}

/**
 * Gets the maximum amount of gas claimable after spending all BHP.
 * @param url - URL of a bhpDB service.
 * @param address - Address to check.
 * @return An object with available and unavailable GAS amounts.
 */
export async function getMaxClaimAmount(
  url: string,
  address: string
): Promise<u.Fixed8> {
  const response = await axios.get(url + "/v2/address/claims/" + address);
  const data = response.data as BhpDbClaims;
  log.info(
    `Retrieved maximum amount of gas claimable after spending all BHP for ${address} from bhpDB ${url}`
  );
  return new u.Fixed8(data.total_claim + data.total_unspent_claim).div(
    100000000
  );
}

/**
 * Get transaction history for an account
 * @param url - URL of a bhpDB service.
 * @param address - Address to check.
 * @return a list of PastTransaction
 */
export async function getTransactionHistory(
  url: string,
  address: string
): Promise<PastTransaction[]> {
  const response = await axios.get(url + "/v2/address/history/" + address);
  const data = response.data as BhpDbHistory;
  log.info(`Retrieved History for ${address} from bhpDB ${url}`);
  return data.history.map(rawTx => {
    return {
      change: {
        BHP: new u.Fixed8(rawTx.BHP || 0),
        GAS: new u.Fixed8(rawTx.GAS || 0)
      },
      blockHeight: rawTx.block_index,
      txid: rawTx.txid
    };
  });
}

/**
 * Get the current height of the light wallet DB
 * @param url - URL of a bhpDB service.
 * @return Current height.
 */
export async function getHeight(url: string): Promise<number> {
  const response = await axios.get(url + "/v2/block/height");
  return parseInt(response.data.block_height, 10);
}
