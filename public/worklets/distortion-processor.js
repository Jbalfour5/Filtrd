class Distortion {
  constructor(drive = 1.0, makeupGain = 1.0) {
    this.drive = drive;
    this.makeup = makeupGain;
  }

  applyCurve(x) {
    const driven = x * this.drive;
    const clipped = Math.tanh(driven);
    return clipped * this.makeup;
  }

  processSample(x) {
    return this.applyCurve(x);
  }
}

class DistortionProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const drive = options.processorOptions.drive || 2.5;
    const makeup = options.processorOptions.makeup || 1.2;
    this.dist = new Distortion(drive, makeup);
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !output) return true;

    const inputL = input[0] ?? new Float32Array(output[0].length);
    const inputR = input[1] ?? inputL;
    const outputL = output[0];
    const outputR = output[1] ?? outputL;

    const len = Math.min(inputL.length, outputL.length);
    for (let i = 0; i < len; i++) {
      outputL[i] = this.dist.processSample(inputL[i]);
      outputR[i] = this.dist.processSample(inputR[i]);
    }

    return true;
  }
}

registerProcessor("distortion-processor", DistortionProcessor);
