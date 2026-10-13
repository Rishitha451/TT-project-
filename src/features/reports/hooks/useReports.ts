import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReports, generateReportApi } from '../api/reports.api';
import type { FinancialReport } from '../../../types';
import { toast } from '../../../stores/toast.store';

export const REPORTS_QUERY_KEY = ['reports', 'list'];

export const useReports = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: REPORTS_QUERY_KEY,
    queryFn: fetchReports,
    staleTime: 5 * 60 * 1000,
  });

  const generateMutation = useMutation({
    mutationFn: ({ type, period }: { type: FinancialReport['type']; period: string }) =>
      generateReportApi(type, period),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      toast.success('Report generated', `${newReport.name} is ready for export.`);
    },
    onError: (err: any) => {
      toast.error('Generation failed', err.message || 'Please try again.');
    },
  });

  return {
    ...query,
    reports: query.data || [],
    generateReport: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
};
