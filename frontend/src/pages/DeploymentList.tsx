import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deploymentAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Layers, TrendingUp, TrendingDown } from 'lucide-react';

export default function DeploymentList() {
  const queryClient = useQueryClient();
  const [selectedNamespace] = useState<string>('');

  const { data: deployments, isLoading, refetch } = useQuery({
    queryKey: ['deployments', selectedNamespace],
    queryFn: () => deploymentAPI.list(selectedNamespace || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ namespace, name }: { namespace: string; name: string }) =>
      deploymentAPI.delete(namespace, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });

  const scaleMutation = useMutation({
    mutationFn: ({ namespace, name, replicas }: { namespace: string; name: string; replicas: number }) =>
      deploymentAPI.scale(namespace, name, replicas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });

  const handleDelete = async (namespace: string, name: string) => {
    if (confirm(`Are you sure you want to delete deployment ${name}?`)) {
      try {
        await deleteMutation.mutateAsync({ namespace, name });
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete deployment');
      }
    }
  };

  const handleScale = async (namespace: string, name: string, currentReplicas: number, direction: 'up' | 'down') => {
    const newReplicas = direction === 'up' ? currentReplicas + 1 : Math.max(0, currentReplicas - 1);
    try {
      await scaleMutation.mutateAsync({ namespace, name, replicas: newReplicas });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to scale deployment');
    }
  };

  const deploymentList = deployments?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 gradient-primary rounded-xl glow-primary">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Deployments
            </h1>
            <p className="text-slate-400 mt-1">Manage your application deployments</p>
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
          <p className="text-slate-400">Loading deployments...</p>
        </Card>
      ) : deploymentList.length === 0 ? (
        <Card className="p-8 glass-effect border-slate-700/50 text-center">
          <Layers className="h-12 w-12 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">No deployments found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deploymentList.map((deployment: any) => {
            const ready = deployment.readyReplicas || 0;
            const desired = deployment.replicas || 0;
            const isHealthy = ready === desired && desired > 0;

            return (
              <Card key={`${deployment.namespace}-${deployment.name}`} className="p-6 glass-effect border-slate-700/50 hover:border-purple-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {deployment.name}
                      </h3>
                      <Badge variant={isHealthy ? 'default' : 'secondary'}>
                        {ready}/{desired} Ready
                      </Badge>
                      <Badge variant="outline">
                        {deployment.namespace}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-slate-400">Image</p>
                        <p className="text-white font-medium">
                          {deployment.image || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Replicas</p>
                        <p className="text-white font-medium">{desired}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Available</p>
                        <p className="text-white font-medium">{deployment.availableReplicas || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Age</p>
                        <p className="text-white font-medium">
                          {new Date(deployment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {deployment.labels && Object.keys(deployment.labels).length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-400 mb-2">Labels</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(deployment.labels).map(([key, value]: [string, any]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}={value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleScale(deployment.namespace, deployment.name, desired, 'up')}
                        variant="outline"
                        size="sm"
                        disabled={scaleMutation.isPending}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleScale(deployment.namespace, deployment.name, desired, 'down')}
                        variant="outline"
                        size="sm"
                        disabled={scaleMutation.isPending || desired === 0}
                      >
                        <TrendingDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleDelete(deployment.namespace, deployment.name)}
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
