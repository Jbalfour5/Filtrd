class ReverbFIR {
  constructor(sampleRate, delayTime = 0.1, feedback = 0.3) {
    this.fs = sampleRate;
    this.delaySamples = Math.floor(delayTime * sampleRate);
    this.feedback = feedback;

    this.buffer = new Float32Array(this.delaySamples).fill(0);
    this.bufferIdx = 0;
  }

  processSample(x) {
    const delayed = this.buffer[this.bufferIdx];
    const y = x + delayed * this.feedback;
    this.buffer[this.bufferIdx] = y;
    this.bufferIdx = (this.bufferIdx + 1) % this.delaySamples;
    return y;
  }
}

class ReverbProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.reverb = new ReverbFIR(sampleRate, 0.1, 0.3);
  }

  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];

    if (!input || !output) return true;

    for (let i = 0; i < input.length; i++) {
      output[i] = this.reverb.processSample(input[i]);
    }

    return true;
  }
}

registerProcessor("reverb-processor", ReverbProcessor);