/** 正式站点的唯一来源，未配置时不输出猜测的绝对 URL。 */
export function getSiteUrl(): URL | undefined {
  const value = process.env.SITE_URL?.trim();
  if (!value) return undefined;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("SITE_URL 必须是完整的 HTTPS 站点地址");
  }

  if (
    url.protocol !== "https:" ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error("SITE_URL 必须是 HTTPS 域名，不包含路径、参数或片段");
  }

  return url;
}

export function getAbsoluteUrl(path: string): string | undefined {
  const siteUrl = getSiteUrl();
  return siteUrl ? new URL(path, siteUrl).toString() : undefined;
}
