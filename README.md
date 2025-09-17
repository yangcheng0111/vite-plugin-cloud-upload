# vite-plugin-cloud-upload

[English](README.en-US.md) | 中文

[![npm version](https://img.shields.io/npm/v/vite-plugin-cloud-upload.svg)](https://www.npmjs.com/package/vite-plugin-cloud-upload)
[![npm downloads](https://img.shields.io/npm/dm/vite-plugin-cloud-upload.svg)](https://www.npmjs.com/package/vite-plugin-cloud-upload)
[![license](https://img.shields.io/npm/l/vite-plugin-cloud-upload.svg)](https://github.com/your-username/vite-plugin-cloud-upload/blob/main/LICENSE)

一个 Vite 插件，它会在构建过程完成后，自动将你的构建产物上传到云存储。无需任何手动操作，即可将静态文件推送到 CDN 或存储桶，让你的部署工作流更加丝滑。

目前支持 **腾讯云 COS** 和 **阿里云 OSS**。

## ✨ 特性

-   **🚀 自动上传**: `vite build` 命令结束后自动触发上传。
-   **☁️ 多厂商支持**: 对腾讯云 COS 和阿里云 OSS 提供一流支持。
-   **⚡ 并发执行**: 并行上传多个文件，以实现最快速度。
-   **🧹 远程清理**: 可选择在上传前清空远程目录下的旧文件。
-   **🎯 文件过滤**: 使用正则表达式来筛选需要上传的文件。
-   **🗑️ 本地删除**: 可选择在上传成功后删除本地的构建文件。
-   **📞 生命周期钩子**: 提供 `onProgress`、`onUploaded` 和 `onFailed` 等钩子，用于执行自定义逻辑。

## 📦 安装

```bash
npm install vite-plugin-cloud-upload --save-dev
```
```bash
pnpm add -D vite-plugin-cloud-upload
```
```bash
yarn add vite-plugin-cloud-upload --dev
```

## 🚀 使用方法

在你的 `vite.config.ts` 文件中导入插件，并将其添加到 `plugins` 数组中。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import cloudUpload from 'vite-plugin-cloud-upload';

export default defineConfig({
  plugins: [
    // ...你的其他插件
    cloudUpload({
      // 在这里进行配置...
    }),
  ],
});
```

### 腾讯云 COS 示例

为了安全起见，强烈建议将 `secretId` 和 `secretKey` 等敏感信息存储在 `.env` 文件或系统环境变量中，不要硬编码在代码里。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import cloudUpload from 'vite-plugin-cloud-upload';

export default defineConfig({
  plugins: [
    cloudUpload({
      provider: 'tencent',
      providerConfig: {
        secretId: process.env.COS_SECRET_ID,   // 推荐使用环境变量
        secretKey: process.env.COS_SECRET_KEY,
        bucket: 'your-bucket-name-1250000000', // 你的存储桶名称
        region: 'ap-guangzhou',                // 你的存储桶所在地域
      },
      keyPrefix: 'my-project/latest', // 上传到指定的文件夹
      cleanRemote: true,              // 上传前清空目标文件夹
    }),
  ],
});
```

### 阿里云 OSS 示例

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import cloudUpload from 'vite-plugin-cloud-upload';

export default defineConfig({
  plugins: [
    cloudUpload({
      provider: 'aliyun',
      providerConfig: {
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
        bucket: 'your-aliyun-bucket-name',
        region: 'oss-cn-hangzhou',
      },
      keyPrefix: 'assets', // 上传到 'assets' 文件夹
      // 只上传 .js 和 .css 文件
      include: /\.(js|css)$/,
      // 上传后删除本地文件
      deleteLocalAfterUpload: true,
    }),
  ],
});
```

## ⚙️ 配置选项

| 选项                    | 类型                                      | 是否必需 | 描述                                                                                         |
| ----------------------- | ----------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `provider`              | `'tencent' \| 'aliyun'`                   | **是**   | 云服务提供商的类型。                                                                         |
| `providerConfig`        | `TencentCOSOptions \| AliOSSOptions`      | **是**   | 所选云服务商的配置对象（凭证、存储桶等）。                                                     |
| `outDir`                | `string`                                  | 否       | 本地构建输出目录，相对于项目根目录。默认为 `dist`。                                          |
| `recursive`             | `boolean`                                 | 否       | 是否递归扫描 `outDir` 下的子目录。默认为 `true`。                                            |
| `keyPrefix`             | `string`                                  | 否       | 在存储桶中上传路径的前缀（例如 `my-app/v1`）。默认为存储桶根目录。                           |
| `cleanRemote`           | `boolean`                                 | 否       | 若为 `true`，在上传前会清空远程存储桶中 `keyPrefix` 目录下的所有文件。默认为 `false`。       |
| `include`               | `RegExp`                                  | 否       | 一个正则表达式，用于筛选需要上传的文件。如果未提供，则上传所有文件。                           |
| `deleteLocalAfterUpload`| `boolean`                                 | 否       | 若为 `true`，在文件成功上传后删除本地对应的文件。默认为 `false`。                            |
| `concurrency`           | `number`                                  | 否       | 并发上传的数量。默认为 `6`。                                                                 |
| `retry`                 | `number`                                  | 否       | 如果单个文件上传失败，重试的次数。默认为 `2`。                                               |
| `onProgress`            | `(total: number, finished: number) => void`| 否       | 用于跟踪上传进度的回调钩子，在每个文件处理完毕后触发。                                         |
| `onUploaded`            | `(task: UploadTask) => void`              | 否       | 文件成功上传后的回调钩子。                                                                   |
| `onFailed`              | `(task: UploadTask, error: Error) => void`| 否       | 文件上传失败后的回调钩子。                                                                   |

## 📞 高级用法：生命周期钩子

你可以使用钩子来监控上传过程，例如在控制台中显示一个动态的进度条。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import cloudUpload from 'vite-plugin-cloud-upload';

export default defineConfig({
  plugins: [
    cloudUpload({
      provider: 'tencent',
      providerConfig: { /* ...你的配置... */ },
      onProgress: (total, finished) => {
        const percentage = Math.round((finished / total) * 100);
        // \r 让光标回到行首，实现单行刷新效果
        process.stdout.write(`上传中: ${finished}/${total} (${percentage}%) \r`);
      },
      onUploaded: (task) => {
        // 使用 console.log 换行，避免覆盖进度条
        console.log(`\n✔ 上传成功: ${task.key}`);
      },
      onFailed: (task, error) => {
        console.error(`\n✖ 上传失败 ${task.key}:`, error.message);
      },
    }),
  ],
});
```

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 授权。

---
