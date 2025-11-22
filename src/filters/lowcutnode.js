export async function createLowCutNode(audioCtx, cutoff = 500) {
  if (!audioCtx._lowcutLoaded) {
    await audioCtx.audioWorklet.addModule("/worklets/lowcut-processor.js");
    audioCtx._lowcutLoaded = true;
  }

  return new AudioWorkletNode(audioCtx, "lowcut-processor", {
    processorOptions: { cutoff },
  });
}
