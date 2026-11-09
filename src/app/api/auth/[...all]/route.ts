import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

async function handle(request: Request) {
  if (
    request.method === "POST" &&
    request.headers.get("origin") !== new URL(request.url).origin
  ) {
    return Response.json({ error: "请求来源无效。" }, { status: 403 });
  }
  const auth = getAuth();
  if (!auth)
    return Response.json(
      { error: "账号服务尚未启用。" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  try {
    return await auth.handler(request);
  } catch {
    return Response.json(
      { error: "账号服务暂时无法连接，请稍后重试。" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export { handle as GET, handle as POST };
