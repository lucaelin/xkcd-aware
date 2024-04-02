// while this would be nice, it is has many issues.
// So far, I've only been able to get it to work in Chrome, and even then, it stops after a few seconds.
// Additionally, it seems to connect to the internet to do the transcription, which is also not ideal.

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export function transcribeMicrophone(_language?: string) {
  const recognition = new window.webkitSpeechRecognition();
  //const grammar =
  //  "#JSGF V1.0; grammar colors; public <color> = aqua | azure | beige | bisque | black | blue | brown | chocolate | coral | crimson | cyan | fuchsia | ghostwhite | gold | goldenrod | gray | green | indigo | ivory | khaki | lavender | lime | linen | magenta | maroon | moccasin | navy | olive | orange | orchid | peru | pink | plum | purple | red | salmon | sienna | silver | snow | tan | teal | thistle | tomato | turquoise | violet | white | yellow ;";
  //const speechRecognitionList = new webkitSpeechGrammarList();
  //speechRecognitionList.addFromString(grammar, 1);
  //recognition.grammars = speechRecognitionList;
  recognition.continuous = true; // TODO this isnt working, it still stops after a few seconds
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  console.log(recognition);

  recognition.onresult = (event: any) => {
    console.log(event.results[event.results.length - 1][0].transcript);
  };
  recognition.start();
}
