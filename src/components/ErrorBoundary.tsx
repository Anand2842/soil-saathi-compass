import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log error details for monitoring
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Full Error Data:', errorData);
      console.groupEnd();
    }

    // Send to monitoring service (in production, you'd send to your logging service)
    this.logErrorToService(errorData);

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  private getCurrentUserId = (): string | null => {
    // Try to get user ID from various sources
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id || null;
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  };

  private logErrorToService = async (errorData: any) => {
    try {
      // In production, you would send this to your monitoring service
      // For now, we'll just store it locally for development purposes
      const existingErrors = localStorage.getItem('soil_saathi_errors');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];
      errors.push(errorData);
      
      // Keep only the last 50 errors to prevent storage bloat
      const trimmedErrors = errors.slice(-50);
      localStorage.setItem('soil_saathi_errors', JSON.stringify(trimmedErrors));

      // In production, replace this with actual service call:
      // await fetch('/api/errors', { 
      //   method: 'POST', 
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData) 
      // });
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  };

  private handleRetry = () => {
    this.retryCount++;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error, errorId } = this.state;
      
      if (fallback) {
        return fallback;
      }

      const canRetry = this.retryCount < this.maxRetries;
      const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network');
      const isChunkError = error?.message?.includes('Loading chunk') || error?.message?.includes('Loading CSS chunk');

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-destructive/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                {isChunkError ? 'App Update Available' : 'Something Went Wrong'}
              </CardTitle>
              <CardDescription>
                {isChunkError 
                  ? 'A new version of Soil Saathi is available. Please refresh to get the latest features.'
                  : isNetworkError
                    ? 'It looks like there\'s a connectivity issue. Please check your internet connection.'
                    : 'An unexpected error occurred in the application.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Error Details:</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {error?.message || 'Unknown error occurred'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {errorId}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {canRetry && !isChunkError && (
                  <Button 
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReload}
                  variant={isChunkError ? "default" : "outline"}
                  className="flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    Developer Details
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {error?.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
