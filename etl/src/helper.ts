import axios from 'axios';

export async function getAiresLastUrl(url: string) {
  try {
    const response = await axios.get(url);
    const fileUrl = response.data.history[0].payload.permanent_url;
    console.debug(`fileUrl: ${fileUrl}`);
    return fileUrl;
  } catch (e){
    console.debug(e.response.data);
  }
}