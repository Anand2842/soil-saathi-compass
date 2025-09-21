// Production monitoring and logging utilities
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  stackTrace?: string;
}

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly sessionId: string;
  private logQueue: LogData[] = [];
  private readonly maxQueueSize = 100;
  private flushInterval?: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPeriodicFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPeriodicFlush() {
    // Flush logs every 30 seconds in production
    if (!this.isDevelopment) {
      this.flushInterval = window.setInterval(() => {
        this.flush();
      }, 30000);
    }
  }

  private getCurrentUserId(): string | null {
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
  }

  private formatLogData(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogData {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
      },
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      stackTrace: error?.stack,
    };
  }

  private addToQueue(logData: LogData) {
    this.logQueue.push(logData);
    
    // Prevent queue from growing too large
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue = this.logQueue.slice(-this.maxQueueSize);
    }
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>) {
    const logData = this.formatLogData(LOG_LEVELS.ERROR, message, context, metadata, error);
    
    if (this.isDevelopment) {
      console.error(`[${logData.timestamp}] ERROR:`, message, { error, metadata });
    }
    
    this.addToQueue(logData);
    
    // Flush immediately for errors
    this.flush();
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    const logData = this.formatLogData(LOG_LEVELS.WARN, message, context, metadata);
    
    if (this.isDevelopment) {
      console.warn(`[${logData.timestamp}] WARN:`, message, { metadata });
    }
    
    this.addToQueue(logData);
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    const logData = this.formatLogData(LOG_LEVELS.INFO, message, context, metadata);
    
    if (this.isDevelopment) {
      console.log(`[${logData.timestamp}] INFO:`, message, { metadata });
    }
    
    this.addToQueue(logData);
  }

  debug(message: string, context?: string, metadata?: Record<string, any>) {
    const logData = this.formatLogData(LOG_LEVELS.DEBUG, message, context, metadata);
    
    if (this.isDevelopment) {
      console.debug(`[${logData.timestamp}] DEBUG:`, message, { metadata });
    }
    
    this.addToQueue(logData);
  }

  private async flush() {
    if (this.logQueue.length === 0) return;

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      // In development, just store locally
      if (this.isDevelopment) {
        const existingLogs = localStorage.getItem('soil_saathi_logs');
        const logs = existingLogs ? JSON.parse(existingLogs) : [];
        logs.push(...logsToSend);
        localStorage.setItem('soil_saathi_logs', JSON.stringify(logs.slice(-500)));
        return;
      }

      // In production, send to your logging service
      // Replace this with your actual logging endpoint
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logsToSend),
      });
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add logs to queue for retry
      this.logQueue.unshift(...logsToSend);
    }
  }

  // Manual flush for critical logs
  async flushNow() {
    await this.flush();
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush(); // Final flush
  }
}

// Performance monitoring
class PerformanceMonitor {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    return asyncFn()
      .then((result) => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration, 'success');
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration, 'error');
        throw error;
      });
  }

  measure<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'success');
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'error');
      throw error;
    }
  }

  private recordMetric(name: string, duration: number, status: 'success' | 'error') {
    const metric = {
      name,
      duration,
      status,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    if (this.isDevelopment) {
      console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms (${status})`);
    }

    // Store metrics for analysis
    try {
      const existingMetrics = localStorage.getItem('soil_saathi_metrics');
      const metrics = existingMetrics ? JSON.parse(existingMetrics) : [];
      metrics.push(metric);
      localStorage.setItem('soil_saathi_metrics', JSON.stringify(metrics.slice(-200)));
    } catch (error) {
      console.error('Failed to store metric:', error);
    }

    // Send to analytics service in production
    if (!this.isDevelopment) {
      // Replace with your analytics endpoint
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(() => {
        // Ignore analytics failures
      });
    }
  }

  getStoredMetrics(): any[] {
    try {
      const metrics = localStorage.getItem('soil_saathi_metrics');
      return metrics ? JSON.parse(metrics) : [];
    } catch {
      return [];
    }
  }
}

// Create singleton instances
export const logger = new Logger();
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const captureUserAction = (action: string, metadata?: Record<string, any>) => {
  logger.info(`User action: ${action}`, 'user_interaction', metadata);
};

export const captureAPICall = (endpoint: string, method: string, duration: number, status: number) => {
  const metadata = {
    endpoint,
    method,
    duration,
    status,
  };
  
  if (status >= 400) {
    logger.error(`API ${method} ${endpoint}`, undefined, 'api_call', metadata);
  } else if (status >= 300) {
    logger.warn(`API ${method} ${endpoint}`, 'api_call', metadata);
  } else {
    logger.info(`API ${method} ${endpoint}`, 'api_call', metadata);
  }
};

export const captureComponentError = (componentName: string, error: Error, props?: any) => {
  logger.error(`Component error in ${componentName}`, error, 'component_error', {
    componentName,
    props: props ? JSON.stringify(props) : undefined,
  });
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  logger.destroy();
});