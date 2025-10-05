import { Link } from 'react-router-dom';
import {
  Server,
  Rocket,
  Shield,
  Zap,
  Code,
  Cloud,
  CheckCircle,
  ArrowRight,
  Github,
  Terminal,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function Home() {
  const features = [
    {
      icon: Rocket,
      title: 'One-Click Deploy',
      description: 'Deploy your containerized applications to Kubernetes with a single click. No complex YAML configurations needed.',
      color: 'text-purple-400'
    },
    {
      icon: Shield,
      title: 'Secure by Default',
      description: 'Built-in security features with authentication, authorization, and resource isolation for multi-tenant deployments.',
      color: 'text-blue-400'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized deployment pipeline ensures your applications are up and running in seconds, not minutes.',
      color: 'text-yellow-400'
    },
    {
      icon: Terminal,
      title: 'Developer Friendly',
      description: 'Intuitive UI with real-time logs, pod management, and service discovery. Built by developers, for developers.',
      color: 'text-green-400'
    },
    {
      icon: Layers,
      title: 'Full Stack Management',
      description: 'Manage deployments, services, pods, and namespaces all from one beautiful dashboard.',
      color: 'text-pink-400'
    },
    {
      icon: Cloud,
      title: 'Cloud Native',
      description: 'Leverages Kubernetes best practices and cloud-native patterns for scalability and reliability.',
      color: 'text-indigo-400'
    }
  ];

  const stats = [
    { label: 'Deploy Time', value: '< 30s', icon: Zap },
    { label: 'Availability', value: '99.9%', icon: CheckCircle },
    { label: 'Developer XP', value: 'Amazing', icon: Code }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass-effect border-b border-slate-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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

            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline" className="border-slate-600 hover:border-purple-500">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="gradient-primary text-white glow-primary">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-purple-500/50 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-slate-300">Production Ready • Open Source • Cloud Native</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Kubernetes Deployment
            </span>
            <br />
            <span className="text-white">Made Effortless</span>
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            KubeDeploy is a modern Pod-as-a-Service platform that simplifies Kubernetes deployments.
            Deploy, manage, and scale your containerized applications with an intuitive interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-white text-lg px-8 py-6 glow-primary group">
                Start Deploying
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="https://github.com/imranhasan871/kube-deploy" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-slate-600 hover:border-purple-500">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="glass-effect border-slate-700/50 p-6">
                  <Icon className="h-8 w-8 text-purple-400 mb-3 mx-auto" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Why KubeDeploy?
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Built to solve real-world deployment challenges with modern tools and best practices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="glass-effect border-slate-700/50 p-6 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="mb-4">
                  <div className="inline-block p-3 rounded-xl gradient-primary glow-primary group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <Card className="glass-effect border-slate-700/50 p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Built With Modern Tech
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Leveraging cutting-edge technologies for the best developer experience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { name: 'React 19', desc: 'Modern UI', color: 'from-cyan-400 to-blue-500', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', useColor: true },
              { name: 'Go', desc: 'Fast Backend', color: 'from-cyan-400 to-blue-600', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg', useColor: true },
              { name: 'Kubernetes', desc: 'Orchestration', color: 'from-blue-500 to-indigo-600', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg', useColor: true },
              { name: 'PostgreSQL', desc: 'Database', color: 'from-blue-600 to-indigo-700', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', useColor: true },
              { name: 'Docker', desc: 'Containers', color: 'from-blue-500 to-cyan-500', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', useColor: true },
              { name: 'TailwindCSS', desc: 'Styling', color: 'from-cyan-400 to-blue-500', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', useColor: true },
              { name: 'TypeScript', desc: 'Type Safety', color: 'from-blue-600 to-indigo-600', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', useColor: true },
              { name: 'Gin', desc: 'Web Framework', color: 'from-cyan-500 to-blue-600', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg', useColor: true }
            ].map((tech, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className={`p-4 rounded-xl glass-effect border border-slate-700/50 group-hover:border-purple-500/50 group-hover:scale-110 transition-all mb-2 bg-gradient-to-br ${tech.color} bg-opacity-10`}>
                  <img
                    src={tech.logo}
                    alt={tech.name}
                    className={`h-12 w-12 mx-auto ${tech.useColor ? '' : 'filter brightness-0 invert opacity-90'} group-hover:opacity-100 transition-opacity`}
                  />
                </div>
                <div className="font-semibold text-white">{tech.name}</div>
                <div className="text-sm text-slate-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <Card className="glass-effect border-slate-700/50 p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Ready to Deploy?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join developers who are simplifying their Kubernetes deployments with KubeDeploy
          </p>
          <Link to="/signup">
            <Button size="lg" className="gradient-primary text-white text-lg px-12 py-6 glow-primary group">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 mt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm gap-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span>© 2025 KubeDeploy. Production Ready.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-purple-400 transition-colors">Documentation</a>
              <a href="https://github.com/imranhasan871/kube-deploy" className="hover:text-purple-400 transition-colors">GitHub</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Discord</a>
            </div>
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
