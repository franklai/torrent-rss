const got = require('got');
const he = require('he');
const RSS = require('rss');

class Parser {
  constructor(url) { this.url = url; }
  async get_html() {
    const resp = await got(this.url);
    return resp.body;
  }
  parse_links(html) {
    const pattern = /magnet:[^"]+/g;
    return html.match(pattern).map(v => he.decode(v));
  }
  get_filename(value) {
    const pattern = /&dn=(.+?)&/;
    const matched = value.match(pattern);
    if (matched) {
      return decodeURIComponent(matched[1]);
    }
    return '';
  }
  convert_to_rss(links) {
    const options = {
      title: 'just a title',

    };
    const feed = new RSS(options)

        for (const link of links) {
      const name = this.get_filename(link);

      feed.item({
        title: name,
        url: link,
        guid: link,
      })
    }

    return feed.xml({indent: true});
  }
  async parse() {
    const html = await this.get_html();

    const magnet_links = this.parse_links(html);
    const rss = this.convert_to_rss(magnet_links.reverse());

    console.log(rss);
  }
}

function main() {
  const url = 'http://www.zimuxia.cn/portfolio/%E9%9F%A6%E9%A9%AE%E5%A4%A9';
  parser = new Parser(url);

  parser.parse().then(() => { });
}

if (require.main === module) {
  main();
}
