class LowCutFIR {
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
    const lp = new Float32Array(N);

    for (let n = 0; n < N; n++) {
      const x = n - mid;
      const ideal = 2 * fc * this.sinc(2 * fc * x);
      const w = this.hamming(n, N);
      lp[n] = ideal * w;
    }

    for (let n = 0; n < N; n++) {
      this.h[n] = (n === mid ? 1 : 0) - lp[n];
    }
  }

  processSample(x) {
    this.buffer[this.bufferIdx] = x;
    let y = 0;
    let idx = this.bufferIdx;
    for (let k = 0; k < this.M; k++) {
      y += this.h[k] * this.buffer[idx];
      idx = (idx + 1) % this.M;
    }
    this.bufferIdx = (this.bufferIdx + 1) % this.M;
    return y;
  }
}

class LowCutProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const cutoff = options.processorOptions.cutoff || 500;
    this.isBypassed = options.processorOptions.isBypassed || false;
    this.filterL = new LowCutFIR(sampleRate, cutoff, 101);
    this.filterR = new LowCutFIR(sampleRate, cutoff, 101);

    this.port.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "setCutoff") {
        this.filterL.fc = msg.value;
        this.filterR.fc = msg.value;
        this.filterL.design();
        this.filterR.design();
      }
      if (msg.type === "setBypass") {
        this.isBypassed = msg.value;
      }
    };
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0] || !output) return true;

    const inputL = input[0];
    const inputR = input[1] || input[0];
    const outputL = output[0];
    const outputR = output[1] || output[0];

    if (this.isBypassed) {
      for (let i = 0; i < inputL.length; i++) {
        outputL[i] = inputL[i];
        outputR[i] = inputR[i];
      }
      return true;
    }

    for (let i = 0; i < inputL.length; i++) {
      outputL[i] = this.filterL.processSample(inputL[i]);
      outputR[i] = this.filterR.processSample(inputR[i]);
    }

    return true;
  }
}

registerProcessor("lowcut-processor", LowCutProcessor);
