import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DeployPod } from './pages/DeployPod';
import { PodList } from './pages/PodList';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import AdvancedDeploy from './pages/AdvancedDeploy';
import DeploymentList from './pages/DeploymentList';
import ServiceList from './pages/ServiceList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes (with layout) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="deploy" element={<DeployPod />} />
            <Route path="advanced-deploy" element={<AdvancedDeploy />} />
            <Route path="pods" element={<PodList />} />
            <Route path="deployments" element={<DeploymentList />} />
            <Route path="services" element={<ServiceList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
