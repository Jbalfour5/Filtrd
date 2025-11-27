class ReverbFIR {
  constructor(sampleRate, delayTime = 0.1, feedback = 0.3) {
    this.fs = sampleRate;
    this.delaySamples = Math.floor(delayTime * sampleRate);
    this.feedback = feedback;

    this.bufferL = new Float32Array(this.delaySamples).fill(0);
    this.bufferR = new Float32Array(this.delaySamples).fill(0);
    this.bufferIdx = 0;
  }

  processSample(x, channel = "L") {
    const buffer = channel === "L" ? this.bufferL : this.bufferR;
    const delayed = buffer[this.bufferIdx];
    const y = x + delayed * this.feedback;
    buffer[this.bufferIdx] = y;
    return y;
  }

  incrementIndex() {
    this.bufferIdx = (this.bufferIdx + 1) % this.delaySamples;
  }
}

class ReverbProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.reverb = new ReverbFIR(sampleRate, 0.1, 0.3);
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !output) return true;

    const inputL = input[0];
    const inputR = input[1] || input[0];
    const outputL = output[0];
    const outputR = output[1] || output[0];

    for (let i = 0; i < inputL.length; i++) {
      outputL[i] = this.reverb.processSample(inputL[i], "L");
      outputR[i] = this.reverb.processSample(inputR[i], "R");
      this.reverb.incrementIndex();
    }

    return true;
  }
}

registerProcessor("reverb-processor", ReverbProcessor);
