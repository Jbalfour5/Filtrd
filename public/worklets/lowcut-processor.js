class LowCutFIR {
  constructor(sampleRate, cutoffHz = 3000, length = 101) {
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
    const fcNorm = Math.max(1e-6, Math.min(0.499999, this.fc / this.fs));
    const mid = (N - 1) / 2;

    const h_lp = new Float32Array(N);

    for (let n = 0; n < N; n++) {
      const x = n - mid;
      const ideal = 2 * fcNorm * this.sinc(2 * fcNorm * x);
      const w = this.hamming(n, N);
      h_lp[n] = ideal * w;
    }

    for (let n = 0; n < N; n++) {
      const delta = n === mid ? 1 : 0;
      this.h[n] = delta - h_lp[n];
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

class LowCutProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    const cutoff = options.processorOptions.cutoff || 500;
    this.isBypassed = options.processorOptions.isBypassed || false;

    this.filter = new LowCutFIR(sampleRate, cutoff, 101);

    this.port.onmessage = (event) => {
      if (event.data.type === "setCutoff") {
        this.filter.fc = event.data.value;
        this.filter.design();
      } else if (event.data.type === "setBypass") {
        this.isBypassed = event.data.value;
      }
    };
  }

  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];

    if (!input || !output) return true;

    if (this.isBypassed) {
      for (let i = 0; i < input.length; i++) {
        output[i] = input[i];
      }
    } else {
      for (let i = 0; i < input.length; i++) {
        output[i] = this.filter.processSample(input[i]);
      }
    }
    return true;
  }
}

registerProcessor("lowcut-processor", LowCutProcessor);
