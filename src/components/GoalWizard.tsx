import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, ArrowRight, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface GoalWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (goal: any) => void;
}

const wizardSteps = [
  { id: 'type', title: 'Goal Type', description: 'What type of goal are you setting?', icon: Target },
  { id: 'details', title: 'Goal Details', description: 'Set your target amount and timeline', icon: DollarSign },
  { id: 'plan', title: 'Action Plan', description: 'Define your monthly contribution strategy', icon: TrendingUp },
  { id: 'milestones', title: 'Milestones', description: 'Set key milestones to track progress', icon: Calendar },
];

export function GoalWizard({ isOpen, onClose, onComplete }: GoalWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [goalData, setGoalData] = useState({
    type: '',
    title: '',
    target: '',
    deadline: '',
    monthlyContribution: '',
    category: '',
    milestones: []
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(goalData);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const Icon = wizardSteps[currentStep].icon;

    switch (currentStep) {
      case 0: // Goal Type
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{wizardSteps[currentStep].title}</h3>
              <p className="text-gray-600">{wizardSteps[currentStep].description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Savings', 'Investment', 'Debt Reduction', 'Purchase'].map((type) => (
                <button
                  key={type}
                  onClick={() => setGoalData({ ...goalData, type })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    goalData.type === type
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{type}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 1: // Goal Details
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{wizardSteps[currentStep].title}</h3>
              <p className="text-gray-600">{wizardSteps[currentStep].description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Emergency Fund"
                  value={goalData.title}
                  onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="target">Target Amount ($)</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="10000"
                  value={goalData.target}
                  onChange={(e) => setGoalData({ ...goalData, target: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={goalData.deadline}
                  onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={goalData.category} onValueChange={(value) => setGoalData({ ...goalData, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2: // Action Plan
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{wizardSteps[currentStep].title}</h3>
              <p className="text-gray-600">{wizardSteps[currentStep].description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="monthly">Monthly Contribution ($)</Label>
                <Input
                  id="monthly"
                  type="number"
                  placeholder="500"
                  value={goalData.monthlyContribution}
                  onChange={(e) => setGoalData({ ...goalData, monthlyContribution: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-sm font-semibold text-blue-900 mb-2">Projected Timeline</div>
                <div className="text-2xl font-bold text-blue-600">
                  {goalData.target && goalData.monthlyContribution
                    ? `${Math.ceil(parseInt(goalData.target) / parseInt(goalData.monthlyContribution))} months`
                    : 'Enter amounts to calculate'}
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Milestones
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{wizardSteps[currentStep].title}</h3>
              <p className="text-gray-600">{wizardSteps[currentStep].description}</p>
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-700">Suggested Milestones</div>
              {goalData.target && [25, 50, 75, 100].map((percent) => (
                <div key={percent} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{percent}% - ${(parseInt(goalData.target) * percent / 100).toLocaleString()}</span>
                  <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked={percent === 25} />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {wizardSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
          <CardTitle className="text-center">
            Step {currentStep + 1} of {wizardSteps.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          {renderStepContent()}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <span>{currentStep === wizardSteps.length - 1 ? 'Complete' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}