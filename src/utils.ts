/**
 * 纯工具函数 - 零副作用
 */
import {readdirSync, readFileSync, statSync, unlinkSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import mime from 'mime-types';
import type {UploadTask} from './types.js';

/** 标准化对象键前缀（去掉头尾 /，统一以 / 结尾） */
export const normalizePrefix = (raw?: string): string => {
    if (!raw) return '';
    return `${raw.replace(/^\/|\/$/g, '')}/`;
};


/** MIME 类型推断 */
export function getContentType(filePath: string): string {
    return mime.lookup(filePath) || 'application/octet-stream';
}

/**
 * 扫描本地目录 → 上传任务列表
 * @param args
 */
export function scanLocal(args: {
    root: string;
    recursive: boolean;
    include?: RegExp;
    prefix: string;
}): UploadTask[] {
    const tasks: UploadTask[] = [];

    function walk(dir: string): void {
        for (const ent of readdirSync(dir, {withFileTypes: true})) {
            const full = resolve(dir, ent.name);
            if (ent.isDirectory()) {
                if (args.recursive) walk(full);
                continue;
            }
            const rel = relative(args.root, full).replace(/\\/g, '/');
            if (args.include && !args.include.test(rel)) continue;
            tasks.push({key: args.prefix + rel, localPath: full, buffer: readFileSync(full)});
        }
    }

    walk(args.root);
    return tasks;
}

/** 安全删除单个本地文件（仅文件 & 存在时才删） */
export function deleteLocalFile(path: string): void {
    try {
        const stat = statSync(path);
        if (stat.isFile()) unlinkSync(path);
    } catch {
    }
}