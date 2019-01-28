/*
 * Strip down logs to important information
 *
 * Intended to be useful in conjunction with "fetch_papertrail_logs.sh"
 *
 * Usage:
 *  npm run exc ./bin/strip_logs.ts < cat FILENAME
 *
 * Accepts no arguments, input taken from stdin.
 * Use pipe (|) or redirection (<) to provide input.
 */
import { evolve, compose, omit, pick } from 'ramda';
import { Stream } from 'stream';


const readStreamToMem = (s: Stream): Promise<string> =>
  new Promise((resolve, reject) => {
    let data = '';
    s.on('data', (chunk) => { data += chunk; });
    s.on('end', () => resolve(data));
    s.on('error', reject);
  });


(async () => {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  const fileContents = await readStreamToMem(process.stdin);

  const logs = fileContents
    .split('\n')                                            // split by line
    .filter((l) => l.includes('app/web.1	{'))              // ignore heroku router logs
    .map((l) => l.split('app/web.1	').slice(-1)[0].trim()) // get body of log
    .filter((l) => l.length > 0)                            // cheap filter for something parse-able
    .map((l) => JSON.parse(l))                              // parse the JSON
    .sort((a, b) => a.time - b.time)                        // sort by timestamp
    .map(compose(                                           // choose only useful properties
      evolve({
        time: (s) => new Date(s),
        req: pick(['method', 'url', 'sessionUserId', 'sessionOrgId']),
        res: omit(['headers']),
      }),
      pick(['time', 'req', 'res', 'payload'])
    ))
    .map((s) => JSON.stringify(s))                          // transform back to strings
    .join('\n');                                            // insert new-lines

  console.log(logs);
})();
