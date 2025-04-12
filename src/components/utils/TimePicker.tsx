import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimePicker = ({ value, onChange }: TimePickerProps) => {
  const [timeValue, setTimeValue] = useState('');

  useEffect(() => {
    if (value) {
      // Format incoming value as HH:MM if it's not already
      const formattedTime = formatTimeForDisplay(value);
      setTimeValue(formattedTime);
    }
  }, [value]);

  // Convert time to a display format
  const formatTimeForDisplay = (time: string): string => {
    // If it already contains a colon, assume it's in HH:MM format
    if (time.includes(':')) return time;
    
    // Otherwise, try to parse it
    try {
      const date = new Date(`2000-01-01T${time}`);
      return date.toTimeString().substring(0, 5); // Get HH:MM from time string
    } catch {
      return time; // Return as is if parsing fails
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTimeValue(newValue);
    
    // Ensure time is in HH:MM:SS format for database
    let formattedTime = newValue;
    if (newValue.length === 5 && newValue.includes(':')) {
      formattedTime = `${newValue}:00`;
    }
    
    onChange(formattedTime);
  };

  return (
    <Input
      type="time"
      value={timeValue}
      onChange={handleChange}
    />
  );
};
