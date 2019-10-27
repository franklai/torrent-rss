/* eslint-disable class-methods-use-this */
const fs = require('fs');

const got = require('got');
const he = require('he');
const RSS = require('rss');

const config = require('./config');

class Parser {
  constructor(url, title) {
    this.url = url;
    this.title = title;
  }

  async getHtml() {
    const resp = await got(this.url);
    return resp.body;
  }

  parseLinks(html) {
    const pattern = /magnet:[^"]+/g;
    return html.match(pattern).map(he.decode);
  }

  getFilename(value) {
    const pattern = /&dn=([^&]+)/;
    const matched = value.match(pattern);
    if (matched) {
      return decodeURIComponent(matched[1]);
    }
    return '';
  }

  getBTIH(value) {
    const pattern = /btih:([a-fA-F0-9]+)/;
    const matched = value.match(pattern);
    if (matched) {
      return matched[1];
    }
    return '';
  }

  convertToRss(links) {
    const options = {
      title: `${this.title} - from FIX subs`,
    };
    const feed = new RSS(options);

    links.forEach((link) => {
      const name = this.getFilename(link) || this.getBTIH(link) || link;

      feed.item({
        title: name,
        url: link,
        guid: link,
      });
    });

    return feed.xml({ indent: true });
  }

  async parse() {
    const html = await this.getHtml();

    const magnetLinks = this.parseLinks(html);
    const rss = this.convertToRss(magnetLinks.reverse());

    return rss;
  }
}

function main() {
  const { links } = config;

  links.forEach(([title, url]) => {
    console.log(`fetching url: ${url}`);
    const parser = new Parser(url, title);

    parser.parse().then((rss) => {
      console.log(`write ${title} to rss`);
      fs.writeFile(`${title}.rss`, rss, (err) => {
        if (err) throw err;
      });
    });
  });
}

if (require.main === module) {
  main();
}
