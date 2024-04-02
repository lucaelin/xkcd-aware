import { cos_sim } from "@xenova/transformers";
import { createPassageEmbedding } from "./embed.js";

export type XKCD = {
  id: number;
  title: string;
  image_title: string;
  url: string;
  image_url: string;
  explained_url: string;
  transcript: string;
  explanation: string;
};

let database: (XKCD & {
  embeddings: {
    explanation: number[];
    transcript: number[];
    title: number[];
  };
})[];

export async function initXKCD() {
  const dataset = await fetch(
    new URL("../assets/dataset_vec.jsonl", import.meta.url),
  )
    .then((res) => res.text())
    .then((text) => text.split("\n"))
    .then((lines) => lines.filter((line) => line.trim()))
    .then((lines) => lines.map((line) => JSON.parse(line)));

  database = dataset;

  /*
  for (const entry of dataset) {
    database.push({
      ...entry,
      embeddings: {
        explanation: await createPassageEmbedding(entry.explanation),
        transcript: await createPassageEmbedding(entry.transcript),
        title: await createPassageEmbedding(entry.title),
      },
    });
    //await new Promise((res) => setTimeout(res, 10));
    console.log("Loaded XKCD", entry.id, entry.title);
  }
  console.log(database.map((entry) => JSON.stringify(entry)).join("\n"));
  */

  return database;
}

export async function findBestXKCD(query: string): Promise<XKCD> {
  if (!database) {
    database = await initXKCD();
  }
  const queryEmbedding = await createPassageEmbedding(query);

  let bestMatch = database[0];
  let bestScore = -Infinity;

  for (const entry of database) {
    const explanationScore = (entry.explanation ?? "").trim().length > 5
      ? cos_sim(
        queryEmbedding,
        entry.embeddings.explanation,
      )
      : 0;
    const transcriptScore = (entry.transcript ?? "").trim().length > 5
      ? cos_sim(
        queryEmbedding,
        entry.embeddings.transcript,
      )
      : 0;
    /*const titleScore = cos_sim(
      queryEmbedding,
      entry.embeddings.title,
    );*/

    const score = Math.max(explanationScore, transcriptScore);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestMatch;
}
