/**
 * 云厂商上传插件（Vite 专用）
 * 支持：腾讯云 COS、阿里云 OSS
 */
import type { Plugin } from 'vite';
import { resolve } from 'node:path';
import pLimit from 'p-limit';
import type { Options, UploadTask, ICloudProvider } from './types.js';
import { normalizePrefix, scanLocal, deleteLocalFile } from './utils.js';
import { createProvider } from './provider-factory.js';

/** 并发上传所有任务 */
async function uploadAll(provider: ICloudProvider, opts: Options, tasks: UploadTask[]) {
    const limit = pLimit(opts.concurrency ?? 6);
    let finished = 0;
    const total = tasks.length;
    opts.onProgress?.(total, finished);

    await Promise.allSettled(
        tasks.map((task) =>
            limit(async () => {
                try {
                    await provider.upload(task);
                    opts.onUploaded?.(task);
                    if (opts.deleteLocalAfterUpload) deleteLocalFile(task.localPath);
                } catch (e) {
                    opts.onFailed?.(task, e as Error);
                }
                finished++;
                opts.onProgress?.(total, finished);
            })
        )
    );
}

/** 插件工厂 */
export default function cloudUploadPlugin(opts: Options): Plugin {
    return {
        name: 'vite-plugin-cloud-upload',
        apply: 'build',
        closeBundle: async () => {
            const root = resolve(process.cwd(), opts.outDir || 'dist');
            const prefix = normalizePrefix(opts.keyPrefix);

            const provider = createProvider(opts);

            /* 1. 可选：清远程 */
            if (opts.cleanRemote && provider.cleanRemote) await provider.cleanRemote(prefix);

            /* 2. 扫描本地 */
            const tasks = scanLocal({ root, recursive: opts.recursive ?? true, include: opts.include, prefix });
            if (!tasks.length) {
                console.log(`[${provider.name}] 没有需要上传的文件`);
                return;
            }

            /* 3. 上传 */
            console.log(`[${provider.name}] 开始上传 ${tasks.length} 个文件 ...`);
            const t0 = Date.now();
            await uploadAll(provider, opts, tasks);
            console.log(`[${provider.name}] 全部处理完成！耗时 ${Date.now() - t0} ms`);
        },
    };
}