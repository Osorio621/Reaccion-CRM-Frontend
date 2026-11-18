import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/config.api';

export function useLogoConfig() {
  return useQuery({
    queryKey: ['logoConfig'],
    queryFn: () => api.getLogoConfig(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateLogoConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateLogoConfig,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logoConfig'] });
    },
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.uploadLogo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logoConfig'] });
    },
  });
}