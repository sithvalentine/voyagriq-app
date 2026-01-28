"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  link: string;
  completed: boolean;
}

const ONBOARDING_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'add-first-trip',
    title: 'Add Your First Trip',
    description: 'Start tracking your travel business by adding your first trip. Include client name, destination, dates, and costs.',
    action: 'Add Trip',
    link: '/trips',
  },
  {
    id: 'set-commission',
    title: 'Set Default Commission Rate',
    description: 'Configure your default commission percentage to automatically calculate earnings on all trips.',
    action: 'Set Commission',
    link: '/settings',
  },
  {
    id: 'explore-analytics',
    title: 'Explore Your Analytics',
    description: 'View your dashboard to see revenue insights, top destinations, and commission breakdowns.',
    action: 'View Analytics',
    link: '/analytics',
  },
  {
    id: 'try-export',
    title: 'Export Your First Report',
    description: 'Generate a professional report in CSV, Excel, or PDF format to share with clients or for your records.',
    action: 'Export Report',
    link: '/export-options',
  },
  {
    id: 'invite-team',
    title: 'Invite Team Members (Optional)',
    description: 'If you have team members, invite them to collaborate on trip tracking and reporting.',
    action: 'Manage Team',
    link: '/settings/team',
  },
];

const STORAGE_KEY = 'voyagriq-onboarding';

export default function OnboardingGuide() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Load onboarding progress from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);

        // Check if user has dismissed the guide
        if (data.dismissed) {
          setIsVisible(false);
          return;
        }

        // Load step completion status
        const loadedSteps = ONBOARDING_STEPS.map(step => ({
          ...step,
          completed: data.completedSteps?.includes(step.id) || false,
        }));

        setSteps(loadedSteps);

        // Find the first incomplete step
        const firstIncomplete = loadedSteps.findIndex(s => !s.completed);
        setCurrentStepIndex(firstIncomplete !== -1 ? firstIncomplete : loadedSteps.length - 1);

        // Show guide if not all steps are completed
        const allCompleted = loadedSteps.every(s => s.completed);
        setIsVisible(!allCompleted);
        setIsExpanded(data.isExpanded !== false); // Default to expanded
      } catch (e) {
        console.error('Error loading onboarding data:', e);
        initializeSteps();
      }
    } else {
      initializeSteps();
    }
  }, [user]);

  const initializeSteps = () => {
    const initialSteps = ONBOARDING_STEPS.map(step => ({
      ...step,
      completed: false,
    }));
    setSteps(initialSteps);
    setIsVisible(true);
    setCurrentStepIndex(0);
  };

  const saveProgress = (updatedSteps: OnboardingStep[], expanded: boolean, dismissed: boolean = false) => {
    const data = {
      completedSteps: updatedSteps.filter(s => s.completed).map(s => s.id),
      isExpanded: expanded,
      dismissed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const markStepComplete = (stepId: string) => {
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, completed: true } : step
    );
    setSteps(updatedSteps);
    saveProgress(updatedSteps, isExpanded);

    // Move to next incomplete step
    const nextIncomplete = updatedSteps.findIndex((s, idx) => !s.completed && idx > currentStepIndex);
    if (nextIncomplete !== -1) {
      setCurrentStepIndex(nextIncomplete);
    }

    // Check if all steps are complete
    const allCompleted = updatedSteps.every(s => s.completed);
    if (allCompleted) {
      // Auto-hide after 3 seconds if all complete
      setTimeout(() => setIsVisible(false), 3000);
    }
  };

  const dismissGuide = () => {
    setIsVisible(false);
    saveProgress(steps, isExpanded, true);
  };

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    saveProgress(steps, newExpanded);
  };

  if (!isVisible || !user) return null;

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = (completedCount / totalSteps) * 100;
  const currentStep = steps[currentStepIndex];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 cursor-pointer"
          onClick={toggleExpanded}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Getting Started Guide</h3>
                <p className="text-white/80 text-sm">
                  {completedCount} of {totalSteps} steps completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded();
                }}
                className="hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissGuide();
                }}
                className="hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4">
            {completedCount === totalSteps ? (
              // All steps completed
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">You're All Set! 🎉</h4>
                <p className="text-gray-600 mb-4">
                  You've completed the onboarding guide. You're ready to manage your travel business with VoyagrIQ!
                </p>
                <button
                  onClick={dismissGuide}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Close Guide
                </button>
              </div>
            ) : (
              <>
                {/* Current Step */}
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {currentStepIndex + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{currentStep?.title}</h4>
                      <p className="text-sm text-gray-600">{currentStep?.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={currentStep?.link || '#'}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
                    >
                      {currentStep?.action}
                    </Link>
                    <button
                      onClick={() => markStepComplete(currentStep?.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                      title="Mark as complete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* All Steps Checklist */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-3">All Steps</h5>
                  <div className="space-y-2">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-2 text-sm ${
                          step.completed ? 'text-gray-400' : 'text-gray-700'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          step.completed
                            ? 'bg-green-500 border-green-500'
                            : index === currentStepIndex
                            ? 'border-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {step.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={step.completed ? 'line-through' : ''}>{step.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Help Link */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/about"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Need help? View full documentation
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
