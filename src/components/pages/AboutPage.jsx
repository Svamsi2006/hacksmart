import { motion } from 'framer-motion';
import { 
  Zap, Shield, TrendingUp, Brain, Clock, Users, 
  DollarSign, BarChart3, Phone, Cpu, CheckCircle2,
  AlertTriangle, Target, Sparkles, Globe, Server,
  Database, Cloud, Lock, Award, Rocket, LineChart
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Card from '../shared/Card';

const AboutPage = () => {
  const { isDarkMode } = useTheme();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Key Stats
  const keyStats = [
    { value: '100%', label: 'Call Coverage', sublabel: 'vs 2-3% manual', icon: Phone, color: 'emerald' },
    { value: '₹1.5Cr+', label: 'Annual Savings', sublabel: 'Revenue protected', icon: DollarSign, color: 'teal' },
    { value: '4 AI', label: 'Models Used', sublabel: 'With fallback chain', icon: Brain, color: 'violet' },
    { value: 'Real-time', label: 'Analysis', sublabel: 'Instant insights', icon: Zap, color: 'amber' },
  ];

  // Problem & Solution
  const problems = [
    { problem: '10,000+ daily calls', solution: '100% automated auditing' },
    { problem: 'Manual QA covers only 2-3%', solution: 'AI analyzes every call' },
    { problem: 'Revenue leakage undetected', solution: 'Real-time leakage alerts' },
    { problem: 'Delayed agent coaching', solution: 'Instant coaching triggers' },
    { problem: 'No real-time visibility', solution: 'Live dashboard monitoring' },
  ];

  // Tech Stack
  const techStack = [
    { name: 'React 18 + Vite', purpose: 'Fast Modern UI', icon: '⚛️' },
    { name: 'Tailwind CSS', purpose: 'Beautiful Design', icon: '🎨' },
    { name: 'DistilBERT', purpose: 'Sentiment Analysis', icon: '🤖' },
    { name: 'BART-MNLI', purpose: 'Call Classification', icon: '📊' },
    { name: 'DistilRoBERTa', purpose: 'Emotion Detection', icon: '😊' },
    { name: 'Deepgram API', purpose: 'Hindi/English Transcription', icon: '🎤' },
    { name: 'Google Sheets', purpose: 'Live Data Source', icon: '📋' },
    { name: 'Vercel', purpose: 'Global CDN Deploy', icon: '🚀' },
  ];

  // Features
  const features = [
    { 
      title: 'Live Call Monitoring', 
      desc: 'Real-time dashboard with search, filter, pagination for 10,000+ calls',
      icon: Phone 
    },
    { 
      title: 'Call Latency Analysis', 
      desc: '3-part breakdown: Response Time, Hold Time, Resolution Time with grades',
      icon: Clock 
    },
    { 
      title: 'DistilBERT AI Analysis', 
      desc: 'Sentiment, Category Classification, Emotion Detection with confidence scores',
      icon: Brain 
    },
    { 
      title: 'Revenue Leakage Radar', 
      desc: 'Detect and prevent revenue loss from SOP violations and missed upsells',
      icon: TrendingUp 
    },
    { 
      title: 'Agent Coaching Panel', 
      desc: 'AI-generated coaching themes for agents with SOP adherence < 80%',
      icon: Users 
    },
    { 
      title: 'Supervisor Alerts', 
      desc: 'Critical alerts with one-line reasons, detailed reports, email notifications',
      icon: AlertTriangle 
    },
  ];

  // ROI Breakdown
  const roiData = [
    { metric: 'QA Team Savings', before: '₹4,00,000/month', after: '₹26,500/month', savings: '₹3,73,500' },
    { metric: 'Call Coverage', before: '3,000 calls (1%)', after: '300,000 calls (100%)', savings: '100x more' },
    { metric: 'Issue Detection', before: '1-2 days delay', after: 'Real-time', savings: '48+ hours' },
    { metric: 'Revenue Protected', before: 'Unknown leakage', after: 'Full visibility', savings: '₹43,900+' },
  ];

  // API Costs
  const apiCosts = [
    { service: 'Hugging Face', plan: 'FREE', limit: '30K requests/mo', cost: '₹0' },
    { service: 'Deepgram', plan: 'FREE', limit: '200 hours/mo', cost: '₹0' },
    { service: 'Google Sheets API', plan: 'FREE', limit: 'Unlimited', cost: '₹0' },
    { service: 'Vercel', plan: 'Hobby', limit: 'Unlimited', cost: '₹0' },
  ];

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Hero Section */}
      <motion.div 
        {...fadeIn}
        className={`relative overflow-hidden rounded-2xl p-8 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-violet-900/50 via-purple-900/30 to-indigo-900/50 border border-violet-500/30' 
            : 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700'
        }`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Smart-Audit AI</h1>
              <p className="text-white/80">AI-Powered Call Center Quality Monitoring</p>
            </div>
          </div>
          
          <p className="text-lg text-white/90 max-w-2xl mb-6">
            A complete solution for <strong>Battery Smart</strong> to automate call auditing, 
            detect revenue leakage, and improve agent performance using advanced AI models.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium backdrop-blur">
              🔋 Battery Smart Hackathon
            </span>
            <span className="px-4 py-2 rounded-full bg-teal-500/30 text-teal-100 text-sm font-medium backdrop-blur">
              ✅ Production Ready
            </span>
            <span className="px-4 py-2 rounded-full bg-emerald-500/30 text-emerald-100 text-sm font-medium backdrop-blur">
              💰 ₹0 API Cost
            </span>
          </div>
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {keyStats.map((stat, i) => (
          <Card key={i} className={`p-4 text-center ${isDarkMode ? 'bg-slate-800/50' : ''}`}>
            <div className={`w-12 h-12 mx-auto rounded-xl mb-3 flex items-center justify-center ${
              stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
              stat.color === 'teal' ? 'bg-teal-100 text-teal-600' :
              stat.color === 'violet' ? 'bg-violet-100 text-violet-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-navy'}`}>
              {stat.value}
            </p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {stat.label}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {stat.sublabel}
            </p>
          </Card>
        ))}
      </motion.div>

      {/* Problem vs Solution */}
      <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
        <Card className={`p-6 ${isDarkMode ? 'bg-slate-800/50' : ''}`}>
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>
            <Target className="w-5 h-5 text-teal" />
            Problem vs Solution
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2 px-3">❌ Current Problem</th>
                  <th className="text-left py-2 px-3">✅ Our Solution</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((item, i) => (
                  <tr key={i} className={`${isDarkMode ? 'border-t border-slate-700' : 'border-t border-gray-100'}`}>
                    <td className={`py-3 px-3 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {item.problem}
                    </td>
                    <td className={`py-3 px-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {item.solution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Features Grid */}
      <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>
          <Rocket className="w-5 h-5 text-violet-500" />
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <Card key={i} className={`p-4 ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'hover:shadow-lg'} transition-all`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                  <feature.icon className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-navy'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
        <Card className={`p-6 ${isDarkMode ? 'bg-slate-800/50' : ''}`}>
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>
            <Server className="w-5 h-5 text-teal" />
            Tech Stack & AI Models
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {techStack.map((tech, i) => (
              <div key={i} className={`p-3 rounded-xl text-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <span className="text-2xl">{tech.icon}</span>
                <p className={`font-medium text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-navy'}`}>
                  {tech.name}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tech.purpose}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* AI Pipeline Diagram */}
      <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
        <Card className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-violet-900/30' : 'bg-gradient-to-br from-violet-50 to-indigo-50'}`}>
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>
            <Brain className="w-5 h-5 text-violet-500" />
            AI Analysis Pipeline
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-sm">
            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
              🎤 Audio Recording
            </div>
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>→</span>
            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
              📝 Deepgram Transcription
            </div>
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>→</span>
            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
              🤖 DistilBERT Analysis
            </div>
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>→</span>
            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
              📊 Insights Dashboard
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              AI Pipeline: DistilBERT → BART-MNLI → DistilRoBERTa → Keyword Fallback
            </p>
          </div>
        </Card>
      </motion.div>

      {/* ROI Comparison */}
      <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
        <Card className={`p-6 ${isDarkMode ? 'bg-slate-800/50' : ''}`}>
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>
            <LineChart className="w-5 h-5 text-emerald-500" />
            ROI & Cost Savings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2 px-3">Metric</th>
                  <th className="text-left py-2 px-3">Before</th>
                  <th className="text-left py-2 px-3">After</th>
                  <th className="text-left py-2 px-3">Savings</th>
                </tr>
              </thead>
              <tbody>
                {roiData.map((item, i) => (
                  <tr key={i} className={`${isDarkMode ? 'border-t border-slate-700' : 'border-t border-gray-100'}`}>
                    <td className={`py-3 px-3 font-medium ${isDarkMode ? 'text-white' : 'text-navy'}`}>
                      {item.metric}
                    </td>
                    <td className={`py-3 px-3 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {item.before}
                    </td>
                    <td className={`py-3 px-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {item.after}
                    </td>
                    <td className={`py-3 px-3 font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                      {item.savings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* API Costs */}
      <motion.div {...fadeIn} transition={{ delay: 0.7 }}>
        <Card className={`p-6 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
            <DollarSign className="w-5 h-5" />
            Current API Costs (Hackathon Demo)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {apiCosts.map((api, i) => (
              <div key={i} className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-navy'}`}>
                  {api.service}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {api.plan}
                </p>
                <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {api.cost}
                </p>
              </div>
            ))}
          </div>
          <div className={`mt-4 p-3 rounded-lg text-center ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
            <p className={`font-bold text-lg ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              💰 Total Cost: ₹0/month (All Free Tiers)
            </p>
          </div>
        </Card>
      </motion.div>

      {/* USPs */}
      <motion.div {...fadeIn} transition={{ delay: 0.8 }}>
        <Card className={`p-6 ${isDarkMode ? 'bg-slate-800/50' : ''}`}>
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>
            <Award className="w-5 h-5 text-amber-500" />
            Why Smart-Audit AI Wins
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: '100% Coverage', desc: 'Every call audited vs 2-3%', icon: '✅' },
              { title: 'Real-time', desc: 'Instant analysis vs days', icon: '⚡' },
              { title: '4 AI Fallbacks', desc: 'Never fails to analyze', icon: '🛡️' },
              { title: 'Hindi + English', desc: 'Bilingual support', icon: '🌐' },
              { title: '₹0 Cost', desc: 'All free tier APIs', icon: '💰' },
              { title: 'Cyberpunk UI', desc: 'Beautiful dark mode', icon: '🎨' },
              { title: 'Mobile Ready', desc: 'Responsive design', icon: '📱' },
              { title: '3-Part Latency', desc: 'Detailed call analysis', icon: '⏱️' },
            ].map((usp, i) => (
              <div key={i} className={`p-3 rounded-lg flex items-center gap-3 ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <span className="text-2xl">{usp.icon}</span>
                <div>
                  <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-navy'}`}>
                    {usp.title}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {usp.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div {...fadeIn} transition={{ delay: 0.9 }}>
        <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-slate-800/30' : 'bg-gray-50'}`}>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-navy'}`}>
            🚀 Built for Battery Smart Hackathon 2026
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Powered by React • Tailwind • Hugging Face • Deepgram • Google Sheets
          </p>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Live Demo: hacksmart-rho.vercel.app | GitHub: Gundavenkatasai/hacksmart
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AboutPage;
