import { useQuery } from '@tanstack/react-query';
import { getDashboardResumen } from '../api/dashboard.api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardResumen().then((r) => r.data),
    staleTime: 30_000,
  });
}
