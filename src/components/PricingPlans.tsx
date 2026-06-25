import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Sparkles, 
  UploadCloud, 
  CreditCard, 
  GraduationCap, 
  Building2, 
  Users, 
  Wallet, 
  ArrowLeft, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  FileText, 
  Lock,
  Loader2,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

interface PricingPlansProps {
  user: any;
  token: string;
  darkMode: boolean;
  onBack: () => void;
  onUserProfileUpdated: (updatedUser: any) => void;
}

type TabType = 'personal' | 'education' | 'business';
type CycleType = 'yearly' | 'monthly';

export default function PricingPlans({ user, token, darkMode, onBack, onUserProfileUpdated }: PricingPlansProps) {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [billingCycle, setBillingCycle] = useState<CycleType>('yearly');
  
  // Custom Budget Interactive features
  const [userBudget, setUserBudget] = useState<number>(20);
  const [recommendedPlan, setRecommendedPlan] = useState<string>('IRA Pro');
  
  // Group seats multiplier for Business
  const [seats, setSeats] = useState<number>(5);

  // States for verification & checkout overlays
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<any | null>(null);
  const [verificationStep, setVerificationStep] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<boolean>(false);
  const [transactionProcessing, setTransactionProcessing] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Verification Input States
  const [eduEmail, setEduEmail] = useState<string>(user?.email || '');
  const [eduSchool, setEduSchool] = useState<string>(user?.school || '');
  const [eduGradYear, setEduGradYear] = useState<string>('2028');
  const [studentIdFile, setStudentIdFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Credit Card Form states
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>(user?.name || '');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Dynamic recommendation based on user budget and settings
  useEffect(() => {
    if (userBudget === 0) {
      setRecommendedPlan('Free Plan');
    } else if (userBudget > 0 && userBudget < 12) {
      setRecommendedPlan('Education Pro');
    } else if (userBudget >= 12 && userBudget < 30) {
      setRecommendedPlan('IRA Pro');
    } else if (userBudget >= 30 && userBudget < 100) {
      setRecommendedPlan('Enterprise Pro');
    } else if (userBudget >= 100 && userBudget < 250) {
      setRecommendedPlan('IRA Max');
    } else {
      setRecommendedPlan('Enterprise Max');
    }
  }, [userBudget]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setStudentIdFile(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStudentIdFile(e.target.files[0].name);
    }
  };

  const currentActivePlanName = user?.plan || 'Free';

  // Plans details map reflecting IRA plans layout exactly
  const plansData = {
    personal: [
      {
        id: 'free',
        name: 'Free',
        badge: '',
        priceMonthly: 0,
        priceYearly: 0,
        subtext: 'Answers with accurate AI and citations',
        desc: 'Answers with accurate AI and citations',
        durationText: '',
        actionLabel: currentActivePlanName === 'Free' ? 'Current Plan' : 'Downgrade to Free',
        features: [
          'Good for limited daily usage',
          'Better for simple questions',
          'Citations in every answer',
          'Access to basic AI models'
        ],
        btnStyle: 'border-[#dedcd1] hover:bg-[#f3f2ee]'
      },
      {
        id: 'pro',
        name: 'IRA Pro',
        badge: 'Popular',
        priceMonthly: 20,
        priceYearly: 17,
        subtext: 'Advanced answers and top AI models',
        desc: 'Everything in Free and:',
        durationText: '/month or equivalent, when billed annually',
        actionLabel: currentActivePlanName === 'IRA Pro' ? 'Active Plan' : 'Get Pro',
        features: [
          'Access to IRA Computer (+$40 free Computer credits, LIMITED TIME)',
          '4,000 bonus credits',
          'Access to the latest AI models, post-trained for higher accuracy',
          'Select between Gemini 3.1 Pro, Sonar 2, Claude Sonnet 4.6, and more',
          'Better for complex questions and building reports, documents, and apps',
          'Deeper sourcing from IRA’s index, including proprietary financial and scientific data'
        ],
        btnStyle: 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90'
      },
      {
        id: 'max',
        name: 'IRA Max',
        badge: 'Top Tier',
        priceMonthly: 200,
        priceYearly: 167,
        subtext: 'Unlimited usage and top performance',
        desc: 'Everything in Pro and:',
        durationText: '/month or equivalent, when billed annually',
        actionLabel: currentActivePlanName === 'IRA Max' ? 'Active Plan' : 'Get Max',
        features: [
          'Access to IRA Computer (+$450 free Computer credits, LIMITED TIME)',
          '35,000 bonus credits',
          '10,000 monthly credits',
          'Get the best answers with the most advanced AI reasoning models',
          'Run deep investigations at any scale',
          'Work with massive datasets and files',
          'Compare responses across multiple AI models'
        ],
        btnStyle: 'border-amber-600 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
      }
    ],
    education: [
      {
        id: 'free',
        name: 'Free',
        badge: '',
        priceMonthly: 0,
        priceYearly: 0,
        subtext: 'Answers with accurate AI and citations',
        desc: 'Answers with accurate AI and citations',
        durationText: '',
        actionLabel: currentActivePlanName === 'Free' ? 'Current Plan' : 'Downgrade to Free',
        features: [
          'Good for limited daily usage',
          'Better for simple questions',
          'Citations in every answer',
          'Access to basic AI models'
        ],
        btnStyle: 'border-[#dedcd1] hover:bg-[#f3f2ee]'
      },
      {
        id: 'edu_pro',
        name: 'Education Pro',
        badge: '50% off',
        priceMonthly: 11,
        priceYearly: 9,
        subtext: 'In-depth research and AI model selection',
        desc: 'Everything in Free and:',
        durationText: '/month or equivalent, when billed annually',
        actionLabel: currentActivePlanName === 'Education Pro' ? 'Active Plan' : 'Verify & Subscribe',
        features: [
          'Access to IRA Computer (+$40 free Computer credits, LIMITED TIME)',
          'Access to Gemini 3.1 Pro, Sonar 2, Claude Sonnet 4.6, and more',
          'Access to the latest AI models, post-trained for higher accuracy',
          'Increased document upload limits',
          'Better for complex questions and building reports, documents, and apps',
          'Usage limits for everyday academic research'
        ],
        btnStyle: 'bg-[#b59547] border-[#b59547] text-white hover:bg-opacity-90'
      }
    ],
    business: [
      {
        id: 'biz_pro',
        name: 'Enterprise Pro',
        badge: 'Business',
        priceMonthly: 40,
        priceYearly: 34,
        subtext: 'In-depth research and AI model selection',
        desc: 'Professional research and data isolation:',
        durationText: '/seat each month or equivalent',
        actionLabel: currentActivePlanName === 'Enterprise Pro' ? 'Active Plan' : 'Continue with Enterprise Pro',
        features: [
          'Access to IRA Computer (+$85 free Computer credits, LIMITED TIME)',
          'Guaranteed no training on your organization data',
          'Access to the latest AI models, post-trained for higher accuracy',
          'Search across the web, files and shared apps',
          'Premium source citations from PitchBook, Statista and more',
          'Manage user permissions and integrate with corporate SSO',
          'SOC 2 Type II, HIPAA, GDPR, PCI DSS compliance',
          'Dedicated Enterprise support 24/7'
        ],
        btnStyle: 'bg-[#141413] text-[#faf9f5] border-[#141413] dark:bg-[#faf9f5] dark:text-[#141413] dark:border-[#faf9f5] hover:opacity-90'
      },
      {
        id: 'biz_max',
        name: 'Enterprise Max',
        badge: 'Scale Multiplier',
        priceMonthly: 320,
        priceYearly: 271,
        subtext: 'Unlimited usage and top performance',
        desc: 'Everything in Enterprise Pro and:',
        durationText: '/seat each month or equivalent',
        actionLabel: currentActivePlanName === 'Enterprise Max' ? 'Active Plan' : 'Continue with Enterprise Max',
        features: [
          'Access to IRA Computer (+$550 free Computer credits, LIMITED TIME)',
          'Get the best answers with the most advanced AI reasoning models',
          'Run deep investigations at any scale with group resources',
          'Work with massive organizational datasets and files',
          'Compare responses across multiple premium AI models',
          'Priority access to newly trained enterprise models',
          'Premium security features including SCIM, audit logs, and custom retention guidelines'
        ],
        btnStyle: 'border-amber-600 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
      }
    ]
  };

  const activePlansList = plansData[activeTab];

  const handleInitiateUpgrade = (plan: any) => {
    if (plan.id === 'free') {
      // Direct downgrade simulation
      handleUpdatePlanDatabase('Free');
      return;
    }
    
    setSelectedUpgradePlan(plan);
    setPaymentError(null);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');

    if (plan.id === 'edu_pro') {
      // Show Verification First
      setVerificationStep(true);
      setCheckoutStep(false);
    } else {
      // Show Checkout First
      setVerificationStep(false);
      setCheckoutStep(true);
    }
  };

  const handleUpdatePlanDatabase = async (planName: string) => {
    try {
      setTransactionProcessing(true);
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          plan: planName,
          school: activeTab === 'education' ? eduSchool || user.school : user.school,
          major: user.major
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update plan status');
      }

      onUserProfileUpdated(data.user);
      setShowCelebration(true);
      setCheckoutStep(false);
      setVerificationStep(false);
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || 'Error executing checkout sequence.');
    } finally {
      setTransactionProcessing(false);
    }
  };

  const handleVerifyStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduEmail.includes('.edu') && !eduEmail.includes('school') && !eduEmail.includes('univ')) {
      alert('Please use a valid institution email or proceed with standard ID check.');
    }
    // Proceed to payment checkout step
    setVerificationStep(false);
    setCheckoutStep(true);
  };

  const handleCardPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setPaymentError('Invalid Card Number.');
      return;
    }
    if (!cardExpiry.includes('/')) {
      setPaymentError('Expiry date must match MM/YY format.');
      return;
    }
    if (cardCvv.length < 3) {
      setPaymentError('Invalid CVV code.');
      return;
    }

    setPaymentError(null);
    handleUpdatePlanDatabase(selectedUpgradePlan.name);
  };

  // Helper to format currency
  const formatDollar = (amount: number) => {
    return `US$${amount}`;
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto font-sans transition-colors duration-200 ${
      darkMode ? 'bg-[#141413] text-[#faf9f5]' : 'bg-[#faf9f5] text-[#141413]'
    }`}>
      {/* Top Breadcrumb Bar */}
      <div className={`sticky top-0 px-6 py-4 border-b flex justify-between items-center z-13 backdrop-blur-md ${
        darkMode ? 'border-[#31302b] bg-[#141413]/90' : 'border-[#dedcd1] bg-[#faf9f5]/90'
      }`}>
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider cursor-pointer ${
            darkMode ? 'text-[#a09e95] hover:text-[#faf9f5]' : 'text-[#706e64] hover:text-[#141413]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Desk</span>
        </button>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-amber-500 font-bold">
            PRO GRADE CAPABILITIES
          </span>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto p-6 lg:p-10 space-y-12">
        
        {/* Intro Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin animate-duration-3000" />
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-amber-505 dark:text-amber-400">
              Upgrade Your Intelligence Engine
            </span>
          </div>
          <h2 className="font-serif text-3xl font-extrabold tracking-tight lg:text-4xl text-neutral-900 dark:text-white">
            Specialized Search & Reasoning
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
            Upgrade for a broader search experience, specialized curation files, deeper repository crawls, and premium AI models.
          </p>
        </div>        {/* Tab Controls (Personal, Education, Business) */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex p-1 gap-1.5 border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100/60 dark:bg-neutral-900/30 max-w-sm w-full rounded-full">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all uppercase cursor-pointer hover:scale-102 duration-200 ${
                activeTab === 'personal'
                  ? 'bg-white shadow-sm text-neutral-950 dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 hover:scale-102 duration-200 ${
                activeTab === 'education'
                  ? 'bg-white shadow-sm text-neutral-950 dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Education
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 hover:scale-102 duration-200 ${
                activeTab === 'business'
                  ? 'bg-white shadow-sm text-neutral-950 dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Business
            </button>
          </div>

          {/* Billing Cycle Selector */}
          <div className="flex items-center gap-3.5 bg-neutral-500/5 px-4 py-2 rounded-full border border-neutral-200/50 dark:border-neutral-800/50 text-[11px] font-mono select-none">
            <span className={billingCycle === 'yearly' ? 'text-neutral-400' : 'font-semibold text-neutral-800 dark:text-[#faf9f5]'}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${
                billingCycle === 'yearly' ? 'bg-[#b59547]' : 'bg-neutral-300 dark:bg-neutral-800'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-xs ${
                billingCycle === 'yearly' ? 'left-4.5' : 'left-0.5'
              }`} />
            </button>
            <span className="flex items-center gap-1.5">
              <span className={billingCycle === 'monthly' ? 'text-neutral-400' : 'font-semibold text-[#b59547]'}>Yearly</span>
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[#b59547] text-[8px] font-bold rounded-full uppercase">
                Save ~15%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid gap-6 items-stretch ${
          activePlansList.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'
        }`}>
          {activePlansList.map((plan: any) => {
            const isPopular = plan.badge !== '';
            const isActive = currentActivePlanName.toLowerCase() === plan.name.toLowerCase();
            const originalPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            
            // Adjust business seats dynamically
            const planPrice = activeTab === 'business' ? originalPrice * seats : originalPrice;

            return (
              <div 
                key={plan.id}
                className={`relative border-[1px] p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-102 rounded-[24px] shadow-sm ${
                  isActive 
                    ? 'border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/10 dark:border-indigo-500/40 text-neutral-900 dark:text-white'
                    : isPopular
                      ? 'border-[#b59547]/80 bg-amber-500/5'
                      : darkMode ? 'border-neutral-850 bg-[#1c1b18]' : 'border-neutral-200/70 bg-white'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-6 px-3 py-0.5 bg-[#b59547] text-white text-[9px] font-mono font-bold tracking-wider uppercase rounded-full shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-lg font-bold tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400 font-light">
                      {plan.subtext}
                    </p>
                  </div>

                  <div className="py-2.5 border-y border-neutral-200/40 dark:border-neutral-800/40">
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-4xl font-extrabold tracking-tight">
                        {formatDollar(planPrice)}
                      </span>
                      {plan.priceMonthly > 0 && (
                        <span className="text-xs text-neutral-400 font-mono">
                          /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                        </span>
                      )}
                    </div>
                    {plan.durationText && (
                      <p className="text-[9px] text-neutral-400 font-mono mt-1">
                        {plan.durationText}
                      </p>
                    )}
                  </div>

                  {/* Business seats block */}
                  {activeTab === 'business' && plan.priceMonthly > 0 && (
                    <div className="p-4 bg-neutral-500/5 border border-neutral-200/40 dark:border-neutral-800/40 rounded-[18px] space-y-2 shadow-3xs">
                      <div className="flex justify-between text-[10px] font-mono font-bold">
                        <span>Organization Seats:</span>
                        <span className="text-[#b59547]">{seats} Users</span>
                      </div>
                      <input 
                        type="range" 
                        min="2" 
                        max="100" 
                        value={seats}
                        onChange={(e) => setSeats(parseInt(e.target.value))}
                        className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full appearance-none cursor-pointer accent-[#b59547]"
                      />
                      <div className="flex justify-between text-[9px] text-neutral-400 font-light font-mono">
                        <span>Min: 2 seats</span>
                        <span>Max: 100 seats</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-300">
                      {plan.desc}
                    </p>
                    <ul className="space-y-2.5 text-xs">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
                          <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    disabled={isActive && plan.id !== 'free'}
                    onClick={() => handleInitiateUpgrade(plan)}
                    className={`w-full py-2.5 text-xs font-bold uppercase tracking-widest border rounded-full transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                      isActive 
                        ? 'border-indigo-600 bg-transparent text-indigo-500 dark:text-indigo-400 cursor-default opacity-85'
                        : plan.btnStyle.includes('rounded') ? plan.btnStyle : `${plan.btnStyle} rounded-full`
                    }`}
                  >
                    {isActive ? 'Current PlanActive' : plan.actionLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Budget Optimizer Slider Section */}
        <div className={`p-8 md:p-10 border border-neutral-200/40 dark:border-neutral-800/40 relative overflow-hidden rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300 ${
          darkMode ? 'border-[#31302b] bg-[#1c1b18]' : 'border-[#dedcd1] bg-white shadow-xs'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-5ff/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-500/10 border dark:border-neutral-800 rounded-full font-mono text-[9px] uppercase font-bold text-neutral-500">
                <Wallet className="w-3 h-3" />
                Plan Recommender
              </div>
              <h3 className="font-serif text-lg md:text-xl font-bold tracking-tight">
                Academic Budget Optimizer
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                Provide your targeted monthly budget constraint. Our AI model matching system automatically suggests the most resource-efficient subscription configuration.
              </p>

              {/* Slider Input */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-400">YOUR TARGET BUDGET:</span>
                  <span className="text-lg font-bold text-[#b59547]">
                    ${userBudget} <span className="text-[10px] font-light font-sans">/ month</span>
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="300" 
                  step="5"
                  value={userBudget}
                  onChange={(e) => setUserBudget(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#b59547]"
                />
                <div className="flex justify-between font-mono text-[9px] text-neutral-400 font-light">
                  <span>US$0 (Free)</span>
                  <span>US$150</span>
                  <span>US$300+</span>
                </div>
              </div>
            </div>

            {/* Simulated AI Output Box */}
            <div className={`p-6.5 border flex flex-col justify-between h-full min-h-[190px] rounded-[24px] shadow-sm ${
              darkMode ? 'bg-black/40 border-neutral-800/60 text-white' : 'bg-[#faf9f5]/80 border-neutral-200/50 text-[#141413]'
            } backdrop-blur-xs`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400">
                  <span>Optimizer Suggestion</span>
                  <span className="text-teal-600 dark:text-teal-400">Matched 100%</span>
                </div>
                
                <h4 className="font-serif text-base font-extrabold flex items-center gap-1.5 text-neutral-900 dark:text-white">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin animate-duration-3000" />
                  <span>{recommendedPlan}</span>
                </h4>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
                  {userBudget === 0 ? (
                    'The Free plan fits your constraint perfectly. You gain access to verified citations, standard response intervals, and conversational studies.'
                  ) : userBudget > 0 && userBudget < 12 ? (
                    'The Education Pro plan ($9/mo) matches your budget. Highly structured for college academia with deep computer integrations, plus standard student verification discounts.'
                  ) : userBudget >= 12 && userBudget < 30 ? (
                    'IRA Pro ($17/mo) fits beautifully. Includes 4,000 bonus credits, custom selections of top-tier AI models (Gemini Pro, Claude Sonnet), plus rich data file attachments.'
                  ) : userBudget >= 30 && userBudget < 100 ? (
                    'Enterprise Pro ($34/seat) matches cleanly. Allows up to several organization members with isolated workspaces, full SSO compliance, and zero repository training risk.'
                  ) : userBudget >= 100 && userBudget < 250 ? (
                    'IRA Max ($167/mo) matches your allocation. Yields 35,000 daily credits, premium research capabilities, and massive workspace datasets.'
                  ) : (
                    'Enterprise Max ($271/mo) fits your professional budget. Delivers uncompromised deep research crawls, infinite reasoning iterations, and institutional level support.'
                  )}
                </p>
              </div>

              <div className="pt-4 border-t border-[#dedcd1]/50 dark:border-[#31302b]/50 flex justify-between items-center group">
                <span className="text-[10px] font-mono text-neutral-400 font-light">
                  Estimated billing: {userBudget === 0 ? 'US$0' : `$${userBudget}/mo`}
                </span>
                <button
                  onClick={() => {
                    // Automatically switch tab and initiate upgrade sequence
                    if (recommendedPlan === 'Free Plan') {
                      setActiveTab('personal');
                    } else if (recommendedPlan === 'Education Pro') {
                      setActiveTab('education');
                      handleInitiateUpgrade({ id: 'edu_pro', name: 'Education Pro', priceMonthly: 11, priceYearly: 9 });
                    } else if (recommendedPlan === 'IRA Pro') {
                      setActiveTab('personal');
                      handleInitiateUpgrade({ id: 'pro', name: 'IRA Pro', priceMonthly: 20, priceYearly: 17 });
                    } else if (recommendedPlan === 'Enterprise Pro') {
                      setActiveTab('business');
                      handleInitiateUpgrade({ id: 'biz_pro', name: 'Enterprise Pro', priceMonthly: 40, priceYearly: 34 });
                    } else if (recommendedPlan === 'IRA Max') {
                      setActiveTab('personal');
                      handleInitiateUpgrade({ id: 'max', name: 'IRA Max', priceMonthly: 200, priceYearly: 167 });
                    } else {
                      setActiveTab('business');
                      handleInitiateUpgrade({ id: 'biz_max', name: 'Enterprise Max', priceMonthly: 320, priceYearly: 271 });
                    }
                  }}
                  className="text-[10px] font-mono tracking-wider uppercase font-semibold text-amber-550 dark:text-amber-400 flex items-center gap-1 group-hover:underline cursor-pointer"
                >
                  Configure recommending plan &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY 1: STUDENT VERIFICATION SCREEN (For Education Pro) */}
      {verificationStep && selectedUpgradePlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-40 text-neutral-800 dark:text-neutral-100 animate-in fade-in duration-300">
          <div className={`w-full max-w-md border border-neutral-200/30 dark:border-neutral-850/40 shadow-2xl p-7 space-y-5 transition-all duration-300 rounded-[32px] ${
            darkMode ? 'bg-[#1c1b18]/95 text-white' : 'bg-white/95 text-black'
          } backdrop-blur-xl animate-in zoom-in-95 duration-200`}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                  Education Verification
                </span>
                <h3 className="font-serif text-lg font-bold tracking-tight">Verify Student Status</h3>
              </div>
              <button 
                onClick={() => setVerificationStep(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
              Education pricing is strictly restricted to active students, academic staff, and researchers. Provide your institutional login or upload a student ID.
            </p>

            <form onSubmit={handleVerifyStudentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 pl-1">Institution Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Stanford University"
                  value={eduSchool}
                  onChange={(e) => setEduSchool(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/50 rounded-[18px] transition-all duration-200 ${
                    darkMode ? 'border-neutral-800 focus:border-[#b59547]' : 'border-neutral-200 focus:border-[#b59547]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 pl-1">Academic Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="student@example.edu"
                    value={eduEmail}
                    onChange={(e) => setEduEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/50 rounded-[18px] transition-all duration-200 ${
                      darkMode ? 'border-neutral-800 focus:border-[#b59547]' : 'border-neutral-200 focus:border-[#b59547]'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 pl-1">Graduation Year</label>
                  <select 
                    value={eduGradYear}
                    onChange={(e) => setEduGradYear(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/50 rounded-[18px] transition-all duration-200 ${
                      darkMode ? 'border-neutral-800 focus:border-[#b59547] bg-[#1c1b18]' : 'border-neutral-200 focus:border-[#b59547] bg-[#faf9f5]'
                    }`}
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>
                </div>
              </div>

              {/* ID upload drop region */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 pl-1">Document Upload Proof</label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed p-4 text-center cursor-pointer transition-all duration-300 rounded-[18px] ${
                    isDragging
                      ? 'border-amber-500 bg-amber-500/10'
                      : studentIdFile 
                        ? 'border-green-500 bg-green-500/5'
                        : darkMode ? 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/85' : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50'
                  }`}
                  onClick={() => document.getElementById('student-id-file-input')?.click()}
                >
                  <input 
                    type="file" 
                    id="student-id-file-input"
                    className="hidden" 
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf"
                  />
                  <div className="flex flex-col items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <UploadCloud className={`w-6 h-6 ${studentIdFile ? 'text-green-500' : 'text-neutral-400'}`} />
                    {studentIdFile ? (
                      <div className="space-y-0.5">
                        <span className="font-semibold text-green-600 dark:text-green-400 block text-[11px]">School ID Registered!</span>
                        <span className="font-mono text-[9px] text-neutral-400 block truncate max-w-[200px]">{studentIdFile}</span>
                      </div>
                    ) : (
                      <span>Drag & drop student ID or <span className="text-[#b59547] underline">browse file</span></span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={() => setVerificationStep(false)}
                  className={`px-4.5 py-2 border text-[10px] uppercase font-bold tracking-wider rounded-full transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    darkMode ? 'border-neutral-850 bg-transparent hover:bg-neutral-900' : 'border-neutral-200 bg-transparent hover:bg-neutral-100 shadow-2xs'
                  }`}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#b59547] hover:bg-opacity-90 text-[#141413] text-[10px] uppercase font-bold tracking-wider rounded-full flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
                >
                  Confirm & Proceed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY 2: CREDIT CARD CHECKOUT AND DIRECT TRANSACTION SCREEN */}
      {checkoutStep && selectedUpgradePlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-40 text-neutral-800 dark:text-neutral-100 animate-in fade-in duration-300">
          <div className={`w-full max-w-md border border-neutral-200/30 dark:border-neutral-850/40 shadow-2xl p-7 space-y-5 transition-all duration-300 rounded-[32px] ${
            darkMode ? 'bg-[#1c1b18]/95 text-white' : 'bg-white/95 text-black'
          } backdrop-blur-xl animate-in zoom-in-95 duration-200`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#b59547]">
                  Transaction Checkout
                </span>
                <h3 className="font-serif text-lg font-bold tracking-tight">Confirm Subscription</h3>
              </div>
              <button 
                disabled={transactionProcessing}
                onClick={() => setCheckoutStep(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 font-mono text-xs cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {paymentError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-mono rounded-[12px]">
                {paymentError}
              </div>
            )}

            {/* Price Calculations */}
            <div className="p-4 bg-neutral-500/5 rounded-[18px] border border-neutral-200/40 dark:border-neutral-800/40 space-y-2 text-xs font-mono shadow-3xs">
              <div className="flex justify-between text-neutral-400 font-light">
                <span>Selected Plan:</span>
                <span className="font-sans font-semibold text-neutral-800 dark:text-neutral-200">{selectedUpgradePlan.name}</span>
              </div>
              <div className="flex justify-between text-neutral-400 font-light">
                <span>Cycles:</span>
                <span>{billingCycle === 'yearly' ? 'Yearly Billing (~15% discount)' : 'Monthly Billing'}</span>
              </div>
              {activeTab === 'business' && (
                <div className="flex justify-between text-neutral-400 font-light">
                  <span>Seats:</span>
                  <span>{seats} Accounts</span>
                </div>
              )}
              <div className="border-t border-neutral-200/40 dark:border-neutral-800/40 pt-2 flex justify-between font-bold text-neutral-900 dark:text-white">
                <span>TOTAL AMOUNT:</span>
                <span className="text-[#b59547]">
                  {formatDollar(activeTab === 'business' 
                    ? (billingCycle === 'yearly' ? selectedUpgradePlan.priceYearly : selectedUpgradePlan.priceMonthly) * seats
                    : (billingCycle === 'yearly' ? selectedUpgradePlan.priceYearly : selectedUpgradePlan.priceMonthly))}
                  <span className="text-[10px] font-normal text-neutral-400">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                </span>
              </div>
            </div>

            {/* Credit Card Visual Model */}
            <div className="relative h-44 rounded-[24px] p-5 flex flex-col justify-between overflow-hidden shadow-lg text-white bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700/60">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 rounded-full bg-red-500/80 -mr-2" />
                  <span className="inline-block w-4 h-4 rounded-full bg-amber-500/85" />
                  <span className="text-[10px] font-mono text-neutral-400 ml-1.5 uppercase font-light">Horizon Card</span>
                </div>
                <Users className="w-5 h-5 text-neutral-400" />
              </div>

              {/* Simulated card digits */}
              <div className="space-y-1">
                <span className="text-sm font-mono tracking-widest block h-5">
                  {cardNumber || '•••• •••• •••• ••••'}
                </span>
                <div className="flex justify-between text-[8px] font-mono text-neutral-400 font-light">
                  <span>CARDHOLDER NAME</span>
                  <span>EXPIRY</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono uppercase h-4">
                  <span className="truncate max-w-[200px]">{cardName || 'STUDENT USER'}</span>
                  <span>{cardExpiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>

            {/* Payment Details Input Fields */}
            <form onSubmit={handleCardPaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 pl-1">Cardholder Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Nirmal Naik"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/50 rounded-[18px] transition-all duration-200 ${
                    darkMode ? 'border-neutral-850 focus:border-[#b59547]' : 'border-neutral-200 focus:border-[#b59547]'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 pl-1">Credit Card Number</label>
                <input 
                  type="text" 
                  required
                  maxLength={19}
                  placeholder="4111 2222 3333 4444"
                  value={cardNumber}
                  onChange={(e) => {
                    // Simple formatting helper
                    let val = e.target.value.replace(/\D/g, '');
                    let matches = val.match(/\d{4,16}/g);
                    let match = matches && matches[0] || '';
                    let parts = [];
                    for (let i=0, len=match.length; i<len; i+=4) {
                      parts.push(match.substring(i, i+4));
                    }
                    if (parts.length > 0) {
                      setCardNumber(parts.join(' '));
                    } else {
                      setCardNumber(val);
                    }
                  }}
                  className={`w-full px-4 py-2.5 font-mono bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/50 rounded-[18px] transition-all duration-200 ${
                    darkMode ? 'border-neutral-850 focus:border-[#b59547]' : 'border-neutral-200 focus:border-[#b59547]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 pl-1">Expiration Date</label>
                  <input 
                    type="text" 
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.length === 2 && !val.includes('/')) {
                        setCardExpiry(val + '/');
                      } else {
                        setCardExpiry(val);
                      }
                    }}
                    className={`w-full px-4 py-2.5 font-mono bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/50 rounded-[18px] transition-all duration-200 ${
                      darkMode ? 'border-neutral-850 focus:border-[#b59547]' : 'border-neutral-200 focus:border-[#b59547]'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 pl-1">CVV / CVZ</label>
                  <input 
                    type="password" 
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-4 py-2.5 font-mono bg-transparent border text-xs focus:outline-none focus:ring-2 focus:ring-[#b59547]/50 rounded-[18px] transition-all duration-200 ${
                      darkMode ? 'border-neutral-850 focus:border-[#b59547]' : 'border-neutral-200 focus:border-[#b59547]'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 font-mono">
                <button
                  type="button"
                  disabled={transactionProcessing}
                  onClick={() => setCheckoutStep(false)}
                  className={`px-4.5 py-2 border text-[10px] uppercase font-bold tracking-wider rounded-full transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    darkMode ? 'border-neutral-850 bg-transparent hover:bg-neutral-900' : 'border-neutral-200 bg-transparent hover:bg-neutral-100 shadow-2xs'
                  } disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transactionProcessing}
                  className="px-5 py-2.5 bg-[#b59547] hover:bg-opacity-90 text-[#141413] text-[10px] uppercase font-bold tracking-wider rounded-full flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {transactionProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{transactionProcessing ? 'Processing...' : 'Complete Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY 3: UPGRADE CELEBRATION MODAL */}
      {showCelebration && selectedUpgradePlan && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-40 text-neutral-800 dark:text-neutral-100 animate-in fade-in duration-300">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Tailwind purely client micro-confetti simulation */}
            <div className="absolute top-1/4 left-1/4 w-3.5 h-3.5 rounded-full bg-amber-500 animate-bounce" />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#b59547] animate-ping" />
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-teal-500 animate-pulse animate-duration-1000" />
            <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-indigo-500 rounded-sm rotate-45 animate-pulse" />
          </div>

          <div className={`w-full max-w-md border border-neutral-200/30 dark:border-neutral-850/40 text-center shadow-2xl p-8 space-y-6 relative overflow-hidden transition-all duration-300 rounded-[32px] ${
            darkMode ? 'bg-[#1c1b18]/95 text-white' : 'bg-white/95 text-black'
          } backdrop-blur-xl animate-in zoom-in-95 duration-250`}>
            <div className="absolute -top-10 -left-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-[#b59547] flex items-center justify-center text-[#b59547] animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                Subscription Confirmed!
              </h3>
              <p className="text-[10px] font-mono tracking-widest text-[#b59547] uppercase font-bold">
                You are now upgraded to {selectedUpgradePlan.name}
              </p>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
              Your academic profile credentials have been successfully updated. All deep curation tools, enhanced query structures, and premium model selections have been unlocked directly inside your desk.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowCelebration(false);
                  setSelectedUpgradePlan(null);
                  onBack(); // Go back to the main chat desk automatically!
                }}
                className="w-full py-2.5 bg-neutral-950 dark:bg-[#e6e4db] text-white dark:text-neutral-950 font-mono text-[10px] uppercase font-bold tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-md"
              >
                Access Premium Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
