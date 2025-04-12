import React from 'react';
import { Badge } from '../components/ui/badge';

interface Subscription {
  id: string;
  status: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
  subscription_plans?: {
    name: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const MessDashboard: React.FC = () => {
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);

  // Fix the profiles reference in subscriptions display
  const renderSubscribersList = () => {
    if (subscriptions.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          No subscribers yet
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {subscriptions.map((subscription) => {
          // Safely access profiles data, add null checks
          const firstName = subscription.profiles?.first_name || '';
          const lastName = subscription.profiles?.last_name || '';
          const planName = subscription.subscription_plans?.name || 'Basic Plan';
          
          return (
            <div key={subscription.id} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
              <div>
                <span className="font-medium">{firstName} {lastName}</span>
                <div className="text-xs text-gray-500">
                  Plan: {planName}
                </div>
              </div>
              <Badge variant={subscription.status === 'active' ? 'secondary' : 'outline'} 
                className={subscription.status === 'active' ? "bg-green-100 text-green-800" : ""}>
                {subscription.status}
              </Badge>
            </div>
          );
        })}
      </div>
    );
  };

  // Fix payments display
  const renderRecentPayments = () => {
    if (payments.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          No payment records yet
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {payments.map((payment) => {
          // Add safe access to payment properties
          const paymentDate = payment.payment_date ? new Date(payment.payment_date) : new Date();
          const formattedDate = paymentDate.toLocaleDateString('en-US', { 
            day: 'numeric', month: 'short', year: 'numeric' 
          });
          
          const studentName = payment.profiles ? `${payment.profiles.first_name} ${payment.profiles.last_name}` : 'Student';
          
          return (
            <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
              <div>
                <span className="font-medium">₹{payment.amount}</span>
                <div className="text-xs text-gray-500">
                  {formattedDate} • {payment.payment_method}
                </div>
                <div className="text-xs text-gray-500">
                  {studentName}
                </div>
              </div>
              <Badge variant={payment.status === 'completed' ? 'secondary' : 'outline'} 
                className={payment.status === 'completed' ? "bg-green-100 text-green-800" : ""}>
                {payment.status}
              </Badge>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mess Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Subscribers</h2>
          {renderSubscribersList()}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
          {renderRecentPayments()}
        </div>
      </div>
    </div>
  );
};

export default MessDashboard;
