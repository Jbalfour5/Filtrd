class HighCutFIR {
  constructor(sampleRate, cutoffHz = 3000, length = 101) {
    if (length % 2 === 0) length++;
    this.fs = sampleRate;
    this.fc = cutoffHz;
    this.M = length;
    this.buffer = new Float32Array(this.M).fill(0);
    this.bufferIdx = 0;
    this.h = new Float32Array(this.M);
    this.design();
  }

  sinc(x) {
    return x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
  }

  hamming(n, N) {
    return 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
  }

  design() {
    const N = this.M;
    const fc = Math.max(1e-6, Math.min(0.499999, this.fc / this.fs));
    const mid = (N - 1) / 2;
    let sum = 0;

    for (let n = 0; n < N; n++) {
      const x = n - mid;
      const ideal = 2 * fc * this.sinc(2 * fc * x);
      const w = this.hamming(n, N);
      const hn = ideal * w;
      this.h[n] = hn;
      sum += hn;
    }

    for (let n = 0; n < N; n++) {
      this.h[n] /= sum;
    }
  }

  processSample(x) {
    this.bufferIdx = (this.bufferIdx + 1) % this.M;
    this.buffer[this.bufferIdx] = x;
    let y = 0;
    let idx = this.bufferIdx;
    for (let k = 0; k < this.M; k++) {
      y += this.h[k] * this.buffer[idx];
      idx = (idx - 1 + this.M) % this.M;
    }
    return y;
  }
}

class HighCutProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const cutoff = options.processorOptions.cutoff || 8000;
    this.filterL = new HighCutFIR(sampleRate, cutoff, 101);
    this.filterR = new HighCutFIR(sampleRate, cutoff, 101);
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0] || !output) return true;

    const inputL = input[0];
    const inputR = input[1] || input[0];
    const outputL = output[0];
    const outputR = output[1] || output[0];

    for (let i = 0; i < inputL.length; i++) {
      outputL[i] = this.filterL.processSample(inputL[i]);
      outputR[i] = this.filterR.processSample(inputR[i]);
    }
    return true;
  }
}

registerProcessor("highcut-processor", HighCutProcessor);
