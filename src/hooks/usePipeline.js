import { useQuery } from '@tanstack/react-query';
import { getPipeline } from '../api/pipeline.api';

export function usePipeline() {
  return useQuery({
    queryKey: ['pipeline'],
    queryFn: () => getPipeline().then((r) => r.data),
  });
}
