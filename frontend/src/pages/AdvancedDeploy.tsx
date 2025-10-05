import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deploymentAPI, serviceAPI, namespaceAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, Plus, Trash2, Server, Globe, Rocket } from 'lucide-react';

interface EnvVar {
  name: string;
  value: string;
}

interface Port {
  name: string;
  containerPort: number;
  protocol: string;
}

interface ServicePort {
  name: string;
  port: number;
  targetPort: number;
  protocol: string;
  nodePort?: number;
}

export default function AdvancedDeploy() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [deploymentType, setDeploymentType] = useState<'pod' | 'deployment'>('deployment');
  const [name, setName] = useState('');
  const [namespace, setNamespace] = useState('default');
  const [image, setImage] = useState('');
  const [replicas, setReplicas] = useState(1);
  const [cpuRequest, setCpuRequest] = useState('100m');
  const [memoryRequest, setMemoryRequest] = useState('128Mi');
  const [cpuLimit, setCpuLimit] = useState('500m');
  const [memoryLimit, setMemoryLimit] = useState('512Mi');

  // Environment variables
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);

  // Container ports
  const [ports, setPorts] = useState<Port[]>([{ name: 'http', containerPort: 80, protocol: 'TCP' }]);

  // Service configuration
  const [createService, setCreateService] = useState(true);
  const [serviceType, setServiceType] = useState<'ClusterIP' | 'NodePort' | 'LoadBalancer'>('LoadBalancer');
  const [servicePorts, setServicePorts] = useState<ServicePort[]>([
    { name: 'http', port: 80, targetPort: 80, protocol: 'TCP' }
  ]);

  // File upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { data: namespaces } = useQuery({
    queryKey: ['namespaces'],
    queryFn: () => namespaceAPI.list(),
  });

  const deploymentMutation = useMutation({
    mutationFn: (data: any) => deploymentAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });

  const serviceMutation = useMutation({
    mutationFn: (data: any) => serviceAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { name: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const addPort = () => {
    setPorts([...ports, { name: '', containerPort: 8080, protocol: 'TCP' }]);
  };

  const removePort = (index: number) => {
    setPorts(ports.filter((_, i) => i !== index));
  };

  const updatePort = (index: number, field: keyof Port, value: string | number) => {
    const updated = [...ports];
    updated[index][field] = value as never;
    setPorts(updated);
  };

  const addServicePort = () => {
    setServicePorts([...servicePorts, { name: '', port: 8080, targetPort: 8080, protocol: 'TCP' }]);
  };

  const removeServicePort = (index: number) => {
    setServicePorts(servicePorts.filter((_, i) => i !== index));
  };

  const updateServicePort = (index: number, field: keyof ServicePort, value: string | number) => {
    const updated = [...servicePorts];
    updated[index][field] = value as never;
    setServicePorts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create deployment
      const deploymentData = {
        name,
        namespace,
        image,
        replicas: deploymentType === 'deployment' ? replicas : 1,
        resources: {
          requests: {
            cpu: cpuRequest,
            memory: memoryRequest,
          },
          limits: {
            cpu: cpuLimit,
            memory: memoryLimit,
          },
        },
        ports: ports.map(p => ({
          name: p.name,
          containerPort: p.containerPort,
          protocol: p.protocol,
        })),
        env: envVars.filter(e => e.name && e.value).map(e => ({
          name: e.name,
          value: e.value,
        })),
      };

      await deploymentMutation.mutateAsync(deploymentData);

      // Create service if requested
      if (createService) {
        const serviceData = {
          name: `${name}-service`,
          namespace,
          type: serviceType,
          selector: {
            app: name,
          },
          ports: servicePorts.map(p => ({
            name: p.name,
            port: p.port,
            targetPort: p.targetPort,
            protocol: p.protocol,
            nodePort: serviceType === 'NodePort' ? p.nodePort : undefined,
          })),
        };

        await serviceMutation.mutateAsync(serviceData);
      }

      navigate('/deployments');
    } catch (error: any) {
      console.error('Deployment failed:', error);
      alert(error.response?.data?.error || 'Failed to create deployment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 gradient-primary rounded-xl glow-primary">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Advanced Deployment
          </h1>
          <p className="text-slate-400 mt-1">Deploy applications with full Kubernetes features</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <Card className="p-6 glass-effect border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-400" />
            Upload Project (Optional)
          </h2>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg text-white mb-2">
              {uploadedFile ? uploadedFile.name : 'Drag & drop your project zip file here'}
            </p>
            <p className="text-sm text-slate-400 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="inline-block">
              <Button type="button" variant="outline" className="cursor-pointer">
                Choose File
              </Button>
            </label>
          </div>
        </Card>

        {/* Deployment Type */}
        <Card className="p-6 glass-effect border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Deployment Type</h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setDeploymentType('pod')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                deploymentType === 'pod'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <Server className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <p className="text-white font-medium">Single Pod</p>
              <p className="text-sm text-slate-400 mt-1">Quick deployment</p>
            </button>
            <button
              type="button"
              onClick={() => setDeploymentType('deployment')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                deploymentType === 'deployment'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <Globe className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <p className="text-white font-medium">Deployment</p>
              <p className="text-sm text-slate-400 mt-1">Production ready with replicas</p>
            </button>
          </div>
        </Card>

        {/* Basic Configuration */}
        <Card className="p-6 glass-effect border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-app"
                required
              />
            </div>
            <div>
              <Label htmlFor="namespace">Namespace *</Label>
              <select
                id="namespace"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {namespaces?.data?.data?.map((ns: string) => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="image">Container Image *</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="nginx:latest"
                required
              />
            </div>
            {deploymentType === 'deployment' && (
              <div>
                <Label htmlFor="replicas">Replicas</Label>
                <Input
                  id="replicas"
                  type="number"
                  min="1"
                  value={replicas}
                  onChange={(e) => setReplicas(parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Resource Limits */}
        <Card className="p-6 glass-effect border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Resource Limits</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpu-request">CPU Request</Label>
              <Input
                id="cpu-request"
                value={cpuRequest}
                onChange={(e) => setCpuRequest(e.target.value)}
                placeholder="100m"
              />
            </div>
            <div>
              <Label htmlFor="memory-request">Memory Request</Label>
              <Input
                id="memory-request"
                value={memoryRequest}
                onChange={(e) => setMemoryRequest(e.target.value)}
                placeholder="128Mi"
              />
            </div>
            <div>
              <Label htmlFor="cpu-limit">CPU Limit</Label>
              <Input
                id="cpu-limit"
                value={cpuLimit}
                onChange={(e) => setCpuLimit(e.target.value)}
                placeholder="500m"
              />
            </div>
            <div>
              <Label htmlFor="memory-limit">Memory Limit</Label>
              <Input
                id="memory-limit"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
                placeholder="512Mi"
              />
            </div>
          </div>
        </Card>

        {/* Environment Variables */}
        <Card className="p-6 glass-effect border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Environment Variables</h2>
            <Button type="button" onClick={addEnvVar} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </div>
          <div className="space-y-2">
            {envVars.map((env, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={env.name}
                  onChange={(e) => updateEnvVar(index, 'name', e.target.value)}
                  placeholder="KEY"
                  className="flex-1"
                />
                <Input
                  value={env.value}
                  onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                  placeholder="value"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeEnvVar(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Container Ports */}
        <Card className="p-6 glass-effect border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Container Ports</h2>
            <Button type="button" onClick={addPort} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Port
            </Button>
          </div>
          <div className="space-y-2">
            {ports.map((port, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={port.name}
                  onChange={(e) => updatePort(index, 'name', e.target.value)}
                  placeholder="http"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={port.containerPort}
                  onChange={(e) => updatePort(index, 'containerPort', parseInt(e.target.value))}
                  placeholder="80"
                  className="flex-1"
                />
                <select
                  value={port.protocol}
                  onChange={(e) => updatePort(index, 'protocol', e.target.value)}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePort(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Service Configuration */}
        <Card className="p-6 glass-effect border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="create-service"
              checked={createService}
              onChange={(e) => setCreateService(e.target.checked)}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <Label htmlFor="create-service" className="cursor-pointer">
              Create Service to expose this deployment
            </Label>
          </div>

          {createService && (
            <>
              <div className="mb-4">
                <Label htmlFor="service-type">Service Type</Label>
                <select
                  id="service-type"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ClusterIP">ClusterIP (Internal only)</option>
                  <option value="NodePort">NodePort (External access via node IP)</option>
                  <option value="LoadBalancer">LoadBalancer (Cloud load balancer)</option>
                </select>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Service Ports</h3>
                <Button type="button" onClick={addServicePort} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Port
                </Button>
              </div>

              <div className="space-y-2">
                {servicePorts.map((servicePort, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={servicePort.name}
                      onChange={(e) => updateServicePort(index, 'name', e.target.value)}
                      placeholder="http"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={servicePort.port}
                      onChange={(e) => updateServicePort(index, 'port', parseInt(e.target.value))}
                      placeholder="80"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={servicePort.targetPort}
                      onChange={(e) => updateServicePort(index, 'targetPort', parseInt(e.target.value))}
                      placeholder="8080"
                      className="flex-1"
                    />
                    {serviceType === 'NodePort' && (
                      <Input
                        type="number"
                        value={servicePort.nodePort || ''}
                        onChange={(e) => updateServicePort(index, 'nodePort', parseInt(e.target.value))}
                        placeholder="30000-32767"
                        className="flex-1"
                      />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeServicePort(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1 gradient-primary text-white font-medium py-6 text-lg glow-primary"
            disabled={deploymentMutation.isPending || serviceMutation.isPending}
          >
            {deploymentMutation.isPending || serviceMutation.isPending ? (
              'Deploying...'
            ) : (
              <>
                <Rocket className="h-5 w-5 mr-2" />
                Deploy Application
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            className="px-8"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
