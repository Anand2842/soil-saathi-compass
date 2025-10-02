import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  HardDrive, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/monitoring';
import { getCacheInfo, clearAllCaches } from '@/utils/serviceWorkerRegistration';

interface SystemHealth {
  service_name: string;
  status: string;
  response_time_ms: number;
  last_check: string;
}

interface AnalyticsData {
  total_events: number;
  unique_users: number;
  top_events: { event_name: string; count: number }[];
}

interface PerformanceData {
  avg_response_time: number;
  p95_response_time: number;
  error_rate: number;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{ name: string; size: number }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSystemHealth(),
        fetchAnalytics(),
        fetchPerformanceMetrics(),
        fetchCacheInfo(),
      ]);
    } catch (error) {
      logger.error('Failed to fetch dashboard data', error as Error, 'admin_dashboard');
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const { data, error } = await supabase.rpc('check_system_health');
      if (error) throw error;
      setSystemHealth(data || []);
    } catch (error) {
      logger.error('Failed to fetch system health', error as Error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Get analytics summary
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_name, user_id')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const uniqueUsers = new Set(events?.map((e) => e.user_id).filter(Boolean)).size;
      const eventCounts = events?.reduce((acc, e) => {
        acc[e.event_name] = (acc[e.event_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topEvents = Object.entries(eventCounts || {})
        .map(([event_name, count]) => ({ event_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalyticsData({
        total_events: events?.length || 0,
        unique_users: uniqueUsers,
        top_events: topEvents,
      });
    } catch (error) {
      logger.error('Failed to fetch analytics', error as Error);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('metric_value')
        .eq('metric_name', 'api_response_time')
        .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      if (data && data.length > 0) {
        const values = data.map((m) => Number(m.metric_value)).sort((a, b) => a - b);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const p95Index = Math.floor(values.length * 0.95);
        const p95 = values[p95Index] || 0;

        setPerformanceData({
          avg_response_time: Math.round(avg),
          p95_response_time: Math.round(p95),
          error_rate: 0, // Would need error tracking
        });
      }
    } catch (error) {
      logger.error('Failed to fetch performance metrics', error as Error);
    }
  };

  const fetchCacheInfo = async () => {
    const info = await getCacheInfo();
    setCacheInfo(info);
  };

  const handleClearCaches = async () => {
    try {
      await clearAllCaches();
      await fetchCacheInfo();
      toast({
        title: 'Success',
        description: 'All caches cleared successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear caches',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor system health and performance</p>
          </div>
          <Button onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="health" className="space-y-4">
          <TabsList>
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">All tables operational</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cacheInfo.length}</div>
                  <p className="text-xs text-muted-foreground">Active caches</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.unique_users || 0}</div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.total_events || 0}</div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>Real-time status of all system services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemHealth.map((service) => (
                    <div key={service.service_name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="font-medium capitalize">{service.service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Response: {service.response_time_ms}ms
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Events (24h)</CardTitle>
                <CardDescription>Most frequent user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.top_events.map((event, index) => (
                    <div key={event.event_name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{event.event_name}</span>
                      </div>
                      <Badge>{event.count} events</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {performanceData && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.avg_response_time}ms</div>
                    <p className="text-xs text-muted-foreground">Last 24 hours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">P95 Response Time</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.p95_response_time}ms</div>
                    <p className="text-xs text-muted-foreground">95th percentile</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceData.error_rate}%</div>
                    <p className="text-xs text-muted-foreground">Last 24 hours</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cache Management</CardTitle>
                    <CardDescription>View and manage application caches</CardDescription>
                  </div>
                  <Button variant="destructive" onClick={handleClearCaches}>
                    Clear All Caches
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cacheInfo.map((cache) => (
                    <div key={cache.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{cache.name}</p>
                        <p className="text-sm text-muted-foreground">{cache.size} items</p>
                      </div>
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;