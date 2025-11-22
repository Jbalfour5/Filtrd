export default class HighCutFIR {
  constructor(
    sampleRate = 44100,
    cutoffHz = 8000,
    length = 101,
    window = "hamming"
  ) {
    if (length % 2 === 0) {
      length += 1;
    }

    this.fs = sampleRate;
    this.fc = cutoffHz;
    this.M = length;
    this.windowType = window;

    this.buffer = new Float32Array(this.M).fill(0);
    this.bufferIdx = 0;

    this.h = new Float32Array(this.M);
    this._design();
  }

  _sinc(x) {
    if (x === 0) return 1;
    return Math.sin(Math.PI * x) / (Math.PI * x);
  }

  _hamming(n, N) {
    return 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
  }

  _hann(n, N) {
    return 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
  }

  _rect(n, N) {
    return 1;
  }

  _design() {
    const N = this.M;
    const fc_norm = this.fc / this.fs;
    const fc_clamped = Math.max(1e-6, Math.min(0.4999999, fc_norm));
    const mid = (N - 1) / 2;

    let windowFn = this._hamming.bind(this);
    if (this.windowType === "hann") windowFn = this._hann.bind(this);
    if (this.windowType === "rect") windowFn = this._rect.bind(this);

    let sum = 0;
    for (let n = 0; n < N; n++) {
      const x = n - mid;
      const ideal = 2 * fc_clamped * this._sinc(2 * fc_clamped * x);
      const w = windowFn(n, N);
      const hn = ideal * w;
      this.h[n] = hn;
      sum += hn;
    }

    if (sum === 0) sum = 1;
    for (let n = 0; n < N; n++) this.h[n] /= sum;
  }

  processSample(inputSample) {
    this.bufferIdx = (this.bufferIdx + 1) % this.M;
    this.buffer[this.bufferIdx] = inputSample;

    let y = 0;
    let idx = this.bufferIdx;
    for (let k = 0; k < this.M; k++) {
      y += this.h[k] * this.buffer[idx];
      idx = (idx - 1 + this.M) % this.M;
    }

    return y;
  }

  processBuffer(input) {
    const out = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      out[i] = this.processSample(input[i]);
    }
    return out;
  }

  redesign({
    cutoffHz = this.fc,
    length = this.M,
    window = this.windowType,
  } = {}) {
    if (length % 2 === 0) {
      length += 1;
    }

    if (length !== this.M) {
      this.M = length;
      this.buffer = new Float32Array(this.M).fill(0);
      this.bufferIdx = 0;
      this.h = new Float32Array(this.M);
    }

    this.fc = cutoffHz;
    this.windowType = window;
    this._design();
  }

  frequencyResponse(bins = 512) {
    const mags = new Float32Array(bins);
    const freqs = new Float32Array(bins);

    for (let b = 0; b < bins; b++) {
      const f = (b / (bins - 1)) * (this.fs / 2);
      freqs[b] = f;

      const omega = (2 * Math.PI * f) / this.fs;
      let real = 0;
      let imag = 0;
      for (let n = 0; n < this.M; n++) {
        const phase = -omega * n;
        real += this.h[n] * Math.cos(phase);
        imag += this.h[n] * Math.sin(phase);
      }
      mags[b] = Math.sqrt(real * real + imag * imag);
    }

    return { freqs, mags };
  }
}
