<script lang="ts">
  import type { Language } from "./lib/voice2text.js";
  import { createXKCDStore } from "./stores/xkcdStore.js";

  const xkcdStore = createXKCDStore();

  let language: Language = "en";
</script>

<main>
  <div>
    <h1>XKCD Aware</h1>
    {#if $xkcdStore.status === "STOPPED"}
      <p>
        There is a XKCD for everything. Especially during your next teams
        meeting. Press the button and let the app search for the most relevant
        comic from your past minute of audio.
      </p>
      <p style="font-style: italic; opacity: 0.8">
        This app runs entirely on your device. No data is sent to any server,
        but this means that it requires quite a bit of CPU, and will download
        almost half a gigabyte of ML-Models.
      </p>
      <select id="language" bind:value={language}>
        <option value="en">English</option>
        <option value="de">German</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
        <option value="ru">Russian</option>
        <option value="pt">Portuguese</option>
        <option value="it">Italian</option>
        <option value="pl">Polish</option>
        <option value="nl">Dutch</option>
        <option value="ja">Japanese</option>
        <option value="ko">Korean</option>
        <option value="zh">Chinese</option>
      </select>
      <button on:click={() => xkcdStore.start(language)}>
        Start Listening
      </button>
    {:else if $xkcdStore.status === "LOADING"}
      <p style="font-style: italic; opacity: 0.8">
        I wasn't joking about downloading half gigabyte of models. This might
        take a while.
      </p>
    {:else}
      <button disabled>Status: {$xkcdStore.status}</button>
      <button on:click={() => xkcdStore.stop()}> Stop Listening </button>
    {/if}
  </div>
  <div>
    {#if $xkcdStore.xkcd?.title}
      <h2>{$xkcdStore.xkcd.title}</h2>
    {/if}
    {#if $xkcdStore.xkcd?.image_url}
      <a
        href={$xkcdStore.xkcd.explained_url}
        title={$xkcdStore.xkcd.image_title}
        target="_blank"
      >
        <img
          src={$xkcdStore.xkcd.image_url}
          alt={$xkcdStore.xkcd.image_title}
        />
      </a>
    {/if}
  </div>
  <div>
    {#if $xkcdStore.text}
      <pre>{$xkcdStore.text}</pre>
    {/if}
    {#if $xkcdStore.preview}
      <pre>{$xkcdStore.preview}</pre>
    {/if}
  </div>
</main>

<style>
  img {
    display: block;
    margin: 0 auto;
  }
  pre {
    white-space: pre-wrap;
    max-width: 100%;
  }
</style>
