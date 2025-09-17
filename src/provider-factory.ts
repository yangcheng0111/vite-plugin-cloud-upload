/**
 * 云厂商工厂函数
 */
import type {ICloudProvider, Options} from './types.js';
import {createCOSProvider} from './providers/tencent-cos.js';
import {createAliOSSProvider} from './providers/aliyun-oss.js';

export function createProvider(opts: Options): ICloudProvider {
    if (opts.provider === 'tencent') return createCOSProvider(opts.providerConfig as any);
    if (opts.provider === 'aliyun') return createAliOSSProvider(opts.providerConfig as any);
    throw new Error('[cloud-upload] 未知的 provider 类型');
}