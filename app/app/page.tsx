'use client';

import { useState, useEffect } from 'react';
import { FormData, BookResponse, ErrorResponse, TimeSlot } from '@/app/types';

function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30); // Round up to next 30 min

  for (let i = 0; i < 5; i++) {
    const startTime = new Date(now.getTime() + i * 30 * 60000);
    const endTime = new Date(startTime.getTime() + 30 * 60000);
    
    slots.push({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      formattedTime: `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
  }

  return slots;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots());
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeSelect = (slot: TimeSlot) => {
    setFormData(prev => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime
    }));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          successUrl: `${window.location.origin}/confirmation?success=true`,
          cancelUrl: `${window.location.origin}/confirmation?success=false`,
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

  const formatSelectedTime = () => {
    if (!formData.startTime || !formData.endTime) return '';
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Schedule a Virtual Consultation
          </h2>
          <h4 className="m-2 text-center text-gray-500">
            {step === 1 ? 'Select Appointment Time' : 'Provide Your Contact Info'}
          </h4>
          <h6 className="m-2 text-center text-sm text-gray-500">
            Brought to you by InTown Plumbing
          </h6>
        </div>

        {step === 1 ? (
          <div className="mt-8 space-y-4">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => handleTimeSelect(slot)}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {slot.formattedTime}
              </button>
            ))}
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
                    Selected appointment time: <span className="font-medium">{formatSelectedTime()}</span>
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
      </div>
    </main>
  );
} 