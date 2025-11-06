/**
 * 302支付订单创建API接口
 *
 * 该接口处理支付请求签名生成并调用302 API
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  SignatureValidator,
  type Params
} from '@/app/utils/signature-validator';

// 302支付配置 - 生产环境应使用环境变量
const PAY302_CONFIG = {
  appId: process.env.PAY302_APP_ID || '',
  secret: process.env.PAY302_SECRET || '',
  apiUrl: process.env.PAY302_API_URL || ''
};
const IS_DEBUG = process.env.IS_DEBUG === 'true';

/**
 * 请求体参数
 */
interface CheckoutRequest {
  user_name: string;                   // 用户名
  email: string;                       // 用户邮箱
  amount: number;                      // 支付金额
  back_url?: string;                   // 返回URL(可选)
  fail_url?: string;                   // 失败回调URL(可选)
  suc_url?: string;                    // 成功回调URL(可选)
  extra?: Record<string, unknown>;     // 额外自定义数据(可选)
}

/**
 * 302支付参数接口
 */
interface PaymentParams extends Params {
  app_id: string;                      // 应用ID
  user_name: string;                   // 用户名
  email: string;                       // 用户邮箱
  amount: number;                      // 支付金额
  back_url: string;                    // 返回URL
  fail_url: string;                    // 失败回调URL
  suc_url: string;                     // 成功回调URL
  extra?: Record<string, unknown>;     // 额外数据
  signature?: string;                  // 签名(生成后添加)
}

/**
 * POST /api/payment/create
 * 创建302支付订单
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: CheckoutRequest = await request.json();

    // 参数验证
    if (!body.user_name || !body.email || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: user_name, email, amount' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 构建302支付请求参数
    const paymentParams: PaymentParams = {
      app_id: PAY302_CONFIG.appId,
      secret: PAY302_CONFIG.secret,
      user_name: body.user_name,
      email: body.email,
      amount: body.amount,
      back_url: body.back_url || '',
      fail_url: body.fail_url || '',
      suc_url: body.suc_url || '',
      extra: body.extra || {}
    };

    // 生成签名
    const validator = new SignatureValidator(PAY302_CONFIG.secret);
    const signature = validator.generateSignature(paymentParams);

    // 构建最终请求数据 - secret和signature都需要
    const requestData = {
      ...paymentParams,
      signature
    };

    console.log('[302 Payment Request]:', JSON.stringify(requestData, null, 2));

    // 调用302支付API
    const response = await fetch(PAY302_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    // 处理302 API响应
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[302 Payment API Error]:', errorText);
      return NextResponse.json(
        { error: 'Payment API call failed', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('[302 Payment Response]:', result);

    // 返回支付结果
    return NextResponse.json({
      success: true,
      ...result,
      signature: IS_DEBUG ? signature : undefined // 调试模式包含签名
    });
  } catch (error) {
    console.error('[Checkout API Error]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/create
 * 获取支付配置信息 (不包含敏感数据)
 */
export async function GET() {
  return NextResponse.json({
    apiUrl: PAY302_CONFIG.apiUrl,
    appId: PAY302_CONFIG.appId,
    // 重要: 绝不暴露secret!
    message: 'Use POST method to create payment order'
  });
}
