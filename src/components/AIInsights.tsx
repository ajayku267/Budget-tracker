import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  DollarSign,
  Zap,
  Shield,
  ChevronRight,
  Star,
  Award
} from 'lucide-react';
import { storage } from '../utils/storage';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: string;
  icon: React.ReactNode;
  color: string;
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setLoading(true);
    const data = storage.getData();
    const generatedInsights: Insight[] = [];

    // Analyze spending patterns
    const transactions = data.transactions;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Generate insights based on data
    if (totalExpenses > totalIncome * 0.9) {
      generatedInsights.push({
        id: 'spending-alert',
        type: 'warning',
        title: 'High Spending Detected',
        description: `Your expenses this month are ${((totalExpenses / totalIncome) * 100).toFixed(1)}% of your income. Consider reviewing your spending habits.`,
        impact: 'high',
        actionable: true,
        action: 'Review Budget',
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'red'
      });
    }

    if (totalIncome > totalExpenses * 1.2) {
      generatedInsights.push({
        id: 'savings-opportunity',
        type: 'opportunity',
        title: 'Great Savings Potential',
        description: `You could save ${(totalIncome - totalExpenses).toFixed(2)} this month. Consider investing or adding to your emergency fund.`,
        impact: 'medium',
        actionable: true,
        action: 'Invest Now',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'green'
      });
    }

    // Goal progress insights
    const goals = data.goals;
    const goalsOnTrack = goals.filter(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const requiredProgress = (100 - progress) / daysLeft * 30; // Monthly progress needed
      return progress >= requiredProgress;
    });

    if (goalsOnTrack.length > 0) {
      generatedInsights.push({
        id: 'goals-achievement',
        type: 'achievement',
        title: 'Goals on Track!',
        description: `${goalsOnTrack.length} of your goals are progressing well. Keep up the great work!`,
        impact: 'medium',
        actionable: false,
        icon: <Award className="w-5 h-5" />,
        color: 'purple'
      });
    }

    // Investment insights
    const investments = data.investments;
    if (investments.length > 0) {
      const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
      const totalInvestmentCost = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalReturn = ((totalInvestmentValue - totalInvestmentCost) / totalInvestmentCost) * 100;

      if (totalReturn > 10) {
        generatedInsights.push({
          id: 'investment-success',
          type: 'achievement',
          title: 'Excellent Investment Returns',
          description: `Your portfolio has gained ${totalReturn.toFixed(1)}% in value. Great investment choices!`,
          impact: 'high',
          actionable: false,
          icon: <Star className="w-5 h-5" />,
          color: 'yellow'
        });
      }
    }

    // General tips
    generatedInsights.push({
      id: 'tip-automation',
      type: 'tip',
      title: 'Automate Your Savings',
      description: 'Set up automatic transfers to your savings account right after payday to build wealth consistently.',
      impact: 'medium',
      actionable: true,
      action: 'Set Up Automation',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'blue'
    });

    setInsights(generatedInsights);
    setLoading(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5" />;
      case 'achievement':
        return <Award className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'warning':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'tip':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'achievement':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Analyzing your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-600">Personalized financial recommendations powered by AI</p>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${getInsightColor(insight.type)}`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-600' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{insight.description}</p>
                  {insight.actionable && insight.action && (
                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      {insight.action}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Features */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Smart Categorization</h3>
              <p className="text-sm text-gray-600">Automatically categorize transactions with 95% accuracy</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Goal Optimization</h3>
              <p className="text-sm text-gray-600">Get personalized recommendations to reach goals faster</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Fraud Detection</h3>
              <p className="text-sm text-gray-600">AI-powered security to protect your financial data</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}