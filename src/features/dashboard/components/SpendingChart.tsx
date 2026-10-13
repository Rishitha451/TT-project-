import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import type { SpendingCategory } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

export interface SpendingChartProps {
  data: SpendingCategory[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as SpendingCategory;
    return (
      <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg border border-slate-800">
        <p className="font-semibold">{data.category}</p>
        <p className="mt-0.5 text-indigo-300 font-bold">{formatCurrency(data.amount)}</p>
      </div>
    );
  }
  return null;
};

export const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  return (
    <Card hoverable className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Monthly breakdown of your major expenses</CardDescription>
      </CardHeader>

      <CardContent className="mt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis
                dataKey="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 4 }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#4f46e5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
