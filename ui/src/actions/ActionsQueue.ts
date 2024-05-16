import { DraftAction } from "@/actions/base/DraftAction";

export class ActionsQueue {
  public queue: DraftAction[];

  constructor() {
    this.queue = [];
  }

  public addAction(newAction: DraftAction): void {
    this.queue.push(newAction);
  }

  public empty(): void {
    this.queue = [];
  }

  public getLength(): number {
    return this.queue.length;
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public getFirstAction(): DraftAction | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  public async executeAll(userTenant: string, draftId: string): Promise<void> {
    while (this.queue.length > 0) {
      const currAction = this.queue[0];
      await currAction.execute(userTenant, draftId);
      this.queue.shift();
    }
  }
}
