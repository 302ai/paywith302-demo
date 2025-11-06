'use client';

/**
 * Payment Success Page
 *
 * This page is displayed when payment is successful
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get payment info from URL params
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const transactionId = searchParams.get('transaction_id');

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center justify-center py-16 px-8">
        <div className="w-full space-y-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
              <svg
                className="w-16 h-16 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payment Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your payment has been processed successfully
            </p>
          </div>

          {/* Payment Details */}
          {(orderId || amount || transactionId) && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Payment Details
              </h3>
              <dl className="space-y-3 text-sm">
                {orderId && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Order ID:</dt>
                    <dd className="text-gray-900 dark:text-white font-mono">
                      {orderId}
                    </dd>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Amount:</dt>
                    <dd className="text-gray-900 dark:text-white font-semibold">
                      ${amount}
                    </dd>
                  </div>
                )}
                {transactionId && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Transaction ID:</dt>
                    <dd className="text-gray-900 dark:text-white font-mono text-xs">
                      {transactionId}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleBackHome}
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </button>
            <button
              onClick={() => window.print()}
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Receipt
            </button>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">Note:</span> A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
