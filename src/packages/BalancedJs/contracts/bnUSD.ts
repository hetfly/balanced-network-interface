import { IconAmount } from 'icon-sdk-js';

import { ResponseJsonRPCPayload } from '..';
import addresses from '../addresses';
import ContractSettings from '../contractSettings';
import { Contract } from './contract';

export default class bnUSD extends Contract {
  constructor(contractSettings: ContractSettings) {
    super(contractSettings);
    this.address = addresses[this.nid].bnUSD;
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

  async dexDeposit(value: number): Promise<ResponseJsonRPCPayload> {
    const data = '0x' + Buffer.from('{"method": "_deposit"}', 'utf8').toString('hex');
    const valueHex = '0x' + IconAmount.of(value, IconAmount.Unit.ICX).toLoop().toString(16);
    const params = { _to: addresses[this.nid].dex, _value: valueHex, _data: data };
    const payload = this.transactionParamsBuilder({
      method: 'transfer',
      value: 0,
      params,
    });
    return this.callIconex(payload);
  }

  async swapBysICX(value: number, slippage: string): Promise<ResponseJsonRPCPayload> {
    const data =
      '0x' +
      Buffer.from(
        '{"method": "_swap", "params": {"toToken":"' + addresses[this.nid].sicx + '", "maxSlippage":' + slippage + '}}',
        'utf8',
      ).toString('hex');
    const valueHex = '0x' + IconAmount.of(value, IconAmount.Unit.ICX).toLoop().toString(16);
    const params = { _to: addresses[this.nid].dex, _value: valueHex, _data: data };

    const payload = this.transactionParamsBuilder({
      method: 'transfer',
      value: 0,
      params,
    });
    return this.callIconex(payload);
  }

  totalSupply() {
    const callParams = this.paramsBuilder({
      method: 'totalSupply',
    });

    return this.call(callParams);
  }
}
