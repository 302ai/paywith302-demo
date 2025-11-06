/**
 * 签名验证器使用示例
 *
 * 提示: 这个demo展示如何使用SignatureValidator进行API签名
 * 包含302支付接口的真实场景示例
 */

import {
  SignatureValidator,
  quickSign,
  quickValidate,
  type Params
} from './signature-validator';

/**
 * 302 AI 支付接口参数类型定义
 * API: https://test-api2.gpt302.com/302/api/charge
 */
export interface Pay302Params extends Params {
  app_id: string; // 应用ID
  user_name: string; // 用户名
  email: string; // 用户邮箱
  amount: number; // 支付金额
  back_url: string; // 返回URL
  fail_url: string; // 失败回调URL
  suc_url: string; // 成功回调URL
  extra?: Record<string, unknown>; // 额外参数(可选)
  signature?: string; // 签名(提交时携带)
}

/**
 * 302支付接口参数类型
 */
interface PaymentParams {
  app_id: string;
  secret?: string; // secret不参与签名,仅用于生成签名
  user_name: string;
  email: string;
  amount: number;
  back_url: string;
  fail_url: string;
  suc_url: string;
  extra?: Record<string, unknown>;
  signature?: string;
}

/**
 * 示例1: 302支付接口签名生成
 * 这个SB例子展示真实的支付场景
 */
function example302Payment() {
  console.log('='.repeat(60));
  console.log('示例 1: 302支付接口签名生成');
  console.log('='.repeat(60));

  const SECRET = 'ck-f9821410aed88898ad13e75d';
  const validator = new SignatureValidator(SECRET);

  // 支付请求参数 - 按照302 API文档要求
  const paymentParams: PaymentParams = {
    app_id: '3f52c129-5310-4531-a8f8-bf7257136cfa',
    user_name: 'Franklin Santos',
    email: 'ron@ehido.kp',
    amount: 39.99,
    back_url: 'https://baidu.com',
    fail_url: 'http://fail.url',
    suc_url: 'http://suc.url',
    extra: {}
  };

  // 生成签名 - secret不参与签名计算
  const signature = validator.generateSignature(
    paymentParams as unknown as Params
  );

  // 构建完整的请求数据
  const requestData = {
    ...paymentParams,
    secret: SECRET, // secret要传给服务端,但不参与签名
    signature
  };

  console.log('\n原始参数:');
  console.log(JSON.stringify(paymentParams, null, 2));

  console.log('\n生成的签名:', signature);

  console.log('\n完整请求体:');
  console.log(JSON.stringify(requestData, null, 2));

  // 验证签名
  const isValid = validator.validate(
    paymentParams as unknown as Params,
    signature
  );
  console.log('\n签名验证结果:', isValid ? '✓ 合法' : '✗ 非法');
  console.log('\n');
}

/**
 * 示例2: 基本签名生成与验证
 */
function exampleBasicSignature() {
  console.log('='.repeat(60));
  console.log('示例 2: 基本签名生成与验证');
  console.log('='.repeat(60));

  const SECRET = 'your_secret_key_here';
  const validator = new SignatureValidator(SECRET);

  // 客户端生成签名
  const requestParams: Params = {
    user_id: 12345,
    action: 'transfer',
    amount: 100.5,
    currency: 'USD'
  };

  const signature = validator.generateSignature(requestParams);
  const paramsWithSign = { ...requestParams, sign: signature };

  console.log('\n请求参数:', paramsWithSign);
  console.log('生成签名:', signature);

  // 服务端验证签名
  let isValid = validator.validate(paramsWithSign, signature);
  console.log('签名验证结果:', isValid ? '✓ 合法' : '✗ 非法');

  // 篡改参数测试
  console.log('\n' + '-'.repeat(60));
  console.log('篡改测试: 修改 amount 参数');
  console.log('-'.repeat(60));
  const tamperedParams = { ...paramsWithSign, amount: 999999 };
  isValid = validator.validate(tamperedParams, signature);
  console.log('篡改后验证结果:', isValid ? '✓ 合法' : '✗ 非法 (符合预期)');
  console.log('\n');
}

/**
 * 示例3: 带时间戳的防重放攻击
 */
function exampleTimestampValidation() {
  console.log('='.repeat(60));
  console.log('示例 3: 带时间戳的防重放攻击');
  console.log('='.repeat(60));

  const SECRET = 'your_secret_key_here';
  const validator = new SignatureValidator(SECRET);

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const secureParams: Params = {
    user_id: 12345,
    action: 'login',
    timestamp: currentTimestamp
  };

  const secureSignature = validator.generateSignature(secureParams);
  const secureParamsWithSign = { ...secureParams, sign: secureSignature };

  console.log('\n带时间戳的请求:', secureParamsWithSign);

  // 验证(5分钟容差)
  let isValid = validator.validate(secureParamsWithSign, secureSignature, 300);
  console.log('当前时间验证:', isValid ? '✓ 合法' : '✗ 非法');

  // 模拟过期请求
  console.log('\n模拟10分钟前的过期请求...');
  const oldParams: Params = {
    ...secureParams,
    timestamp: currentTimestamp - 600 // 10分钟前
  };
  const oldSignature = validator.generateSignature(oldParams);
  isValid = validator.validate(oldParams, oldSignature, 300);
  console.log('过期请求验证:', isValid ? '✓ 合法' : '✗ 非法 (符合预期)');
  console.log('\n');
}

/**
 * 示例4: 便捷函数使用
 */
function exampleQuickFunctions() {
  console.log('='.repeat(60));
  console.log('示例 4: 便捷函数使用');
  console.log('='.repeat(60));

  const SECRET = 'your_secret_key_here';
  const params: Params = { product_id: 'ABC123', quantity: 5 };

  // 快速生成签名
  const sign = quickSign(params, SECRET);
  console.log('\n快速签名:', sign);

  // 快速验证
  const isValid = quickValidate(params, sign, SECRET);
  console.log('快速验证:', isValid ? '✓ 合法' : '✗ 非法');
  console.log('\n');
}

/**
 * 示例5: 跨语言兼容性测试
 */
function exampleCrossLanguageCompatibility() {
  console.log('='.repeat(60));
  console.log('示例 5: 与 Python/JavaScript 版本兼容性测试');
  console.log('='.repeat(60));

  const SECRET = 'your_secret_key_here';
  const validator = new SignatureValidator(SECRET);

  const testParams: Params = {
    user_id: 12345,
    action: 'transfer',
    amount: 100.5,
    currency: 'USD'
  };

  const testSignature = validator.generateSignature(testParams);
  console.log('\n测试参数:', testParams);
  console.log('TS 生成的签名:', testSignature);
  console.log('\n提示: 请使用相同参数在 Python/JS 中验证,应得到相同签名');
  console.log('\n');
}

/**
 * 运行所有示例
 * 提示: 直接运行这个文件看效果!
 */
function runAllExamples() {
  console.log('\n');
  console.log('🚀 签名验证器使用示例 - 老王出品');
  console.log('\n');

  // 先展示302支付的真实场景
  example302Payment();

  // 再展示其他通用场景
  exampleBasicSignature();
  exampleTimestampValidation();
  exampleQuickFunctions();
  exampleCrossLanguageCompatibility();

  console.log('='.repeat(60));
  console.log('✓ 所有示例运行完成!');
  console.log('='.repeat(60));
}

// 仅在直接运行时执行示例(Node.js 环境)
if (typeof require !== 'undefined' && require.main === module) {
  runAllExamples();
}

// 导出示例函数供其他地方调用
export {
  example302Payment,
  exampleBasicSignature,
  exampleTimestampValidation,
  exampleQuickFunctions,
  exampleCrossLanguageCompatibility,
  runAllExamples
};
