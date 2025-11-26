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
    const input = inputs[0][0];
    const output = outputs[0][0];
    if (!input) return true;
    for (let i = 0; i < input.length; i++) {
      output[i] = this.dist.processSample(input[i]);
    }
    return true;
  }
}

registerProcessor("distortion-processor", DistortionProcessor);
