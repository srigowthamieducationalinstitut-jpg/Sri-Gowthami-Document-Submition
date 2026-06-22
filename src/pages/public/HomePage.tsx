import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { GraduationCap, ArrowRight, CheckCircle2, Users, BookOpen, Trophy } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">Sri Gowthami</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-primary-600 transition-colors">About</a>
            <a href="#why-choose-us" className="hover:text-primary-600 transition-colors">Why Choose Us</a>
            <a href="#records" className="hover:text-primary-600 transition-colors">Our Records</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:shadow-primary-500/30 transition-all flex items-center gap-2"
            >
              Take Admission <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="px-4 py-2 rounded-full bg-primary-50 text-primary-600 text-sm font-bold tracking-wide uppercase mb-6 inline-block">
              Admissions Open 2026-27
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Empowering Minds, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                Shaping Futures
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Join Sri Gowthami Junior College, where academic excellence meets holistic development. Secure your future with our proven track record of success.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Take Admission Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
        <div className="flex-1 relative">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="aspect-[4/3] rounded-3xl bg-slate-200 overflow-hidden relative shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
                alt="Students on campus" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us & Records */}
      <section id="why-choose-us" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Sri Gowthami?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We don't just teach; we inspire. Our state-of-the-art facilities and experienced faculty ensure every student reaches their full potential.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { icon: BookOpen, title: 'Expert Faculty', desc: 'Learn from highly qualified educators with decades of combined experience in shaping bright minds.' },
              { icon: Trophy, title: 'Proven Track Record', desc: 'Consistent top state ranks and high placement rates in premier engineering and medical institutions.' },
              { icon: Users, title: 'Holistic Environment', desc: 'Focus on character building, sports, and extracurriculars alongside rigorous academics.' }
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-primary-500/5 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <div id="records" className="bg-primary-600 rounded-3xl p-12 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <GraduationCap className="w-64 h-64" />
            </div>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'State Ranks', value: '150+' },
                { label: 'Pass Percentage', value: '98%' },
                { label: 'Alumni', value: '10,000+' },
                { label: 'Years of Excellence', value: '25+' }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl lg:text-5xl font-extrabold mb-2">{stat.value}</div>
                  <div className="text-primary-100 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400">
        <p className="flex items-center justify-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5" />
          <span className="font-bold text-white tracking-wide">Sri Gowthami</span>
        </p>
        <p className="text-sm text-slate-500">© 2026 Sri Gowthami Junior College. All rights reserved.</p>
      </footer>
    </div>
  )
}
