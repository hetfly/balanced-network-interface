import axios from 'axios';
import { BalancedJs } from 'packages/BalancedJs';
import { useQuery } from 'react-query';

import { CHART_PERIODS } from 'app/components/TradingViewChart';
import { getTradePair, isQueue } from 'constants/currency';
import { ONE } from 'constants/index';
import QUERY_KEYS from 'queries/queryKeys';
import { Field } from 'store/swap/actions';
import { getTokenFromCurrencyKey } from 'types/adapter';
import { Currency } from 'types/balanced-sdk-core';

import { API_ENDPOINT } from '../constants';

const LAUNCH_DAY = 1619398800000000;

export const usePriceChartDataQuery = (currencies: { [field in Field]?: Currency }, period: CHART_PERIODS) => {
  return useQuery<{ time: number; open: number; close: number; high: number; low: number; volume: number }[]>(
    QUERY_KEYS.Swap.PriceChart(currencies, period),
    async () => {
      const [pair, inverse] = getTradePair(
        currencies[Field.INPUT]?.symbol as string,
        currencies[Field.OUTPUT]?.symbol as string,
      );
      if (pair && !isQueue(pair)) {
        const day = new Date().valueOf() * 1_000;
        const {
          data: result,
        }: {
          data: { time: number; open: number; close: number; high: number; low: number; volume: number }[];
        } = await axios.get(`${API_ENDPOINT}/dex/swap-chart/${pair?.id}/${period.toLowerCase()}/${LAUNCH_DAY}/${day}`);

        let data1;

        const quoteToken = getTokenFromCurrencyKey(pair.quoteCurrencyKey);
        const baseToken = getTokenFromCurrencyKey(pair.baseCurrencyKey);

        const decimal = (quoteToken?.decimals ?? 0) - (baseToken?.decimals ?? 0) + 18;
        if (!inverse) {
          data1 = result.map(item => ({
            time: item.time / 1_000_000,
            value: BalancedJs.utils.toFormat(item.close, decimal).toNumber(),
            open: BalancedJs.utils.toFormat(item.open, decimal).toNumber(),
            close: BalancedJs.utils.toFormat(item.close, decimal).toNumber(),
            high: BalancedJs.utils.toFormat(item.high, decimal).toNumber(),
            low: BalancedJs.utils.toFormat(item.low, decimal).toNumber(),
            volume: BalancedJs.utils.toIcx(item.volume).toNumber(),
          }));
        } else {
          data1 = result.map(item => ({
            time: item.time / 1_000_000,
            value: ONE.div(BalancedJs.utils.toFormat(item.close, decimal)).toNumber(),
            open: ONE.div(BalancedJs.utils.toFormat(item.open, decimal)).toNumber(),
            close: ONE.div(BalancedJs.utils.toFormat(item.close, decimal)).toNumber(),
            high: ONE.div(BalancedJs.utils.toFormat(item.high, decimal)).toNumber(),
            low: ONE.div(BalancedJs.utils.toFormat(item.low, decimal)).toNumber(),
            volume: BalancedJs.utils.toIcx(item.volume).toNumber(),
          }));
        }
        return data1;
      }

      return [];
    },
  );
};
