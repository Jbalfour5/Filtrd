export async function createReverbNode(audioCtx) {
  if (!audioCtx._reverbLoaded) {
    await audioCtx.audioWorklet.addModule("/worklets/reverb-processor.js");
    audioCtx._reverbLoaded = true;
  }

  return new AudioWorkletNode(audioCtx, "reverb-processor");
}