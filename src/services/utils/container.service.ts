export class ContainerService {
  static container: Element | null;

  static getContainer(): Element | null {
    return this.container;
  }

  static setContainer(container: Element | null) {
    this.container = container;
  }
}
