import { Transaction } from '../types';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  tip: string;
}

export class SavingsRecommendationEngine {
  generateRecommendations(
    transactions: Transaction[],
    income: number,
    expenses: number
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Analyze spending by category
    const categorySpending: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    // 1. Subscription audit
    const subscriptions = transactions.filter(
      t => t.type === 'expense' && t.recurring && t.category.toLowerCase().includes('subscription')
    );
    if (subscriptions.length > 0) {
      const totalSubscriptionCost = subscriptions.reduce((sum, t) => sum + t.amount, 0);
      recommendations.push({
        id: 'sub-audit',
        title: 'Review Your Subscriptions',
        description: `You have ${subscriptions.length} recurring subscriptions. Review and cancel unused services.`,
        potentialSavings: totalSubscriptionCost * 0.3,
        category: 'Subscriptions',
        priority: 'high',
        actionable: true,
        tip: 'Cancel at least 30% of unused subscriptions to save money',
      });
    }

    // 2. Dining out analysis
    const diningSpending = categorySpending['Food'] || 0;
    if (diningSpending > income * 0.15) {
      recommendations.push({
        id: 'dining-reduction',
        title: 'Reduce Dining Out',
        description: `You're spending ${((diningSpending / income) * 100).toFixed(1)}% of income on food. Try meal planning and cooking at home.`,
        potentialSavings: diningSpending * 0.4,
        category: 'Food',
        priority: 'high',
        actionable: true,
        tip: 'Cooking at home 4 more times per week could save you significantly',
      });
    }

    // 3. Transportation costs
    const transportSpending = categorySpending['Transport'] || 0;
    if (transportSpending > income * 0.12) {
      recommendations.push({
        id: 'transport-optimization',
        title: 'Optimize Transportation',
        description: 'Consider carpooling, public transit, or bike commuting to reduce costs.',
        potentialSavings: transportSpending * 0.25,
        category: 'Transport',
        priority: 'medium',
        actionable: true,
        tip: 'Using public transport 3 days a week can cut transportation costs significantly',
      });
    }

    // 4. Entertainment spending
    const entertainmentSpending = categorySpending['Entertainment'] || 0;
    if (entertainmentSpending > income * 0.1) {
      recommendations.push({
        id: 'entertainment-budget',
        title: 'Set Entertainment Budget',
        description: 'Entertainment spending is above recommended levels. Set a monthly budget.',
        potentialSavings: entertainmentSpending * 0.3,
        category: 'Entertainment',
        priority: 'medium',
        actionable: true,
        tip: 'Look for free community events and use discount platforms',
      });
    }

    // 5. Emergency fund
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    if (savingsRate < 20) {
      recommendations.push({
        id: 'emergency-fund',
        title: 'Build Emergency Fund',
        description: 'Aim to save 3-6 months of expenses for financial security.',
        potentialSavings: income * 0.2,
        category: 'Savings',
        priority: 'high',
        actionable: true,
        tip: 'Start by saving just 5% of each paycheck and increase gradually',
      });
    }

    // 6. Impulse buying pattern
    const smallTransactions = transactions.filter(
      t => t.type === 'expense' && t.amount < 20 && !t.recurring
    );
    if (smallTransactions.length > 20) {
      const totalImpulse = smallTransactions.reduce((sum, t) => sum + t.amount, 0);
      recommendations.push({
        id: 'impulse-buying',
        title: 'Reduce Impulse Purchases',
        description: `You made ${smallTransactions.length} small purchases. Use the 24-hour rule for non-essentials.`,
        potentialSavings: totalImpulse * 0.5,
        category: 'Shopping',
        priority: 'medium',
        actionable: true,
        tip: 'Wait 24 hours before making non-essential purchases under $50',
      });
    }

    // 7. Automated savings
    recommendations.push({
      id: 'auto-save',
      title: 'Automate Your Savings',
      description: 'Set up automatic transfers to savings on payday.',
      potentialSavings: income * 0.1,
      category: 'Savings',
      priority: 'high',
      actionable: true,
      tip: 'Automate 10-15% of income to savings before spending',
    });

    // 8. High-interest debt
    const debtPayments = categorySpending['Bills'] || 0;
    if (debtPayments > income * 0.2) {
      recommendations.push({
        id: 'debt-payoff',
        title: 'Accelerate Debt Payoff',
        description: 'Use the avalanche method to pay off high-interest debt faster.',
        potentialSavings: debtPayments * 0.15,
        category: 'Bills',
        priority: 'high',
        actionable: true,
        tip: 'Pay extra on highest interest debt while maintaining minimums on others',
      });
    }

    // 9. Utility optimization
    const utilitySpending = categorySpending['Utilities'] || 0;
    if (utilitySpending > income * 0.08) {
      recommendations.push({
        id: 'utility-savings',
        title: 'Reduce Utility Bills',
        description: 'Implement energy-saving habits and review service plans.',
        potentialSavings: utilitySpending * 0.2,
        category: 'Utilities',
        priority: 'low',
        actionable: true,
        tip: 'LED bulbs, programmable thermostat, and unplugging devices can save 15-20%',
      });
    }

    // 10. Cashback and rewards
    recommendations.push({
      id: 'rewards-optimization',
      title: 'Maximize Rewards',
      description: 'Use cashback credit cards for regular purchases.',
      potentialSavings: expenses * 0.02,
      category: 'Optimization',
      priority: 'low',
      actionable: true,
      tip: 'Earn 1-5% cashback on purchases you already make',
    });

    // Sort by priority and potential savings
    return recommendations.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.potentialSavings - a.potentialSavings;
    });
  }

  calculateTotalPotentialSavings(recommendations: Recommendation[]): number {
    return recommendations.reduce((sum, r) => sum + r.potentialSavings, 0);
  }
}

export const recommendationEngine = new SavingsRecommendationEngine();
