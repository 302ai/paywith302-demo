'use client';

/**
 * Payment Failure Page
 *
 * This page is displayed when payment fails
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function FailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get error info from URL params
  const errorCode = searchParams.get('error_code');
  const errorMessage = searchParams.get('error_message') || 'Payment processing failed';
  const orderId = searchParams.get('order_id');

  const handleRetry = () => {
    router.push('/');
  };

  const handleContactSupport = () => {
    // Open support email or link
    window.location.href = 'mailto:support@302.ai?subject=Payment Issue';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center justify-center py-16 px-8">
        <div className="w-full space-y-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6">
              <svg
                className="w-16 h-16 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payment Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {errorMessage}
            </p>
          </div>

          {/* Error Details */}
          {(errorCode || orderId) && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-3">
                Error Details
              </h3>
              <dl className="space-y-3 text-sm">
                {errorCode && (
                  <div className="flex justify-between">
                    <dt className="text-red-700 dark:text-red-300">Error Code:</dt>
                    <dd className="text-red-900 dark:text-red-100 font-mono">
                      {errorCode}
                    </dd>
                  </div>
                )}
                {orderId && (
                  <div className="flex justify-between">
                    <dt className="text-red-700 dark:text-red-300">Order ID:</dt>
                    <dd className="text-red-900 dark:text-red-100 font-mono">
                      {orderId}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Common Issues */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
              Common Issues
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Insufficient funds in your account
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Payment card expired or invalid
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Network connection issues
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Bank security restrictions
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleRetry}
              className="flex-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
            <button
              onClick={handleContactSupport}
              className="flex-1 inline-flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Contact Support
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If the problem persists, please contact our support team with the error code above
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    }>
      <FailureContent />
    </Suspense>
  );
}
