const got = require('got');
const he = require('he');
const RSS = require('rss');

class Parser {
  constructor(url) {
    this.url = url;
  }

  async getHtml() {
    const resp = await got(this.url);
    return resp.body;
  }

  parseLinks(html) {
    const pattern = /magnet:[^"]+/g;
    return html.match(pattern).map(v => he.decode(v));
  }

  getFilename(value) {
    const pattern = /&dn=(.+?)&/;
    const matched = value.match(pattern);
    if (matched) {
      return decodeURIComponent(matched[1]);
    }
    return '';
  }

  convertToRss(links) {
    const options = {
      title: 'just a title'
    };
    const feed = new RSS(options);

    links.forEach(link => {
      const name = this.getFilename(link);

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

    console.log(rss);
  }
}

function main() {
  const url = 'http://www.zimuxia.cn/portfolio/%E9%9F%A6%E9%A9%AE%E5%A4%A9';
  const parser = new Parser(url);

  parser.parse().then(() => {});
}

if (require.main === module) {
  main();
}
