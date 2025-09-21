import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ErrorState {
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
}

interface UseErrorHandlerOptions {
  retryCount?: number;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { retryCount = 3, onError, showToast = true } = options;
  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    isLoading: false,
  });
  const [retryAttempts, setRetryAttempts] = useState(0);

  const logError = useCallback((error: Error, context?: string) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorData);
    }

    // In production, send to monitoring service
    try {
      const existingErrors = localStorage.getItem('soil_saathi_errors');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];
      errors.push(errorData);
      localStorage.setItem('soil_saathi_errors', JSON.stringify(errors.slice(-50)));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }, []);

  const handleError = useCallback((error: Error, context?: string) => {
    logError(error, context);
    
    setErrorState({
      error,
      isError: true,
      isLoading: false,
    });

    // Call custom error handler
    if (onError) {
      onError(error);
    }

    // Show toast notification
    if (showToast) {
      const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
      const isTimeoutError = error.message.includes('timeout');
      
      let title = 'Error';
      let description = error.message;
      
      if (isNetworkError) {
        title = 'Network Error';
        description = 'Please check your internet connection and try again.';
      } else if (isTimeoutError) {
        title = 'Timeout Error';
        description = 'The request took too long. Please try again.';
      }
      
      toast({
        title,
        description,
        variant: 'destructive',
      });
    }
  }, [logError, onError, showToast, toast]);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    context?: string,
    maxRetries = retryCount
  ): Promise<T | null> => {
    setErrorState({ error: null, isError: false, isLoading: true });
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await asyncFunction();
        setErrorState({ error: null, isError: false, isLoading: false });
        setRetryAttempts(0);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          handleError(err, context);
          setRetryAttempts(attempt + 1);
          return null;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return null;
  }, [handleError, retryCount]);

  const retry = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    if (retryAttempts < retryCount) {
      return executeWithErrorHandling(asyncFunction, context, retryCount - retryAttempts);
    }
    return null;
  }, [executeWithErrorHandling, retryAttempts, retryCount]);

  const clearError = useCallback(() => {
    setErrorState({ error: null, isError: false, isLoading: false });
    setRetryAttempts(0);
  }, []);

  const isRetryAvailable = retryAttempts < retryCount;

  return {
    ...errorState,
    executeWithErrorHandling,
    handleError,
    clearError,
    retry,
    retryAttempts,
    isRetryAvailable,
  };
};