import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import VersionDisplay from "@/components/VersionDisplay";

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignInWithCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo - determine role based on username
    let role = 'document-controller';
    if (username.includes('admin')) {
      role = 'admin';
    } else if (username.includes('owner')) {
      role = 'document-owner';
    } else if (username.includes('requester')) {
      role = 'requester';
    } else if (username.includes('creator')) {
      role = 'document-creator';
    }
    localStorage.setItem('userRole', role);
    toast({
      title: "Logged in successfully",
      description: `Welcome back!`
    });
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleSignInWithMicrosoft = () => {
    toast({
      title: "Microsoft Sign In",
      description: "Microsoft authentication would happen here"
    });
    // For demo purposes, just navigate to dashboard
    localStorage.setItem('userRole', 'document-controller');
    navigate('/dashboard');
  };

  const handleRoleLogin = (role: string) => {
    setLoading(role);
    // Simulate a delay for the login process
    setTimeout(() => {
      localStorage.setItem('userRole', role);
      toast({
        title: "Logged in successfully",
        description: `Welcome back as ${role.replace('-', ' ')}!`
      });
      navigate(role === 'admin' ? '/admin' : '/dashboard');
      setLoading(null);
    }, 800);
  };

  return <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{
    backgroundImage: 'url("/lovable-uploads/d685a44f-9590-4308-8b29-4ad12abe4be8.png")'
  }}>
      {/* Soft gradient overlay for better contrast and readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 to-amber-900/40"></div>
      
      <div className="relative z-10 w-full max-w-sm px-5 py-6 bg-white/70 backdrop-blur-sm rounded-lg shadow-xl border border-amber-100/50">
        <div className="mb-5 text-center">
          <img src="/lovable-uploads/a390b421-ca77-4ac3-8308-8a0b052d6a4c.png" alt="Sharaf DG" className="h-10 mx-auto mb-3" />
        </div>
        
        <form onSubmit={handleSignInWithCredentials} className="space-y-3">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-800 mb-1">
              Username<span className="text-red-500">*</span>
            </label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full h-9 rounded-md border border-amber-200 bg-white/80" />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
              Password<span className="text-red-500">*</span>
            </label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full h-9 rounded-md border border-amber-200 bg-white/80" />
          </div>
          
          <Button type="submit" className="w-full bg-[#0068B7] hover:bg-[#00559a] text-white py-1 h-9 rounded-md">
            Log In
          </Button>
        </form>
        
        <div className="my-3 text-center">
          <p className="text-xs text-gray-700">OR</p>
        </div>
        
        <Button onClick={handleSignInWithMicrosoft} className="w-full bg-[#0068B7] hover:bg-[#00559a] text-white py-1 h-9 rounded-md flex items-center justify-center">
          {/* Microsoft logo SVG */}
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
            <path fill="#f3f3f3" d="M0 0h23v23H0z" />
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
          Sign in with Microsoft
        </Button>
        
        {/* Quick access buttons - with more compact layout */}
        <div className="mt-5">
          <p className="text-xs text-center mb-1.5 text-gray-800 font-medium">Quick access (for demo):</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            <Button variant="outline" size="sm" className="bg-white/70 hover:bg-amber-50 border-amber-200 text-gray-800 text-xs py-0 h-6" onClick={() => handleRoleLogin('document-controller')} disabled={loading !== null}>
              {loading === 'document-controller' ? <span className="inline-block h-3 w-3 border-2 border-r-transparent border-gray-800 rounded-full animate-spin mr-1"></span> : null}
              Document Controller
            </Button>
            <Button variant="outline" size="sm" className="bg-white/70 hover:bg-amber-50 border-amber-200 text-gray-800 text-xs py-0 h-6" onClick={() => handleRoleLogin('admin')} disabled={loading !== null}>
              {loading === 'admin' ? <span className="inline-block h-3 w-3 border-2 border-r-transparent border-gray-800 rounded-full animate-spin mr-1"></span> : null}
              Admin
            </Button>
            <Button variant="outline" size="sm" className="bg-white/70 hover:bg-amber-50 border-amber-200 text-gray-800 text-xs py-0 h-6" onClick={() => handleRoleLogin('document-owner')} disabled={loading !== null}>
              {loading === 'document-owner' ? <span className="inline-block h-3 w-3 border-2 border-r-transparent border-gray-800 rounded-full animate-spin mr-1"></span> : null}
              Document Owner
            </Button>
            <Button variant="outline" size="sm" className="bg-white/70 hover:bg-amber-50 border-amber-200 text-gray-800 text-xs py-0 h-6" onClick={() => handleRoleLogin('requester')} disabled={loading !== null}>
              {loading === 'requester' ? <span className="inline-block h-3 w-3 border-2 border-r-transparent border-gray-800 rounded-full animate-spin mr-1"></span> : null}
              Reviewer
            </Button>
            <Button variant="outline" size="sm" className="bg-white/70 hover:bg-amber-50 border-amber-200 text-gray-800 text-xs py-0 h-6" onClick={() => handleRoleLogin('document-creator')} disabled={loading !== null}>
              {loading === 'document-creator' ? <span className="inline-block h-3 w-3 border-2 border-r-transparent border-gray-800 rounded-full animate-spin mr-1"></span> : null}
              Document Creator
            </Button>
          </div>
        </div>

        {/* Version display at the bottom */}
        <div className="mt-4 text-center">
          <VersionDisplay />
        </div>
      </div>
    </div>;
};

export default LoginPage;
