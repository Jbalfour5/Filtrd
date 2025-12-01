class PitchShifterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "semitones", defaultValue: 0, minValue: -12, maxValue: 12 },
    ];
  }

  constructor() {
    super();
    this.bufferSize = 4096;

    this.bufferL = new Float32Array(this.bufferSize).fill(0);
    this.bufferR = new Float32Array(this.bufferSize).fill(0);

    this.writeIdxL = 0;
    this.writeIdxR = 0;

    this.readIdxL = 0;
    this.readIdxR = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0] || !output) return true;

    const inputL = input[0];
    const inputR = input[1] || input[0];
    const outputL = output[0];
    const outputR = output[1] || output[0];

    const semitones =
      parameters.semitones.length > 1
        ? parameters.semitones
        : [parameters.semitones[0]];

    const pitchRatio = Math.pow(2, semitones[0] / 12);

    for (let i = 0; i < inputL.length; i++) {
      this.bufferL[this.writeIdxL] = inputL[i];
      this.bufferR[this.writeIdxR] = inputR[i];

      this.writeIdxL = (this.writeIdxL + 1) % this.bufferSize;
      this.writeIdxR = (this.writeIdxR + 1) % this.bufferSize;

      const flL = Math.floor(this.readIdxL);
      const ceL = (flL + 1) % this.bufferSize;
      const frL = this.readIdxL - flL;

      const flR = Math.floor(this.readIdxR);
      const ceR = (flR + 1) % this.bufferSize;
      const frR = this.readIdxR - flR;

      outputL[i] = this.bufferL[flL] * (1 - frL) + this.bufferL[ceL] * frL;

      outputR[i] = this.bufferR[flR] * (1 - frR) + this.bufferR[ceR] * frR;

      this.readIdxL += pitchRatio;
      this.readIdxR += pitchRatio;

      if (this.readIdxL >= this.bufferSize) this.readIdxL -= this.bufferSize;
      if (this.readIdxR >= this.bufferSize) this.readIdxR -= this.bufferSize;
    }

    return true;
  }
}

registerProcessor("pitch-shifter-processor", PitchShifterProcessor);
