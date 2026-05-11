export interface FinanceIndex {
  symbol: string;
  name: string;
  display: string;
  price: number | null;
  change: number | null;
  sparkline: number[];
  currency: string;
}

export interface FinanceCommodity {
  symbol: string;
  name: string;
  display: string;
  price: number | null;
  change: number | null;
  sparkline: number[];
  currency: string;
}

export interface FinanceCrypto {
  symbol: string;
  name: string;
  display: string;
  price: number | null;
  change24h: number | null;
}

export interface FinanceForex {
  symbol: string;
  name: string;
  display: string;
  price: number | null;
  change: number | null;
  sparkline: number[];
  currency: string;
}

export interface CompositeSignal {
  name: string;
  value: number; // -1 to +1
}

export interface FinanceComposite {
  score: number; // 0-100
  signals: CompositeSignal[];
}

export interface VixData {
  price: number | null;
  change: number | null;
  sparkline: number[];
}

export interface TreasuryYield {
  display: string;
  price: number | null;
  change: number | null;
}

export interface FinanceData {
  indices: FinanceIndex[];
  commodities: FinanceCommodity[];
  crypto: FinanceCrypto[];
  forex: FinanceForex[];
  vix?: VixData;
  treasuryYields?: TreasuryYield[];
  composite: FinanceComposite;
  timestamp: string;
}
