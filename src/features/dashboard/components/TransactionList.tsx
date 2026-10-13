import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Home, ShoppingCart, Train, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import type { Transaction } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';

export interface TransactionListProps {
  transactions: Transaction[];
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'income':
      return <DollarSign className="w-4 h-4 text-emerald-600" />;
    case 'housing & rent':
      return <Home className="w-4 h-4 text-indigo-600" />;
    case 'food & groceries':
      return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
    case 'transport':
      return <Train className="w-4 h-4 text-rose-600" />;
    case 'shopping':
    default:
      return <ShoppingBag className="w-4 h-4 text-cyan-600" />;
  }
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  return (
    <Card hoverable>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </div>
        <Badge variant="outline" size="sm">
          {transactions.length} Activity
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const isCredit = tx.type === 'credit';
            return (
              <div key={tx.id} className="flex items-center justify-between py-3 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isCredit ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{tx.title}</p>
                    <p className="text-xs text-slate-500">{tx.category} • {formatDate(tx.date)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center text-sm font-semibold ${
                      isCredit ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                    )}
                    {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
