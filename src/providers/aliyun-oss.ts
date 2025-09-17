/**
 * 阿里云 OSS 上传实现（TypeScript 严格模式）
 * 依赖：npm i ali-oss @types/ali-oss
 */
import OSS from 'ali-oss';
import type { ICloudProvider, AliOSSOptions, UploadTask } from '../types.js';
import { getContentType } from '../utils.js';

export function createAliOSSProvider(conf: AliOSSOptions): ICloudProvider {
    const client = new OSS({
        accessKeyId: conf.accessKeyId,
        accessKeySecret: conf.accessKeySecret,
        bucket: conf.bucket,
        region: conf.region,
        secure: conf.secure ?? true,
    });

    return {
        name: 'AliOSS',
        async upload(task: UploadTask) {
            // 2024-06 官方返回：PutObjectResult → res.headers.etag（字符串）
            const result = await client.put(task.key, task.buffer, {
                headers: { 'Content-Type': getContentType(task.key) },
            });
            // ① 修正：etag 在 headers 里，先断言为对象再取值
            const etag = (result.res.headers as Record<string, string>)['etag'];
            return { etag };
        },

        async cleanRemote(prefix: string) {
            let nextMarker = '';
            do {
                // ② 修正：list 第 2 个参数传 {} 而非 null
                const res = await client.list(
                    { prefix, 'max-keys': 1000, marker: nextMarker },
                    {} // 空 options 即可
                );
                nextMarker = res.nextMarker;
                if (res.objects?.length) await client.deleteMulti(res.objects.map((o) => o.name));
            } while (nextMarker);
            console.log('[AliOSS] 远程清理完成');
        },
    };
}