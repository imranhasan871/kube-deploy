import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { UserPlus, Server } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [error, setError] = useState('');

  const signupMutation = useMutation({
    mutationFn: (data: { email: string; username: string; password: string; full_name?: string }) =>
      authAPI.signup(data),
    onSuccess: (response) => {
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Signup failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    signupMutation.mutate({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      full_name: formData.fullName || undefined,
    });
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden py-12">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md p-8 glass-effect border-slate-700/50 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 gradient-primary rounded-xl glow-primary">
            <Server className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              KubeDeploy
            </h1>
            <p className="text-xs text-slate-400">Kubernetes Made Simple</p>
          </div>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400">Sign up to start deploying applications</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name (Optional)</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={handleChange('username')}
              placeholder="johndoe"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-white font-medium py-6 text-lg glow-primary"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              'Creating Account...'
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                Sign Up
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>

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
