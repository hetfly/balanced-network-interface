import BigNumber from 'bignumber.js';
import { IconConverter } from 'icon-sdk-js';

import addresses from '../addresses';
import { Contract } from './contract';

export default class IRC2 extends Contract {
  name() {
    const callParams = this.paramsBuilder({
      method: 'name',
    });

    return this.call(callParams);
  }

  symbol() {
    const callParams = this.paramsBuilder({
      method: 'symbol',
    });

    return this.call(callParams);
  }

  decimals() {
    const callParams = this.paramsBuilder({
      method: 'decimals',
    });

    return this.call(callParams);
  }

  balanceOf(owner: string) {
    const callParams = this.paramsBuilder({
      method: 'balanceOf',
      params: {
        _owner: owner,
      },
    });

    return this.call(callParams);
  }

  deposit(value: string) {
    return this.transfer(addresses[this.nid].dex, value, JSON.stringify({ method: '_deposit' }));
  }

  totalSupply() {
    const callParams = this.paramsBuilder({
      method: 'totalSupply',
    });

    return this.call(callParams);
  }

  swapUsingRoute(value: string, outputAddress: string, minimumReceive: BigNumber, path: (string | null)[]) {
    const data = {
      method: '_swap',
      params: {
        toToken: outputAddress,
        minimumReceive: minimumReceive.toFixed(),
        path: path,
      },
    };

    return this.transfer(addresses[this.nid].router, value, JSON.stringify(data));
  }

  transfer(to: string, value: string, data?: string) {
    const callParams = this.transactionParamsBuilder({
      method: 'transfer',
      params: {
        _to: to,
        _value: value,
        _data: data && IconConverter.toHex(data),
      },
    });

    return this.callICONPlugins(callParams);
  }
}
