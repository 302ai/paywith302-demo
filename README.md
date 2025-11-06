# Pay with 302 Demo

一个基于 Next.js 的 302AI 支付平台集成示例项目，展示了完整的支付流程实现，包括订单创建、签名验证和 Webhook 回调处理。

## ✨ 功能特性

- 🔐 **HMAC-SHA256 签名验证** - 确保支付请求的安全性和完整性
- 💳 **完整支付流程** - 从订单创建到支付完成的端到端实现
- 🔔 **Webhook 回调处理** - 接收并处理 302AI 平台的支付状态通知
- 🎨 **现代化 UI** - 基于 Tailwind CSS 的响应式界面
- 📱 **移动端适配** - 完美支持移动设备访问
- ⚡ **实时状态更新** - 支付状态实时反馈

## 🛠️ 技术栈

### 前端
- **Next.js 16** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript 5** - 类型安全的 JavaScript
- **Tailwind CSS 4** - 原子化 CSS 框架

### 后端
- **Next.js API Routes** - 服务端 API 接口
- **Node.js Crypto** - 签名生成和验证

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd paywith302-demo
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 配置环境变量

创建 `.env.local` 文件并配置以下环境变量：

```env
# 302AI 支付平台配置
PAY302_APP_ID=你的应用ID
PAY302_SECRET=你的应用密钥
PAY302_API_URL=https://api.302.ai/payment/create

# 调试模式 (可选)
IS_DEBUG=true
```

### 4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 5. 构建生产版本

```bash
npm run build
npm run start
```

## 📖 核心功能说明

### 1. 签名验证机制

项目已经实现了 HMAC-SHA256 签名算法：

**核心特性：**
- ✅ 空值过滤 (过滤 null、undefined、空字符串、空对象、空数组)
- ✅ 递归对象键排序 (确保 JSON 序列化的确定性)
- ✅ 自动排除 signature 和 secret 字段

**使用示例：**

```typescript
import { SignatureValidator } from '@/app/utils/signature-validator';

const validator = new SignatureValidator('your-secret-key');

// 生成签名
const params = {
  app_id: 'your-app-id',
  amount: 39.99,
  email: 'user@example.com'
};
const signature = validator.generateSignature(params);

// 验证签名
const isValid = validator.validate(params, receivedSignature);
```

### 2. 支付流程

#### 创建支付订单

**API 端点：** `POST /api/payment/create`

**请求体：**
```json
{
  "user_name": "用户名",
  "email": "user@example.com",
  "amount": 39.99,
  "back_url": "http://localhost:3000",
  "fail_url": "http://localhost:3000/payment/fail",
  "suc_url": "http://localhost:3000/payment/success",
  "extra": {
    "order_id": "ORDER_1234567890",
    "source": "web"
  }
}
```

**响应：**
```json
{
  "success": true,
  "url": "https://...",
  "payment_order": "..."
}
```

#### Webhook 回调处理

**API 端点：** `POST /api/payment/checkout`

**302 平台回调数据：**
```json
{
  "extra": {
    "source": "web",
    "order_id": "ORDER_1762399109268"
  },
  "payment_order": "302平台生成的支付订单号",
  "payment_fee": "0.0",
  "payment_amount": 39.99,
  "payment_status": 1,
  "app_id": "你的应用ID",
  "signature": "HMAC-SHA256签名字符串"
}
```

**支付状态码：**
- `0` - 未支付
- `1` - 支付完成
- `-1` - 支付失败
- `-2` - 支付超时

## 🎨 界面展示

### 首页 - 支付演示
- Demo 标识
- GitHub 开源项目链接
- 用户信息输入 (用户名、邮箱)
- 金额输入框
- 一键支付按钮

### 支付成功页面
- 成功图标和提示
- 订单详情展示
- 返回首页和打印收据功能

### 支付失败页面
- 失败图标和错误信息
- 常见问题说明
- 重试和联系支持功能

## 📝 环境变量说明

| 变量名 | 说明 | 必填 | 示例 |
|--------|------|------|------|
| `PAY302_APP_ID` | 302AI 平台应用 ID | ✅ | `app_123456` |
| `PAY302_SECRET` | 302AI 平台应用密钥 | ✅ | `sk_abc123...` |
| `PAY302_API_URL` | 302AI 支付 API 地址 | ✅ | `https://xxxxxx/api/payment/create` |
| `IS_DEBUG` | 调试模式开关 | ❌ | `true` / `false` |

## 📄 License

MIT License

- GitHub: [项目地址](https://github.com/302ai/paywith302-demo)
- 问题反馈: [Issues](https://github.com/302ai/paywith302-demo/issues)

---
