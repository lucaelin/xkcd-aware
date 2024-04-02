import {
  env,
  type FeatureExtractionPipeline,
  pipeline,
} from "@xenova/transformers";
env.cacheDir = "./.cache";
env.allowRemoteModels = true;
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 6;

let extractor: FeatureExtractionPipeline;
export async function initEmbedding() {
  if (extractor) {
    return extractor;
  }
  extractor = await pipeline(
    "feature-extraction",
    "Xenova/multilingual-e5-small",
    { revision: "main", quantized: true },
  );
  return extractor;
}

export async function createQueryEmbedding(
  query: string,
  options = {},
): Promise<number[]> {
  if (!extractor) {
    extractor = await initEmbedding();
  }
  const res = await extractor("query: " + query, {
    pooling: "mean",
    normalize: true,
    ...options,
  });
  return [...res.data];
}

export async function createPassageEmbedding(
  passage: string,
  options = {},
): Promise<number[]> {
  if (!extractor) {
    extractor = await initEmbedding();
  }
  const res = await extractor("passage: " + passage, {
    pooling: "mean",
    normalize: true,
    ...options,
  });
  return [...res.data];
}
