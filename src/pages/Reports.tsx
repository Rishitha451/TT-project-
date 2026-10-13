import React, { useState } from 'react';
import { useReports } from '../features/reports/hooks/useReports';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/ui/Badge';
import { toast } from '../stores/toast.store';
import { FileText, Download, Plus, Calendar, CheckCircle2, Clock } from 'lucide-react';
import type { FinancialReport } from '../types';

export default function Reports() {
  const { reports, isLoading, isError, error, refetch, generateReport, isGenerating } = useReports();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState<FinancialReport['type']>('spending');
  const [reportPeriod, setReportPeriod] = useState('October 2026');

  const handleDownload = (report: FinancialReport) => {
    if (report.status !== 'Ready') {
      toast.warning('Report Processing', 'This report is currently compiling data.');
      return;
    }

    const dummyContent = `AI Finance Advisor - Exported Report\nReport Name: ${report.name}\nPeriod: ${report.period}\nGenerated Date: ${report.date}\nStatus: Verified\n---\nSummary: Full ledger synchronization verified with all connected banking and investment feeds.`;
    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded', `${report.name} has been saved.`);
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateReport({ type: reportType, period: reportPeriod });
      setIsModalOpen(false);
    } catch {
      // Handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load financial reports"
        message={(error as Error)?.message || 'Something went wrong fetching report records.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Export standardized compliance, spending, and portfolio tax records.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Generate Report
        </Button>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <EmptyState
          title="No reports generated yet"
          message="Generate your first monthly cashflow summary or portfolio tax statement."
          actionText="Generate Report"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const isReady = report.status === 'Ready';
            return (
              <div
                key={report.id}
                className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-base leading-tight">
                          {report.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Period: {report.period}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isReady ? 'success' : 'warning'} size="sm">
                      {isReady ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Processing
                        </span>
                      )}
                    </Badge>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Generated on: {report.date}</span>
                    <span>{report.fileSize || 'Standard PDF / CSV'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    variant={isReady ? 'outline' : 'outline'}
                    size="sm"
                    disabled={!isReady}
                    onClick={() => handleDownload(report)}
                    leftIcon={<Download className="w-4 h-4" />}
                    className={!isReady ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {isReady ? 'Download Export' : 'Processing...'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate New Financial Report"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Report Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="spending">Monthly Spending & Cashflow Audit</option>
              <option value="portfolio">Investment & Portfolio Returns Review</option>
              <option value="tax">Annual Tax Ledger Summary</option>
              <option value="summary">Net Worth & Savings Progression</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reporting Period / Timeframe
            </label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="October 2026">Current Month (October 2026)</option>
              <option value="September 2026">Past Month (September 2026)</option>
              <option value="Q3 2026">Past Quarter (Q3 2026)</option>
              <option value="FY 2025-2026">Financial Year 2025-2026</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isGenerating}>
              {isGenerating ? 'Compiling Report...' : 'Generate Report'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
