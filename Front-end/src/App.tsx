import React from 'react';
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
  Globe
} from 'lucide-react';

function App() {
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
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#process" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
              <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">Benefits</a>
              <button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg transition-all">
                Sign In
              </button>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="inline-block px-4 py-1 bg-blue-500/10 rounded-full text-blue-400 text-sm font-semibold mb-6">
              Revolutionizing Idea Development
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 text-transparent bg-clip-text leading-tight">
              Transform Ideas into Reality with IMARA
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              A decentralized platform where brilliant ideas meet collaborative execution, powered by blockchain and AI technologies.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2">
                Get Started <ChevronRight className="w-5 h-5" />
              </button>
              <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:bg-white/20">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 py-12 px-6 bg-white/5 backdrop-blur-sm rounded-2xl mb-20">
            <StatCard number="1000+" label="Active Projects" />
            <StatCard number="50k+" label="Community Members" />
            <StatCard number="$2M+" label="Total Investments" />
            <StatCard number="95%" label="Success Rate" />
          </div>
        </header>

        {/* Key Features */}
        <section id="features" className="py-20 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-purple-500/10 rounded-full text-purple-400 text-sm font-semibold mb-4">
                Platform Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our comprehensive suite of tools and features empowers your journey from ideation to execution.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Token />}
                title="Idea Tokenization"
                description="Transform ideas into valuable tokens, enabling stakeholder participation and investment"
              />
              <FeatureCard
                icon={<MessageSquare />}
                title="Collaboration Hub"
                description="Connect with experts, developers, and investors in a unified workspace"
              />
              <FeatureCard
                icon={<Vote />}
                title="Democratic Governance"
                description="Community-driven decision making through transparent voting mechanisms"
              />
              <FeatureCard
                icon={<Wallet />}
                title="Secure Payments"
                description="Milestone-based escrow payments ensuring fair compensation"
              />
              <FeatureCard
                icon={<Code />}
                title="AI Integration"
                description="Leverage AI for idea generation, refinement, and market analysis"
              />
              <FeatureCard
                icon={<Target />}
                title="Progress Tracking"
                description="Monitor project milestones and achievements in real-time"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="process" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-blue-500/10 rounded-full text-blue-400 text-sm font-semibold mb-4">
                Simple Process
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How IMARA Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our streamlined process makes it easy to bring your ideas to life through collaboration.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              <ProcessCard
                icon={<Brain />}
                step="01"
                title="Submit Your Idea"
                description="Share your innovative concept or let our AI help generate and refine ideas"
              />
              <ProcessCard
                icon={<Users />}
                step="02"
                title="Build Your Team"
                description="Connect with experts, contributors, and investors who believe in your vision"
              />
              <ProcessCard
                icon={<Rocket />}
                step="03"
                title="Launch & Scale"
                description="Execute your project with community support and transparent governance"
              />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="py-20 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-indigo-500/10 rounded-full text-indigo-400 text-sm font-semibold mb-4">
                Why Choose Us
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The IMARA Advantage</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Experience the benefits of our decentralized ecosystem for idea development.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BenefitCard
                icon={<Workflow />}
                title="Streamlined Execution"
                description="Transform complex ideas into manageable, achievable milestones with expert guidance"
              />
              <BenefitCard
                icon={<Shield />}
                title="Secure & Transparent"
                description="Blockchain-powered security ensuring transparent processes and fair compensation"
              />
              <BenefitCard
                icon={<TrendingUp />}
                title="Market Growth"
                description="Access to a growing ecosystem of innovators, investors, and industry experts"
              />
              <BenefitCard
                icon={<Zap />}
                title="AI-Powered"
                description="Leverage artificial intelligence for idea validation and optimization"
              />
              <BenefitCard
                icon={<Award />}
                title="Quality Assurance"
                description="Rigorous vetting process ensures high-quality projects and contributors"
              />
              <BenefitCard
                icon={<Globe />}
                title="Global Reach"
                description="Connect with talent and opportunities from around the world"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              </div>
              <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to Bring Your Ideas to Life?</h2>
                <p className="text-xl text-gray-100 mb-12 max-w-2xl mx-auto">
                  Join our community of innovators, creators, and builders. Transform the way ideas become reality.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:bg-gray-100">
                    Join IMARA Today
                  </button>
                  <button className="bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:bg-white/20">
                    Schedule a Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900/80 backdrop-blur-sm py-12">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <span className="text-xl font-bold">IMARA</span>
                </div>
                <p className="text-gray-400">
                  Transforming how ideas evolve into impactful realities through decentralized collaboration.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>© 2024 IMARA Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
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

function ProcessCard({ icon, step, title, description }) {
  return (
    <div className="text-center group">
      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "w-10 h-10 text-purple-400" })}
      </div>
      <div className="text-sm font-semibold text-purple-400 mb-2">Step {step}</div>
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

export default App;