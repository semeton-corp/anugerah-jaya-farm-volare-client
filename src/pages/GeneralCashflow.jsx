import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import YearSelector from "../components/YearSelector";
import { getCashflowOverview } from "../services/cashflow";
import { useEffect } from "react";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatRupiah = (n = 0) =>
  "Rp " +
  Number(n)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const generateTicks = (min, max) => {
  const range = max - min;
  let step;

  if (range <= 10_000_000) {
    step = 2_000_000;
  } else if (range <= 100_000_000) {
    step = 20_000_000;
  } else {
    step = 50_000_000;
  }

  const ticks = [];
  for (let i = Math.floor(min / step) * step; i <= max + step; i += step) {
    ticks.push(i);
  }
  return ticks;
};

const SummaryCard = ({ title, value, yoy = null, isIncrease = null }) => {
  const isPos = isIncrease === true;
  const isNeg = isIncrease === false;

  const cardCls = `
    rounded-md p-4
    ${isPos ? "border-2 border-green-500 bg-green-100" : ""}
    ${isNeg ? "border-2 border-red-500 bg-red-100" : ""}
    ${isIncrease == null ? "border border-green-400 bg-green-50" : ""}
  `;

  const titleCls = `font-semibold mb-1 ${
    isPos ? "text-green-800" : isNeg ? "text-red-800" : "text-green-700"
  }`;

  const valueCls = `text-2xl font-bold ${
    isPos ? "text-green-900" : isNeg ? "text-red-900" : "text-sky-900"
  }`;

  const yoyText =
    yoy == null
      ? "—"
      : `${yoy > 0 ? "▲" : "▼"} ${Math.abs(yoy)}% dibanding tahun sebelumnya`;

  const yoyCls = `text-sm mt-2 ${
    isPos ? "text-[#00A651]" : isNeg ? "text-red-700" : "text-gray-500"
  }`;

  return (
    <div className={cardCls}>
      <div className={titleCls}>{title}</div>
      <div className={valueCls}>{formatRupiah(value)}</div>
      <div className={yoyCls}>{yoyText}</div>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-md">
    <div className="px-6 py-6">
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="px-2 pb-3 overflow-x-auto">{children}</div>
  </div>
);

export default function GeneralCashflow() {
  const [year, setYear] = useState(2025);
  const [cashflowSummary, setCashflowSummary] = useState([]);
  const [cashflowGraphs, setCashflowGraphs] = useState([]);
  const [eggSaleCashflowGraphs, setEggSaleCashflowGraphs] = useState([]);

  const currency = (v) => formatRupiah(Number(v));

  const CustomTooltip = ({ active, label, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-md border bg-white px-3 py-2 shadow">
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: p.stroke }}
            />
            <span className="capitalize">{p.name || p.dataKey}</span>
            <span className="ml-auto font-medium">{currency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const fetchOverviewData = async () => {
    try {
      const overviewResponse = await getCashflowOverview(year);
      console.log("overviewResponse: ", overviewResponse);
      if (overviewResponse.status == 200) {
        const overviewData = overviewResponse.data.data;
        setCashflowSummary(overviewData.cashflowSummary || []);
        setCashflowGraphs(overviewData.cashflowGraphs || []);
        setEggSaleCashflowGraphs(overviewData.eggSaleCashflowGraphs || []);
      }
    } catch (error) {
      console.log("error :", error);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [year]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">General Cashflow</h1>
        <YearSelector year={year} setYear={setYear} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <SummaryCard
          title="Keuntungan"
          value={cashflowSummary?.profit}
          yoy={cashflowSummary?.profitDiffPercentage}
          isIncrease={cashflowSummary?.isProfitIncrease}
        />
        <SummaryCard
          title="Pendapatan"
          value={cashflowSummary?.income}
          yoy={cashflowSummary?.incomeDiffPercentage}
          isIncrease={cashflowSummary?.isIncomeIncrease}
        />
        <SummaryCard
          title="Pengeluaran"
          value={cashflowSummary?.expense}
          yoy={cashflowSummary?.expenseDiffPercentage}
          isIncrease={cashflowSummary?.isExpenseIncrease}
        />
        <SummaryCard
          title="Kas"
          value={cashflowSummary?.cash}
          yoy={cashflowSummary?.cashDiffPercentage}
          isIncrease={cashflowSummary?.isCashIncrease}
        />
        <SummaryCard
          title="Piutang"
          value={cashflowSummary?.receivables}
          yoy={cashflowSummary?.receivablesDiffPercentage}
          isIncrease={cashflowSummary?.isReceivablesIncrease}
        />
        <SummaryCard
          title="Hutang"
          value={cashflowSummary?.debt}
          yoy={cashflowSummary?.debtDiffPercentage}
          isIncrease={cashflowSummary?.isDebtIncrease}
        />
      </div>

      <ChartCard title="Grafik Pendapatan - Pengeluaran">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={cashflowGraphs}
            margin={{ top: 12, right: 24, bottom: 8, left: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="Key" tickMargin={8} />
            <YAxis
              width={70}
              ticks={generateTicks(
                Math.min(
                  ...cashflowGraphs.map((d) =>
                    Math.min(d.income, d.expense, d.profit)
                  )
                ),
                Math.max(
                  ...cashflowGraphs.map((d) =>
                    Math.max(d.income, d.expense, d.profit)
                  )
                )
              )}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${parseInt(value / 1000000)} juta`}
              padding={{ top: 20, bottom: 25 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={28} iconType="circle" />

            <Line
              type="monotone"
              name="pendapatan"
              dataKey="income"
              stroke="#3b82f6"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{ r: 3, strokeWidth: 1, stroke: "#3b82f6", fill: "#fff" }}
              activeDot={{ r: 6 }}
              connectNulls
              animationDuration={600}
            />
            <Line
              type="monotone"
              name="keuntungan"
              dataKey="profit"
              stroke="#22c55e"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{ r: 3, strokeWidth: 1, stroke: "#22c55e", fill: "#fff" }}
              activeDot={{ r: 6 }}
              connectNulls
              animationDuration={600}
            />
            <Line
              type="monotone"
              name="pengeluaran"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{ r: 3, strokeWidth: 1, stroke: "#ef4444", fill: "#fff" }}
              activeDot={{ r: 6 }}
              connectNulls
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Grafik Penjualan Telur">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={eggSaleCashflowGraphs}
            margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="key" tickMargin={8} />
            <YAxis
              width={80}
              tickFormatter={(value) => `${parseInt(value / 1000000)} juta`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={28} iconType="circle" />

            <Line
              type="monotone"
              name="Penjualan Gudang"
              dataKey="warehouseEggSale"
              stroke="#3b82f6"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{ r: 3, strokeWidth: 1, stroke: "#3b82f6", fill: "#fff" }}
              activeDot={{ r: 6 }}
              connectNulls
              animationDuration={600}
            />
            <Line
              type="monotone"
              name="Toko"
              dataKey="storeEggSale"
              stroke="#22c55e"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{ r: 3, strokeWidth: 1, stroke: "#22c55e", fill: "#fff" }}
              activeDot={{ r: 6 }}
              connectNulls
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Kas - Net Profit">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={cashflowGraphs}
            margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="Key" tickMargin={8} />
            <YAxis
              width={80}
              tickFormatter={(value) => `${parseInt(value / 1000000)} juta`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={28} iconType="circle" />

            <Line
              type="monotone"
              name="Kas"
              dataKey="cash"
              stroke="#3b82f6"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{ r: 3, strokeWidth: 1, stroke: "#3b82f6", fill: "#fff" }}
              activeDot={{ r: 6 }}
              connectNulls
              animationDuration={600}
            />
            <Line
              type="monotone"
              name="Keuntungan"
              dataKey="profit"
              stroke="#22c55e"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{ r: 3, strokeWidth: 1, stroke: "#22c55e", fill: "#fff" }}
              activeDot={{ r: 6 }}
              connectNulls
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
