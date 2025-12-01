export async function createDistortionNode(
  audioCtx,
  drive = 2.5,
  makeup = 1.2
) {
  if (!audioCtx._distortionLoaded) {
    await audioCtx.audioWorklet.addModule("/worklets/distortion-processor.js");
    audioCtx._distortionLoaded = true;
  }

  return new AudioWorkletNode(audioCtx, "distortion-processor", {
    processorOptions: { drive, makeup },
  });
}
