export class Queue {
  private isRunning = false;
  private isDestroyed = false;
  private tasks: (() => Promise<void>)[] = [];

  public push = (task: () => Promise<void>) => {
    if (this.isDestroyed) return this;

    this.tasks.push(task);

    return this;
  };

  public run = async () => {
    if (this.isDestroyed) return;
    if (this.isRunning) return;

    this.privateRun();
  };

  public destroy = async () => {
    this.tasks = [];
    this.isRunning = false;
    this.isDestroyed = true;
  };

  private privateRun = async () => {
    if (this.isDestroyed) return;

    if (!this.tasks.length) {
      this.isRunning = false;
      return;
    }

    this.isRunning = true;

    await this.tasks[0]();

    this.tasks.shift();

    // TODO: maybe use process.nextTick here
    await this.privateRun();
  };
}
