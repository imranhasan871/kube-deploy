export interface Pod {
  name: string;
  namespace: string;
  status: string;
  phase: string;
  created_at: string;
  image: string;
  restarts: number;
  labels?: Record<string, string>;
}

export interface PodCreateRequest {
  name: string;
  namespace: string;
  image: string;
  replicas?: number;
  resources?: {
    cpu?: string;
    memory?: string;
  };
  ports?: number[];
  env?: Array<{
    name: string;
    value: string;
  }>;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
