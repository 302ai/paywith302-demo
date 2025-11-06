/**
 * 基于 Secret 的字典参数签名验证器 (TypeScript 版本)
 *
 * 使用 HMAC-SHA256 算法确保参数完整性和真实性
 * 与 Python/JavaScript 版本完全兼容,生成相同的签名
 */

import crypto from 'crypto';

/**
 * 参数对象类型 - 允许字符串、数字、布尔值,以及对象(用于复杂结构)
 * 对象类型主要用于extra等扩展字段
 */
export type ParamValue = string | number | boolean | Record<string, unknown>;

export interface Params {
  [key: string]: ParamValue | null | undefined;
}

/**
 * 签名验证器配置选项
 */
export interface ValidatorOptions {
  /** 需要排除的键集合,默认排除 'sign' 和 'signature' */
  excludeKeys?: Set<string>;
  /** 时间戳容差(秒),用于防重放攻击 */
  timestampTolerance?: number;
}

/**
 * 签名验证器类
 * 这个类专门处理API签名验证,别tm乱改逻辑!
 */
export class SignatureValidator {
  private readonly secret: string;

  /**
   * 初始化验证器
   * @param secret - 密钥字符串,不能为空
   * @throws {Error} 当 secret 为空时抛出异常
   */
  constructor(secret: string) {
    if (!secret || secret.trim() === '') {
      throw new Error('Secret 不能为空!');
    }
    this.secret = secret;
  }

  /**
   * 生成签名
   * @param params - 需要签名的参数对象
   * @param timestamp - 时间戳(可选,用于防重放攻击)
   * @param excludeKeys - 需要排除的键集合
   * @returns 签名字符串(十六进制)
   */
  generateSignature(
    params: Params,
    timestamp: number | null = null,
    excludeKeys: Set<string> | null = null
  ): string {
    // 过滤参数
    const finalExcludeKeys = excludeKeys || new Set(['sign', 'signature']);
    const filteredParams: Record<string, ParamValue> = {};

    for (const [key, value] of Object.entries(params)) {
      if (!finalExcludeKeys.has(key) && this._isValidValue(value)) {
        filteredParams[key] = value;
      }
    }

    // 添加时间戳(可选)
    if (timestamp !== null) {
      filteredParams.timestamp = timestamp;
    }

    // 构建签名字符串
    const signString = this._buildSignString(filteredParams);

    // 生成 HMAC-SHA256 签名
    return crypto
      .createHmac('sha256', this.secret)
      .update(signString)
      .digest('hex');
  }

  /**
   * 验证签名是否合法
   * @param params - 请求参数对象
   * @param signature - 待验证的签名
   * @param timestampTolerance - 时间戳容差(秒),null 表示不检查
   * @returns true: 签名合法, false: 签名非法
   */
  validate(
    params: Params,
    signature: string,
    timestampTolerance: number | null = null
  ): boolean {
    // 时间戳检查(防重放攻击) - 这个机制能防止黑客重放请求
    if (timestampTolerance !== null && params.timestamp) {
      if (!this._checkTimestamp(params.timestamp, timestampTolerance)) {
        return false;
      }
    }

    // 生成期望签名
    const expectedSign = this.generateSignature(params);

    // 常量时间比较,防止时序攻击 - 安全性很重要, 别用普通比较!
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSign),
        Buffer.from(signature)
      );
    } catch (error) {
      console.error('[SignatureValidator] validate error', error);
      // 如果长度不一致会抛异常,直接返回false
      return false;
    }
  }

  /**
   * 判断值是否有效(不为空)
   * @private
   */
  private _isValidValue(value: unknown): value is ParamValue {
    // null 或 undefined
    if (value === null || value === undefined) {
      return false;
    }
    // 空字符串
    if (value === '') {
      return false;
    }
    // 空对象
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      return false;
    }
    // 空数组
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * 统一值的字符串表示(跨语言一致性)
   * @private
   */
  private _normalizeValue(value: ParamValue): string {
    // 对象或数组使用JSON序列化(紧凑格式,递归排序所有键)
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(this._sortObjectKeys(value));
    }
    return String(value);
  }

  /**
   * 递归排序对象的所有键(确保与Python一致)
   * @private
   */
  private _sortObjectKeys(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this._sortObjectKeys(item));
    }
    // 对对象的键进行排序
    return Object.keys(obj)
      .sort()
      .reduce((result: Record<string, unknown>, key) => {
        result[key] = this._sortObjectKeys(
          (obj as Record<string, unknown>)[key]
        );
        return result;
      }, {});
  }

  /**
   * 构建待签名字符串
   * 规则: 按 key 字典序排序,拼接为 key1=value1&key2=value2 格式
   * 注意: 空格编码为 + (与Python版本保持一致)
   * @private
   */
  private _buildSignString(params: Record<string, ParamValue>): string {
    // 按 key 排序
    const sortedKeys = Object.keys(params).sort();

    // 构建 URL 编码格式的字符串
    const parts = sortedKeys.map((key) => {
      const value = this._normalizeValue(params[key]);
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      return `${encodedKey}=${encodedValue}`;
    });

    return parts.join('&');
  }

  /**
   * 检查时间戳是否在容差范围内
   * @private
   */
  private _checkTimestamp(timestamp: ParamValue, tolerance: number): boolean {
    try {
      const ts =
        typeof timestamp === 'number'
          ? timestamp
          : parseInt(String(timestamp), 10);

      if (isNaN(ts)) {
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return Math.abs(currentTime - ts) <= tolerance;
    } catch (error) {
      return false;
    }
  }
}

// ============ 便捷函数(可选) ============

/**
 * 快速生成签名的便捷函数
 * @param params - 参数对象
 * @param secret - 密钥
 * @returns 签名字符串
 */
export function quickSign(params: Params, secret: string): string {
  return new SignatureValidator(secret).generateSignature(params);
}

/**
 * 快速验证签名的便捷函数
 * @param params - 参数对象
 * @param signature - 签名
 * @param secret - 密钥
 * @returns 是否合法
 */
export function quickValidate(
  params: Params,
  signature: string,
  secret: string
): boolean {
  return new SignatureValidator(secret).validate(params, signature);
}
