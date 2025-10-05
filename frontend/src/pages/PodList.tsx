import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { podAPI, namespaceAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, FileText } from 'lucide-react';
import type { APIResponse, Pod } from '@/types';

export function PodList() {
  const queryClient = useQueryClient();
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  const { data: namespacesData } = useQuery<APIResponse<string[]>>({
    queryKey: ['namespaces'],
    queryFn: async () => {
      const response = await namespaceAPI.list();
      return response.data;
    },
  });

  const { data, isLoading } = useQuery<APIResponse<Pod[]>>({
    queryKey: ['pods', selectedNamespace],
    queryFn: async () => {
      const response = await podAPI.list(selectedNamespace || undefined);
      return response.data;
    },
    refetchInterval: 3000,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery<APIResponse<{ logs: string }>>({
    queryKey: ['podLogs', selectedPod?.namespace, selectedPod?.name],
    queryFn: async () => {
      if (!selectedPod) return { success: false, data: { logs: '' } };
      const response = await podAPI.getLogs(selectedPod.namespace, selectedPod.name, 100);
      return response.data;
    },
    enabled: !!selectedPod && showLogs,
  });

  const deletePodMutation = useMutation({
    mutationFn: async ({ namespace, name }: { namespace: string; name: string }) => {
      const response = await podAPI.delete(namespace, name);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pods'] });
    },
  });

  const pods = data?.data || [];

  const handleDelete = (pod: Pod) => {
    if (confirm(`Are you sure you want to delete pod ${pod.name}?`)) {
      deletePodMutation.mutate({ namespace: pod.namespace, name: pod.name });
    }
  };

  const handleViewLogs = (pod: Pod) => {
    setSelectedPod(pod);
    setShowLogs(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pods</h2>
          <p className="text-muted-foreground">Manage your Kubernetes pods</p>
        </div>

        <div className="flex gap-4 items-center">
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Namespaces</option>
            {namespacesData?.data?.map((ns) => (
              <option key={ns} value={ns}>
                {ns}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pod List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : pods.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pods found</p>
          ) : (
            <div className="space-y-2">
              {pods.map((pod) => (
                <div
                  key={`${pod.namespace}/${pod.name}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{pod.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {pod.namespace}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{pod.image}</span>
                      <span>•</span>
                      <span>Restarts: {pod.restarts}</span>
                      <span>•</span>
                      <span>{new Date(pod.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        pod.phase === 'Running'
                          ? 'success'
                          : pod.phase === 'Failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {pod.phase}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewLogs(pod)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pod)}
                      disabled={deletePodMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showLogs && selectedPod && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Logs: {selectedPod.name} ({selectedPod.namespace})
              </CardTitle>
              <Button variant="ghost" onClick={() => setShowLogs(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <p className="text-muted-foreground">Loading logs...</p>
            ) : (
              <pre className="bg-black text-green-400 p-4 rounded-md overflow-auto max-h-96 text-sm font-mono">
                {logsData?.data?.logs || 'No logs available'}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
