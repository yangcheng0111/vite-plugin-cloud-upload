/**
 * vite-plugin-cloud-upload 统一配置
 */
export interface Options {
    /** 本地构建目录（相对于项目根） */
    outDir?: string;
    /** 是否递归子目录 */
    recursive?: boolean;
    /** 云厂商类型 */
    provider: 'tencent' | 'aliyun';
    /** 对应云厂商配置 */
    providerConfig: TencentCOSOptions | AliOSSOptions;
    /** 上传路径前缀（''=根目录） */
    keyPrefix?: string;
    /** 上传前清空远程前缀目录 */
    cleanRemote?: boolean;
    /** 白名单正则，仅上传匹配文件 */
    include?: RegExp;
    /** 上传成功后删除对应本地文件 */
    deleteLocalAfterUpload?: boolean;
    /** 并发数，默认 6 */
    concurrency?: number;
    /** 单文件重试次数，默认 2 */
    retry?: number;
    /* ===== 生命周期钩子 ===== */
    onProgress?: (total: number, finished: number) => void;
    onUploaded?: (task: UploadTask) => void;
    onFailed?: (task: UploadTask, error: Error) => void;
}

/** 腾讯云 COS 配置 */
export interface TencentCOSOptions {
    secretId: string;
    secretKey: string;
    bucket: string;
    region: string;
}

/** 阿里云 OSS 配置 */
export interface AliOSSOptions {
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    region: string;
    secure?: boolean;
}

/** 内部任务 */
export interface UploadTask {
    key: string;
    localPath: string;
    buffer: Buffer;
}

// 云厂商上传器接口（已定义，只需导出）
export interface ICloudProvider {
    name: string;

    upload(task: UploadTask): Promise<{ etag: string }>;

    cleanRemote?(prefix: string): Promise<void>;
}