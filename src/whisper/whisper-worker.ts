/* eslint-disable camelcase */
// @ts-ignore
console.log("Running worker script...");

import { env, pipeline } from "@xenova/transformers";

env.allowLocalModels = false;
console.log("self.crossOriginIsolated", self.crossOriginIsolated);
console.log(
  "env.backends.onnx.wasm.numThreads",
  env.backends.onnx.wasm.numThreads,
);
env.backends.onnx.wasm.numThreads = 6;

// Create translation pipeline
let transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-base",
  { quantized: true },
);

addEventListener("message", async (event) => {
  const { audio, options, id } = event.data;

  const output = await transcriber(audio, options);
  postMessage({ ...output, id });
});

postMessage({ status: "running" });
