import { useQuery } from '@tanstack/react-query';
import { podAPI, deploymentAPI, serviceAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Box, AlertCircle, Layers, Globe, Server } from 'lucide-react';
import type { APIResponse, Pod } from '@/types';

export function Dashboard() {
  const { data: podsData, isLoading: podsLoading, error: podsError } = useQuery<APIResponse<Pod[]>>({
    queryKey: ['pods'],
    queryFn: async () => {
      const response = await podAPI.list();
      return response.data;
    },
    refetchInterval: 5000,
  });

  const { data: deploymentsData, isLoading: deploymentsLoading } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => deploymentAPI.list(),
    refetchInterval: 5000,
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceAPI.list(),
    refetchInterval: 5000,
  });

  const pods = podsData?.data || [];
  const deployments = deploymentsData?.data?.data || [];
  const services = servicesData?.data?.data || [];

  const runningPods = pods.filter(p => p.phase === 'Running').length;
  const pendingPods = pods.filter(p => p.phase === 'Pending').length;
  const failedPods = pods.filter(p => p.phase === 'Failed').length;

  // Calculate deployment health
  const healthyDeployments = deployments.filter((d: any) => {
    const ready = d.status?.readyReplicas || 0;
    const desired = d.spec?.replicas || 0;
    return ready === desired && desired > 0;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 gradient-primary rounded-xl glow-primary">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Overview of your Kubernetes cluster</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Pods</CardTitle>
            <Box className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pods.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {runningPods} running
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Deployments</CardTitle>
            <Layers className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{deployments.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {healthyDeployments} healthy
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Services</CardTitle>
            <Globe className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{services.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              Network endpoints
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pendingPods + failedPods}</div>
            <p className="text-xs text-slate-500 mt-1">
              Pending or failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deployments */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-effect border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-400" />
              Recent Deployments
            </CardTitle>
            <CardDescription className="text-slate-400">Latest deployments in your cluster</CardDescription>
          </CardHeader>
          <CardContent>
            {deploymentsLoading ? (
              <p className="text-center text-slate-400 py-8">Loading...</p>
            ) : deployments.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No deployments yet</p>
            ) : (
              <div className="space-y-3">
                {deployments.slice(0, 5).map((deployment: any) => {
                  const ready = deployment.status?.readyReplicas || 0;
                  const desired = deployment.spec?.replicas || 0;
                  const isHealthy = ready === desired && desired > 0;

                  return (
                    <div
                      key={`${deployment.metadata.namespace}/${deployment.metadata.name}`}
                      className="flex items-center justify-between p-3 border border-slate-700/50 rounded-lg hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{deployment.metadata.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {deployment.metadata.namespace}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {deployment.spec?.template?.spec?.containers?.[0]?.image || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={isHealthy ? 'default' : 'secondary'}>
                          {ready}/{desired}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-400" />
              Recent Pods
            </CardTitle>
            <CardDescription className="text-slate-400">Latest pod deployments</CardDescription>
          </CardHeader>
          <CardContent>
            {podsLoading ? (
              <p className="text-center text-slate-400 py-8">Loading...</p>
            ) : podsError ? (
              <p className="text-center text-red-400 py-8">Error loading pods</p>
            ) : pods.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No pods deployed yet</p>
            ) : (
              <div className="space-y-3">
                {pods.slice(0, 5).map((pod) => (
                  <div
                    key={`${pod.namespace}/${pod.name}`}
                    className="flex items-center justify-between p-3 border border-slate-700/50 rounded-lg hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{pod.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {pod.namespace}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{pod.image}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          pod.phase === 'Running'
                            ? 'default'
                            : pod.phase === 'Failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {pod.phase}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Services Overview */}
      <Card className="glass-effect border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-400" />
            Active Services
          </CardTitle>
          <CardDescription className="text-slate-400">Network services exposing your applications</CardDescription>
        </CardHeader>
        <CardContent>
          {servicesLoading ? (
            <p className="text-center text-slate-400 py-8">Loading...</p>
          ) : services.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No services configured</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((service: any) => {
                const serviceType = service.spec?.type || 'ClusterIP';
                const ports = service.spec?.ports || [];

                return (
                  <div
                    key={`${service.metadata.namespace}/${service.metadata.name}`}
                    className="p-3 border border-slate-700/50 rounded-lg hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-white">{service.metadata.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={
                        serviceType === 'LoadBalancer' ? 'gradient-green' :
                        serviceType === 'NodePort' ? 'gradient-blue' : 'gradient-purple'
                      }>
                        {serviceType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {service.metadata.namespace}
                      </Badge>
                    </div>
                    {ports.length > 0 && (
                      <p className="text-xs text-slate-400">
                        Ports: {ports.map((p: any) => `${p.port}:${p.targetPort}`).join(', ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
