import axios from 'axios';

export async function getAiresLastUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const fileUrl = response.data.history[0].payload.permanent_url;
    return fileUrl;
  } catch (e) {
    console.error(e.response.data);
  }
}