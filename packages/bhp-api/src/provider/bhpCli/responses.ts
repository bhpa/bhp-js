import { rpc } from "../../../../bhp-core/lib";

export interface BhpCliGetUnspentsResponse extends rpc.RPCResponse {
  result: {
    balance: BhpCliBalance[];
    address: string;
  };
}

export interface BhpCliBalance {
  unspent: BhpCliTx[];
  asset_hash: string;
  asset: string;
  asset_symbol: string;
  amount: number;
}
export interface BhpCliTx {
  txid: string;
  value: number;
  n: number;
}

export interface BhpCliGetUnclaimedResponse extends rpc.RPCResponse {
  result: {
    available: number;
    unavailable: number;
    unclaimed: number;
  };
}

export interface BhpCliGetClaimableResponse extends rpc.RPCResponse {
  result: {
    address: string;
    claimable: BhpCliClaimable[];
    unclaimed: number;
  };
}

export interface BhpCliClaimable {
  end_height: number;
  generated: number;
  n: number;
  start_height: number;
  sys_fee: number;
  txid: string;
  unclaimed: number;
  value: number;
}
