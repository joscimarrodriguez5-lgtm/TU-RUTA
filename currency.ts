const HNL_TO_USD = 0.04065; // Approximate rate, update as needed

export function hnlToUsd(hnl: number): number {
  return parseFloat((hnl * HNL_TO_USD).toFixed(2));
}

export function formatHnl(amount: number): string {
  return `L ${amount.toFixed(2)}`;
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)} USD`;
}

export function formatPrice(hnl: number): { hnl: string; usd: string } {
  return {
    hnl: formatHnl(hnl),
    usd: formatUsd(hnlToUsd(hnl)),
  };
}
