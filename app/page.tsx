'use client';

import { useState } from 'react';
import Image from 'next/image';
import Logo from './logo.png';

interface PaymentResponse {
  success: boolean;
  data?: unknown;
  signature?: string;
  error?: string;
  message?: string;
}

export default function Home() {
  const [amount, setAmount] = useState('0.01');
  const [userName, setUserName] = useState('Franklin Santos');
  const [email, setEmail] = useState('ron@ehido.kp');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResponse | null>(null);

  const handlePayment = async () => {
    const amountValue = parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      setResult({
        success: false,
        error: 'Invalid amount',
        message: 'Please enter a valid amount greater than 0'
      });
      return;
    }

    if (!userName || userName.trim() === '') {
      setResult({
        success: false,
        error: 'Invalid user name',
        message: 'Please enter a valid user name'
      });
      return;
    }

    if (!email || email.trim() === '') {
      setResult({
        success: false,
        error: 'Invalid email',
        message: 'Please enter a valid email address'
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResult({
        success: false,
        error: 'Invalid email format',
        message: 'Please enter a valid email address'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const paymentData = {
        user_name: userName,
        email: email,
        amount: amountValue,
        back_url: window.location.origin,
        fail_url: window.location.origin + '/payment/fail',
        suc_url: window.location.origin + '/payment/success',
        extra: {
          order_id: 'ORDER_' + Date.now(),
          source: 'web'
        }
      };

      console.log('Payment Request:', paymentData);

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const res: PaymentResponse = await response.json();

      console.log('Payment Response:', res);
      setResult(res);

      if (
        res.success &&
        res.data &&
        typeof res.data === 'object' &&
        'url' in res.data
      ) {
        const paymentUrl = (res.data as { url?: string }).url;
        if (paymentUrl) {
          console.log('Redirecting to:', paymentUrl);
          window.location.href = paymentUrl;
        }
      }
    } catch (error) {
      console.error('Payment Error:', error);
      setResult({
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handlePayment();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium rounded-md">
              Demo
            </span>
          </div>
          <a
            href="https://github.com/302ai/paywith302-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Payment Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-8">
          {/* Title with Logo Placeholder */}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-2">
                <Image
                  src={Logo}
                  alt="302 Logo"
                  width={32}
                  height={32}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pay with 302
              </h1>
            </div>
          </div>

          {/* User Info - Editable */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
              测试支付信息
            </h4>
            <div className="space-y-3">
              {/* User Name Input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={loading}
                  placeholder="请输入用户名"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="请输入邮箱地址"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              金额
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg font-semibold">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={loading}
                className="w-full pl-10 pr-4 py-4 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white text-lg font-semibold transition-all transform cursor-pointer ${
              loading
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              </span>
            ) : (
              '支付'
            )}
          </button>

          {/* Result Display */}
          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  result.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {result.success ? '✓ Success' : '✗ Failed'}
              </p>
              {result.message && (
                <p
                  className={`text-xs mt-1 ${
                    result.success
                      ? 'text-green-600 dark:text-green-300'
                      : 'text-red-600 dark:text-red-300'
                  }`}
                >
                  {result.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Test payment demo - Safe to use
        </p>
      </main>
    </div>
  );
}
