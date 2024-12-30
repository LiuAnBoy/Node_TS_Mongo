import dayjs from "dayjs";

// 自定義錯誤類別
class ConsoleError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// Console 訊息處理器介面
interface IConsoleHandler {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  handleError(error: Error): void;
}

// Console 訊息處理器實作
class ConsoleHandler implements IConsoleHandler {
  private static instances: Map<string, ConsoleHandler> = new Map();
  private logHistory: string[] = [];
  private readonly MAX_HISTORY = 100;
  private readonly MAX_NAME_LENGTH = 18; // 固定模組名稱長度

  private constructor(private readonly moduleName: string) {}

  public static getInstance(moduleName: string): ConsoleHandler {
    if (!moduleName) {
      throw new Error("模組名稱不能為空");
    }

    if (!this.instances.has(moduleName)) {
      this.instances.set(moduleName, new ConsoleHandler(moduleName));
    }

    return this.instances.get(moduleName)!;
  }

  private formatMessage(message: string): string {
    const modulePadded = this.moduleName.padEnd(this.MAX_NAME_LENGTH, " ");

    return `${modulePadded}:: ${message}`;
  }

  log(message: string): void {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const formattedMessage = this.formatMessage(message);
    const fullMessage = `[LOG  ]${formattedMessage} [${timestamp}]`;
    console.log("\x1b[32m%s\x1b[0m", fullMessage);
    this.addToHistory(fullMessage);
  }

  warn(message: string): void {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const formattedMessage = this.formatMessage(message);
    const fullMessage = `[WARN ]${formattedMessage} [${timestamp}]`;
    console.warn("\x1b[33m%s\x1b[0m", fullMessage);
    this.addToHistory(fullMessage);
  }

  error(message: string, error?: Error): void {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const formattedMessage = this.formatMessage(message);
    const fullMessage = `[ERROR]${formattedMessage} [${timestamp}]`;
    console.error("\x1b[31m%s\x1b[0m", fullMessage);
    this.addToHistory(fullMessage);
    if (error) {
      throw error;
    }
  }

  handleError(error: Error): void {
    const errorMessage = `Error caught: ${error.name} - ${error.message}`;
    this.error(errorMessage, error);
  }

  private addToHistory(message: string): void {
    this.logHistory.push(message);
    if (this.logHistory.length > this.MAX_HISTORY) {
      this.logHistory.shift();
    }
  }

  getHistory(): string[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }

  // 取得所有已建立的模組名稱
  static getAllModuleNames(): string[] {
    return Array.from(this.instances.keys());
  }

  // 取得指定模組的實例
  static getModuleInstance(moduleName: string): ConsoleHandler | undefined {
    return this.instances.get(moduleName);
  }
}

export { ConsoleError, ConsoleHandler };
