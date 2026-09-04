export class EndOfInputError extends Error {
  constructor() {
    super("End of input");
  }
}

const lineQueue: string[] = [];
let waiting: ((line: string | null) => void) | null = null;
let closed = false;
let buffer = Buffer.from("");

function deliver(line: string): void {
  if (waiting) {
    const resolve = waiting;
    waiting = null;
    resolve(line);
  } else {
    lineQueue.push(line);
  }
}

function endOfInput(): never {
  throw new EndOfInputError();
}

process.stdin.on("data", (chunk: Buffer) => {
  buffer = Buffer.concat([buffer, chunk]);
  let newlineIdx = buffer.indexOf("\n");
  while (newlineIdx !== -1) {
    const line = buffer.subarray(0, newlineIdx).toString("utf8").trim();
    buffer = buffer.subarray(newlineIdx + 1);
    if (line.length > 0) deliver(line);
    newlineIdx = buffer.indexOf("\n");
  }
});

process.stdin.on("end", () => {
  const rest = buffer.toString("utf8").trim();
  buffer = Buffer.from("");
  if (rest.length > 0) deliver(rest);
  closed = true;
  if (waiting) {
    const resolve = waiting;
    waiting = null;
    resolve(null);
  }
});

process.stdin.on("error", () => {
  closed = true;
  if (waiting) {
    const resolve = waiting;
    waiting = null;
    resolve(null);
  }
});

export async function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  const queued = lineQueue.shift();
  if (queued !== undefined) return queued;
  if (closed) endOfInput();
  const line = await new Promise<string | null>((resolve) => {
    waiting = resolve;
  });
  if (line === null) endOfInput();
  return line;
}
