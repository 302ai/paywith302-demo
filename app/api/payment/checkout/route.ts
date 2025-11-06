/**
 * 302支付平台Webhook回调接口
 *
 * 该接口处理来自302支付平台的支付回调通知
 * 验证签名并处理支付状态更新
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
 * 302平台支付回调Webhook参数
 *
 * 这是302支付平台在支付完成后发送的数据结构
 */
interface PaymentWebhookCallback extends Params {
  extra: Record<string, unknown>;    // 自定义数据(包含order_id、source等)
  payment_order: string;             // 302平台支付订单号
  payment_fee: number;               // 支付手续费
  payment_amount: number;            // 实际支付金额
  payment_status: number;            // 支付状态: 0=未支付, 1=支付完成, -1=失败, -2=超时
  app_id: string;                    // 应用ID
  signature: string;                 // 请求签名用于验证
}

/**
 * POST /api/payment/checkout
 *
 * 302支付平台回调Webhook端点
 *
 * 该端点接收来自302支付平台的支付状态通知
 *
 * 请求体示例 (Request Body Example):
 * ```json
 * {
 *   "extra": {
 *     "source": "web",
 *     "order_id": "ORDER_1762399109268"
 *   },
 *   "payment_order": "302平台生成的支付订单号",
 *   "payment_fee": 0,
 *   "payment_amount": 39.99,
 *   "payment_status": 1,
 *   "app_id": "你的应用ID",
 *   "signature": "HMAC-SHA256签名字符串"
 * }
 * ```
 *
 * 重要流程:
 * 1. 验证webhook签名以确保请求真实性
 * 2. 检查payment_status字段 (0=未支付, 1=支付完成, -1=失败, -2=超时)
 * 3. 从extra字段中提取order_id
 *
 * TODO - 生产环境实现步骤:
 * 4. 查询数据库通过order_id找到订单
 * 5. 验证payment_amount是否与订单金额匹配 (防止金额篡改)
 * 6. 更新数据库中的订单状态 (pending -> paid/failed)
 * 7. 触发业务逻辑:
 *    - 发送确认邮件给用户
 *    - 授予购买的服务/产品访问权限
 *    - 更新用户账户余额/积分
 *    - 生成发票/收据
 * 8. 记录支付日志用于审计追踪
 * 9. 返回成功响应给302平台 (必须返回200 OK以确认收到)
 *
 * 安全注意事项:
 * - 必须在任何处理之前验证签名
 * - 必须实现幂等性 (同一个回调可能到达多次)
 * - 即使已处理也必须返回200 (以停止重试)
 * - 必须使用数据库事务更新订单状态
 */
export async function POST(request: NextRequest) {
  try {
    // 解析webhook回调请求体
    const body: PaymentWebhookCallback = await request.json();

    console.log('[302 Webhook Received]:', JSON.stringify(body, null, 2));

    // ==================== 步骤1: 验证必填字段 ====================
    if (!body.signature || !body.app_id || !body.payment_order) {
      console.error('[Webhook Validation Failed]: Missing required fields');
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: signature, app_id, payment_order'
        },
        { status: 400 }
      );
    }

    // 验证app_id是否匹配配置
    if (body.app_id !== PAY302_CONFIG.appId) {
      console.error('[Webhook Validation Failed]: Invalid app_id');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid app_id'
        },
        { status: 403 }
      );
    }

    // ==================== 步骤2: 签名验证 ====================
    // 从请求体中提取签名 (验证时会被排除)
    const receivedSignature = body.signature;

    // 使用SignatureValidator验证签名
    const validator = new SignatureValidator(PAY302_CONFIG.secret);
    const isValidSignature = validator.validate(
      body,
      receivedSignature
    );

    if (!isValidSignature) {
      console.error('[Webhook Security Alert]: Invalid signature detected!');
      console.error('[Received Signature]:', receivedSignature);
      console.error('[Request Body]:', body);

      // 安全: 无效签名表示潜在攻击或配置错误
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid signature - request authentication failed'
        },
        { status: 401 }
      );
    }

    console.log('[Signature Verified]: ✓ Request is authentic');

    // ==================== 步骤3: 提取支付信息 ====================
    const {
      payment_order,
      payment_amount,
      payment_fee,
      payment_status,
      extra
    } = body;

    // 从extra字段中提取自定义order_id
    const orderId = (extra?.order_id as string) || 'UNKNOWN';
    const source = (extra?.source as string) || 'unknown';

    console.log('[Payment Info]:');
    console.log('  - Order ID:', orderId);
    console.log('  - Payment Order:', payment_order);
    console.log('  - Amount:', payment_amount);
    console.log('  - Fee:', payment_fee);
    console.log(
      '  - Status:',
      payment_status,
      `(${getPaymentStatusText(payment_status)})`
    );
    console.log('  - Source:', source);

    // ==================== 步骤4: 检查支付状态 ====================
    const isPaymentSuccess = payment_status === 1;

    if (isPaymentSuccess) {
      console.log('[Payment SUCCESS]: ✓ Payment completed successfully');

      // TODO - 生产环境: 更新数据库订单状态
      // 示例伪代码:
      // ```
      // const order = await db.order.findUnique({ where: { orderId } });
      // if (!order) {
      //   return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      // }
      //
      // // 验证金额是否匹配 (防止金额篡改攻击)
      // if (order.amount !== payment_amount) {
      //   console.error('[Security Alert]: Amount mismatch!');
      //   return NextResponse.json({ success: false, error: 'Amount mismatch' }, { status: 400 });
      // }
      //
      // // 幂等性检查 - 如果已处理,直接返回成功
      // if (order.status === 'paid') {
      //   console.log('[Idempotent]: Order already processed');
      //   return NextResponse.json({ success: true, message: 'Already processed' });
      // }
      //
      // // 在事务中更新订单状态
      // await db.$transaction(async (tx) => {
      //   await tx.order.update({
      //     where: { orderId },
      //     data: {
      //       status: 'paid',
      //       payment_order,
      //       payment_amount,
      //       payment_fee,
      //       paid_at: new Date()
      //     }
      //   });
      //
      //   // 给用户账户增加积分/余额
      //   await tx.user.update({
      //     where: { id: order.userId },
      //     data: { credits: { increment: order.credits } }
      //   });
      // });
      //
      // // 发送确认邮件
      // await sendPaymentConfirmationEmail(order.email, {
      //   orderId,
      //   amount: payment_amount,
      //   payment_order
      // });
      //
      // // 记录审计日志
      // await db.paymentLog.create({
      //   data: {
      //     orderId,
      //     payment_order,
      //     amount: payment_amount,
      //     fee: payment_fee,
      //     status: 'success',
      //     webhook_data: body
      //   }
      // });
      // ```
    } else if (payment_status === 0) {
      console.log('[Payment UNPAID]: ⧗ Order is unpaid');

      // TODO - 生产环境: 保持订单为未支付状态
      // 无需操作,等待用户完成支付
    } else if (payment_status === -1) {
      console.log('[Payment FAILED]: ✗ Payment failed');

      // TODO - 生产环境: 更新订单状态为失败
      // await db.order.update({
      //   where: { orderId },
      //   data: { status: 'failed', failed_at: new Date() }
      // });
    } else if (payment_status === -2) {
      console.log('[Payment TIMEOUT]: ⏱ Payment timeout');

      // TODO - 生产环境: 更新订单状态为超时
      // await db.order.update({
      //   where: { orderId },
      //   data: { status: 'timeout', timeout_at: new Date() }
      // });
    } else {
      console.warn('[Unknown Status]:', payment_status);
    }

    // ==================== 步骤5: 返回成功响应 ====================
    // 重要: 必须返回200 OK告诉302平台我们已收到回调
    // 如果返回错误,302会持续重试回调
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      data: {
        order_id: orderId,
        payment_order,
        payment_status,
        is_payment_complete: isPaymentSuccess,
        status_text: getPaymentStatusText(payment_status)
      },
      // 开发环境包含调试信息
      ...(IS_DEBUG && {
        debug: {
          signature_valid: true,
          received_data: body
        }
      })
    });
  } catch (error) {
    console.error('[Webhook Processing Error]:', error);

    // 重要: 即使发生错误,也考虑返回200以防止无休止的重试
    // 记录错误用于人工审查
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 获取支付状态的可读文本
 */
function getPaymentStatusText(status: number): string {
  switch (status) {
    case 1:
      return 'COMPLETED';
    case 0:
      return 'UNPAID';
    case -1:
      return 'FAILED';
    case -2:
      return 'TIMEOUT';
    default:
      return 'UNKNOWN';
  }
}

/**
 * GET /api/payment/checkout
 *
 * 健康检查端点 - 不用于支付处理
 */
export async function GET() {
  return NextResponse.json({
    message: 'Payment webhook endpoint is active',
    note: 'This endpoint only accepts POST requests from 302 payment platform'
  });
}
