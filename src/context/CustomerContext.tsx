
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Customer {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  mess_id: string;
  subscription_status: string;
}

interface CustomerContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  selectedCustomerId: string | null;
  setSelectedCustomerId: React.Dispatch<React.SetStateAction<string | null>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  refetchCustomers: () => Promise<void>;
  messId: string;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};

interface CustomerProviderProps {
  children: ReactNode;
  messId: string;
  fetchCustomersFunction: (messId: string) => Promise<Customer[]>;
}

export const CustomerProvider = ({ 
  children, 
  messId, 
  fetchCustomersFunction 
}: CustomerProviderProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCustomersFunction(messId);
      setCustomers(data);
    } catch (error: any) {
      console.error('Error fetching customers:', error.message);
      setError(error.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    customers,
    setCustomers,
    loading,
    setLoading,
    error,
    setError,
    selectedCustomerId,
    setSelectedCustomerId,
    isSubmitting,
    setIsSubmitting,
    refetchCustomers,
    messId
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};
