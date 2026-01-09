import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Mail, Phone, DollarSign, Calendar, Check, Target } from 'lucide-react';
import { storage } from '../utils/storage';
import { UserProfile } from '../types';

interface ProfileSetupProps {
  onComplete: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    currency: 'USD',
    monthlyIncome: '',
    monthlyBudget: '',
    financialGoal: '',
    riskTolerance: 'moderate'
  });

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  ];

  const financialGoals = [
    'Build Emergency Fund',
    'Save for Retirement',
    'Buy a Home',
    'Invest in Stocks',
    'Pay Off Debt',
    'Travel Fund',
    'Education Fund',
    'Other'
  ];

  const handleSubmit = () => {
    // Create user profile
    const profile: UserProfile = {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      currency: profileData.currency,
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
        billReminders: true,
        goalUpdates: true,
        investmentAlerts: true,
        budgetAlerts: true,
        securityAlerts: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date().toISOString(),
        activeSessions: [],
        biometricEnabled: false
      },
      subscription: {
        plan: 'free',
        startDate: new Date().toISOString(),
        features: ['basic_tracking', 'monthly_reports']
      }
    };

    // Save profile using the correct method
    storage.saveProfile(profile);

    // Add initial income transaction if provided
    if (profileData.monthlyIncome) {
      const incomeTransaction = {
        id: Date.now().toString(),
        name: 'Initial Income',
        amount: parseFloat(profileData.monthlyIncome),
        type: 'income' as const,
        category: 'Salary',
        date: new Date().toISOString(),
        description: 'Monthly salary'
      };
      storage.addTransaction(incomeTransaction);
    }

    // Create initial budget if provided
    if (profileData.monthlyBudget) {
      const budget = {
        id: Date.now().toString(),
        category: 'General',
        amount: parseFloat(profileData.monthlyBudget),
        spent: 0,
        period: 'monthly' as const,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        alertThreshold: 80
      };
      storage.addBudget(budget);
    }

    // Create initial goal if provided
    if (profileData.financialGoal && profileData.monthlyIncome) {
      const goal = {
        id: Date.now().toString(),
        name: profileData.financialGoal,
        targetAmount: parseFloat(profileData.monthlyIncome) * 3, // 3 months of income
        currentAmount: 0,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
        category: 'Savings',
        createdAt: new Date().toISOString(),
        color: '#3B82F6',
        icon: 'target'
      };
      storage.addGoal(goal);
    }

    onComplete();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Prime Pay</h2>
              <p className="text-gray-600">Let's set up your profile to get started</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Information</h2>
              <p className="text-gray-600">Help us understand your financial situation</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currency">Preferred Currency</Label>
                <select
                  id="currency"
                  value={profileData.currency}
                  onChange={(e) => setProfileData({...profileData, currency: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="monthlyIncome"
                    type="number"
                    placeholder="Enter your monthly income"
                    value={profileData.monthlyIncome}
                    onChange={(e) => setProfileData({...profileData, monthlyIncome: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="monthlyBudget"
                    type="number"
                    placeholder="Enter your monthly budget"
                    value={profileData.monthlyBudget}
                    onChange={(e) => setProfileData({...profileData, monthlyBudget: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Goals</h2>
              <p className="text-gray-600">What are you working towards?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="financialGoal">Primary Financial Goal</Label>
                <select
                  id="financialGoal"
                  value={profileData.financialGoal}
                  onChange={(e) => setProfileData({...profileData, financialGoal: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select your primary goal</option>
                  {financialGoals.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <select
                  id="riskTolerance"
                  value={profileData.riskTolerance}
                  onChange={(e) => setProfileData({...profileData, riskTolerance: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="conservative">Conservative - Low risk, stable returns</option>
                  <option value="moderate">Moderate - Balanced risk and returns</option>
                  <option value="aggressive">Aggressive - High risk, high returns</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profileData.name && profileData.email;
      case 2:
        return profileData.currency && profileData.monthlyIncome;
      case 3:
        return profileData.financialGoal;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Step {step} of 3
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Financial Details'}
            {step === 3 && 'Goals & Preferences'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}