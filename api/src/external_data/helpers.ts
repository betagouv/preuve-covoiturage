export async function getAiresLastUrl(url: string): Promise<string> {
  const response = await fetch(url, { method: "get" });
  const res = await response.json();
  const list = res
    ? res.history.filter((h) => h.payload.schema_name !== null)
    : [];
  const fileUrl = list.length > 0 ? list[0].payload.permanent_url : "";
  if (!response.ok) {
    console.error(res.error.data);
  }
  return fileUrl;
}
