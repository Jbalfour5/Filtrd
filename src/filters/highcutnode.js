export async function createHighCutNode(audioCtx, cutoff = 8000) {
  if (!audioCtx._highcutLoaded) {
    await audioCtx.audioWorklet.addModule("/worklets/highcut-processor.js");
    audioCtx._highcutLoaded = true;
  }

  return new AudioWorkletNode(audioCtx, "highcut-processor", {
    processorOptions: { cutoff },
  });
}
