import got from 'got';
import RSS from 'rss';

interface MyVideoItem {
  title: string;
  description: string;
  created: number;
  link: string;
}

interface ApiVideoItem {
  title: string;
  description: string;
  created: number;
  aid: number;
}

interface ApiResponse {
  data: {
    list: {
      vlist: ApiVideoItem[];
    };
  };
}

export default class BilibiliParser {
  url: string;
  title: string;

  constructor(url: string, title: string) {
    this.url = url;
    this.title = title;
  }

  getId(): string {
    const value = this.url;

    const pattern = /bilibili.com\/(\d+)/;
    const matched = value.match(pattern);
    if (matched) {
      return matched[1];
    }
    return '';
  }

  async getJsonList(): Promise<ApiResponse> {
    const id = this.getId();
    // https://api.bilibili.com/x/space/arc/search?mid=138832847&ps=10&pn=1
    const url = `https://api.bilibili.com/x/space/arc/search?mid=${id}&ps=10&pn=1`;
    console.log(`url: ${url}`);
    const resp: ApiResponse = await got(url).json();
    return resp;
  }

  parseLinks(response: ApiResponse): MyVideoItem[] {
    // https://www.bilibili.com/video/av96617447
    const videos = response.data.list.vlist;
    return videos.map((item) => {
      return {
        link: `https://www.bilibili.com/video/av${item.aid}`,
        title: item.title,
        description: item.description,
        created: item.created,
      };
    });
  }

  convertToRss(linksAndNames: MyVideoItem[]): string {
    const options = {
      title: `${this.title} - from Bilibili.com`,
      feed_url: 'https://franklai.github.io/torrent-rss/',
      site_url: `https://franklai.github.io/torrent-rss/rss/${this.title}.rss`,
    };
    const feed = new RSS(options);

    for (const { link, title, description, created } of linksAndNames) {
      feed.item({
        title,
        description,
        url: link,
        guid: link,
        date: new Date(created * 1000).toISOString(),
      });
    }

    return feed.xml({ indent: true });
  }

  async parse(): Promise<string> {
    const response: ApiResponse = await this.getJsonList();
    const linksAndNames = this.parseLinks(response);
    const rss = this.convertToRss(linksAndNames);

    return rss;
  }
}
