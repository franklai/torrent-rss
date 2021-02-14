/* eslint-disable class-methods-use-this */
const fs = require('fs');
const path = require('path');

const { BilibiliParser } = require('./bilibili');
const { FixSubParser } = require('./fix-sub');

const config = require('./config');

function findParser(url) {
  const urlKewords = [
    ['zimuxia.cn/', FixSubParser],
    ['bilibili.com/', BilibiliParser],
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const [keyword, parser] of urlKewords) {
    if (url.includes(keyword)) {
      return parser;
    }
  }
  return;
}

function getAbsolutePath(filename) {
  return path.join(__dirname, 'public', filename);
}

function outputToHtml(links) {
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
  const { links } = config;

  for (const [title, url] of links) {
    console.log(`fetching ${title} of url: ${url}`);
    const Parser = findParser(url);
    const parser = new Parser(url, title);

    parser.parse().then((rss) => {
      console.log(`write ${title} to rss`);
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
