const got = require('got');
const RSS = require('rss');

exports.BilibiliParser = class BilibiliParser {
  constructor(url, title) {
    this.url = url;
    this.title = title;
  }

  getId() {
    const value = this.url;

    const pattern = /bilibili.com\/(\d+)/;
    const matched = value.match(pattern);
    if (matched) {
      return matched[1];
    }
    return '';
  }

  async getJsonList() {
    const id = this.getId();
    const url = `https://api.bilibili.com/x/space/arc/search?mid=${id}&ps=10&pn=1`;
    console.log(`url: ${url}`);
    const resp = await got(url).json();
    return resp;
  }

  static parseLinks(list) {
    // https://www.bilibili.com/video/av96617447
    const videos = list.data.list.vlist;
    return videos.map((item) => {
      return [`https://www.bilibili.com/video/av${item.aid}`, item.title];
    });
  }

  convertToRss(linksAndNames) {
    const options = {
      title: `${this.title} - from Bilibili.com`,
    };
    const feed = new RSS(options);

    linksAndNames.forEach(([link, name]) => {
      feed.item({
        title: name,
        url: link,
        guid: link,
      });
    });

    return feed.xml({ indent: true });
  }

  async parse() {
    const list = await this.getJsonList();
    const linksAndNames = this.constructor.parseLinks(list);
    const rss = this.convertToRss(linksAndNames);

    return rss;
  }
};
