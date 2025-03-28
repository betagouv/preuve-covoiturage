import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log("HTTP server is running on http://localhost:8080");

const controller = new AbortController();
const { signal } = controller;

serve(async (req) => {
  const { method, url, headers } = req;
  console.log(`[Request] ${method} ${url}`);
  console.log("Headers:", Object.fromEntries(headers.entries()));
  console.log("body", await req.text());

  return new Response("Hello from Deno!", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}, { port: 8080, signal });

function shutdownHandler(signalName: string) {
  return () => {
    console.log(`\nReceived ${signalName}. Shutting down server...`);
    controller.abort(); // Gracefully close server
  };
}

// Listen for SIGINT (Ctrl+C) and SIGTERM (Docker/K8s stop)
Deno.addSignalListener("SIGINT", shutdownHandler("SIGINT"));
Deno.addSignalListener("SIGTERM", shutdownHandler("SIGTERM"));
