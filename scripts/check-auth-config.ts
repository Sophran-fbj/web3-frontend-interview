import { config } from "dotenv";

import { readAuthConfiguration } from "../src/lib/auth-config";

config({ path: [".env.local", ".env"], quiet: true });
const settings = readAuthConfiguration();
console.log(`账号开关：${settings.enabled ? "开启" : "关闭"}`);
console.log(
  `配置状态：${settings.config ? "变量已配置，尚需验证数据库和 GitHub 授权" : "未完成"}`,
);
if (settings.issues.length)
  console.log(`需要检查的变量：${settings.issues.join("、")}`);
if (settings.config)
  console.log(
    `GitHub 回调地址：${settings.config.baseURL}/api/auth/callback/github`,
  );
if (settings.enabled && !settings.config) process.exitCode = 1;
