import { parse, ParsedQuery } from 'query-string';

export class NotificationService {
  static error(): void {
    chrome.notifications.create({
      priority: 1,
      type: 'basic',
      title: 'Primary Title',
      message: 'Primary message to display',
      contextMessage: 'Secondary message to display',
      iconUrl: 'assets/icons/icon-64.png',
      buttons: [{ title: 'Button 1' }, { title: 'Button 2' }],
    });
  }

  static create(uri: string, source?: string, destination?: string): void {
    // TODO temporary downloading task replaced by with name
    const parsed: ParsedQuery = parse(uri);
    console.log('parsed', parsed);
    const message = typeof parsed?.dn === 'string' ? parsed?.dn : parsed?.dn?.shift() ?? uri;
    chrome.notifications.create({
      type: 'basic',
      title: 'Adding download task' + (destination ? ` to '${destination}'` : ''),
      message,
      contextMessage: source,
      iconUrl: 'assets/icons/icon-64.png',
      buttons: [{ title: 'Edit' }, { title: 'Cancel' }],
    });
  }

  static createList() {
    chrome.notifications.create({
      type: 'list',
      title: 'Primary Title',
      message: 'Primary message to display',
      contextMessage: 'Secondary message to display',
      iconUrl: 'assets/icons/icon-64.png',
      items: [
        { title: 'Item1', message: 'This is item 1.' },
        { title: 'Item2', message: 'This is item 2.' },
        { title: 'Item3', message: 'This is item 3.' },
      ],
      buttons: [{ title: 'Button 1' }, { title: 'Button 2' }],
    });
  }
}
