import { wallet } from "../../../../bhp-core/lib";

export interface BhpDbNode {
  block_height: number | null;
  status: boolean;
  time: number | null;
  url: string;
}

export interface BhpDbBalance {
  GAS: wallet.AssetBalanceLike;
  BHP: wallet.AssetBalanceLike;
  address: string;
  net: string;
}

export interface BhpDbClaims {
  address: string;
  net: string;
  total_claim: number;
  total_unspent_claim: number;
  claims: wallet.ClaimItemLike[];
}

export interface BhpDbHistory {
  address: string;
  history: {
    GAS: number;
    BHP: number;
    block_index: number;
    gas_sent: boolean;
    bhp_sent: boolean;
    txid: string;
  }[];
  name: string;
  net: string;
}
