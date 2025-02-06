export async function getAiresLastUrl(url: string): Promise<string> {
  const response = await fetch(url, { method: "get" });
  const res = await response.json();
  if (!response.ok) {
    console.error(res.error.data);
  }
  const list = res ? res.history.filter((h: any) => h.payload.schema_name !== null) : [];
  const fileUrl = list.length > 0 ? list[0].payload.permanent_url : "";
  return fileUrl;
}

export async function getCampaignsLastUrl(url: string): Promise<string> {
  const response = await fetch(url, { method: "get" });
  const res = await response.json();
  if (!response.ok) {
    console.error(res.error.data);
  }
  const list = res ? res.resources : [];
  const fileUrl = list.length > 0 ? list[0].latest : "";
  return fileUrl;
}
