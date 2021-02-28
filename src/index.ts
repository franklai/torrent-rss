import fs from 'fs';
import path from 'path';

import BilibiliParser from './bilibili-parser';
import FixSubParser from './fix-sub-parser';

import { links } from './config';

function findParser(url: string, title: string) {
  if (url.includes('bilibili.com/')) {
    return new BilibiliParser(url, title);
  } else if (url.includes('zimuxia.cn/')) {
    return new FixSubParser(url, title);
  }
  throw new Error(`Unknown url: ${url}`);
}

function getAbsolutePath(filename: string) {
  return path.join(__dirname, '..', 'public', filename);
}

function outputToHtml(links: [string, string][]) {
  const lines = [];
  lines.push(
    '<!doctype html>',
    '<html>',
    '<head><meta charset="utf-8"><title>Links to generated RSS</title></head>',
    '<body>',
    '<ul>'
  );
  const prefix = 'https://franklai.github.io/torrent-rss/rss';
  for (const [title, url] of links) {
    const rssLink = `${prefix}/${encodeURIComponent(title)}.rss`;

    lines.push(
      '<li>',
      `[<a href="${url}">Page</a>] `,
      `[<a href="${rssLink}">RSS</a>] `,
      `<a href="${rssLink}">${title}</a>`,
      '</li>'
    );
  }
  lines.push('</ul>', '</body></html>');

  const content = lines.join('\n');
  fs.writeFile(getAbsolutePath('index.html'), content, (error) => {
    if (error) throw error;
  });
}

function main() {
  for (const [title, url] of links) {
    console.log(`fetching ${title} of url: ${url}`);
    const parser = findParser(url, title);

    parser.parse().then((rss) => {
      console.log(`write ${title} to rss`);
      // remove lastBuildDate
      rss = rss.replace(/<lastBuildDate.*?lastBuildDate>/, '');
      fs.writeFile(getAbsolutePath(`rss/${title}.rss`), rss, (error) => {
        if (error) throw error;
      });
    });
  }

  outputToHtml(links);
}

if (require.main === module) {
  main();
}
