const got = require('got');
const he = require('he');
const RSS = require('rss');

exports.FixSubParser = class FixSubParser {
  constructor(url, title) {
    this.url = url;
    this.title = title;
  }

  async getHtml() {
    const resp = await got(this.url);
    return resp.body;
  }

  static parseLinks(html) {
    const pattern = /magnet:[^"]+/g;
    return html.match(pattern).map(he.decode);
  }

  static getFilename(value) {
    const pattern = /&dn=([^&]+)/;
    const matched = value.match(pattern);
    if (matched) {
      return decodeURIComponent(matched[1]);
    }
    return '';
  }

  static getBTIH(value) {
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
      const name = this.constructor.getFilename(link) || this.constructor.getBTIH(link) || link;

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

    const magnetLinks = this.constructor.parseLinks(html);
    const rss = this.convertToRss(magnetLinks.reverse());

    return rss;
  }
};
