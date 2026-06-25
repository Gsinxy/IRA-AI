import React from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  BookOpen, 
  Shield, 
  MessageSquare, 
  Compass, 
  Award, 
  Target, 
  Landmark, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onStart: (view: 'login' | 'register') => void;
  darkMode: boolean;
}

export default function LandingPage({ onStart, darkMode }: LandingPageProps) {
  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 font-sans ${
      darkMode ? 'bg-[#141413] text-[#e6e4db]' : 'bg-[#faf9f5] text-[#141413]'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 ${
        darkMode ? 'border-[#31302b] bg-[#141413]/80' : 'border-[#dedcd1] bg-[#faf9f5]/80'
      } py-5 px-6 sm:px-12`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <div className={`p-2 border rounded-xl transition-all duration-300 ${
              darkMode ? 'border-rose-500/30 bg-rose-500/10' : 'border-rose-200 bg-rose-50'
            }`}>
              <GraduationCap className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight">IRA AI</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onStart('login')}
              className={`text-sm font-medium hover:underline transition-all cursor-pointer ${
                darkMode ? 'text-[#e6e4db] hover:text-white' : 'text-[#141413] hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => onStart('register')}
              className={`px-5 py-2.5 border text-sm font-semibold tracking-wide transition-all duration-250 cursor-pointer rounded-full ${
                darkMode 
                  ? 'bg-[#e6e4db] text-[#141413] border-[#e6e4db] hover:bg-white hover:scale-[1.03] hover:shadow-lg hover:shadow-white/5' 
                  : 'bg-[#141413] text-[#faf9f5] border-[#141413] hover:bg-black/90 hover:scale-[1.03] hover:shadow-lg hover:shadow-black/10'
              }`}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1">
        
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-12 py-20 sm:py-32 text-center flex flex-col justify-center items-center">
          <span className={`text-xs uppercase tracking-[0.2em] font-semibold px-4 py-1.5 border mb-8 rounded-full inline-flex items-center gap-2 ${
            darkMode ? 'border-rose-500/30 text-rose-300 bg-rose-500/10' : 'border-rose-200 text-rose-700 bg-rose-50'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            Personalized Ivy League-Grade Support
          </span>
          
          <h1 className="font-serif text-4xl sm:text-7xl font-semibold tracking-tight mb-8 max-w-4xl leading-[1.12]">
            Democratizing advanced <span className="font-light italic text-rose-500">academic intelligence</span> for every learner.
          </h1>
          
          <p className={`text-lg sm:text-xl max-w-2xl mb-12 leading-relaxed font-light ${
            darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'
          }`}>
            IRA AI is an elite, concept-first tutor. Get deep explanation structures, intuitive analogies, and rigorous academic guidance tailored to your specific college coursework.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-24">
            <button
              onClick={() => onStart('register')}
              className={`px-8 py-4 border font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer rounded-full group ${
                darkMode 
                  ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600 hover:scale-[1.03] hover:shadow-lg hover:shadow-rose-500/25' 
                  : 'bg-[#141413] text-[#faf9f5] border-[#141413] hover:bg-black hover:scale-[1.03] hover:shadow-lg hover:shadow-black/20'
              }`}
            >
              Create Academic Profile
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <button
              onClick={() => onStart('login')}
              className={`px-8 py-4 border font-bold text-sm uppercase tracking-wider transition-all cursor-pointer rounded-full ${
                darkMode 
                  ? 'border-[#31302b] text-[#faf9f5] bg-[#1c1b18] hover:bg-[#252420] hover:scale-[1.03]' 
                  : 'border-[#dedcd1] text-[#141413] bg-white hover:bg-[#f3f2ee] hover:scale-[1.03]'
              }`}
            >
              Access My Workspace
            </button>
          </div>

          {/* Core Feature Row */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t pt-16 text-left ${
            darkMode ? 'border-[#31302b]' : 'border-[#dedcd1]'
          }`}>
            <div className="group flex flex-col p-6 rounded-2xl transition-all duration-300 hover:bg-[#1c1b18]/40 dark:hover:bg-[#1c1b18]/40 hover:bg-white/50 border border-transparent hover:border-[#dedcd1] dark:hover:border-[#31302b]">
              <div className={`w-12 h-12 flex items-center justify-center border rounded-xl mb-5 transition-transform duration-300 group-hover:scale-110 ${
                darkMode ? 'border-[#31302b] bg-[#1c1b18]' : 'border-[#dedcd1] bg-white'
              }`}>
                <BookOpen className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="font-serif text-lg font-bold mb-3">Deep Concept Breakdown</h3>
              <p className={`text-sm leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
                Goes beyond quick answers. IRA teaches step-by-step logic, custom formulas, and intuitive real-world analogies.
              </p>
            </div>

            <div className="group flex flex-col p-6 rounded-2xl transition-all duration-300 hover:bg-[#1c1b18]/40 dark:hover:bg-[#1c1b18]/40 hover:bg-white/50 border border-transparent hover:border-[#dedcd1] dark:hover:border-[#31302b]">
              <div className={`w-12 h-12 flex items-center justify-center border rounded-xl mb-5 transition-transform duration-300 group-hover:scale-110 ${
                darkMode ? 'border-[#31302b] bg-[#1c1b18]' : 'border-[#dedcd1] bg-white'
              }`}>
                <MessageSquare className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="font-serif text-lg font-bold mb-3">Claude-Inspired Interface</h3>
              <p className={`text-sm leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
                A serene, distraction-free drafting board designed for deep focus, featuring pristine markdown formatting and code highlighting.
              </p>
            </div>

            <div className="group flex flex-col p-6 rounded-2xl transition-all duration-300 hover:bg-[#1c1b18]/40 dark:hover:bg-[#1c1b18]/40 hover:bg-white/50 border border-transparent hover:border-[#dedcd1] dark:hover:border-[#31302b]">
              <div className={`w-12 h-12 flex items-center justify-center border rounded-xl mb-5 transition-transform duration-300 group-hover:scale-110 ${
                darkMode ? 'border-[#31302b] bg-[#1c1b18]' : 'border-[#dedcd1] bg-white'
              }`}>
                <Shield className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="font-serif text-lg font-bold mb-3">Personalized Context</h3>
              <p className={`text-sm leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
                Set your school and major inside your profile to customize explanations to your precise academic coursework perspective.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: About IRA AI */}
        <section className={`border-t py-24 sm:py-32 ${
          darkMode ? 'border-[#31302b] bg-[#1c1b18]/30' : 'border-[#dedcd1] bg-white/30'
        }`}>
          <div className="max-w-6xl mx-auto px-6 sm:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              <div className="lg:col-span-5">
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-rose-500 block mb-3">The Platform</span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                  About IRA AI
                </h2>
                <div className={`h-1 w-20 bg-rose-500 mt-6 rounded-full`} />
                <p className={`mt-8 text-base leading-relaxed font-light ${
                  darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'
                }`}>
                  IRA AI is an academic intelligence platform founded by Gaurav Naik, a student of the Department of Economics at Government Autonomous College, Sundargarh.
                </p>
                <p className={`mt-4 text-base leading-relaxed font-light ${
                  darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'
                }`}>
                  The idea behind IRA AI was born from a simple observation: many talented students in rural and semi-urban areas do not have access to the same educational resources, mentorship, and premium AI tools available to students in major cities.
                </p>
              </div>
              
              <div className="lg:col-span-7 space-y-6">
                <div className={`p-8 border rounded-3xl transition-all duration-300 ${
                  darkMode ? 'border-[#31302b] bg-[#141413]' : 'border-[#dedcd1] bg-white shadow-xs'
                }`}>
                  <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-rose-500" /> Bridging the Opportunity Gap
                  </h3>
                  <p className={`text-sm leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    IRA AI was created to bridge that gap. By combining artificial intelligence with personalized academic support, IRA AI helps students understand concepts, solve problems, prepare assignments, explore career opportunities, and learn more effectively.
                  </p>
                </div>

                <div className={`p-8 border rounded-3xl transition-all duration-300 ${
                  darkMode ? 'border-[#31302b] bg-[#141413]' : 'border-[#dedcd1] bg-white shadow-xs'
                }`}>
                  <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-rose-500" /> Our Core Mission
                  </h3>
                  <p className={`text-sm leading-relaxed font-light mb-4 ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Our mission is to make high-quality AI-powered education affordable and accessible to everyone, regardless of their location or financial background.
                  </p>
                  <p className={`text-sm leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    We believe every student deserves access to world-class learning tools, not just those who can afford expensive subscriptions. IRA AI is building a future where every learner has a personal academic companion available anytime, anywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why We Started Section */}
        <section className={`border-t py-20 ${
          darkMode ? 'border-[#31302b] bg-transparent' : 'border-[#dedcd1] bg-transparent'
        }`}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-rose-500 block mb-3">The Impetus</span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-6">Why We Started</h2>
            <p className={`text-base sm:text-lg leading-relaxed font-light max-w-3xl mx-auto ${
              darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'
            }`}>
              Many students in rural areas struggle to access quality mentorship, premium AI tools, research assistance, and career guidance. IRA AI was created to ensure that students from places like Sundargarh can learn with the same level of support available to students anywhere in the world.
            </p>
          </div>
        </section>

        {/* Section 2: Founder Story */}
        <section className={`border-t py-24 sm:py-32 relative overflow-hidden ${
          darkMode ? 'border-[#31302b] bg-[#141413]' : 'border-[#dedcd1] bg-[#faf9f5]'
        }`}>
          <div className="max-w-6xl mx-auto px-6 sm:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-rose-500 block mb-3">The Founder</span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-6">Gaurav Naik</h2>
                <p className="font-mono text-sm tracking-wide text-neutral-500 font-semibold uppercase mb-1">Department of Economics</p>
                <p className={`text-sm font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>Government Autonomous College, Sundargarh</p>
                
                <div className={`mt-8 p-6 border rounded-2xl flex items-center gap-4 w-full text-left transition-all ${
                  darkMode ? 'border-[#31302b] bg-[#1c1b18]/60' : 'border-[#dedcd1] bg-white'
                }`}>
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg font-serif font-bold">
                    GN
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm">Gaurav Naik</h4>
                    <p className="text-xs text-neutral-400">Pioneering Academic Equity in India</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className={`p-10 sm:p-12 border rounded-3xl relative transition-all duration-300 ${
                  darkMode ? 'border-[#31302b] bg-[#1c1b18]/50' : 'border-[#dedcd1] bg-white shadow-md'
                }`}>
                  <div className="absolute top-6 left-6 text-6xl font-serif text-rose-500/20 leading-none select-none">“</div>
                  <blockquote className="relative z-10">
                    <p className={`font-serif text-lg sm:text-2xl leading-relaxed font-light italic mb-8 ${
                      darkMode ? 'text-[#e6e4db]' : 'text-[#141413]'
                    }`}>
                      Education should not depend on where you live or how much you can pay. My goal is to make advanced AI learning tools accessible to every student and create equal opportunities through technology.
                    </p>
                    <cite className="not-italic flex items-center gap-2">
                      <span className="w-6 h-[1px] bg-rose-500" />
                      <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">Gaurav Naik, Founder of IRA AI</span>
                    </cite>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 & 4: Problems We Solve & Key Benefits */}
        <section className={`border-t py-24 sm:py-32 ${
          darkMode ? 'border-[#31302b] bg-[#1c1b18]/20' : 'border-[#dedcd1] bg-white'
        }`}>
          <div className="max-w-6xl mx-auto px-6 sm:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-rose-500 block mb-3">Academic Challenges</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-6">Restoring Educational Balance</h2>
              <p className={`text-base font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                Why standard models fail students in regional areas, and how IRA AI serves as a powerful equalizer.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Problems Column */}
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold mb-6 text-rose-500/90 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Problems We Solve
                </h3>
                
                <div className={`p-6 border rounded-2xl transition-all ${
                  darkMode ? 'border-[#31302b] bg-[#141413]/50' : 'border-[#dedcd1] bg-[#faf9f5]'
                }`}>
                  <h4 className="font-serif font-bold text-base mb-2">1. Rural Educational Divide</h4>
                  <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Students outside large metropolitan centers struggle to access quality immediate mentorship, tutoring support, and custom curriculum guides.
                  </p>
                </div>

                <div className={`p-6 border rounded-2xl transition-all ${
                  darkMode ? 'border-[#31302b] bg-[#141413]/50' : 'border-[#dedcd1] bg-[#faf9f5]'
                }`}>
                  <h4 className="font-serif font-bold text-base mb-2">2. Prohibitive Cost Barriers</h4>
                  <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Advanced subscription-based AI models and online platforms charges excessive fees, making them completely inaccessible for average public college budgets.
                  </p>
                </div>

                <div className={`p-6 border rounded-2xl transition-all ${
                  darkMode ? 'border-[#31302b] bg-[#141413]/50' : 'border-[#dedcd1] bg-[#faf9f5]'
                }`}>
                  <h4 className="font-serif font-bold text-base mb-2">3. Disconnected Personalization</h4>
                  <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    General chatbots operate on universal models, completely ignoring a student's custom college affiliations, syllabus structures, and academic majors.
                  </p>
                </div>
              </div>

              {/* Benefits Column */}
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold mb-6 text-emerald-500 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Key Benefits
                </h3>

                <div className={`p-6 border rounded-2xl transition-all ${
                  darkMode ? 'border-[#31302b] bg-[#141413]/50' : 'border-[#dedcd1] bg-[#faf9f5]'
                }`}>
                  <h4 className="font-serif font-bold text-base mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Concept-First Tutorial Logic
                  </h4>
                  <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Rather than copying answers, IRA triggers logical step-by-step concepts, derivations, and historical analogies designed for cognitive absorption.
                  </p>
                </div>

                <div className={`p-6 border rounded-2xl transition-all ${
                  darkMode ? 'border-[#31302b] bg-[#141413]/50' : 'border-[#dedcd1] bg-[#faf9f5]'
                }`}>
                  <h4 className="font-serif font-bold text-base mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Democratized Platform Cost
                  </h4>
                  <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Highly optimized backends deliver advanced enterprise-grade models under affordable tiers designed specifically for public university college budgets.
                  </p>
                </div>

                <div className={`p-6 border rounded-2xl transition-all ${
                  darkMode ? 'border-[#31302b] bg-[#141413]/50' : 'border-[#dedcd1] bg-[#faf9f5]'
                }`}>
                  <h4 className="font-serif font-bold text-base mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Adaptive Workspace Environment
                  </h4>
                  <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Your workspace reads your educational profile to customize examples, terminology, and reference guides corresponding exactly to your actual curriculum.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: How IRA AI Works */}
        <section className={`border-t py-24 sm:py-32 ${
          darkMode ? 'border-[#31302b] bg-[#141413]' : 'border-[#dedcd1] bg-[#faf9f5]'
        }`}>
          <div className="max-w-6xl mx-auto px-6 sm:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-rose-500 block mb-3">Visual Step Guide</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-6">How IRA AI Works</h2>
              <p className={`text-base font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                Follow our streamlined onboarding process to transition from generic answers to tailored scholastic comprehension.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="flex flex-col items-center md:items-start p-6 text-center md:text-left relative">
                <span className="font-serif text-6xl font-bold text-rose-500/10 mb-4 select-none">01</span>
                <h4 className="font-serif text-lg font-bold mb-2">Build Profile</h4>
                <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
                  Register your account and customize your academic details including university, major, and research discipline.
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start p-6 text-center md:text-left relative">
                <span className="font-serif text-6xl font-bold text-rose-500/10 mb-4 select-none">02</span>
                <h4 className="font-serif text-lg font-bold mb-2">Pose Inquiries</h4>
                <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
                  Submit assignment prompts, math equations, research papers, or complex economics models onto the workspace.
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start p-6 text-center md:text-left relative">
                <span className="font-serif text-6xl font-bold text-rose-500/10 mb-4 select-none">03</span>
                <h4 className="font-serif text-lg font-bold mb-2">Absorb Concepts</h4>
                <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
                  Study adaptive step-by-step logic, custom-derived solutions, real-world analogies, and robust visual outlines.
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start p-6 text-center md:text-left relative">
                <span className="font-serif text-6xl font-bold text-rose-500/10 mb-4 select-none">04</span>
                <h4 className="font-serif text-lg font-bold mb-2">Master Coursework</h4>
                <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
                  Excel in exams, generate rigorous academic content, study for competitive programs, and map precise career trajectories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Vision & Roadmap */}
        <section className={`border-t py-24 sm:py-32 ${
          darkMode ? 'border-[#31302b] bg-[#1c1b18]/30' : 'border-[#dedcd1] bg-white/30'
        }`}>
          <div className="max-w-6xl mx-auto px-6 sm:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              
              <div className="lg:col-span-5">
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-rose-500 block mb-3">Strategic Blueprint</span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-8">Vision & Roadmap</h2>
                
                <div className="space-y-6">
                  <div className={`p-6 border rounded-2xl ${
                    darkMode ? 'border-[#31302b] bg-[#141413]' : 'border-[#dedcd1] bg-white'
                  }`}>
                    <h4 className="font-serif font-bold text-sm text-rose-500 flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4" /> Vision
                    </h4>
                    <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                      To become India's most accessible AI-powered academic platform and empower millions of students with affordable, intelligent learning support.
                    </p>
                  </div>

                  <div className={`p-6 border rounded-2xl ${
                    darkMode ? 'border-[#31302b] bg-[#141413]' : 'border-[#dedcd1] bg-white'
                  }`}>
                    <h4 className="font-serif font-bold text-sm text-rose-500 flex items-center gap-2 mb-2">
                      <Compass className="w-4 h-4" /> Mission
                    </h4>
                    <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                      To make premium AI capabilities affordable and available to every student while improving the quality of education in rural and underserved communities through technology.
                    </p>
                  </div>
                </div>
              </div>

              {/* Roadmap Timeline */}
              <div className="lg:col-span-7 space-y-8 relative pl-6 sm:pl-8">
                <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-neutral-300 dark:bg-neutral-800" />

                <div className="relative">
                  <div className="absolute -left-[27px] sm:-left-[31px] top-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-[#141413] z-10" />
                  <span className="font-mono text-[10px] text-neutral-400 font-bold tracking-widest uppercase">Phase 1 (Active)</span>
                  <h4 className="font-serif font-bold text-lg mb-2">Concept-First Workspace</h4>
                  <p className={`text-xs font-light leading-relaxed ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Deploying the multi-model core workspace, custom student profiles, structured file uploads, and active learning dashboard configurations.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[27px] sm:-left-[31px] top-1 w-3 h-3 rounded-full bg-neutral-400 border-2 border-white dark:border-[#141413] z-10" />
                  <span className="font-mono text-[10px] text-neutral-400 font-bold tracking-widest uppercase">Phase 2 (In Development)</span>
                  <h4 className="font-serif font-bold text-lg mb-2">Regional Curriculum Alignment</h4>
                  <p className={`text-xs font-light leading-relaxed ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Partnering directly with local public educators to ingest custom college syllabus outlines, recommended course guides, and exam archives.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[27px] sm:-left-[31px] top-1 w-3 h-3 rounded-full bg-neutral-400 border-2 border-white dark:border-[#141413] z-10" />
                  <span className="font-mono text-[10px] text-neutral-400 font-bold tracking-widest uppercase">Phase 3 (Upcoming)</span>
                  <h4 className="font-serif font-bold text-lg mb-2">Voice Assistant Public Launch</h4>
                  <p className={`text-xs font-light leading-relaxed ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Graduating the dual-duplex Live Voice Assistant (currently in Founder Beta) to public student circles with minimal network bandwidth requirements.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[27px] sm:-left-[31px] top-1 w-3 h-3 rounded-full bg-neutral-400 border-2 border-white dark:border-[#141413] z-10" />
                  <span className="font-mono text-[10px] text-neutral-400 font-bold tracking-widest uppercase">Phase 4 (Expansion)</span>
                  <h4 className="font-serif font-bold text-lg mb-2">The Rural Equalizer Program</h4>
                  <p className={`text-xs font-light leading-relaxed ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                    Launching national sponsorships to deploy custom sponsored computer packages and free terminal access accounts inside hostel systems.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 7: College Partnership Section */}
        <section className={`border-t py-24 sm:py-32 text-center relative overflow-hidden ${
          darkMode ? 'border-[#31302b] bg-[#141413]' : 'border-[#dedcd1] bg-[#faf9f5]'
        }`}>
          <div className="max-w-4xl mx-auto px-6 sm:px-12">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-rose-500 block mb-4">Academic Alliance</span>
            
            <div className="inline-flex items-center justify-center p-3 border rounded-2xl mb-6 bg-white dark:bg-[#1c1b18] border-neutral-200 dark:border-neutral-800">
              <Landmark className="w-8 h-8 text-rose-500" />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-6">
              Government Autonomous College, Sundargarh
            </h2>
            
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-8">
              Pioneering Academic Research Site • Established 1948 • Odisha, India
            </p>

            <div className={`p-8 border rounded-3xl transition-all duration-300 max-w-2xl mx-auto ${
              darkMode ? 'border-[#31302b] bg-[#1c1b18]/50' : 'border-[#dedcd1] bg-white shadow-xs'
            }`}>
              <p className={`text-sm leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#5c5b54]'}`}>
                Proudly pioneered by student Gaurav Naik within the Department of Economics. Our goal is to expand partnership networks to other public and government autonomous colleges to deploy customized, low-bandwidth academic AI companions in administrative blocks, libraries, and hostels.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Section 8: Professional Footer */}
      <footer className={`border-t py-16 px-6 sm:px-12 transition-colors duration-200 ${
        darkMode ? 'border-[#31302b] bg-[#1c1b18]/50' : 'border-[#dedcd1] bg-white'
      }`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-rose-500" />
              <span className="font-serif text-xl font-bold tracking-tight">IRA AI</span>
            </div>
            <p className={`text-xs leading-relaxed font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
              An academic intelligence platform bridging the educational gap through premium concept-first artificial intelligence tutoring.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold mb-4">Core Platform</h4>
            <ul className={`text-xs space-y-2.5 font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
              <li><button onClick={() => onStart('register')} className="hover:text-rose-500 transition-colors">Concept breakdowns</button></li>
              <li><button onClick={() => onStart('register')} className="hover:text-rose-500 transition-colors">Academic profile config</button></li>
              <li><button onClick={() => onStart('register')} className="hover:text-rose-500 transition-colors">File analysis engine</button></li>
              <li><span className="text-neutral-400 dark:text-neutral-600">Voice practice (Founder Beta)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold mb-4">Regional Center</h4>
            <ul className={`text-xs space-y-2.5 font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
              <li>Department of Economics</li>
              <li>Government Autonomous College</li>
              <li>Sundargarh District, Odisha</li>
              <li>India</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-bold mb-4">Intellectual Integrity</h4>
            <ul className={`text-xs space-y-2.5 font-light ${darkMode ? 'text-[#a09e95]' : 'text-[#706e64]'}`}>
              <li>No copy-paste answers</li>
              <li>Step-by-step cognitive learning</li>
              <li>Low-bandwidth accessibility</li>
              <li>Affordable student plans</li>
            </ul>
          </div>

        </div>

        <div className={`border-t pt-8 text-center text-xs tracking-wider flex flex-col sm:flex-row justify-between items-center gap-4 ${
          darkMode ? 'border-[#31302b] text-[#706e64]' : 'border-[#dedcd1] text-[#a09e95]'
        }`}>
          <p>© {new Date().getFullYear()} IRA AI — Built for Intellectual Integrity & Academic Rigor.</p>
          <div className="flex gap-6">
            <span className="hover:text-rose-500 transition-colors">Gaurav Naik Initiative</span>
            <span className="hover:text-rose-500 transition-colors">Odisha Rural EdTech</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
