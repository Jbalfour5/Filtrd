export async function createPitchShifterNode(audioCtx, semitones = 3) {
  if (!audioCtx._pitchShifterLoaded) {
    await audioCtx.audioWorklet.addModule(
      "/worklets/pitchshifter-processor.js"
    );
    audioCtx._pitchShifterLoaded = true;
  }

  return new AudioWorkletNode(audioCtx, "pitch-shifter-processor", {
    parameterData: { semitones },
  });
}
