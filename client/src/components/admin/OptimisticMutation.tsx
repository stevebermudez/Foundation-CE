import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { UseMutationOptions, UseMutationResult, QueryKey } from "@tanstack/react-query";

interface OptimisticMutationOptions<TData, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;
  queryKey: QueryKey;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: boolean;
}

/**
 * Hook for optimistic mutations with automatic cache updates
 */
export function useOptimisticMutation<TData, TVariables, TContext = unknown>(
  options: OptimisticMutationOptions<TData, TVariables, TContext>
): UseMutationResult<TData, Error, TVariables, TContext> {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    mutationFn,
    onMutate,
    onSuccess,
    onError,
    queryKey,
    successMessage,
    errorMessage,
    invalidateQueries = true,
  } = options;

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update cache
      if (onMutate) {
        const context = await onMutate(variables);
        return context as TContext;
      }

      return previousData as TContext;
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(queryKey, context);
      }

      toast({
        title: "Error",
        description: errorMessage || error.message || "An error occurred",
        variant: "destructive",
      });

      if (onError) {
        onError(error, variables, context);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey });
      }

      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  });
}


