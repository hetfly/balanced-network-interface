import React, { useCallback, useMemo } from 'react';

import { useIconReact } from 'packages/icon-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { NotificationPending } from 'app/components/Notification/TransactionNotification';
import { getTrackerLink } from 'utils';

import { AppDispatch, AppState } from '../index';
import { addTransaction } from './actions';
import { TransactionDetails } from './reducer';

interface TransactionResponse {
  hash: string;
}

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponse,
  customData?: {
    summary?: string;
    pending?: string;
  },
) => void {
  const { networkId, account } = useIconReact();
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    (response: TransactionResponse, { summary, pending }: { summary?: string; pending?: string } = {}) => {
      if (!account) return;
      if (!networkId) return;

      const { hash } = response;
      if (!hash) {
        throw Error('No transaction hash found.');
      }

      //
      const link = getTrackerLink(networkId, hash, 'transaction');
      const toastProps = {
        onClick: () => window.open(link, '_blank'),
      };

      toast(<NotificationPending summary={pending || 'Your transaction has been sent to the network'} />, {
        ...toastProps,
        toastId: hash,
      });

      dispatch(addTransaction({ hash, from: account, networkId, summary }));
    },
    [dispatch, networkId, account],
  );
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const { networkId } = useIconReact();

  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions);

  return networkId ? state[networkId] ?? {} : {};
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions();

  if (!transactionHash || !transactions[transactionHash]) return false;

  return !transactions[transactionHash].receipt;
}

export enum TransactionStatus {
  'pending' = 'pending',
  'success' = 'success',
  'failure' = 'failure',
}

export function useTransactionStatus(transactionHash?: string): TransactionStatus {
  const transactions = useAllTransactions();

  if (!transactionHash || !transactions[transactionHash]) return TransactionStatus.pending;

  if (transactions[transactionHash].receipt) {
    if (transactions[transactionHash].receipt?.status) return TransactionStatus.success;
    else return TransactionStatus.failure;
  } else {
    return TransactionStatus.pending;
  }
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000;
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions();
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some(hash => {
        const tx = allTransactions[hash];
        if (!tx) return false;
        if (tx.receipt) {
          return false;
        } else {
          const approval = tx.approval;
          if (!approval) return false;
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx);
        }
      }),
    [allTransactions, spender, tokenAddress],
  );
}

// watch for submissions to claim
// return null if not done loading, return undefined if not found
export function useUserHasSubmittedClaim(
  account?: string,
): { claimSubmitted: boolean; claimTxn: TransactionDetails | undefined } {
  const allTransactions = useAllTransactions();

  // get the txn if it has been submitted
  const claimTxn = useMemo(() => {
    const txnIndex = Object.keys(allTransactions).find(hash => {
      const tx = allTransactions[hash];
      return tx.claim && tx.claim.recipient === account;
    });
    return txnIndex && allTransactions[txnIndex] ? allTransactions[txnIndex] : undefined;
  }, [account, allTransactions]);

  return { claimSubmitted: Boolean(claimTxn), claimTxn };
}
