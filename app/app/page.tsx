'use client';

import { useState, useEffect } from 'react';
import { FormData, BookResponse, ErrorResponse } from '@/app/types';
import { toZonedTime } from 'date-fns-tz';

interface AvailableTimeSlots {
  date: string;
  timeSlots: string[];
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<AvailableTimeSlots[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await fetch('/api/book');
        const data = await response.json();
        setAvailableTimeSlots(data);
        if (data.length > 0) {
          setSelectedDate(data[0].date); // Default to the first available date
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, []);

  const handleDateSelect = (date: string) => {
    console.log('Selected Date:', date);
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;

    // Create a Date object in the local timezone
    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);

    // Convert the date to CST
    const startTime = date;
    const endTime = new Date(date.getTime() + 30 * 60000);

    setFormData(prev => ({
      ...prev,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    }));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    
    // Convert startTime and endTime to ISO format
    const startTimeISO = new Date(formData?.startTime ?? '').toISOString();
    const endTimeISO = new Date(formData?.endTime ?? '').toISOString();

    const successUrl = `${window.location.origin}/confirmation?success=true&name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(formData.phone)}&startTime=${encodeURIComponent(startTimeISO)}&endTime=${encodeURIComponent(endTimeISO)}`;

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startTime: startTimeISO,
          endTime: endTimeISO,
          successUrl,
        }),
      });

      const data = await response.json() as BookResponse | ErrorResponse;
      
      if ('error' in data) {
        throw new Error(data.error);
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      }

      setFormData({ name: '', phone: '', email: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatTime = (date: Date) => {
    if (isNaN(date.getTime())) {
      console.error('Invalid Date:', date);
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date) + ' CT';
  };

  const formatSelectedTime = () => {
    if (!formData.startTime || !formData.endTime) return '';
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const date = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(start);
    return `Selected appointment time: ${date} ${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Schedule a Virtual Consultation with Pedro
          </h2>
          <h4 className="m-2 text-center text-gray-500">
            {step === 1 ? 'Select Appointment Date and Time' : 'Provide Your Contact Info'}
          </h4>
          <h6 className="m-2 text-center text-sm text-gray-500">
            Brought to you by InTown Plumbing
          </h6>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
          </div>
        ) : (
          <>
            {step === 1 ? (
              <div className="mt-8 space-y-4">
                <div className="flex overflow-x-auto space-x-4">
                  {availableTimeSlots.map((slot, index) => {
                    const [year, month, day] = slot.date.split('-').map(Number);
                    const localDate = new Date(year, month - 1, day);

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(slot.date)}
                        className={`px-4 py-2 border rounded-md ${selectedDate === slot.date ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700'}`}
                      >
                        {localDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="mt-4 space-y-2">
                    {availableTimeSlots.find(slot => slot.date === selectedDate)?.timeSlots.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimeSelect(time)}
                        className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {formatTime(new Date(`${selectedDate}T${time}:00`))}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-indigo-700">
                        {formatSelectedTime()}
                      </p>
                    </div>
                  </div>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                      <label htmlFor="name" className="sr-only">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="sr-only">
                        Phone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
} 