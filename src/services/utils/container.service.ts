import type { AppInstance } from '@src/models';

export class ContainerService {
  private static instance: AppInstance;
  private static container: Element | null;

  static getInstance() {
    return this.instance;
  }

  static setInstance(instance: AppInstance) {
    if (this.instance) throw new Error(`Container instance '${this.instance}' cannot be changed once set.`);
    this.instance = instance;
  }

  static getContainer(): Element | null {
    return this.container;
  }

  static setContainer(container: Element | null) {
    if (this.container) throw new Error(`Container '${this.container?.id ?? this.container.localName}' cannot be changed once set.`);
    this.container = container;
  }
}
