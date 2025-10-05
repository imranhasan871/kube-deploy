import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Globe, ExternalLink } from 'lucide-react';

export default function ServiceList() {
  const queryClient = useQueryClient();
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');

  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['services', selectedNamespace],
    queryFn: () => serviceAPI.list(selectedNamespace || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ namespace, name }: { namespace: string; name: string }) =>
      serviceAPI.delete(namespace, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const handleDelete = async (namespace: string, name: string) => {
    if (confirm(`Are you sure you want to delete service ${name}?`)) {
      try {
        await deleteMutation.mutateAsync({ namespace, name });
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete service');
      }
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'LoadBalancer':
        return 'gradient-green';
      case 'NodePort':
        return 'gradient-blue';
      case 'ClusterIP':
      default:
        return 'gradient-purple';
    }
  };

  const serviceList = services?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 gradient-primary rounded-xl glow-primary">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Services
            </h1>
            <p className="text-slate-400 mt-1">Expose your applications to the network</p>
          </div>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 glass-effect border-slate-700/50 text-center">
          <p className="text-slate-400">Loading services...</p>
        </Card>
      ) : serviceList.length === 0 ? (
        <Card className="p-8 glass-effect border-slate-700/50 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">No services found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {serviceList.map((service: any) => {
            const serviceType = service.spec?.type || 'ClusterIP';
            const clusterIP = service.spec?.clusterIP;
            const ports = service.spec?.ports || [];
            const externalIPs = service.status?.loadBalancer?.ingress || [];

            return (
              <Card key={`${service.metadata.namespace}-${service.metadata.name}`} className="p-6 glass-effect border-slate-700/50 hover:border-purple-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {service.metadata.name}
                      </h3>
                      <Badge className={getServiceTypeColor(serviceType)}>
                        {serviceType}
                      </Badge>
                      <Badge variant="outline">
                        {service.metadata.namespace}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-slate-400">Cluster IP</p>
                        <p className="text-white font-medium">{clusterIP}</p>
                      </div>

                      {serviceType === 'LoadBalancer' && externalIPs.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-400">External IP</p>
                          <p className="text-white font-medium flex items-center gap-2">
                            {externalIPs[0].ip || externalIPs[0].hostname}
                            <ExternalLink className="h-3 w-3" />
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-slate-400">Age</p>
                        <p className="text-white font-medium">
                          {new Date(service.metadata.creationTimestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {ports.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-400 mb-2">Ports</p>
                        <div className="flex flex-wrap gap-2">
                          {ports.map((port: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {port.name && `${port.name}: `}
                              {port.port}:{port.targetPort}
                              {port.nodePort && ` (NodePort: ${port.nodePort})`}
                              /{port.protocol}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.spec?.selector && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-400 mb-2">Selectors</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(service.spec.selector).map(([key, value]: [string, any]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}={value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handleDelete(service.metadata.namespace, service.metadata.name)}
                      variant="outline"
                      size="sm"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
