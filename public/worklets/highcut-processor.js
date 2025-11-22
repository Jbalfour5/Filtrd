class HighCutFIR {
  constructor(sampleRate, cutoffHz = 8000, length = 101) {
    if (length % 2 === 0) length += 1;

    this.fs = sampleRate;
    this.fc = cutoffHz;
    this.M = length;

    this.buffer = new Float32Array(this.M).fill(0);
    this.bufferIdx = 0;

    this.h = new Float32Array(this.M);
    this.design();
  }

  sinc(x) {
    if (x === 0) return 1;
    return Math.sin(Math.PI * x) / (Math.PI * x);
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
    this.filter = new HighCutFIR(sampleRate, cutoff, 101);
  }

  process(inputs, outputs) {
    const input = inputs[0][0];
    const output = outputs[0][0];

    if (!input) return true;

    for (let i = 0; i < input.length; i++) {
      output[i] = this.filter.processSample(input[i]);
    }

    return true;
  }
}

registerProcessor("highcut-processor", HighCutProcessor);
