
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
