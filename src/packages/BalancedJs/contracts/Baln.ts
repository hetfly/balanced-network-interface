import { IconAmount } from 'icon-sdk-js';

import { ResponseJsonRPCPayload } from '..';
import addresses from '../addresses';
import ContractSettings from '../contractSettings';
import { Contract } from './contract';

export default class Baln extends Contract {
  constructor(contractSettings: ContractSettings) {
    super(contractSettings);
    this.address = addresses[this.nid].baln;
  }

  balanceOf() {
    const callParams = this.paramsBuilder({
      method: 'balanceOf',
      params: {
        _owner: this.account,
      },
    });

    return this.call(callParams);
  }

  getLiquidityBALNSupply() {
    const callParams = this.paramsBuilder({
      method: 'balanceOf',
      params: {
        _owner: this.account,
        _id: this.address,
      },
    });

    return this.call(callParams);
  }

  async swapToBnUSD(value: number, slippage: string): Promise<ResponseJsonRPCPayload> {
    const data =
      '0x' +
      Buffer.from(
        '{"method": "_swap", "params": {"toToken":"' +
          addresses[this.nid].bnUSD +
          '", "maxSlippage":' +
          slippage +
          '}}',
        'utf8',
      ).toString('hex');
    const valueHex = '0x' + IconAmount.of(value, IconAmount.Unit.ICX).toLoop().toString(16);
    const params = { _to: addresses[this.nid].dex, _value: valueHex, _data: data };

    const payload = this.transactionParamsBuilder({
      method: 'transfer',
      value: 0,
      params,
    });
    console.log(payload);
    return this.callIconex(payload);
  }

  public async transfer(toAddress: string, value: number): Promise<any> {
    const callParams = this.transactionParamsBuilder({
      method: 'transfer',
      params: {
        _to: toAddress,
        _value: '0x' + IconAmount.of(value, IconAmount.Unit.ICX).toLoop().toString(16),
      },
      value: 0,
    });

    return this.callIconex(callParams);
  }

  async stakeBALN(value: number): Promise<ResponseJsonRPCPayload> {
    const valueHex = '0x' + IconAmount.of(value, IconAmount.Unit.ICX).toLoop().toString(16);
    const params = { _value: valueHex };
    const payload = this.transactionParamsBuilder({
      method: 'stake',
      value: 0,
      params,
    });
    console.log(payload);
    return this.callIconex(payload);
  }
}
