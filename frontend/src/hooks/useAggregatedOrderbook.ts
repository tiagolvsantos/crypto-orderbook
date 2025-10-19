import { useMemo } from 'react';
import type { OrderbookData, OrderbookLevel } from '@/types';

export function useAggregatedOrderbook(orderbooks: OrderbookData) {
  return useMemo(() => {
    const priceMap = new Map<string, { bidQty: number; askQty: number }>();

    Object.values(orderbooks).forEach(({ bids, asks }) => {
      bids.forEach((bid) => {
        const price = bid.price;
        const quantity = parseFloat(bid.quantity);
        const existing = priceMap.get(price) || { bidQty: 0, askQty: 0 };
        priceMap.set(price, { ...existing, bidQty: existing.bidQty + quantity });
      });

      asks.forEach((ask) => {
        const price = ask.price;
        const quantity = parseFloat(ask.quantity);
        const existing = priceMap.get(price) || { bidQty: 0, askQty: 0 };
        priceMap.set(price, { ...existing, askQty: existing.askQty + quantity });
      });
    });

    const nettedBids: [string, number][] = [];
    const nettedAsks: [string, number][] = [];

    priceMap.forEach((value, price) => {
      const net = value.bidQty - value.askQty;
      if (net > 0) {
        nettedBids.push([price, net]);
      } else if (net < 0) {
        nettedAsks.push([price, Math.abs(net)]);
      }
    });

    const sortedBids = nettedBids.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
    const sortedAsks = nettedAsks.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

    let bidCumulative = 0;
    const bids: OrderbookLevel[] = sortedBids.map(([price, quantity]) => {
      bidCumulative += quantity;
      return {
        price,
        quantity: quantity.toString(),
        cumulative: bidCumulative.toString(),
      };
    });

    let askCumulative = 0;
    const asks: OrderbookLevel[] = sortedAsks.map(([price, quantity]) => {
      askCumulative += quantity;
      return {
        price,
        quantity: quantity.toString(),
        cumulative: askCumulative.toString(),
      };
    });

    const bestBid = bids.length > 0 ? parseFloat(bids[0].price) : 0;
    const bestAsk = asks.length > 0 ? parseFloat(asks[0].price) : 0;
    const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0;
    const spread = bestBid && bestAsk ? bestAsk - bestBid : 0;

    // Calculate liquidity at different depth percentages
    const calculateLiquidity = (levels: OrderbookLevel[], referencePrice: number, percentage: number, isBid: boolean) => {
      const threshold = isBid
        ? referencePrice * (1 - percentage / 100)
        : referencePrice * (1 + percentage / 100);

      let liquidity = 0;
      for (const level of levels) {
        const price = parseFloat(level.price);
        if (isBid ? price >= threshold : price <= threshold) {
          liquidity += parseFloat(level.quantity);
        } else {
          break;
        }
      }
      return liquidity;
    };

    const bidLiquidity05Pct = calculateLiquidity(bids, midPrice, 0.5, true);
    const askLiquidity05Pct = calculateLiquidity(asks, midPrice, 0.5, false);
    const bidLiquidity2Pct = calculateLiquidity(bids, midPrice, 2, true);
    const askLiquidity2Pct = calculateLiquidity(asks, midPrice, 2, false);
    const bidLiquidity10Pct = calculateLiquidity(bids, midPrice, 10, true);
    const askLiquidity10Pct = calculateLiquidity(asks, midPrice, 10, false);

    return {
      bids,
      asks,
      stats: {
        bestBid: bestBid.toString(),
        bestAsk: bestAsk.toString(),
        midPrice: midPrice.toString(),
        spread: spread.toString(),
        bidLiquidity05Pct: bidLiquidity05Pct.toString(),
        askLiquidity05Pct: askLiquidity05Pct.toString(),
        deltaLiquidity05Pct: (bidLiquidity05Pct - askLiquidity05Pct).toString(),
        bidLiquidity2Pct: bidLiquidity2Pct.toString(),
        askLiquidity2Pct: askLiquidity2Pct.toString(),
        deltaLiquidity2Pct: (bidLiquidity2Pct - askLiquidity2Pct).toString(),
        bidLiquidity10Pct: bidLiquidity10Pct.toString(),
        askLiquidity10Pct: askLiquidity10Pct.toString(),
        deltaLiquidity10Pct: (bidLiquidity10Pct - askLiquidity10Pct).toString(),
        totalBidsQty: bidCumulative.toString(),
        totalAsksQty: askCumulative.toString(),
        totalDelta: (bidCumulative - askCumulative).toString(),
      },
    };
  }, [orderbooks]);
}
