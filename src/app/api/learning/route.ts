import { getDb } from "@/db/client";
import { readLearning, writeLearning } from "@/db/learning-repository";
import { getAuth } from "@/lib/auth";
import { learningRequestSchema } from "@/lib/learning-snapshot";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
const maxBytes = 3 * 1024 * 1024;

async function authorize(request: Request) {
  const auth = getAuth();
  if (!auth) return null;
  return (
    (await auth.api.getSession({ headers: request.headers }))?.user.id ?? ""
  );
}

export async function GET(request: Request) {
  try {
    const userId = await authorize(request);
    if (!userId)
      return Response.json(
        { error: userId === null ? "账号服务尚未启用。" : "请先登录。" },
        { status: userId === null ? 503 : 401, headers },
      );
    return Response.json(await readLearning(getDb(), userId), { headers });
  } catch {
    return Response.json(
      { error: "无法读取云端数据，请稍后重试。" },
      { status: 503, headers },
    );
  }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "请求来源无效。" }, { status: 403, headers });
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return Response.json({ error: "请求格式无效。" }, { status: 415, headers });
  try {
    const userId = await authorize(request);
    if (!userId)
      return Response.json(
        { error: "请先登录。" },
        { status: userId === null ? 503 : 401, headers },
      );
    const reader = request.body?.getReader();
    if (!reader)
      return Response.json(
        { error: "请求内容为空。" },
        { status: 400, headers },
      );
    const parts: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return Response.json(
          { error: "本次同步数据超过 3 MB，记录仍保留在本地。" },
          { status: 413, headers },
        );
      }
      parts.push(value);
    }
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(parts).toString("utf8"));
    } catch {
      return Response.json(
        { error: "请求内容不是有效 JSON。" },
        { status: 400, headers },
      );
    }
    const parsed = learningRequestSchema.safeParse(body);
    if (!parsed.success)
      return Response.json(
        { error: "学习记录格式无效，未修改云端数据。" },
        { status: 400, headers },
      );
    if (parsed.data.expectedUserId !== userId)
      return Response.json(
        {
          error: "登录账号已变化，请刷新后重新确认同步。",
          code: "ACCOUNT_CHANGED",
        },
        { status: 409, headers },
      );
    const result = await writeLearning(getDb(), userId, parsed.data);
    return Response.json(result.data, {
      status: result.conflict ? 409 : 200,
      headers,
    });
  } catch {
    return Response.json(
      { error: "同步未完成，本地数据已保留，请稍后重试。" },
      { status: 503, headers },
    );
  }
}
