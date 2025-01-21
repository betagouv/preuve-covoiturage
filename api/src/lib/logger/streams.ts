import { logger } from "@/lib/logger/index.ts";

export class TapStreamToConsole extends TransformStream<string, string> {
  constructor(level: "INFO" | "WARN" | "DEBUG" | "ERROR" = "INFO") {
    super({
      async transform(value, controller) {
        switch (level) {
          case "INFO":
            logger.info(value);
            break;
          case "WARN":
            logger.warn(value);
            break;
          case "ERROR":
            logger.error(value);
            break;
          default:
            logger.debug(value);
        }

        controller.enqueue(value);
      },
    });
  }
}

export function streamToConsole(
  readable: ReadableStream<Uint8Array>,
  writable: WritableStream<Uint8Array>,
  level: "INFO" | "WARN" | "DEBUG" | "ERROR" = "INFO",
) {
  readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TapStreamToConsole(level))
    .pipeThrough(new TextEncoderStream())
    .pipeTo(writable);
}

export function streamStdout(
  readable: ReadableStream<Uint8Array>,
  level: "INFO" | "WARN" | "DEBUG" | "ERROR" = "INFO",
) {
  streamToConsole(readable, Deno.stdout.writable, level);
}

export function streamStderr(
  readable: ReadableStream<Uint8Array>,
  level: "INFO" | "WARN" | "DEBUG" | "ERROR" = "INFO",
) {
  streamToConsole(readable, Deno.stderr.writable, level);
}
