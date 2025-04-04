// arr should be sorted from large to small
export function insertList(arr, newItem, prop, maxLen = Number.MAX_VALUE) {
  let i = 0;
  for (; i < arr.length; i++) {
    const item = arr[i];
    if (item[prop] < newItem[prop]) {
      arr.splice(i, 0, newItem);

      break;
    }
    // already in list
    if (item[prop] === newItem[prop]) {
      return arr.slice(0, maxLen);
    }
  }

  if (i === arr.length && i < maxLen) {
    arr.push(newItem);
  }

  return arr.slice(0, maxLen);
}


export function atos(amount, decimals, showDecimals = 8) {
  // If amount is undefined, return '0.00'
  if (typeof amount === 'undefined') {
    return '0';
  }

  // Handle null, zero, or invalid decimals cases
  if (!amount || amount == 0 || !decimals || decimals === 0) {
    return amount === 0 ? '0' : `${amount}`; // Return '0' for zero, otherwise stringified value
  }
  // Convert amount to string and remove leading zeros
  if (amount.length > decimals) {
    return (withCommas(amount.slice(0, -decimals)) + "." + amount.slice(amount.length - decimals, amount.length).slice(0, showDecimals).replace(/0*$/, '')).replace(/\.*$/, '');
  } else {
    const b = "0".repeat(decimals - amount.length) + amount.slice(0, showDecimals - (decimals - amount.length)).replace(/0*$/, '');
    if (b.length != 0) {
      return "0." + b;
    } else {
      const ab = "0".repeat(decimals - amount.length) + amount.slice(0, (decimals - amount.length)).replace(/0*$/, '');
      return parseFloat(ab).toString();
    }
  }
}

export function withCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getSbpName(sbps, producer) {
  const sbp = sbps.find(sbp => sbp.blockProducingAddress === producer);
  if (sbp) {
    return sbp.sbpName;
  }
  return '';
}

const typeTextMap = {
  "RegisterSBP": "SBP Registration",
  "RegisterSBP_V1": "SBP Registration",
  "UpdateSBPBlockProducingAddress": "Update Registration",
  "UpdateSBPBlockProducingAddress_V1": "Update Registration",
  "RevokeSBP": "Revoke Registration",
  "RevokeSBP_V1": "Revoke Registration",
  "WithdrawSBPReward": "Claim Reward",
  "WithdrawSBPReward_V1": "Claim Reward",
  "VoteForSBP": "Vote",
  "VoteForSBP_V1": "Vote",
  "CancelSBPVoting": "Revoke Voting",
  "CancelSBPVoting_V1": "Revoke Voting",
  "StakeForQuota": "Stake for Quota",
  "StakeForQuota_V1": "Stake for Quota",
  "CancelQuotaStake": "Revoke Quota",
  "CancelQuotaStake_V1": "Revoke Quota",
  "CancelQuotaStake_V2": "Revoke Quota",
  "IssueToken": "Token Issuance",
  "IssueToken_V1": "Token Issuance",
  "ReIssueToken": "Additional Token Issuance",
  "ReIssueToken_V1": "Additional Token Issuance",
  "BurnToken": "Destroy Tokens",
  "BurnToken_V1": "Destroy Tokens",
  "TransferTokenOwnership": "Transfer of ownership",
  "TransferTokenOwnership_V1": "Transfer of ownership",
  "DisableReIssue": "Disable Token Re-Issue",
  "DisableReIssue_V1": "Disable Token Re-Issue",
  "DexDeposit": "DEX: Deposit",
  "DexDeposit_V1": "DEX: Deposit",
  "DexWithdraw": "DEX: Withdraw Request",
  "DexWithdraw_V1": "DEX: Withdraw Request",
  "DexPlaceOrder": "DEX: Order",
  "DexPlaceOrder_V1": "DEX: Order",
  "DexCancelOrder": "DEX: Cancel Order",
  "DexCancelOrder_V1": "DEX: Cancel Orders",
  "DexStakeForSuperVIP": "DEX: SVIP",
  "DexStakeForSuperVIP_V1": "DEX: SVIP",
  "DexConfigMarketAgents": "Configure Delegations",
  "DexConfigMarketAgents_V1": "Configure Delegations",
  "DexOpenNewMarket": "DEX: Token Listing",
  "DexOpenNewMarket_V1": "DEX: Token Listing",
  "DexStakeForVIP": "DEX: VIP",
  "DexStakeForVIP_V1": "DEX: VIP",
  "DexStakeForMining": "DEX: Staking",
  "DexStakeForMining_V1": "DEX: Staking",
  "DexLockVxForDividend": "DEX: Lock VX for Dividend",
  "CreateContractRequest": "Create Contract",
  "TransferRequest": "Send Token",
  "ReIssueRequest": "Token Re-Issue",
  "Response": "Receive Token",
  "ResponseFail": "Failed",
  "RefundByContractRequest": "Refund",
  "GenesisResponse": "Genesis",
  "FullNodeStake": "Stake for Full Node",
  "FullNodeCancelStake": "Withdraw Full Node Stakes",
  "UpdateSBPRewardWithdrawAddress": "Edit SBP Reward Withdraw Address"
};

export function blockTypeText(blockType) {
  return typeTextMap[blockType] || blockType;
}

export function isReceive(blockType) {
  switch (blockType) {
    case 4:
    case 5:
    case 7:
      return true;
    default:
      return false;
  }
}
