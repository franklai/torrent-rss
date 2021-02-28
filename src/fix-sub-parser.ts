import got from 'got';
import he from 'he';
import RSS from 'rss';

export default class FixSubParser {
  url: string;
  title: string;

  constructor(url: string, title: string) {
    this.url = url;
    this.title = title;
  }

  async getHtml(): Promise<string> {
    const resp = await got(this.url);
    return resp.body;
  }

  parseLinks(html: string): string[] {
    const pattern = /magnet:[^"]+/g;
    const matched = html.match(pattern);
    if (matched) {
      return matched.map((value) => he.decode(value));
    }
    return [];
  }

  getFilename(value: string): string {
    const pattern = /&dn=([^&]+)/;
    const matched = value.match(pattern);
    if (matched) {
      return decodeURIComponent(matched[1]);
    }
    return '';
  }

  getBTIH(value: string): string {
    const pattern = /btih:([\dA-Fa-f]+)/;
    const matched = value.match(pattern);
    if (matched) {
      return matched[1];
    }
    return '';
  }

  convertToRss(links: string[]): string {
    const options = {
      title: `${this.title} - from FIX subs`,
      feed_url: 'https://franklai.github.io/torrent-rss/',
      site_url: `https://franklai.github.io/torrent-rss/rss/${this.title}.rss`,
    };
    const feed = new RSS(options);

    for (const link of links) {
      const name = this.getFilename(link) || this.getBTIH(link) || link;

      feed.item({
        title: name,
        description: '',
        url: link,
        guid: link,
        date: '2021-02-28T03:03:03.003Z'
      });
    }

    return feed.xml({ indent: true });
  }

  async parse(): Promise<string> {
    const html = await this.getHtml();

    const magnetLinks = this.parseLinks(html);
    const rss = this.convertToRss(magnetLinks.reverse());

    return rss;
  }
}
