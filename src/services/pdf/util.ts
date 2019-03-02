import axios from 'axios';


export const isDataUrl = (s: string) =>
  s.startsWith('data:');

export const toDataUrl = async (url: string) => {
  const isJpeg = ['.jpg', '.jpeg'].some((s) => url.endsWith(s));
  const pngUrl = isJpeg ? url.replace(/\.(jpg|jpeg)$/, '.png') : url;
  const result = await axios.get(pngUrl, { responseType: 'arraybuffer' });
  const content = Buffer.from(result.data, 'binary').toString('base64');
  return `data:image/png;base64,${content}`;
};

