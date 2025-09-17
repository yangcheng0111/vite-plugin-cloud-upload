# vite-plugin-cloud-upload

English | [中文](README.md)

[![npm version](https://img.shields.io/npm/v/vite-plugin-cloud-upload.svg)](https://www.npmjs.com/package/vite-plugin-cloud-upload)
[![npm downloads](https://img.shields.io/npm/dm/vite-plugin-cloud-upload.svg)](https://www.npmjs.com/package/vite-plugin-cloud-upload)
[![license](https://img.shields.io/npm/l/vite-plugin-cloud-upload.svg)](https://github.com/your-username/vite-plugin-cloud-upload/blob/main/LICENSE)

A Vite plugin that automatically uploads your build assets to cloud storage after the build process completes. Streamline your deployment workflow by pushing your static files to a CDN or storage bucket with zero manual effort.

Currently supports **Tencent Cloud COS** and **Aliyun OSS**.

## ✨ Features

-   **🚀 Automatic Uploads**: Triggered automatically after `vite build` finishes.
-   **☁️ Multi-Provider Support**: First-class support for Tencent Cloud COS and Aliyun OSS.
-   **⚡ Concurrent**: Uploads multiple files in parallel for maximum speed.
-   **🧹 Remote Cleanup**: Optionally cleans the remote directory before uploading new files.
-   **🎯 File Filtering**: Use regular expressions to include only the files you want to upload.
-   **🗑️ Local Deletion**: Optionally remove local build files after a successful upload.
-   **📞 Lifecycle Hooks**: Provides hooks like `onProgress`, `onUploaded`, and `onFailed` for custom logic.

## 📦 Installation

```bash
npm install vite-plugin-cloud-upload --save-dev
```
```bash
pnpm add -D vite-plugin-cloud-upload
```
```bash
yarn add vite-plugin-cloud-upload --dev
```

## 🚀 Usage

Import and add the plugin to the `plugins` array in your `vite.config.ts`.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import cloudUpload from 'vite-plugin-cloud-upload';

export default defineConfig({
  plugins: [
    // Your other plugins...
    cloudUpload({
      // Configuration options here...
    }),
  ],
});
```

### Example for Tencent Cloud COS

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import cloudUpload from 'vite-plugin-cloud-upload';

export default defineConfig({
  plugins: [
    cloudUpload({
      provider: 'tencent',
      providerConfig: {
        secretId: process.env.COS_SECRET_ID,   // Environment variables recommended
        secretKey: process.env.COS_SECRET_KEY,
        bucket: 'your-bucket-name-1250000000',
        region: 'ap-guangzhou',
      },
      keyPrefix: 'my-project/latest', // Upload to a specific folder
      cleanRemote: true, // Clean the prefix folder before upload
    }),
  ],
});
```

### Example for Aliyun OSS

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
      keyPrefix: 'assets', // Upload to the 'assets' folder
      // Only upload .js and .css files
      include: /\.(js|css)$/,
      // Delete local files after upload
      deleteLocalAfterUpload: true,
    }),
  ],
});
```

## ⚙️ Configuration Options

| Option                  | Type                                      | Required | Description                                                                                             |
| ----------------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `provider`              | `'tencent' \| 'aliyun'`                   | **Yes**  | The cloud service provider.                                                                             |
| `providerConfig`        | `TencentCOSOptions \| AliOSSOptions`      | **Yes**  | Configuration object for the selected provider (credentials, bucket, etc.).                             |
| `outDir`                | `string`                                  | No       | The local build output directory, relative to the project root. Defaults to `dist`.                     |
| `recursive`             | `boolean`                                 | No       | Whether to scan subdirectories within `outDir`. Defaults to `true`.                                     |
| `keyPrefix`             | `string`                                  | No       | A prefix to add to the upload path in the bucket (e.g., `my-app/v1`). Defaults to the bucket root.      |
| `cleanRemote`           | `boolean`                                 | No       | If `true`, cleans all files under `keyPrefix` in the remote bucket before uploading. Defaults to `false`. |
| `include`               | `RegExp`                                  | No       | A regular expression to filter which files to upload. If not provided, all files are uploaded.          |
| `deleteLocalAfterUpload`| `boolean`                                 | No       | If `true`, deletes local files after they are successfully uploaded. Defaults to `false`.               |
| `concurrency`           | `number`                                  | No       | Number of concurrent uploads. Defaults to `6`.                                                          |
| `retry`                 | `number`                                  | No       | Number of retries for a single file upload if it fails. Defaults to `2`.                                |
| `onProgress`            | `(total: number, finished: number) => void`| No       | Callback hook for tracking upload progress. Fires after each file is processed.                         |
| `onUploaded`            | `(task: UploadTask) => void`              | No       | Callback hook for successfully uploaded files.                                                          |
| `onFailed`              | `(task: UploadTask, error: Error) => void`| No       | Callback hook for failed uploads.                                                                       |

## 📞 Advanced Usage: Lifecycle Hooks

You can use hooks to monitor the upload process, for example, to display a progress bar in the console.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import cloudUpload from 'vite-plugin-cloud-upload';

export default defineConfig({
  plugins: [
    cloudUpload({
      provider: 'tencent',
      providerConfig: { /* ... */ },
      onProgress: (total, finished) => {
        const percentage = Math.round((finished / total) * 100);
        process.stdout.write(`Uploading: ${finished}/${total} (${percentage}%) \r`);
      },
      onUploaded: (task) => {
        console.log(`\n✔ Successfully uploaded: ${task.key}`);
      },
      onFailed: (task, error) => {
        console.error(`\n✖ Failed to upload ${task.key}:`, error.message);
      },
    }),
  ],
});
```
## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 授权。

---
