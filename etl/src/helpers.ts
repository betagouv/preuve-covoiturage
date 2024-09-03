export async function getAiresLastUrl(url: string): Promise<string> {
  const response = await fetch(url, { method: "get" });
  const res = await response.json();
  const fileUrl = res ? res.history[0].payload.permanent_url : "";
  if (!response.ok) {
    console.error(res.error.data);
  }
  return fileUrl;
}
