class PitchShifterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "semitones", defaultValue: 0, minValue: -12, maxValue: 12 },
    ];
  }

  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize).fill(0);
    this.writeIdx = 0;
    this.readIdx = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!input || !output) return true;

    const semitones =
      parameters.semitones.length > 1
        ? parameters.semitones
        : [parameters.semitones[0]];
    const pitchRatio = Math.pow(2, semitones[0] / 12);

    for (let i = 0; i < input.length; i++) {
      this.buffer[this.writeIdx] = input[i];
      this.writeIdx = (this.writeIdx + 1) % this.bufferSize;

      const readIdxFloor = Math.floor(this.readIdx);
      const readIdxCeil = (readIdxFloor + 1) % this.bufferSize;
      const frac = this.readIdx - readIdxFloor;

      output[i] =
        this.buffer[readIdxFloor] * (1 - frac) +
        this.buffer[readIdxCeil] * frac;

      this.readIdx += pitchRatio;
      if (this.readIdx >= this.bufferSize) this.readIdx -= this.bufferSize;
    }

    return true;
  }
}

registerProcessor("pitch-shifter-processor", PitchShifterProcessor);
