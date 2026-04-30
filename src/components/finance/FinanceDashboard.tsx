"use client";

import useSWR from "swr";
import type { FinanceData } from "@/types/finance";
import FinanceTicker from "./FinanceTicker";
import IndexGrid from "./IndexGrid";
import CommodityPanel from "./CommodityPanel";
import CryptoPanel from "./CryptoPanel";
import ForexPanel from "./ForexPanel";
import MarketComposite from "./MarketComposite";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export default function FinanceDashboard() {
  const { data, isLoading } = useSWR<FinanceData>("/api/finance/", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  return (
    <div className="h-full overflow-y-auto pb-16 lg:pb-0">
      <FinanceTicker data={data} />

      <div className="p-2 space-y-2 max-w-7xl mx-auto">
        <MarketComposite composite={data?.composite} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <IndexGrid indices={data?.indices ?? []} />
          <CommodityPanel commodities={data?.commodities ?? []} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <CryptoPanel crypto={data?.crypto ?? []} />
          <ForexPanel forex={data?.forex ?? []} />
        </div>

        {isLoading && !data && (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
            <div className="text-[10px] text-gray-400 font-mono mt-2">Loading finance data…</div>
          </div>
        )}

        {data?.timestamp && (
          <div className="text-[9px] text-gray-500 font-mono text-center py-1">
            Last update: {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
