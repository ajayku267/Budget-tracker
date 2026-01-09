import { useState, useEffect } from 'react';
import { Goal, Recommendation } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Target, TrendingUp, Calendar, AlertTriangle, CheckCircle, Clock, Lightbulb } from 'lucide-react';
import { GoalWizard } from './GoalWizard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { storage } from '../utils/storage';

const initialGoals: Goal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    target: 10000,
    current: 6500,
    deadline: '2024-06-30',
    category: 'Savings',
    color: 'bg-blue-500',
    status: 'on-track',
    monthlyContribution: 500,
    milestones: [
      { id: '1', amount: 2500, achieved: true, date: '2024-01-15' },
      { id: '2', amount: 5000, achieved: true, date: '2024-02-28' },
      { id: '3', amount: 7500, achieved: false, date: '2024-04-15' },
      { id: '4', amount: 10000, achieved: false, date: '2024-06-30' }
    ]
  },
  {
    id: '2',
    title: 'Vacation to Japan',
    target: 5000,
    current: 3200,
    deadline: '2024-12-31',
    category: 'Travel',
    color: 'bg-green-500',
    status: 'on-track',
    monthlyContribution: 300,
    milestones: [
      { id: '1', amount: 1250, achieved: true, date: '2024-03-01' },
      { id: '2', amount: 2500, achieved: true, date: '2024-06-01' },
      { id: '3', amount: 3750, achieved: false, date: '2024-09-01' },
      { id: '4', amount: 5000, achieved: false, date: '2024-12-31' }
    ]
  },
  {
    id: '3',
    title: 'New Laptop',
    target: 2000,
    current: 800,
    deadline: '2024-03-31',
    category: 'Technology',
    color: 'bg-purple-500',
    status: 'at-risk',
    monthlyContribution: 200,
    milestones: [
      { id: '1', amount: 500, achieved: true, date: '2024-01-15' },
      { id: '2', amount: 1000, achieved: false, date: '2024-02-15' },
      { id: '3', amount: 1500, achieved: false, date: '2024-03-15' },
      { id: '4', amount: 2000, achieved: false, date: '2024-03-31' }
    ]
  },
  {
    id: '4',
    title: 'Home Renovation',
    target: 15000,
    current: 4500,
    deadline: '2024-09-30',
    category: 'Home',
    color: 'bg-orange-500',
    status: 'on-track',
    monthlyContribution: 1000,
    milestones: [
      { id: '1', amount: 3750, achieved: true, date: '2024-02-01' },
      { id: '2', amount: 7500, achieved: false, date: '2024-05-01' },
      { id: '3', amount: 11250, achieved: false, date: '2024-07-01' },
      { id: '4', amount: 15000, achieved: false, date: '2024-09-30' }
    ]
  }
];

const savingsTrendData = [
  { month: 'Jan', savings: 1200, goal: 1000 },
  { month: 'Feb', savings: 1800, goal: 1000 },
  { month: 'Mar', savings: 1500, goal: 1000 },
  { month: 'Apr', savings: 2200, goal: 1000 },
  { month: 'May', savings: 2000, goal: 1000 },
  { month: 'Jun', savings: 2500, goal: 1000 },
];

const spendingPatternsData = [
  { category: 'Food', amount: 800 },
  { category: 'Transport', amount: 400 },
  { category: 'Entertainment', amount: 300 },
  { category: 'Utilities', amount: 500 },
  { category: 'Shopping', amount: 600 },
];

const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Increase Monthly Savings',
    description: 'Based on your spending patterns, you could save an additional $200/month by reducing dining out expenses.',
    potentialSavings: 200,
    priority: 'high'
  },
  {
    id: '2',
    title: 'Optimize Investment Returns',
    description: 'Consider moving your emergency fund to a high-yield savings account for better returns.',
    potentialSavings: 150,
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Automate Savings',
    description: 'Set up automatic transfers to ensure consistent progress toward your goals.',
    potentialSavings: 100,
    priority: 'low'
  }
];

export function GoalsDashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    loadGoals();

    // Listen for goal updates
    const handleGoalUpdated = () => {
      setTimeout(loadGoals, 100);
    };

    window.addEventListener('goalUpdated', handleGoalUpdated);
    return () => window.removeEventListener('goalUpdated', handleGoalUpdated);
  }, []);

  const loadGoals = () => {
    const data = storage.getGoals();
    setGoals(data);
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;
  const goalsOnTrack = goals.filter(g => g.status === 'on-track').length;
  const goalsAtRisk = goals.filter(g => g.status === 'at-risk').length;
  const goalsAchieved = goals.filter(g => g.status === 'achieved').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'at-risk':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'at-risk':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleGoalComplete = (goal: any) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goal.title,
      target: parseInt(goal.target),
      current: 0,
      deadline: goal.deadline,
      category: goal.category,
      color: 'bg-indigo-500',
      status: 'on-track',
      monthlyContribution: parseInt(goal.monthlyContribution),
      milestones: []
    };
    storage.addGoal(newGoal);
    loadGoals();
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-auto" style={{ fontFamily: 'Gilroy, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Goals</h1>
        <p className="text-gray-600 text-lg">Track your financial goals and achieve them faster</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-600" />
              Total Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{goals.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Total Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">${totalSaved.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-purple-600" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{overallProgress.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{goalsAtRisk}</div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Savings Trend</CardTitle>
            <CardDescription>Monthly savings vs. goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={savingsTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="goal" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Spending Patterns</CardTitle>
            <CardDescription>Monthly breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={spendingPatternsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>Personalized suggestions to achieve your goals faster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className={`p-4 rounded-xl border ${getPriorityColor(rec.priority)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{rec.title}</h4>
                  <span className="text-xs font-bold">
                    +${rec.potentialSavings}/mo
                  </span>
                </div>
                <p className="text-xs opacity-90">{rec.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
        <Button 
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={goal.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {goal.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 mt-1">
                      {goal.category} • {daysLeft} days left
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(goal.status)}
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Progress</span>
                    <span className="font-bold text-gray-900">
                      ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${goal.color} h-3 rounded-full transition-all duration-500 shadow-sm`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-gray-700">
                      {progress.toFixed(1)}% Complete
                    </div>
                    <div className="text-xs text-gray-500">
                      ${goal.monthlyContribution}/month
                    </div>
                  </div>
                  
                  {/* Milestones */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Milestones</div>
                    <div className="flex space-x-2">
                      {goal.milestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className={`flex-1 h-2 rounded-full ${
                            milestone.achieved ? goal.color : 'bg-gray-200'
                          }`}
                          title={`$${milestone.amount.toLocaleString()} - ${milestone.achieved ? 'Achieved' : 'Pending'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Goal Wizard */}
      <GoalWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleGoalComplete}
      />
    </div>
  );
}