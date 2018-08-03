import * as stream from 'stream';
import axios from 'axios';
import { Dictionary, CurriedFunction2, assoc, curry } from 'ramda';

type MapKeys =
  CurriedFunction2<(a: string) => string, Dictionary<any>, Dictionary<any>>;

type RenameKeys<T extends Dictionary<any>, L extends Dictionary<string>> =
  CurriedFunction2<L, T, { [k in L[keyof L]]: any }> ;


export const lazyPromiseSeries = (ps: PromiseLike<any>[]): Promise<any[]> =>
  Promise.resolve()
    .then(() =>
      ps.reduce(
        (fp, p) => fp.then((res) => p.then((rp) => res.concat(rp))),
        Promise.resolve([])
      )
    );

export const mapKeys: MapKeys =
  curry((f, o) => Object.keys(o).reduce((acc, k) => assoc(f(k), o[k], acc), {}));

export const renameKeys: RenameKeys<Dictionary<any>, Dictionary<string>> =
  curry((map, o) =>
    Object.keys(o)
      .reduce((acc, k) => assoc(map[k] || k, o[k], acc), {})
);

export const pipeStreamToPromise = (stream: stream.Readable): Promise<Buffer[]> =>
  new Promise((resolve, reject) => {
    const data: Buffer[] = [];

    stream.on('data', (chunk: any) => data.push(chunk));
    stream.on('end', () => resolve(data));
    stream.on('error', reject);
  });


export const isDataUrl = (s: string) =>
  s.startsWith('data:');


export const toDataUrl = async (url: string) => {
  const isJpeg = ['.jpg', '.jpeg'].some((s) => url.endsWith(s));
  const pngUrl = isJpeg ? url.replace(/\.(jpg|jpeg)$/, '.png') : url;
  const result = await axios.get(pngUrl, { responseType: 'arraybuffer' });
  const content = Buffer.from(result.data, 'binary').toString('base64');
  return `data:image/png;base64,${content}`;
};
