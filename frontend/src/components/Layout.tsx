import { Link, Outlet, useLocation } from 'react-router-dom';
import { Server, Plus, List, Sparkles, Rocket, Layers, Globe } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Server },
    { path: '/advanced-deploy', label: 'Deploy', icon: Rocket },
    { path: '/deployments', label: 'Deployments', icon: Layers },
    { path: '/services', label: 'Services', icon: Globe },
    { path: '/pods', label: 'Pods', icon: List },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with Glass Effect */}
      <header className="relative z-10 glass-effect border-b border-slate-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with Gradient */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="p-2 gradient-primary rounded-xl glow-primary transition-all duration-300 group-hover:scale-110">
                <Server className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  KubeDeploy
                </h1>
                <p className="text-xs text-slate-400">Kubernetes Made Simple</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative flex items-center gap-2 px-5 py-2.5 rounded-xl
                      font-medium transition-all duration-300 group
                      ${active
                        ? 'gradient-primary text-white shadow-lg shadow-purple-500/50'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      }
                    `}
                  >
                    {active && (
                      <div className="absolute inset-0 gradient-primary rounded-xl animate-pulse opacity-50"></div>
                    )}
                    <Icon className={`h-4 w-4 relative z-10 ${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <Link
        to="/advanced-deploy"
        className="fixed bottom-8 right-8 p-4 gradient-accent rounded-full shadow-2xl shadow-pink-500/50 glow-accent hover:scale-110 transition-all duration-300 group z-50"
      >
        <Sparkles className="h-6 w-6 text-white group-hover:rotate-180 transition-transform duration-500" />
      </Link>

      {/* Footer */}
      <footer className="relative z-10 mt-20 py-6 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <p>Built with ❤️ using React 19 & Kubernetes</p>
            <p>© 2025 KubeDeploy. Production Ready.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
