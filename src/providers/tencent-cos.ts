/**
 * 腾讯云 COS 上传实现
 */
import COS from 'cos-nodejs-sdk-v5';
import type { ICloudProvider, TencentCOSOptions, UploadTask } from '../types.js';
import { getContentType } from '../utils.js';

export function createCOSProvider(conf: TencentCOSOptions): ICloudProvider {
    const cos = new COS({ SecretId: conf.secretId, SecretKey: conf.secretKey });

    return {
        name: 'TencentCOS',
        async upload(task: UploadTask) {
            const res = await cos.putObject({
                Bucket: conf.bucket,
                Region: conf.region,
                Key: task.key,
                Body: task.buffer,
                ContentType: getContentType(task.key),
            });
            return { etag: res.ETag };
        },
        async cleanRemote(prefix: string) {
            let marker = '';
            do {
                const res: any = await cos.getBucket({
                    Bucket: conf.bucket,
                    Region: conf.region,
                    Prefix: prefix,
                    Marker: marker,
                    MaxKeys: 1000,
                });
                marker = res.NextMarker;
                if (res.Contents?.length)
                    await cos.deleteMultipleObject({
                        Bucket: conf.bucket,
                        Region: conf.region,
                        Objects: res.Contents.map((c: any) => ({ Key: c.Key })),
                        Quiet: true,
                    });
            } while (marker);
            console.log('[TencentCOS] 远程清理完成');
        },
    };
}