/* eslint-disable class-methods-use-this */
const fs = require('fs');
const path = require('path');

const { BilibiliParser } = require('./bilibili');
const { FixSubParser } = require('./fix_sub');

const config = require('./config');

function findParser(url) {
  const urlKewords = [
    ['zimuxia.cn/', FixSubParser],
    ['bilibili.com/', BilibiliParser],
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const [keyword, parser] of urlKewords) {
    if (url.indexOf(keyword) >= 0) {
      return parser;
    }
  }
  return null;
}

function getAbsolutePath(filename) {
  return path.join(__dirname, 'public', filename);
}

function outputToHtml(links) {
  const lines = [];
  lines.push('<!doctype html>');
  lines.push('<html>');
  lines.push(
    '<head><meta charset="utf-8"><title>Links to generated RSS</title></head>'
  );
  lines.push('<body>');
  lines.push('<ul>');
  links.forEach(([title, url]) => {
    const rssLink = `https://franklai.github.io/torrent-rss/rss/${title}.rss`;

    lines.push('<li>');
    lines.push(`[<a href="${url}">Page</a>] `);
    lines.push(`[<a href="${rssLink}">RSS</a>] `);
    lines.push(`<a href="${rssLink}">${title}</a>`);
    lines.push('</li>');
  });
  lines.push('</ul>');
  lines.push('</body></html>');

  const content = lines.join('\n');
  fs.writeFile(getAbsolutePath('index.html'), content, (err) => {
    if (err) throw err;
  });
}

function main() {
  const { links } = config;

  links.forEach(([title, url]) => {
    console.log(`fetching ${title} of url: ${url}`);
    const Parser = findParser(url);
    const parser = new Parser(url, title);

    parser.parse().then((rss) => {
      console.log(`write ${title} to rss`);
      fs.writeFile(getAbsolutePath(`rss/${title}.rss`), rss, (err) => {
        if (err) throw err;
      });
    });
  });

  outputToHtml(links);
}

if (require.main === module) {
  main();
}
