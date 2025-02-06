import React, { useState } from 'react';
// import Auth from './components/Auth'; 
import { client } from "./client";
import { ConnectButton } from "thirdweb/react";
// import { Globe } from 'lucide-react';
import { 
  Brain, 
  Users, 
  Workflow, 
  Shield, 
  Rocket,
  ChevronRight,
  PenTool as Token,
  MessageSquare,
  Vote,
  Wallet,
  Code,
  Target,
  TrendingUp,
  Zap,
  Award,
  Globe,
  UserCircle,
  Lightbulb,
  Building2,
  Megaphone,
  Bot,
  DollarSign,
  Milestone,
  Lock,
  Timer,
  Briefcase,
  LineChart,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAddress, useDisconnect } from '@thirdweb-dev/react';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePhase, setActivePhase] = useState(1);
  const [showAuth, setShowAuth] = useState(false); // New state variable
  const [showHome, setShowHome] = useState(false); // New state for Home page
 
  
  const address = useAddress();
  const disconnect = useDisconnect();

  const handleSignOut = () => { 
    console.log(`${address} signed out`);
    disconnect(); // Disconnect the wallet
    setIsAuthenticated(false); // Set isAuthenticated to false
    setShowHome(false); // Hide Home page
    
  }

  // if (showAuth) {
  //   return <Auth setShowAuth={setShowAuth} />; // Pass setShowAuth as a prop
  // }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 to-gray-800/95" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Hero Section */}
        <header className="container mx-auto px-6 pt-8">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">IMARA</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#roles" className="text-gray-300 hover:text-white transition-colors">Roles</a>
              <a href="#process" className="text-gray-300 hover:text-white transition-colors">Process</a>
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">Benefits</a>
              <button
                onClick={() => setShowAuth(true)} // Added onClick handler
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg transition-all">
                Sign In
              </button>
              {showAuth && (
                <div className="flex justify-center mb-20">
                  <ConnectButton
                    client={client}
                    appMetadata={{
                      name: "Example app",
                      url: "https://example.com",
                    }}
                  />
                </div>
              )}
            </div>
          </nav>

          

          {/* Stats Section */}

        </header>

        {/* User Roles Section */}
        

            {/* Phase Selector */}
            

            {/* Phase Content */}
           

        {/* Key Features */}
       

        {/* Benefits */}
        

        CTA
        

        {/* Footer */}
       
      </div>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold mb-1">{number}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

function RoleCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl hover:bg-gray-700/50 transition-all group">
      <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "w-7 h-7 text-purple-400" })}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl hover:bg-gray-700/50 transition-all group">
      <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "w-7 h-7 text-blue-400" })}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function BenefitCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl hover:bg-gray-700/50 transition-all group">
      <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "w-7 h-7 text-indigo-400" })}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function PhaseContent({ title, description, steps }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 mb-8">{description}</p>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              {React.cloneElement(step.icon, { className: "w-6 h-6 text-blue-400" })}
            </div>
            <div className="flex-1">
              <p className="text-gray-300">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// export default App;