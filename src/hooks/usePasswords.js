import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { passwordService } from '../services/passwordService';
import { toast } from 'react-toastify';

export const usePasswords = () => {
  const queryClient = useQueryClient();

  // Query for all passwords
  const {
    data: passwordsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['passwords'],
    queryFn: passwordService.getPasswords,
    enabled: true,
  });

  // Query for single password
  const usePassword = (id) => {
    return useQuery({
      queryKey: ['password', id],
      queryFn: () => passwordService.getPassword(id),
      enabled: !!id,
    });
  };

  // Search passwords
  const useSearchPasswords = (query) => {
    return useQuery({
      queryKey: ['passwords', 'search', query],
      queryFn: () => passwordService.searchPasswords(query),
      enabled: !!query && query.length > 0,
    });
  };

  // Create password mutation
  const createMutation = useMutation({
    mutationFn: passwordService.createPassword,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create password');
    },
  });

  // Update password mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => passwordService.updatePassword(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      if (response.password?._id) {
        queryClient.invalidateQueries({ queryKey: ['password', response.password._id] });
      }
      toast.success(response.message || 'Password updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update password');
    },
  });

  // Delete password mutation
  const deleteMutation = useMutation({
    mutationFn: passwordService.deletePassword,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete password');
    },
  });

  return {
    passwords: passwordsData?.passwords || [],
    isLoading,
    error,
    refetch,
    createPassword: createMutation.mutate,
    updatePassword: updateMutation.mutateAsync, // Use mutateAsync to return a promise
    deletePassword: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    usePassword,
    useSearchPasswords,
  };
};
