import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { podAPI, namespaceAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import type { PodCreateRequest, APIResponse } from '@/types';

export function DeployPod() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PodCreateRequest>({
    name: '',
    namespace: 'default',
    image: '',
    replicas: 1,
    resources: {
      cpu: '500m',
      memory: '512Mi',
    },
    ports: [],
    env: [],
  });

  const [newPort, setNewPort] = useState('');
  const [newEnv, setNewEnv] = useState({ name: '', value: '' });

  const { data: namespacesData } = useQuery<APIResponse<string[]>>({
    queryKey: ['namespaces'],
    queryFn: async () => {
      const response = await namespaceAPI.list();
      return response.data;
    },
  });

  const createPodMutation = useMutation({
    mutationFn: async (data: PodCreateRequest) => {
      const response = await podAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pods'] });
      navigate('/pods');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPodMutation.mutate(formData);
  };

  const addPort = () => {
    if (newPort && !isNaN(Number(newPort))) {
      setFormData({
        ...formData,
        ports: [...(formData.ports || []), Number(newPort)],
      });
      setNewPort('');
    }
  };

  const removePort = (index: number) => {
    setFormData({
      ...formData,
      ports: formData.ports?.filter((_, i) => i !== index),
    });
  };

  const addEnv = () => {
    if (newEnv.name && newEnv.value) {
      setFormData({
        ...formData,
        env: [...(formData.env || []), newEnv],
      });
      setNewEnv({ name: '', value: '' });
    }
  };

  const removeEnv = (index: number) => {
    setFormData({
      ...formData,
      env: formData.env?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Deploy New Pod</h2>
        <p className="text-muted-foreground">
          Configure and deploy a new pod to your Kubernetes cluster
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Pod Configuration</CardTitle>
            <CardDescription>
              Enter the details for your pod deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pod Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="my-app"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="namespace">Namespace *</Label>
                <select
                  id="namespace"
                  value={formData.namespace}
                  onChange={(e) =>
                    setFormData({ ...formData, namespace: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  {namespacesData?.data?.map((ns) => (
                    <option key={ns} value={ns}>
                      {ns}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Container Image *</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="nginx:latest"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu">CPU Request</Label>
                <Input
                  id="cpu"
                  value={formData.resources?.cpu}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      resources: { ...formData.resources, cpu: e.target.value },
                    })
                  }
                  placeholder="500m"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory">Memory Request</Label>
                <Input
                  id="memory"
                  value={formData.resources?.memory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      resources: {
                        ...formData.resources,
                        memory: e.target.value,
                      },
                    })
                  }
                  placeholder="512Mi"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ports</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newPort}
                  onChange={(e) => setNewPort(e.target.value)}
                  placeholder="80"
                />
                <Button type="button" onClick={addPort} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.ports?.map((port, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-md"
                  >
                    <span className="text-sm">{port}</span>
                    <button
                      type="button"
                      onClick={() => removePort(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Environment Variables</Label>
              <div className="flex gap-2">
                <Input
                  value={newEnv.name}
                  onChange={(e) =>
                    setNewEnv({ ...newEnv, name: e.target.value })
                  }
                  placeholder="KEY"
                />
                <Input
                  value={newEnv.value}
                  onChange={(e) =>
                    setNewEnv({ ...newEnv, value: e.target.value })
                  }
                  placeholder="value"
                />
                <Button type="button" onClick={addEnv} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.env?.map((env, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-secondary px-3 py-2 rounded-md"
                  >
                    <span className="text-sm">
                      {env.name} = {env.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEnv(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createPodMutation.isPending}
                className="flex-1"
              >
                {createPodMutation.isPending ? 'Deploying...' : 'Deploy Pod'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/pods')}
              >
                Cancel
              </Button>
            </div>

            {createPodMutation.isError && (
              <p className="text-sm text-destructive">
                Error: {(createPodMutation.error as any)?.response?.data?.error || 'Failed to deploy pod'}
              </p>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
