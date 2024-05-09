/*!
 * ONNX Runtime Web v1.19.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// web/node_modules/onnxruntime-common/dist/esm/backend-impl.js
var backends, backendsSortedByPriority, registerBackend, tryResolveAndInitializeBackend, resolveBackendAndExecutionProviders;
var init_backend_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/backend-impl.js"() {
    backends = /* @__PURE__ */ new Map();
    backendsSortedByPriority = [];
    registerBackend = (name, backend, priority) => {
      if (backend && typeof backend.init === "function" && typeof backend.createInferenceSessionHandler === "function") {
        const currentBackend = backends.get(name);
        if (currentBackend === void 0) {
          backends.set(name, { backend, priority });
        } else if (currentBackend.priority > priority) {
          return;
        } else if (currentBackend.priority === priority) {
          if (currentBackend.backend !== backend) {
            throw new Error(`cannot register backend "${name}" using priority ${priority}`);
          }
        }
        if (priority >= 0) {
          const i = backendsSortedByPriority.indexOf(name);
          if (i !== -1) {
            backendsSortedByPriority.splice(i, 1);
          }
          for (let i2 = 0; i2 < backendsSortedByPriority.length; i2++) {
            if (backends.get(backendsSortedByPriority[i2]).priority <= priority) {
              backendsSortedByPriority.splice(i2, 0, name);
              return;
            }
          }
          backendsSortedByPriority.push(name);
        }
        return;
      }
      throw new TypeError("not a valid backend");
    };
    tryResolveAndInitializeBackend = async (backendName) => {
      const backendInfo = backends.get(backendName);
      if (!backendInfo) {
        return "backend not found.";
      }
      if (backendInfo.initialized) {
        return backendInfo.backend;
      } else if (backendInfo.aborted) {
        return backendInfo.error;
      } else {
        const isInitializing = !!backendInfo.initPromise;
        try {
          if (!isInitializing) {
            backendInfo.initPromise = backendInfo.backend.init(backendName);
          }
          await backendInfo.initPromise;
          backendInfo.initialized = true;
          return backendInfo.backend;
        } catch (e) {
          if (!isInitializing) {
            backendInfo.error = `${e}`;
            backendInfo.aborted = true;
          }
          return backendInfo.error;
        } finally {
          delete backendInfo.initPromise;
        }
      }
    };
    resolveBackendAndExecutionProviders = async (options) => {
      const eps = options.executionProviders || [];
      const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
      const backendNames = backendHints.length === 0 ? backendsSortedByPriority : backendHints;
      let backend;
      const errors = [];
      const availableBackendNames = /* @__PURE__ */ new Set();
      for (const backendName of backendNames) {
        const resolveResult = await tryResolveAndInitializeBackend(backendName);
        if (typeof resolveResult === "string") {
          errors.push({ name: backendName, err: resolveResult });
        } else {
          if (!backend) {
            backend = resolveResult;
          }
          if (backend === resolveResult) {
            availableBackendNames.add(backendName);
          }
        }
      }
      if (!backend) {
        throw new Error(`no available backend found. ERR: ${errors.map((e) => `[${e.name}] ${e.err}`).join(", ")}`);
      }
      for (const { name, err } of errors) {
        if (backendHints.includes(name)) {
          console.warn(`removing requested execution provider "${name}" from session options because it is not available: ${err}`);
        }
      }
      const filteredEps = eps.filter((i) => availableBackendNames.has(typeof i === "string" ? i : i.name));
      return [
        backend,
        new Proxy(options, {
          get: (target, prop) => {
            if (prop === "executionProviders") {
              return filteredEps;
            }
            return Reflect.get(target, prop);
          }
        })
      ];
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/backend.js
var init_backend = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/backend.js"() {
    init_backend_impl();
  }
});

// web/node_modules/onnxruntime-common/dist/esm/version.js
var version;
var init_version = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/version.js"() {
    version = "1.19.0";
  }
});

// web/node_modules/onnxruntime-common/dist/esm/env-impl.js
var logLevelValue, env;
var init_env_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/env-impl.js"() {
    init_version();
    logLevelValue = "warning";
    env = {
      wasm: {},
      webgl: {},
      webgpu: {},
      versions: { common: version },
      set logLevel(value) {
        if (value === void 0) {
          return;
        }
        if (typeof value !== "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(value) === -1) {
          throw new Error(`Unsupported logging level: ${value}`);
        }
        logLevelValue = value;
      },
      get logLevel() {
        return logLevelValue;
      }
    };
    Object.defineProperty(env, "logLevel", { enumerable: true });
  }
});

// web/node_modules/onnxruntime-common/dist/esm/env.js
var env2;
var init_env = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/env.js"() {
    init_env_impl();
    env2 = env;
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-conversion-impl.js
var tensorToDataURL, tensorToImageData;
var init_tensor_conversion_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-conversion-impl.js"() {
    tensorToDataURL = (tensor, options) => {
      const canvas = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
      canvas.width = tensor.dims[3];
      canvas.height = tensor.dims[2];
      const pixels2DContext = canvas.getContext("2d");
      if (pixels2DContext != null) {
        let width;
        let height;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
        }
        const inputformat = options?.format !== void 0 ? options.format : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 0];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            const R = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
            const G = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
            const B = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
            const A = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
            pixels2DContext.fillStyle = "rgba(" + R + "," + G + "," + B + "," + A + ")";
            pixels2DContext.fillRect(j, i, 1, 1);
          }
        }
        if ("toDataURL" in canvas) {
          return canvas.toDataURL();
        } else {
          throw new Error("toDataURL is not supported");
        }
      } else {
        throw new Error("Can not access image data");
      }
    };
    tensorToImageData = (tensor, options) => {
      const pixels2DContext = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d");
      let image;
      if (pixels2DContext != null) {
        let width;
        let height;
        let channels;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[1];
          channels = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
          channels = tensor.dims[1];
        }
        const inputformat = options !== void 0 ? options.format !== void 0 ? options.format : "RGB" : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 255];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        if (options !== void 0) {
          if (options.format !== void 0 && (channels === 4 && options.format !== "RGBA") || channels === 3 && (options.format !== "RGB" && options.format !== "BGR")) {
            throw new Error("Tensor format doesn't match input tensor dims");
          }
        }
        const step = 4;
        let rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        image = pixels2DContext.createImageData(width, height);
        for (let i = 0; i < height * width; rImagePointer += step, gImagePointer += step, bImagePointer += step, aImagePointer += step, i++) {
          image.data[rImagePointer] = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
          image.data[gImagePointer] = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
          image.data[bImagePointer] = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
          image.data[aImagePointer] = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
        }
      } else {
        throw new Error("Can not access image data");
      }
      return image;
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-factory-impl.js
var bufferToTensor, tensorFromImage, tensorFromTexture, tensorFromGpuBuffer, tensorFromPinnedBuffer;
var init_tensor_factory_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-factory-impl.js"() {
    init_tensor_impl();
    bufferToTensor = (buffer, options) => {
      if (buffer === void 0) {
        throw new Error("Image buffer must be defined");
      }
      if (options.height === void 0 || options.width === void 0) {
        throw new Error("Image height and width must be defined");
      }
      if (options.tensorLayout === "NHWC") {
        throw new Error("NHWC Tensor layout is not supported yet");
      }
      const { height, width } = options;
      const norm = options.norm ?? { mean: 255, bias: 0 };
      let normMean;
      let normBias;
      if (typeof norm.mean === "number") {
        normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
      } else {
        normMean = [norm.mean[0], norm.mean[1], norm.mean[2], norm.mean[3] ?? 255];
      }
      if (typeof norm.bias === "number") {
        normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
      } else {
        normBias = [norm.bias[0], norm.bias[1], norm.bias[2], norm.bias[3] ?? 0];
      }
      const inputformat = options.format !== void 0 ? options.format : "RGBA";
      const outputformat = options.tensorFormat !== void 0 ? options.tensorFormat !== void 0 ? options.tensorFormat : "RGB" : "RGB";
      const stride = height * width;
      const float32Data = outputformat === "RGBA" ? new Float32Array(stride * 4) : new Float32Array(stride * 3);
      let step = 4, rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
      let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
      if (inputformat === "RGB") {
        step = 3;
        rImagePointer = 0;
        gImagePointer = 1;
        bImagePointer = 2;
        aImagePointer = -1;
      }
      if (outputformat === "RGBA") {
        aTensorPointer = stride * 3;
      } else if (outputformat === "RBG") {
        rTensorPointer = 0;
        bTensorPointer = stride;
        gTensorPointer = stride * 2;
      } else if (outputformat === "BGR") {
        bTensorPointer = 0;
        gTensorPointer = stride;
        rTensorPointer = stride * 2;
      }
      for (let i = 0; i < stride; i++, rImagePointer += step, bImagePointer += step, gImagePointer += step, aImagePointer += step) {
        float32Data[rTensorPointer++] = (buffer[rImagePointer] + normBias[0]) / normMean[0];
        float32Data[gTensorPointer++] = (buffer[gImagePointer] + normBias[1]) / normMean[1];
        float32Data[bTensorPointer++] = (buffer[bImagePointer] + normBias[2]) / normMean[2];
        if (aTensorPointer !== -1 && aImagePointer !== -1) {
          float32Data[aTensorPointer++] = (buffer[aImagePointer] + normBias[3]) / normMean[3];
        }
      }
      const outputTensor = outputformat === "RGBA" ? new Tensor("float32", float32Data, [1, 4, height, width]) : new Tensor("float32", float32Data, [1, 3, height, width]);
      return outputTensor;
    };
    tensorFromImage = async (image, options) => {
      const isHTMLImageEle = typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement;
      const isImageDataEle = typeof ImageData !== "undefined" && image instanceof ImageData;
      const isImageBitmap = typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap;
      const isString = typeof image === "string";
      let data;
      let bufferToTensorOptions = options ?? {};
      const createCanvas = () => {
        if (typeof document !== "undefined") {
          return document.createElement("canvas");
        } else if (typeof OffscreenCanvas !== "undefined") {
          return new OffscreenCanvas(1, 1);
        } else {
          throw new Error("Canvas is not supported");
        }
      };
      const createCanvasContext = (canvas) => {
        if (canvas instanceof HTMLCanvasElement) {
          return canvas.getContext("2d");
        } else if (canvas instanceof OffscreenCanvas) {
          return canvas.getContext("2d");
        } else {
          return null;
        }
      };
      if (isHTMLImageEle) {
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          let height = image.height;
          let width = image.width;
          if (options !== void 0 && options.resizedHeight !== void 0 && options.resizedWidth !== void 0) {
            height = options.resizedHeight;
            width = options.resizedWidth;
          }
          if (options !== void 0) {
            bufferToTensorOptions = options;
            if (options.tensorFormat !== void 0) {
              throw new Error("Image input config format must be RGBA for HTMLImageElement");
            } else {
              bufferToTensorOptions.tensorFormat = "RGBA";
            }
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          } else {
            bufferToTensorOptions.tensorFormat = "RGBA";
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          }
          pixels2DContext.drawImage(image, 0, 0);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isImageDataEle) {
        let height;
        let width;
        if (options !== void 0 && options.resizedWidth !== void 0 && options.resizedHeight !== void 0) {
          height = options.resizedHeight;
          width = options.resizedWidth;
        } else {
          height = image.height;
          width = image.width;
        }
        if (options !== void 0) {
          bufferToTensorOptions = options;
        }
        bufferToTensorOptions.format = "RGBA";
        bufferToTensorOptions.height = height;
        bufferToTensorOptions.width = width;
        if (options !== void 0) {
          const tempCanvas = createCanvas();
          tempCanvas.width = width;
          tempCanvas.height = height;
          const pixels2DContext = createCanvasContext(tempCanvas);
          if (pixels2DContext != null) {
            pixels2DContext.putImageData(image, 0, 0);
            data = pixels2DContext.getImageData(0, 0, width, height).data;
          } else {
            throw new Error("Can not access image data");
          }
        } else {
          data = image.data;
        }
      } else if (isImageBitmap) {
        if (options === void 0) {
          throw new Error("Please provide image config with format for Imagebitmap");
        }
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          const height = image.height;
          const width = image.width;
          pixels2DContext.drawImage(image, 0, 0, width, height);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
          bufferToTensorOptions.height = height;
          bufferToTensorOptions.width = width;
          return bufferToTensor(data, bufferToTensorOptions);
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isString) {
        return new Promise((resolve, reject) => {
          const canvas = createCanvas();
          const context = createCanvasContext(canvas);
          if (!image || !context) {
            return reject();
          }
          const newImage = new Image();
          newImage.crossOrigin = "Anonymous";
          newImage.src = image;
          newImage.onload = () => {
            canvas.width = newImage.width;
            canvas.height = newImage.height;
            context.drawImage(newImage, 0, 0, canvas.width, canvas.height);
            const img = context.getImageData(0, 0, canvas.width, canvas.height);
            bufferToTensorOptions.height = canvas.height;
            bufferToTensorOptions.width = canvas.width;
            resolve(bufferToTensor(img.data, bufferToTensorOptions));
          };
        });
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
      if (data !== void 0) {
        return bufferToTensor(data, bufferToTensorOptions);
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
    };
    tensorFromTexture = (texture, options) => {
      const { width, height, download, dispose } = options;
      const dims = [1, height, width, 4];
      return new Tensor({ location: "texture", type: "float32", texture, dims, download, dispose });
    };
    tensorFromGpuBuffer = (gpuBuffer, options) => {
      const { dataType, dims, download, dispose } = options;
      return new Tensor({ location: "gpu-buffer", type: dataType ?? "float32", gpuBuffer, dims, download, dispose });
    };
    tensorFromPinnedBuffer = (type, buffer, dims) => new Tensor({ location: "cpu-pinned", type, data: buffer, dims: dims ?? [buffer.length] });
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-impl-type-mapping.js
var NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP, NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, isTypedArrayChecked, checkTypedArray;
var init_tensor_impl_type_mapping = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-impl-type-mapping.js"() {
    NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = /* @__PURE__ */ new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
      ["int16", Int16Array],
      ["int32", Int32Array],
      ["bool", Uint8Array],
      ["float64", Float64Array],
      ["uint32", Uint32Array]
    ]);
    NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP = /* @__PURE__ */ new Map([
      [Float32Array, "float32"],
      [Uint8Array, "uint8"],
      [Int8Array, "int8"],
      [Uint16Array, "uint16"],
      [Int16Array, "int16"],
      [Int32Array, "int32"],
      [Float64Array, "float64"],
      [Uint32Array, "uint32"]
    ]);
    isTypedArrayChecked = false;
    checkTypedArray = () => {
      if (!isTypedArrayChecked) {
        isTypedArrayChecked = true;
        const isBigInt64ArrayAvailable = typeof BigInt64Array !== "undefined" && BigInt64Array.from;
        const isBigUint64ArrayAvailable = typeof BigUint64Array !== "undefined" && BigUint64Array.from;
        const isFloat16ArrayAvailable = typeof Float16Array !== "undefined" && Float16Array.from;
        if (isBigInt64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("int64", BigInt64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, "int64");
        }
        if (isBigUint64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("uint64", BigUint64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, "uint64");
        }
        if (isFloat16ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("float16", Float16Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(Float16Array, "float16");
        } else {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("float16", Uint16Array);
        }
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-utils-impl.js
var calculateSize, tensorReshape;
var init_tensor_utils_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-utils-impl.js"() {
    init_tensor_impl();
    calculateSize = (dims) => {
      let size = 1;
      for (let i = 0; i < dims.length; i++) {
        const dim = dims[i];
        if (typeof dim !== "number" || !Number.isSafeInteger(dim)) {
          throw new TypeError(`dims[${i}] must be an integer, got: ${dim}`);
        }
        if (dim < 0) {
          throw new RangeError(`dims[${i}] must be a non-negative integer, got: ${dim}`);
        }
        size *= dim;
      }
      return size;
    };
    tensorReshape = (tensor, dims) => {
      switch (tensor.location) {
        case "cpu":
          return new Tensor(tensor.type, tensor.data, dims);
        case "cpu-pinned":
          return new Tensor({
            location: "cpu-pinned",
            data: tensor.data,
            type: tensor.type,
            dims
          });
        case "texture":
          return new Tensor({
            location: "texture",
            texture: tensor.texture,
            type: tensor.type,
            dims
          });
        case "gpu-buffer":
          return new Tensor({
            location: "gpu-buffer",
            gpuBuffer: tensor.gpuBuffer,
            type: tensor.type,
            dims
          });
        default:
          throw new Error(`tensorReshape: tensor location ${tensor.location} is not supported`);
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-impl.js
var Tensor;
var init_tensor_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-impl.js"() {
    init_tensor_conversion_impl();
    init_tensor_factory_impl();
    init_tensor_impl_type_mapping();
    init_tensor_utils_impl();
    Tensor = class {
      /**
       * implementation.
       */
      constructor(arg0, arg1, arg2) {
        checkTypedArray();
        let type;
        let dims;
        if (typeof arg0 === "object" && "location" in arg0) {
          this.dataLocation = arg0.location;
          type = arg0.type;
          dims = arg0.dims;
          switch (arg0.location) {
            case "cpu-pinned": {
              const expectedTypedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(type);
              if (!expectedTypedArrayConstructor) {
                throw new TypeError(`unsupported type "${type}" to create tensor from pinned buffer`);
              }
              if (!(arg0.data instanceof expectedTypedArrayConstructor)) {
                throw new TypeError(`buffer should be of type ${expectedTypedArrayConstructor.name}`);
              }
              this.cpuData = arg0.data;
              break;
            }
            case "texture": {
              if (type !== "float32") {
                throw new TypeError(`unsupported type "${type}" to create tensor from texture`);
              }
              this.gpuTextureData = arg0.texture;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            case "gpu-buffer": {
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "uint8" && type !== "bool") {
                throw new TypeError(`unsupported type "${type}" to create tensor from gpu buffer`);
              }
              this.gpuBufferData = arg0.gpuBuffer;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
        } else {
          let data;
          let maybeDims;
          if (typeof arg0 === "string") {
            type = arg0;
            maybeDims = arg2;
            if (arg0 === "string") {
              if (!Array.isArray(arg1)) {
                throw new TypeError("A string tensor's data must be a string array.");
              }
              data = arg1;
            } else {
              const typedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(arg0);
              if (typedArrayConstructor === void 0) {
                throw new TypeError(`Unsupported tensor type: ${arg0}.`);
              }
              if (Array.isArray(arg1)) {
                if (arg0 === "float16" && typedArrayConstructor === Uint16Array) {
                  throw new TypeError("Creating a float16 tensor from number array is not supported. Please use Uint16Array as data.");
                } else if (arg0 === "uint64" || arg0 === "int64") {
                  data = typedArrayConstructor.from(arg1, BigInt);
                } else {
                  data = typedArrayConstructor.from(arg1);
                }
              } else if (arg1 instanceof typedArrayConstructor) {
                data = arg1;
              } else {
                throw new TypeError(`A ${type} tensor's data must be type of ${typedArrayConstructor}`);
              }
            }
          } else {
            maybeDims = arg1;
            if (Array.isArray(arg0)) {
              if (arg0.length === 0) {
                throw new TypeError("Tensor type cannot be inferred from an empty array.");
              }
              const firstElementType = typeof arg0[0];
              if (firstElementType === "string") {
                type = "string";
                data = arg0;
              } else if (firstElementType === "boolean") {
                type = "bool";
                data = Uint8Array.from(arg0);
              } else {
                throw new TypeError(`Invalid element type of data array: ${firstElementType}.`);
              }
            } else {
              const mappedType = NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.get(arg0.constructor);
              if (mappedType === void 0) {
                throw new TypeError(`Unsupported type for tensor data: ${arg0.constructor}.`);
              }
              type = mappedType;
              data = arg0;
            }
          }
          if (maybeDims === void 0) {
            maybeDims = [data.length];
          } else if (!Array.isArray(maybeDims)) {
            throw new TypeError("A tensor's dims must be a number array");
          }
          dims = maybeDims;
          this.cpuData = data;
          this.dataLocation = "cpu";
        }
        const size = calculateSize(dims);
        if (this.cpuData && size !== this.cpuData.length) {
          throw new Error(`Tensor's size(${size}) does not match data length(${this.cpuData.length}).`);
        }
        this.type = type;
        this.dims = dims;
        this.size = size;
      }
      // #endregion
      // #region factory
      static async fromImage(image, options) {
        return tensorFromImage(image, options);
      }
      static fromTexture(texture, options) {
        return tensorFromTexture(texture, options);
      }
      static fromGpuBuffer(gpuBuffer, options) {
        return tensorFromGpuBuffer(gpuBuffer, options);
      }
      static fromPinnedBuffer(type, buffer, dims) {
        return tensorFromPinnedBuffer(type, buffer, dims);
      }
      // #endregion
      // #region conversions
      toDataURL(options) {
        return tensorToDataURL(this, options);
      }
      toImageData(options) {
        return tensorToImageData(this, options);
      }
      // #endregion
      // #region properties
      get data() {
        this.ensureValid();
        if (!this.cpuData) {
          throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
        }
        return this.cpuData;
      }
      get location() {
        return this.dataLocation;
      }
      get texture() {
        this.ensureValid();
        if (!this.gpuTextureData) {
          throw new Error("The data is not stored as a WebGL texture.");
        }
        return this.gpuTextureData;
      }
      get gpuBuffer() {
        this.ensureValid();
        if (!this.gpuBufferData) {
          throw new Error("The data is not stored as a WebGPU buffer.");
        }
        return this.gpuBufferData;
      }
      // #endregion
      // #region methods
      async getData(releaseData) {
        this.ensureValid();
        switch (this.dataLocation) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer": {
            if (!this.downloader) {
              throw new Error("The current tensor is not created with a specified data downloader.");
            }
            if (this.isDownloading) {
              throw new Error("The current tensor is being downloaded.");
            }
            try {
              this.isDownloading = true;
              const data = await this.downloader();
              this.downloader = void 0;
              this.dataLocation = "cpu";
              this.cpuData = data;
              if (releaseData && this.disposer) {
                this.disposer();
                this.disposer = void 0;
              }
              return data;
            } finally {
              this.isDownloading = false;
            }
          }
          default:
            throw new Error(`cannot get data from location: ${this.dataLocation}`);
        }
      }
      dispose() {
        if (this.isDownloading) {
          throw new Error("The current tensor is being downloaded.");
        }
        if (this.disposer) {
          this.disposer();
          this.disposer = void 0;
        }
        this.cpuData = void 0;
        this.gpuTextureData = void 0;
        this.gpuBufferData = void 0;
        this.downloader = void 0;
        this.isDownloading = void 0;
        this.dataLocation = "none";
      }
      // #endregion
      // #region tensor utilities
      ensureValid() {
        if (this.dataLocation === "none") {
          throw new Error("The tensor is disposed.");
        }
      }
      reshape(dims) {
        this.ensureValid();
        if (this.downloader || this.disposer) {
          throw new Error("Cannot reshape a tensor that owns GPU resource.");
        }
        return tensorReshape(this, dims);
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor.js
var Tensor2;
var init_tensor = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor.js"() {
    init_tensor_impl();
    Tensor2 = Tensor;
  }
});

// web/node_modules/onnxruntime-common/dist/esm/trace.js
var TRACE, TRACE_FUNC, TRACE_FUNC_BEGIN, TRACE_FUNC_END;
var init_trace = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/trace.js"() {
    init_env_impl();
    TRACE = (deviceType, label) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      console.timeStamp(`${deviceType}::ORT::${label}`);
    };
    TRACE_FUNC = (msg, extraMsg) => {
      const stack = new Error().stack?.split(/\r\n|\r|\n/g) || [];
      let hasTraceFunc = false;
      for (let i = 0; i < stack.length; i++) {
        if (hasTraceFunc && !stack[i].includes("TRACE_FUNC")) {
          let label = `FUNC_${msg}::${stack[i].trim().split(" ")[1]}`;
          if (extraMsg) {
            label += `::${extraMsg}`;
          }
          TRACE("CPU", label);
          return;
        }
        if (stack[i].includes("TRACE_FUNC")) {
          hasTraceFunc = true;
        }
      }
    };
    TRACE_FUNC_BEGIN = (extraMsg) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      TRACE_FUNC("BEGIN", extraMsg);
    };
    TRACE_FUNC_END = (extraMsg) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      TRACE_FUNC("END", extraMsg);
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/inference-session-impl.js
var InferenceSession;
var init_inference_session_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/inference-session-impl.js"() {
    init_backend_impl();
    init_tensor();
    init_trace();
    InferenceSession = class _InferenceSession {
      constructor(handler) {
        this.handler = handler;
      }
      async run(feeds, arg1, arg2) {
        TRACE_FUNC_BEGIN();
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (this.outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of this.outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of this.inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of this.outputNames) {
            fetches[name] = null;
          }
        }
        const results = await this.handler.run(feeds, fetches, options);
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        TRACE_FUNC_END();
        return returnValue;
      }
      async release() {
        return this.handler.dispose();
      }
      static async create(arg0, arg1, arg2, arg3) {
        TRACE_FUNC_BEGIN();
        let filePathOrUint8Array;
        let options = {};
        if (typeof arg0 === "string") {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof Uint8Array) {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && arg0 instanceof SharedArrayBuffer) {
          const buffer = arg0;
          let byteOffset = 0;
          let byteLength = arg0.byteLength;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 === "number") {
            byteOffset = arg1;
            if (!Number.isSafeInteger(byteOffset)) {
              throw new RangeError("'byteOffset' must be an integer.");
            }
            if (byteOffset < 0 || byteOffset >= buffer.byteLength) {
              throw new RangeError(`'byteOffset' is out of range [0, ${buffer.byteLength}).`);
            }
            byteLength = arg0.byteLength - byteOffset;
            if (typeof arg2 === "number") {
              byteLength = arg2;
              if (!Number.isSafeInteger(byteLength)) {
                throw new RangeError("'byteLength' must be an integer.");
              }
              if (byteLength <= 0 || byteOffset + byteLength > buffer.byteLength) {
                throw new RangeError(`'byteLength' is out of range (0, ${buffer.byteLength - byteOffset}].`);
              }
              if (typeof arg3 === "object" && arg3 !== null) {
                options = arg3;
              } else if (typeof arg3 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'byteLength' must be a number.");
            }
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
          filePathOrUint8Array = new Uint8Array(buffer, byteOffset, byteLength);
        } else {
          throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
        }
        const [backend, optionsWithValidatedEPs] = await resolveBackendAndExecutionProviders(options);
        const handler = await backend.createInferenceSessionHandler(filePathOrUint8Array, optionsWithValidatedEPs);
        TRACE_FUNC_END();
        return new _InferenceSession(handler);
      }
      startProfiling() {
        this.handler.startProfiling();
      }
      endProfiling() {
        this.handler.endProfiling();
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/inference-session.js
var InferenceSession2;
var init_inference_session = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/inference-session.js"() {
    init_inference_session_impl();
    InferenceSession2 = InferenceSession;
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-conversion.js
var init_tensor_conversion = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-conversion.js"() {
  }
});

// web/node_modules/onnxruntime-common/dist/esm/tensor-factory.js
var init_tensor_factory = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/tensor-factory.js"() {
  }
});

// web/node_modules/onnxruntime-common/dist/esm/onnx-model.js
var init_onnx_model = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/onnx-model.js"() {
  }
});

// web/node_modules/onnxruntime-common/dist/esm/onnx-value.js
var init_onnx_value = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/onnx-value.js"() {
  }
});

// web/node_modules/onnxruntime-common/dist/esm/training-session-impl.js
var noBackendErrMsg, TrainingSession;
var init_training_session_impl = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/training-session-impl.js"() {
    init_backend_impl();
    init_tensor();
    noBackendErrMsg = "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files.";
    TrainingSession = class _TrainingSession {
      constructor(handler, hasOptimizerModel, hasEvalModel) {
        this.handler = handler;
        this.hasOptimizerModel = hasOptimizerModel;
        this.hasEvalModel = hasEvalModel;
      }
      get trainingInputNames() {
        return this.handler.inputNames;
      }
      get trainingOutputNames() {
        return this.handler.outputNames;
      }
      get evalInputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalInputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      get evalOutputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalOutputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      static async create(trainingOptions, sessionOptions) {
        const evalModel = trainingOptions.evalModel || "";
        const optimizerModel = trainingOptions.optimizerModel || "";
        const options = sessionOptions || {};
        const [backend, optionsWithValidatedEPs] = await resolveBackendAndExecutionProviders(options);
        if (backend.createTrainingSessionHandler) {
          const handler = await backend.createTrainingSessionHandler(trainingOptions.checkpointState, trainingOptions.trainModel, evalModel, optimizerModel, optionsWithValidatedEPs);
          return new _TrainingSession(handler, !!trainingOptions.optimizerModel, !!trainingOptions.evalModel);
        } else {
          throw new Error(noBackendErrMsg);
        }
      }
      /**
       * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
       * the given parameters to SessionHandler.FetchesType and RunOptions.
       *
       * @param inputNames the feeds object is checked that they contain all input names in the provided list of input
       * names.
       * @param outputNames the fetches object is checked that their keys match up with valid names in the list of output
       * names.
       * @param feeds the required input
       * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
       * @param arg2 optional RunOptions object.
       * @returns
       */
      typeNarrowingForRunStep(inputNames, outputNames, feeds, arg1, arg2) {
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of outputNames) {
            fetches[name] = null;
          }
        }
        return [fetches, options];
      }
      /**
       * Helper method for runTrainStep and any other runStep methods. Takes the ReturnType result from the SessionHandler
       * and changes it into a map of Tensors.
       *
       * @param results
       * @returns
       */
      convertHandlerReturnTypeToMapOfTensors(results) {
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        return returnValue;
      }
      async lazyResetGrad() {
        await this.handler.lazyResetGrad();
      }
      async runTrainStep(feeds, arg1, arg2) {
        const [fetches, options] = this.typeNarrowingForRunStep(this.trainingInputNames, this.trainingOutputNames, feeds, arg1, arg2);
        const results = await this.handler.runTrainStep(feeds, fetches, options);
        return this.convertHandlerReturnTypeToMapOfTensors(results);
      }
      async runOptimizerStep(options) {
        if (this.hasOptimizerModel) {
          await this.handler.runOptimizerStep(options || {});
        } else {
          throw new Error("This TrainingSession has no OptimizerModel loaded.");
        }
      }
      async runEvalStep(feeds, arg1, arg2) {
        if (this.hasEvalModel) {
          const [fetches, options] = this.typeNarrowingForRunStep(this.evalInputNames, this.evalOutputNames, feeds, arg1, arg2);
          const results = await this.handler.runEvalStep(feeds, fetches, options);
          return this.convertHandlerReturnTypeToMapOfTensors(results);
        } else {
          throw new Error("This TrainingSession has no EvalModel loaded.");
        }
      }
      async getParametersSize(trainableOnly = true) {
        return this.handler.getParametersSize(trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly = true) {
        const paramsSize = await this.getParametersSize(trainableOnly);
        if (array.length !== 4 * paramsSize) {
          throw new Error("Size of the buffer passed into loadParametersBuffer must match the number of parameters in the model. Please use getParametersSize method to check.");
        }
        return this.handler.loadParametersBuffer(array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly = true) {
        return this.handler.getContiguousParameters(trainableOnly);
      }
      async release() {
        return this.handler.dispose();
      }
    };
  }
});

// web/node_modules/onnxruntime-common/dist/esm/training-session.js
var TrainingSession2;
var init_training_session = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/training-session.js"() {
    init_training_session_impl();
    TrainingSession2 = TrainingSession;
  }
});

// web/node_modules/onnxruntime-common/dist/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  env: () => env2,
  registerBackend: () => registerBackend
});
var init_esm = __esm({
  "web/node_modules/onnxruntime-common/dist/esm/index.js"() {
    init_backend();
    init_env();
    init_inference_session();
    init_tensor();
    init_tensor_conversion();
    init_tensor_factory();
    init_trace();
    init_onnx_model();
    init_onnx_value();
    init_training_session();
  }
});

// nodejs-ignore:node:os
var cpus;
var init_node_os = __esm({
  "nodejs-ignore:node:os"() {
    cpus = void 0;
  }
});

// nodejs-ignore:node:path
var join;
var init_node_path = __esm({
  "nodejs-ignore:node:path"() {
    join = void 0;
  }
});

// nodejs-ignore:fs
var fs_exports = {};
__export(fs_exports, {
  createReadStream: () => createReadStream,
  readFile: () => readFile,
  readFileSync: () => readFileSync
});
var readFile, readFileSync, createReadStream;
var init_fs = __esm({
  "nodejs-ignore:fs"() {
    readFile = void 0;
    readFileSync = void 0;
    createReadStream = void 0;
  }
});

// nodejs-ignore:path
var path_exports = {};
__export(path_exports, {
  join: () => join2
});
var join2;
var init_path = __esm({
  "nodejs-ignore:path"() {
    join2 = void 0;
  }
});

// web/lib/wasm/binding/ort-training-wasm-simd.js
var require_ort_training_wasm_simd = __commonJS({
  "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module2) {
    "use strict";
    var ortWasm = (() => {
      var _scriptDir = typeof document != "undefined" ? document.currentScript?.src : void 0;
      if (typeof __filename != "undefined")
        _scriptDir ||= __filename;
      return function(moduleArg = {}) {
        var e = moduleArg, k, l, readyPromise = new Promise((a, b) => {
          k = a;
          l = b;
        }), u = Object.assign({}, e), v = "./this.program", aa = "object" == typeof window, w = "function" == typeof importScripts, ba = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, z = "", A, B, C;
        if (ba) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), D = (init_path(), __toCommonJS(path_exports));
          z = w ? D.dirname(z) + "/" : __dirname + "/";
          A = (a, b) => {
            a = E(a) ? new URL(a) : D.normalize(a);
            return fs.readFileSync(a, b ? void 0 : "utf8");
          };
          C = (a) => {
            a = A(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          B = (a, b, c, d = true) => {
            a = E(a) ? new URL(a) : D.normalize(a);
            fs.readFile(a, d ? void 0 : "utf8", (g, h) => {
              g ? c(g) : b(d ? h.buffer : h);
            });
          };
          !e.thisProgram && 1 < process.argv.length && (v = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
        } else if (aa || w)
          w ? z = self.location.href : "undefined" != typeof document && document.currentScript && (z = document.currentScript.src), _scriptDir && (z = _scriptDir), z.startsWith("blob:") ? z = "" : z = z.substr(0, z.replace(/[?#].*/, "").lastIndexOf("/") + 1), A = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, w && (C = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), B = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          };
        var ca = console.log.bind(console), F = console.error.bind(console);
        Object.assign(e, u);
        u = null;
        var G, da = false, H, I, J, K, ea;
        function fa() {
          var a = G.buffer;
          e.HEAP8 = H = new Int8Array(a);
          e.HEAP16 = new Int16Array(a);
          e.HEAPU8 = I = new Uint8Array(a);
          e.HEAPU16 = new Uint16Array(a);
          e.HEAP32 = J = new Int32Array(a);
          e.HEAPU32 = K = new Uint32Array(a);
          e.HEAPF32 = new Float32Array(a);
          e.HEAPF64 = ea = new Float64Array(a);
        }
        var L = [], M = [], ha = [], N = 0, O = null, P = null;
        function ia(a) {
          a = "Aborted(" + a + ")";
          F(a);
          da = true;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          l(a);
          throw a;
        }
        var ja = (a) => a.startsWith("data:application/octet-stream;base64,"), E = (a) => a.startsWith("file://"), Q;
        Q = "ort-training-wasm-simd.wasm";
        if (!ja(Q)) {
          var ka = Q;
          Q = e.locateFile ? e.locateFile(ka, z) : z + ka;
        }
        function la(a) {
          if (C)
            return C(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function ma(a) {
          if (aa || w) {
            if ("function" == typeof fetch && !E(a))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw `failed to load wasm binary file at '${a}'`;
                return b.arrayBuffer();
              }).catch(() => la(a));
            if (B)
              return new Promise((b, c) => {
                B(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => la(a));
        }
        function na(a, b, c) {
          return ma(a).then((d) => WebAssembly.instantiate(d, b)).then(c, (d) => {
            F(`failed to asynchronously prepare wasm: ${d}`);
            ia(d);
          });
        }
        function oa(a, b) {
          var c = Q;
          return "function" != typeof WebAssembly.instantiateStreaming || ja(c) || E(c) || ba || "function" != typeof fetch ? na(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {
            F(`wasm streaming compile failed: ${g}`);
            F("falling back to ArrayBuffer instantiation");
            return na(c, a, b);
          }));
        }
        var R, pa = { 869704: (a, b, c, d) => {
          if ("undefined" == typeof e || !e.La)
            return 1;
          a = S(a >>> 0);
          a.startsWith("./") && (a = a.substring(2));
          a = e.La.get(a);
          if (!a)
            return 2;
          b >>>= 0;
          c >>>= 0;
          if (b + c > a.byteLength)
            return 3;
          try {
            return I.set(a.subarray(b, b + c), d >>> 0 >>> 0), 0;
          } catch {
            return 4;
          }
        } };
        class qa {
          constructor(a) {
            this.Ja = a - 24;
          }
        }
        var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && ta)
            return ta.decode(a.subarray(b, c));
          for (d = ""; b < c; ) {
            var g = a[b++];
            if (g & 128) {
              var h = a[b++] & 63;
              if (192 == (g & 224))
                d += String.fromCharCode((g & 31) << 6 | h);
              else {
                var m = a[b++] & 63;
                g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;
                65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
              }
            } else
              d += String.fromCharCode(g);
          }
          return d;
        }, S = (a, b) => (a >>>= 0) ? ua(I, a, b) : "", va = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, T = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var g = c;
          d = c + d - 1;
          for (var h = 0; h < a.length; ++h) {
            var m = a.charCodeAt(h);
            if (55296 <= m && 57343 >= m) {
              var q = a.charCodeAt(++h);
              m = 65536 + ((m & 1023) << 10) | q & 1023;
            }
            if (127 >= m) {
              if (c >= d)
                break;
              b[c++ >>> 0] = m;
            } else {
              if (2047 >= m) {
                if (c + 1 >= d)
                  break;
                b[c++ >>> 0] = 192 | m >> 6;
              } else {
                if (65535 >= m) {
                  if (c + 2 >= d)
                    break;
                  b[c++ >>> 0] = 224 | m >> 12;
                } else {
                  if (c + 3 >= d)
                    break;
                  b[c++ >>> 0] = 240 | m >> 18;
                  b[c++ >>> 0] = 128 | m >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | m >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | m & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - g;
        }, U = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), za = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Aa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], V = [], W = {}, Ba = () => {
          if (!X) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: v || "./this.program" }, b;
            for (b in W)
              void 0 === W[b] ? delete a[b] : a[b] = W[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            X = c;
          }
          return X;
        }, X, Ca = [null, [], []], Da = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ea = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Fa(a) {
          var b = Array(va(a) + 1);
          T(a, b, 0, b.length);
          return b;
        }
        function Ga(a, b, c, d) {
          function g(f, n, p) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )
              f = p[0] + f;
            return f;
          }
          function h(f, n) {
            return g(f, n, "0");
          }
          function m(f, n) {
            function p(wa) {
              return 0 > wa ? -1 : 0 < wa ? 1 : 0;
            }
            var y;
            0 === (y = p(f.getFullYear() - n.getFullYear())) && 0 === (y = p(f.getMonth() - n.getMonth())) && (y = p(f.getDate() - n.getDate()));
            return y;
          }
          function q(f) {
            switch (f.getDay()) {
              case 0:
                return new Date(f.getFullYear() - 1, 11, 29);
              case 1:
                return f;
              case 2:
                return new Date(f.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  f.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(f.getFullYear(), 0, 1);
              case 5:
                return new Date(f.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f.getFullYear() - 1, 11, 30);
            }
          }
          function x(f) {
            var n = f.Fa;
            for (f = new Date(new Date(f.Ga + 1900, 0, 1).getTime()); 0 < n; ) {
              var p = f.getMonth(), y = (U(f.getFullYear()) ? Da : Ea)[p];
              if (n > y - f.getDate())
                n -= y - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + n);
                break;
              }
            }
            p = new Date(f.getFullYear() + 1, 0, 4);
            n = q(new Date(
              f.getFullYear(),
              0,
              4
            ));
            p = q(p);
            return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var r = K[d + 40 >>> 2 >>> 0];
          d = { Oa: J[d >>> 2 >>> 0], Na: J[d + 4 >>> 2 >>> 0], Ha: J[d + 8 >>> 2 >>> 0], Ka: J[d + 12 >>> 2 >>> 0], Ia: J[d + 16 >>> 2 >>> 0], Ga: J[d + 20 >>> 2 >>> 0], Aa: J[d + 24 >>> 2 >>> 0], Fa: J[d + 28 >>> 2 >>> 0], Qa: J[d + 32 >>> 2 >>> 0], Ma: J[d + 36 >>> 2 >>> 0], Pa: r ? S(r) : "" };
          c = S(c);
          r = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var t in r)
            c = c.replace(new RegExp(t, "g"), r[t]);
          var xa = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), ya = "January February March April May June July August September October November December".split(" ");
          r = {
            "%a": (f) => xa[f.Aa].substring(0, 3),
            "%A": (f) => xa[f.Aa],
            "%b": (f) => ya[f.Ia].substring(0, 3),
            "%B": (f) => ya[f.Ia],
            "%C": (f) => h((f.Ga + 1900) / 100 | 0, 2),
            "%d": (f) => h(f.Ka, 2),
            "%e": (f) => g(f.Ka, 2, " "),
            "%g": (f) => x(f).toString().substring(2),
            "%G": x,
            "%H": (f) => h(f.Ha, 2),
            "%I": (f) => {
              f = f.Ha;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return h(f, 2);
            },
            "%j": (f) => {
              for (var n = 0, p = 0; p <= f.Ia - 1; n += (U(f.Ga + 1900) ? Da : Ea)[p++])
                ;
              return h(f.Ka + n, 3);
            },
            "%m": (f) => h(f.Ia + 1, 2),
            "%M": (f) => h(f.Na, 2),
            "%n": () => "\n",
            "%p": (f) => 0 <= f.Ha && 12 > f.Ha ? "AM" : "PM",
            "%S": (f) => h(f.Oa, 2),
            "%t": () => "	",
            "%u": (f) => f.Aa || 7,
            "%U": (f) => h(Math.floor((f.Fa + 7 - f.Aa) / 7), 2),
            "%V": (f) => {
              var n = Math.floor((f.Fa + 7 - (f.Aa + 6) % 7) / 7);
              2 >= (f.Aa + 371 - f.Fa - 2) % 7 && n++;
              if (n)
                53 == n && (p = (f.Aa + 371 - f.Fa) % 7, 4 == p || 3 == p && U(f.Ga) || (n = 1));
              else {
                n = 52;
                var p = (f.Aa + 7 - f.Fa - 1) % 7;
                (4 == p || 5 == p && U(f.Ga % 400 - 1)) && n++;
              }
              return h(n, 2);
            },
            "%w": (f) => f.Aa,
            "%W": (f) => h(Math.floor((f.Fa + 7 - (f.Aa + 6) % 7) / 7), 2),
            "%y": (f) => (f.Ga + 1900).toString().substring(2),
            "%Y": (f) => f.Ga + 1900,
            "%z": (f) => {
              f = f.Ma;
              var n = 0 <= f;
              f = Math.abs(f) / 60;
              return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            },
            "%Z": (f) => f.Pa,
            "%%": () => "%"
          };
          c = c.replace(/%%/g, "\0\0");
          for (t in r)
            c.includes(t) && (c = c.replace(new RegExp(t, "g"), r[t](d)));
          c = c.replace(/\0\0/g, "%");
          t = Fa(c);
          if (t.length > b)
            return 0;
          H.set(t, a >>> 0);
          return t.length - 1;
        }
        var Ia = { a: function(a, b, c) {
          a >>>= 0;
          var d = new qa(a);
          K[d.Ja + 16 >>> 2 >>> 0] = 0;
          K[d.Ja + 4 >>> 2 >>> 0] = b >>> 0;
          K[d.Ja + 8 >>> 2 >>> 0] = c >>> 0;
          ra = a;
          sa++;
          throw ra;
        }, e: function() {
          return 0;
        }, H: function() {
        }, x: function() {
        }, z: function() {
        }, J: function() {
          return 0;
        }, F: function() {
        }, A: function() {
        }, E: function() {
        }, g: function() {
        }, y: function() {
        }, v: function() {
        }, G: function() {
        }, w: function() {
        }, k: () => 1, I: function(a, b, c) {
          b >>>= 0;
          return I.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);
        }, n: function(a, b, c) {
          a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
          c >>>= 0;
          a = new Date(1e3 * a);
          J[c >>> 2 >>> 0] = a.getUTCSeconds();
          J[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();
          J[c + 8 >>> 2 >>> 0] = a.getUTCHours();
          J[c + 12 >>> 2 >>> 0] = a.getUTCDate();
          J[c + 16 >>> 2 >>> 0] = a.getUTCMonth();
          J[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
          J[c + 24 >>> 2 >>> 0] = a.getUTCDay();
          J[c + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
        }, o: function(a, b, c) {
          a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
          c >>>= 0;
          a = new Date(1e3 * a);
          J[c >>> 2 >>> 0] = a.getSeconds();
          J[c + 4 >>> 2 >>> 0] = a.getMinutes();
          J[c + 8 >>> 2 >>> 0] = a.getHours();
          J[c + 12 >>> 2 >>> 0] = a.getDate();
          J[c + 16 >>> 2 >>> 0] = a.getMonth();
          J[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
          J[c + 24 >>> 2 >>> 0] = a.getDay();
          J[c + 28 >>> 2 >>> 0] = (U(a.getFullYear()) ? za : Aa)[a.getMonth()] + a.getDate() - 1 | 0;
          J[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
          b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
          var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
          J[c + 32 >>> 2 >>> 0] = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;
        }, p: function(a) {
          a >>>= 0;
          var b = new Date(
            J[a + 20 >>> 2 >>> 0] + 1900,
            J[a + 16 >>> 2 >>> 0],
            J[a + 12 >>> 2 >>> 0],
            J[a + 8 >>> 2 >>> 0],
            J[a + 4 >>> 2 >>> 0],
            J[a >>> 2 >>> 0],
            0
          ), c = J[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);
          0 > c ? J[a + 32 >>> 2 >>> 0] = Number(g != h && m == d) : 0 < c != (m == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - d)));
          J[a + 24 >>> 2 >>> 0] = b.getDay();
          J[a + 28 >>> 2 >>> 0] = (U(b.getFullYear()) ? za : Aa)[b.getMonth()] + b.getDate() - 1 | 0;
          J[a >>> 2 >>> 0] = b.getSeconds();
          J[a + 4 >>> 2 >>> 0] = b.getMinutes();
          J[a + 8 >>> 2 >>> 0] = b.getHours();
          J[a + 12 >>> 2 >>> 0] = b.getDate();
          J[a + 16 >>> 2 >>> 0] = b.getMonth();
          J[a + 20 >>> 2 >>> 0] = b.getYear();
          a = b.getTime();
          a = isNaN(a) ? -1 : a / 1e3;
          Ha((R = a, 1 <= +Math.abs(R) ? 0 < R ? +Math.floor(R / 4294967296) >>> 0 : ~~+Math.ceil((R - +(~~R >>> 0)) / 4294967296) >>> 0 : 0));
          return a >>> 0;
        }, l: function() {
          return -52;
        }, m: function() {
        }, t: function(a, b, c, d) {
          c >>>= 0;
          d >>>= 0;
          var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);
          g = h.getTimezoneOffset();
          var q = m.getTimezoneOffset();
          K[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(g, q);
          J[b >>> 0 >>> 2 >>> 0] = Number(g != q);
          a = (x) => x.toLocaleTimeString(void 0, { hour12: false, timeZoneName: "short" }).split(" ")[1];
          h = a(h);
          m = a(m);
          q < g ? (T(h, I, c, 17), T(m, I, d, 17)) : (T(h, I, d, 17), T(m, I, c, 17));
        }, d: () => {
          ia("");
        }, B: function(a, b, c) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          V.length = 0;
          for (var d; d = I[b++ >>> 0]; ) {
            var g = 105 != d;
            g &= 112 != d;
            c += g && c % 8 ? 4 : 0;
            V.push(112 == d ? K[c >>> 2 >>> 0] : 105 == d ? J[c >>> 2 >>> 0] : ea[c >>> 3 >>> 0]);
            c += g ? 8 : 4;
          }
          return pa[a](...V);
        }, h: () => Date.now(), u: function() {
          return 4294901760;
        }, b: () => performance.now(), s: function(a) {
          a >>>= 0;
          var b = I.length;
          if (4294901760 < a)
            return false;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, a + 100663296);
            var g = Math;
            d = Math.max(a, d);
            a: {
              g = (g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - G.buffer.byteLength + 65535) / 65536;
              try {
                G.grow(g);
                fa();
                var h = 1;
                break a;
              } catch (m) {
              }
              h = void 0;
            }
            if (h)
              return true;
          }
          return false;
        }, C: function(a, b) {
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          Ba().forEach((d, g) => {
            var h = b + c;
            g = K[a + 4 * g >>> 2 >>> 0] = h;
            for (h = 0; h < d.length; ++h)
              H[g++ >>> 0] = d.charCodeAt(h);
            H[g >>> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        }, D: function(a, b) {
          a >>>= 0;
          b >>>= 0;
          var c = Ba();
          K[a >>> 2 >>> 0] = c.length;
          var d = 0;
          c.forEach((g) => d += g.length + 1);
          K[b >>> 2 >>> 0] = d;
          return 0;
        }, f: () => 52, j: function() {
          return 52;
        }, q: function() {
          return 70;
        }, i: function(a, b, c, d) {
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          for (var g = 0, h = 0; h < c; h++) {
            var m = K[b >>> 2 >>> 0], q = K[b + 4 >>> 2 >>> 0];
            b += 8;
            for (var x = 0; x < q; x++) {
              var r = I[m + x >>> 0], t = Ca[a];
              0 === r || 10 === r ? ((1 === a ? ca : F)(ua(t, 0)), t.length = 0) : t.push(r);
            }
            g += q;
          }
          K[d >>> 2 >>> 0] = g;
          return 0;
        }, r: Ga, c: function(a, b, c, d) {
          return Ga(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
        } }, Y = function() {
          function a(c) {
            Y = c.exports;
            Y = Ja();
            G = Y.K;
            fa();
            M.unshift(Y.L);
            N--;
            0 == N && (null !== O && (clearInterval(O), O = null), P && (c = P, P = null, c()));
            return Y;
          }
          var b = { a: Ia };
          N++;
          if (e.instantiateWasm)
            try {
              return e.instantiateWasm(b, a);
            } catch (c) {
              F(`Module.instantiateWasm callback failed with error: ${c}`), l(c);
            }
          oa(b, function(c) {
            a(c.instance);
          }).catch(l);
          return {};
        }();
        e._OrtInit = (a, b) => (e._OrtInit = Y.M)(a, b);
        e._OrtGetLastError = (a, b) => (e._OrtGetLastError = Y.N)(a, b);
        e._OrtCreateSessionOptions = (a, b, c, d, g, h, m, q, x, r) => (e._OrtCreateSessionOptions = Y.O)(a, b, c, d, g, h, m, q, x, r);
        e._OrtAppendExecutionProvider = (a, b) => (e._OrtAppendExecutionProvider = Y.P)(a, b);
        e._OrtAddFreeDimensionOverride = (a, b, c) => (e._OrtAddFreeDimensionOverride = Y.Q)(a, b, c);
        e._OrtAddSessionConfigEntry = (a, b, c) => (e._OrtAddSessionConfigEntry = Y.R)(a, b, c);
        e._OrtReleaseSessionOptions = (a) => (e._OrtReleaseSessionOptions = Y.S)(a);
        e._OrtCreateSession = (a, b, c) => (e._OrtCreateSession = Y.T)(a, b, c);
        e._OrtReleaseSession = (a) => (e._OrtReleaseSession = Y.U)(a);
        e._OrtGetInputOutputCount = (a, b, c) => (e._OrtGetInputOutputCount = Y.V)(a, b, c);
        e._OrtGetInputName = (a, b) => (e._OrtGetInputName = Y.W)(a, b);
        e._OrtGetOutputName = (a, b) => (e._OrtGetOutputName = Y.X)(a, b);
        e._OrtFree = (a) => (e._OrtFree = Y.Y)(a);
        e._OrtCreateTensor = (a, b, c, d, g, h) => (e._OrtCreateTensor = Y.Z)(a, b, c, d, g, h);
        e._OrtGetTensorData = (a, b, c, d, g) => (e._OrtGetTensorData = Y._)(a, b, c, d, g);
        e._OrtReleaseTensor = (a) => (e._OrtReleaseTensor = Y.$)(a);
        e._OrtCreateRunOptions = (a, b, c, d) => (e._OrtCreateRunOptions = Y.aa)(a, b, c, d);
        e._OrtAddRunConfigEntry = (a, b, c) => (e._OrtAddRunConfigEntry = Y.ba)(a, b, c);
        e._OrtReleaseRunOptions = (a) => (e._OrtReleaseRunOptions = Y.ca)(a);
        e._OrtCreateBinding = (a) => (e._OrtCreateBinding = Y.da)(a);
        e._OrtBindInput = (a, b, c) => (e._OrtBindInput = Y.ea)(a, b, c);
        e._OrtBindOutput = (a, b, c, d) => (e._OrtBindOutput = Y.fa)(a, b, c, d);
        e._OrtClearBoundOutputs = (a) => (e._OrtClearBoundOutputs = Y.ga)(a);
        e._OrtReleaseBinding = (a) => (e._OrtReleaseBinding = Y.ha)(a);
        e._OrtRunWithBinding = (a, b, c, d, g) => (e._OrtRunWithBinding = Y.ia)(a, b, c, d, g);
        e._OrtRun = (a, b, c, d, g, h, m, q) => (e._OrtRun = Y.ja)(a, b, c, d, g, h, m, q);
        e._OrtEndProfiling = (a) => (e._OrtEndProfiling = Y.ka)(a);
        e._OrtTrainingLoadCheckpoint = (a, b) => (e._OrtTrainingLoadCheckpoint = Y.la)(a, b);
        e._OrtTrainingReleaseCheckpoint = (a) => (e._OrtTrainingReleaseCheckpoint = Y.ma)(a);
        e._OrtTrainingCreateSession = (a, b, c, d, g, h, m, q) => (e._OrtTrainingCreateSession = Y.na)(a, b, c, d, g, h, m, q);
        e._OrtTrainingLazyResetGrad = (a) => (e._OrtTrainingLazyResetGrad = Y.oa)(a);
        e._OrtTrainingRunTrainStep = (a, b, c, d, g, h) => (e._OrtTrainingRunTrainStep = Y.pa)(a, b, c, d, g, h);
        e._OrtTrainingOptimizerStep = (a, b) => (e._OrtTrainingOptimizerStep = Y.qa)(a, b);
        e._OrtTrainingEvalStep = (a, b, c, d, g, h) => (e._OrtTrainingEvalStep = Y.ra)(a, b, c, d, g, h);
        e._OrtTrainingGetParametersSize = (a, b, c) => (e._OrtTrainingGetParametersSize = Y.sa)(a, b, c);
        e._OrtTrainingCopyParametersToBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersToBuffer = Y.ta)(a, b, c, d);
        e._OrtTrainingCopyParametersFromBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersFromBuffer = Y.ua)(a, b, c, d);
        e._OrtTrainingGetModelInputOutputCount = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputCount = Y.va)(a, b, c, d);
        e._OrtTrainingGetModelInputOutputName = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputName = Y.wa)(a, b, c, d);
        e._OrtTrainingReleaseSession = (a) => (e._OrtTrainingReleaseSession = Y.xa)(a);
        e._malloc = (a) => (e._malloc = Y.ya)(a);
        e._free = (a) => (e._free = Y.za)(a);
        var Ha = (a) => (Ha = Y.Ba)(a), Ka = (a) => (Ka = Y.Ca)(a), La = (a) => (La = Y.Da)(a), Ma = () => (Ma = Y.Ea)();
        function Ja() {
          var a = Y;
          a = Object.assign({}, a);
          var b = (c) => (d) => c(d) >>> 0;
          a.ya = b(a.ya);
          a.Da = b(a.Da);
          a.Ea = ((c) => () => c() >>> 0)(a.Ea);
          return a;
        }
        e.stackSave = () => Ma();
        e.stackRestore = (a) => Ka(a);
        e.stackAlloc = (a) => La(a);
        e.UTF8ToString = S;
        e.stringToUTF8 = (a, b, c) => T(a, I, b, c);
        e.lengthBytesUTF8 = va;
        var Z;
        P = function Na() {
          Z || Oa();
          Z || (P = Na);
        };
        function Oa() {
          if (!(0 < N)) {
            if (e.preRun)
              for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length; ) {
                var a = e.preRun.shift();
                L.unshift(a);
              }
            for (; 0 < L.length; )
              L.shift()(e);
            if (!(0 < N || Z || (Z = true, e.calledRun = true, da))) {
              for (; 0 < M.length; )
                M.shift()(e);
              for (k(e); 0 < ha.length; )
                ha.shift()(e);
            }
          }
        }
        Oa();
        return readyPromise;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasm;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasm);
  }
});

// nodejs-ignore:worker_threads
var require_worker_threads = __commonJS({
  "nodejs-ignore:worker_threads"() {
  }
});

// nodejs-ignore:perf_hooks
var require_perf_hooks = __commonJS({
  "nodejs-ignore:perf_hooks"() {
  }
});

// nodejs-ignore:os
var os_exports = {};
__export(os_exports, {
  cpus: () => cpus2
});
var cpus2;
var init_os = __esm({
  "nodejs-ignore:os"() {
    cpus2 = void 0;
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.js
var require_ort_wasm_threaded = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module2) {
    "use strict";
    var ortWasmThreaded = (() => {
      var _scriptDir = typeof document != "undefined" ? document.currentScript?.src : void 0;
      if (typeof __filename != "undefined")
        _scriptDir ||= __filename;
      return function(moduleArg = {}) {
        function aa() {
          e.buffer != l.buffer && m();
          return l;
        }
        function n() {
          e.buffer != l.buffer && m();
          return ba;
        }
        function p() {
          e.buffer != l.buffer && m();
          return ca;
        }
        function r() {
          e.buffer != l.buffer && m();
          return da;
        }
        function ea() {
          e.buffer != l.buffer && m();
          return fa;
        }
        var v = moduleArg, ha, x, readyPromise = new Promise((a, b) => {
          ha = a;
          x = b;
        }), ia = Object.assign({}, v), ja = "./this.program", z = (a, b) => {
          throw b;
        }, ka = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = v.ENVIRONMENT_IS_PTHREAD || false, E = "";
        function la(a) {
          return v.locateFile ? v.locateFile(a, E) : E + a;
        }
        var ma, G, H;
        if (B) {
          var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));
          E = A ? na.dirname(E) + "/" : __dirname + "/";
          ma = (a, b) => {
            a = I(a) ? new URL(a) : na.normalize(a);
            return fs.readFileSync(a, b ? void 0 : "utf8");
          };
          H = (a) => {
            a = ma(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          G = (a, b, c, d = true) => {
            a = I(a) ? new URL(a) : na.normalize(a);
            fs.readFile(a, d ? void 0 : "utf8", (h, g) => {
              h ? c(h) : b(d ? g.buffer : g);
            });
          };
          !v.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          z = (a, b) => {
            process.exitCode = a;
            throw b;
          };
          global.Worker = require_worker_threads().Worker;
        } else if (ka || A)
          A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), E.startsWith("blob:") ? E = "" : E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1), B || (ma = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.send(null);
            return b.responseText;
          }, A && (H = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), G = (a, b, c) => {
            var d = new XMLHttpRequest();
            d.open("GET", a, true);
            d.responseType = "arraybuffer";
            d.onload = () => {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          });
        B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);
        var oa = console.log.bind(console), pa = console.error.bind(console);
        B && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\n"));
        var qa = oa, J = pa;
        Object.assign(v, ia);
        ia = null;
        var e, ra, K = false, L, l, ba, ca, da, fa;
        function m() {
          var a = e.buffer;
          v.HEAP8 = l = new Int8Array(a);
          v.HEAP16 = new Int16Array(a);
          v.HEAPU8 = ba = new Uint8Array(a);
          v.HEAPU16 = new Uint16Array(a);
          v.HEAP32 = ca = new Int32Array(a);
          v.HEAPU32 = da = new Uint32Array(a);
          v.HEAPF32 = new Float32Array(a);
          v.HEAPF64 = fa = new Float64Array(a);
        }
        var sa = 16777216;
        if (D)
          e = v.wasmMemory;
        else if (v.wasmMemory)
          e = v.wasmMemory;
        else if (e = new WebAssembly.Memory({ initial: sa / 65536, maximum: 65536, shared: true }), !(e.buffer instanceof SharedArrayBuffer))
          throw J("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && J("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");
        m();
        sa = e.buffer.byteLength;
        var ta = [], ua = [], va = [], M = 0, wa = null, N = null;
        function xa() {
          M--;
          if (0 == M && (null !== wa && (clearInterval(wa), wa = null), N)) {
            var a = N;
            N = null;
            a();
          }
        }
        function ya(a) {
          a = "Aborted(" + a + ")";
          J(a);
          K = true;
          L = 1;
          a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
          x(a);
          throw a;
        }
        var za = (a) => a.startsWith("data:application/octet-stream;base64,"), I = (a) => a.startsWith("file://"), O;
        O = "ort-wasm-threaded.wasm";
        za(O) || (O = la(O));
        function Aa(a) {
          if (H)
            return H(a);
          throw "both async and sync fetching of the wasm failed";
        }
        function Ba(a) {
          if (ka || A) {
            if ("function" == typeof fetch && !I(a))
              return fetch(a, { credentials: "same-origin" }).then((b) => {
                if (!b.ok)
                  throw `failed to load wasm binary file at '${a}'`;
                return b.arrayBuffer();
              }).catch(() => Aa(a));
            if (G)
              return new Promise((b, c) => {
                G(a, (d) => b(new Uint8Array(d)), c);
              });
          }
          return Promise.resolve().then(() => Aa(a));
        }
        function Ca(a, b, c) {
          return Ba(a).then((d) => WebAssembly.instantiate(d, b)).then(c, (d) => {
            J(`failed to asynchronously prepare wasm: ${d}`);
            ya(d);
          });
        }
        function Da(a, b) {
          var c = O;
          return "function" != typeof WebAssembly.instantiateStreaming || za(c) || I(c) || B || "function" != typeof fetch ? Ca(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(h) {
            J(`wasm streaming compile failed: ${h}`);
            J("falling back to ArrayBuffer instantiation");
            return Ca(c, a, b);
          }));
        }
        var P, Ea = { 799412: (a, b, c, d) => {
          if ("undefined" == typeof v || !v.bb)
            return 1;
          a = Q(a >>> 0);
          a.startsWith("./") && (a = a.substring(2));
          a = v.bb.get(a);
          if (!a)
            return 2;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if (b + c > a.byteLength)
            return 3;
          try {
            return n().set(a.subarray(b, b + c), d >>> 0), 0;
          } catch {
            return 4;
          }
        } };
        function R(a) {
          this.name = "ExitStatus";
          this.message = `Program terminated with exit(${a})`;
          this.status = a;
        }
        var Fa = (a) => {
          a.terminate();
          a.onmessage = () => {
          };
        }, Ha = (a) => {
          0 == S.Oa.length && (Ga(), S.Xa(S.Oa[0]));
          var b = S.Oa.pop();
          if (!b)
            return 6;
          S.Pa.push(b);
          S.La[a.Na] = b;
          b.Na = a.Na;
          var c = { cmd: "run", start_routine: a.gb, arg: a.cb, pthread_ptr: a.Na };
          B && b.unref();
          b.postMessage(c, a.mb);
          return 0;
        }, T = 0, Ja = (a) => {
          var b = Ia();
          a = a();
          U(b);
          return a;
        }, V = (a, b, ...c) => Ja(() => {
          for (var d = c.length, h = Ka(8 * d), g = h >>> 3, k = 0; k < c.length; k++) {
            var t = c[k];
            ea()[g + k >>> 0] = t;
          }
          return La(a, 0, d, h, b);
        });
        function Ma(a) {
          if (D)
            return V(0, 1, a);
          L = a;
          0 < T || (S.hb(), v.onExit?.(a), K = true);
          z(a, new R(a));
        }
        var Oa = (a) => {
          L = a;
          if (D)
            throw Na(a), "unwind";
          Ma(a);
        };
        function Pa() {
          for (var a = v.numThreads; a--; )
            Ga();
          ta.unshift(() => {
            M++;
            Qa(() => xa());
          });
        }
        function Ga() {
          var a = la("ort-wasm-threaded.worker.js");
          a = new Worker(a);
          S.Oa.push(a);
        }
        function Qa(a) {
          D ? a() : Promise.all(S.Oa.map(S.Xa)).then(a);
        }
        var S = { Oa: [], Pa: [], ab: [], La: {}, Va() {
          D ? (S.receiveObjectTransfer = S.fb, S.threadInitTLS = S.$a, S.setExitStatus = S.Za) : Pa();
        }, Za: (a) => L = a, pb: ["$terminateWorker"], hb: () => {
          for (var a of S.Pa)
            Fa(a);
          for (a of S.Oa)
            Fa(a);
          S.Oa = [];
          S.Pa = [];
          S.La = [];
        }, Ya: (a) => {
          var b = a.Na;
          delete S.La[b];
          S.Oa.push(a);
          S.Pa.splice(S.Pa.indexOf(a), 1);
          a.Na = 0;
          Ra(b);
        }, fb() {
        }, $a() {
          S.ab.forEach((a) => a());
        }, Xa: (a) => new Promise((b) => {
          a.onmessage = (g) => {
            g = g.data;
            var k = g.cmd;
            if (g.targetThread && g.targetThread != W()) {
              var t = S.La[g.targetThread];
              t ? t.postMessage(g, g.transferList) : J(`Internal error! Worker sent a message "${k}" to target pthread ${g.targetThread}, but that thread no longer exists!`);
            } else if ("checkMailbox" === k)
              Sa();
            else if ("spawnThread" === k)
              Ha(g);
            else if ("cleanupThread" === k)
              S.Ya(S.La[g.thread]);
            else if ("killThread" === k)
              g = g.thread, k = S.La[g], delete S.La[g], Fa(k), Ra(g), S.Pa.splice(S.Pa.indexOf(k), 1), k.Na = 0;
            else if ("cancelThread" === k)
              S.La[g.thread].postMessage({ cmd: "cancel" });
            else if ("loaded" === k)
              a.loaded = true, B && !a.Na && a.unref(), b(a);
            else if ("alert" === k)
              alert(`Thread ${g.threadId}: ${g.text}`);
            else if ("setimmediate" === g.target)
              a.postMessage(g);
            else if ("callHandler" === k)
              v[g.handler](...g.args);
            else
              k && J(`worker sent an unknown command ${k}`);
          };
          a.onerror = (g) => {
            J(`${"worker sent an error!"} ${g.filename}:${g.lineno}: ${g.message}`);
            throw g;
          };
          B && (a.on("message", (g) => a.onmessage({ data: g })), a.on("error", (g) => a.onerror(g)));
          var c = [], d = ["onExit"], h;
          for (h of d)
            v.hasOwnProperty(h) && c.push(h);
          a.postMessage({ cmd: "load", handlers: c, urlOrBlob: v.mainScriptUrlOrBlob || _scriptDir, wasmMemory: e, wasmModule: ra });
        }) };
        v.PThread = S;
        var Ta = (a) => {
          for (; 0 < a.length; )
            a.shift()(v);
        };
        v.establishStackSpace = () => {
          var a = W(), b = r()[a + 52 >>> 2 >>> 0];
          a = r()[a + 56 >>> 2 >>> 0];
          Ua(b, b - a);
          U(b);
        };
        function Na(a) {
          if (D)
            return V(1, 0, a);
          Oa(a);
        }
        var Va = [], Wa;
        v.invokeEntryPoint = (a, b) => {
          T = 0;
          var c = Va[a];
          c || (a >= Va.length && (Va.length = a + 1), Va[a] = c = Wa.get(a));
          a = c(b);
          0 < T ? S.Za(a) : Xa(a);
        };
        class Ya {
          constructor(a) {
            this.Ua = a - 24;
          }
          Va(a, b) {
            r()[this.Ua + 16 >>> 2 >>> 0] = 0;
            r()[this.Ua + 4 >>> 2 >>> 0] = a;
            r()[this.Ua + 8 >>> 2 >>> 0] = b;
          }
        }
        var Za = 0, $a = 0;
        function ab(a, b, c, d) {
          return D ? V(2, 1, a, b, c, d) : bb(a, b, c, d);
        }
        function bb(a, b, c, d) {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          if ("undefined" == typeof SharedArrayBuffer)
            return J("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;
          var h = [];
          if (D && 0 === h.length)
            return ab(a, b, c, d);
          a = { gb: c, Na: a, cb: d, mb: h };
          return D ? (a.ob = "spawnThread", postMessage(a, h), 0) : Ha(a);
        }
        var cb = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, db = (a, b, c) => {
          b >>>= 0;
          var d = b + c;
          for (c = b; a[c] && !(c >= d); )
            ++c;
          if (16 < c - b && a.buffer && cb)
            return cb.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));
          for (d = ""; b < c; ) {
            var h = a[b++];
            if (h & 128) {
              var g = a[b++] & 63;
              if (192 == (h & 224))
                d += String.fromCharCode((h & 31) << 6 | g);
              else {
                var k = a[b++] & 63;
                h = 224 == (h & 240) ? (h & 15) << 12 | g << 6 | k : (h & 7) << 18 | g << 12 | k << 6 | a[b++] & 63;
                65536 > h ? d += String.fromCharCode(h) : (h -= 65536, d += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));
              }
            } else
              d += String.fromCharCode(h);
          }
          return d;
        }, Q = (a, b) => (a >>>= 0) ? db(n(), a, b) : "";
        function eb(a, b, c) {
          return D ? V(3, 1, a, b, c) : 0;
        }
        function fb(a, b) {
          if (D)
            return V(4, 1, a, b);
        }
        var gb = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, hb = (a, b, c, d) => {
          c >>>= 0;
          if (!(0 < d))
            return 0;
          var h = c;
          d = c + d - 1;
          for (var g = 0; g < a.length; ++g) {
            var k = a.charCodeAt(g);
            if (55296 <= k && 57343 >= k) {
              var t = a.charCodeAt(++g);
              k = 65536 + ((k & 1023) << 10) | t & 1023;
            }
            if (127 >= k) {
              if (c >= d)
                break;
              b[c++ >>> 0] = k;
            } else {
              if (2047 >= k) {
                if (c + 1 >= d)
                  break;
                b[c++ >>> 0] = 192 | k >> 6;
              } else {
                if (65535 >= k) {
                  if (c + 2 >= d)
                    break;
                  b[c++ >>> 0] = 224 | k >> 12;
                } else {
                  if (c + 3 >= d)
                    break;
                  b[c++ >>> 0] = 240 | k >> 18;
                  b[c++ >>> 0] = 128 | k >> 12 & 63;
                }
                b[c++ >>> 0] = 128 | k >> 6 & 63;
              }
              b[c++ >>> 0] = 128 | k & 63;
            }
          }
          b[c >>> 0] = 0;
          return c - h;
        }, X = (a, b, c) => hb(a, n(), b, c);
        function ib(a, b) {
          if (D)
            return V(5, 1, a, b);
        }
        function jb(a, b, c) {
          if (D)
            return V(6, 1, a, b, c);
        }
        function kb(a, b, c) {
          return D ? V(7, 1, a, b, c) : 0;
        }
        function lb(a, b) {
          if (D)
            return V(8, 1, a, b);
        }
        function mb(a, b, c) {
          if (D)
            return V(9, 1, a, b, c);
        }
        function nb(a, b, c, d) {
          if (D)
            return V(10, 1, a, b, c, d);
        }
        function ob(a, b, c, d) {
          if (D)
            return V(11, 1, a, b, c, d);
        }
        function pb(a, b, c, d) {
          if (D)
            return V(12, 1, a, b, c, d);
        }
        function qb(a) {
          if (D)
            return V(13, 1, a);
        }
        function rb(a, b) {
          if (D)
            return V(14, 1, a, b);
        }
        function sb(a, b, c) {
          if (D)
            return V(15, 1, a, b, c);
        }
        function tb(a) {
          a >>>= 0;
          "function" === typeof Atomics.nb && (Atomics.nb(p(), a >>> 2, a).value.then(Sa), a += 128, Atomics.store(p(), a >>> 2, 1));
        }
        v.__emscripten_thread_mailbox_await = tb;
        var Sa = () => {
          var a = W();
          if (a && (tb(a), a = ub, !K))
            try {
              if (a(), !(0 < T))
                try {
                  D ? Xa(L) : Oa(L);
                } catch (b) {
                  b instanceof R || "unwind" == b || z(1, b);
                }
            } catch (b) {
              b instanceof R || "unwind" == b || z(1, b);
            }
        };
        v.checkMailbox = Sa;
        var vb = [], Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), wb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], xb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        function yb(a, b, c, d, h, g, k, t) {
          return D ? V(16, 1, a, b, c, d, h, g, k, t) : -52;
        }
        function zb(a, b, c, d, h, g, k) {
          if (D)
            return V(17, 1, a, b, c, d, h, g, k);
        }
        var Ab = [], Bb = {}, Db = () => {
          if (!Cb) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;
            for (b in Bb)
              void 0 === Bb[b] ? delete a[b] : a[b] = Bb[b];
            var c = [];
            for (b in a)
              c.push(`${b}=${a[b]}`);
            Cb = c;
          }
          return Cb;
        }, Cb;
        function Eb(a, b) {
          if (D)
            return V(18, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = 0;
          Db().forEach((d, h) => {
            var g = b + c;
            h = r()[a + 4 * h >>> 2 >>> 0] = g;
            for (g = 0; g < d.length; ++g)
              aa()[h++ >>> 0] = d.charCodeAt(g);
            aa()[h >>> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        }
        function Ib(a, b) {
          if (D)
            return V(19, 1, a, b);
          a >>>= 0;
          b >>>= 0;
          var c = Db();
          r()[a >>> 2 >>> 0] = c.length;
          var d = 0;
          c.forEach((h) => d += h.length + 1);
          r()[b >>> 2 >>> 0] = d;
          return 0;
        }
        function Jb(a) {
          return D ? V(20, 1, a) : 52;
        }
        function Kb(a, b, c, d) {
          return D ? V(21, 1, a, b, c, d) : 52;
        }
        function Lb(a, b, c, d, h) {
          return D ? V(22, 1, a, b, c, d, h) : 70;
        }
        var Mb = [null, [], []];
        function Nb(a, b, c, d) {
          if (D)
            return V(23, 1, a, b, c, d);
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          for (var h = 0, g = 0; g < c; g++) {
            var k = r()[b >>> 2 >>> 0], t = r()[b + 4 >>> 2 >>> 0];
            b += 8;
            for (var C = 0; C < t; C++) {
              var w = n()[k + C >>> 0], y = Mb[a];
              0 === w || 10 === w ? ((1 === a ? qa : J)(db(y, 0)), y.length = 0) : y.push(w);
            }
            h += t;
          }
          r()[d >>> 2 >>> 0] = h;
          return 0;
        }
        var Ob = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Pb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Qb(a) {
          var b = Array(gb(a) + 1);
          hb(a, b, 0, b.length);
          return b;
        }
        var Rb = (a, b) => {
          aa().set(a, b >>> 0);
        };
        function Sb(a, b, c, d) {
          function h(f, q, u) {
            for (f = "number" == typeof f ? f.toString() : f || ""; f.length < q; )
              f = u[0] + f;
            return f;
          }
          function g(f, q) {
            return h(f, q, "0");
          }
          function k(f, q) {
            function u(Fb) {
              return 0 > Fb ? -1 : 0 < Fb ? 1 : 0;
            }
            var F;
            0 === (F = u(f.getFullYear() - q.getFullYear())) && 0 === (F = u(f.getMonth() - q.getMonth())) && (F = u(f.getDate() - q.getDate()));
            return F;
          }
          function t(f) {
            switch (f.getDay()) {
              case 0:
                return new Date(f.getFullYear() - 1, 11, 29);
              case 1:
                return f;
              case 2:
                return new Date(f.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  f.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(f.getFullYear(), 0, 1);
              case 5:
                return new Date(f.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(f.getFullYear() - 1, 11, 30);
            }
          }
          function C(f) {
            var q = f.Qa;
            for (f = new Date(new Date(f.Ra + 1900, 0, 1).getTime()); 0 < q; ) {
              var u = f.getMonth(), F = (Y(f.getFullYear()) ? Ob : Pb)[u];
              if (q > F - f.getDate())
                q -= F - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));
              else {
                f.setDate(f.getDate() + q);
                break;
              }
            }
            u = new Date(f.getFullYear() + 1, 0, 4);
            q = t(new Date(
              f.getFullYear(),
              0,
              4
            ));
            u = t(u);
            return 0 >= k(q, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;
          }
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var w = r()[d + 40 >>> 2 >>> 0];
          d = { kb: p()[d >>> 2 >>> 0], jb: p()[d + 4 >>> 2 >>> 0], Sa: p()[d + 8 >>> 2 >>> 0], Wa: p()[d + 12 >>> 2 >>> 0], Ta: p()[d + 16 >>> 2 >>> 0], Ra: p()[d + 20 >>> 2 >>> 0], Ma: p()[d + 24 >>> 2 >>> 0], Qa: p()[d + 28 >>> 2 >>> 0], qb: p()[d + 32 >>> 2 >>> 0], ib: p()[d + 36 >>> 2 >>> 0], lb: w ? Q(w) : "" };
          c = Q(c);
          w = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var y in w)
            c = c.replace(new RegExp(y, "g"), w[y]);
          var Gb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Hb = "January February March April May June July August September October November December".split(" ");
          w = {
            "%a": (f) => Gb[f.Ma].substring(0, 3),
            "%A": (f) => Gb[f.Ma],
            "%b": (f) => Hb[f.Ta].substring(0, 3),
            "%B": (f) => Hb[f.Ta],
            "%C": (f) => g((f.Ra + 1900) / 100 | 0, 2),
            "%d": (f) => g(f.Wa, 2),
            "%e": (f) => h(f.Wa, 2, " "),
            "%g": (f) => C(f).toString().substring(2),
            "%G": C,
            "%H": (f) => g(f.Sa, 2),
            "%I": (f) => {
              f = f.Sa;
              0 == f ? f = 12 : 12 < f && (f -= 12);
              return g(f, 2);
            },
            "%j": (f) => {
              for (var q = 0, u = 0; u <= f.Ta - 1; q += (Y(f.Ra + 1900) ? Ob : Pb)[u++])
                ;
              return g(f.Wa + q, 3);
            },
            "%m": (f) => g(f.Ta + 1, 2),
            "%M": (f) => g(f.jb, 2),
            "%n": () => "\n",
            "%p": (f) => 0 <= f.Sa && 12 > f.Sa ? "AM" : "PM",
            "%S": (f) => g(f.kb, 2),
            "%t": () => "	",
            "%u": (f) => f.Ma || 7,
            "%U": (f) => g(Math.floor((f.Qa + 7 - f.Ma) / 7), 2),
            "%V": (f) => {
              var q = Math.floor((f.Qa + 7 - (f.Ma + 6) % 7) / 7);
              2 >= (f.Ma + 371 - f.Qa - 2) % 7 && q++;
              if (q)
                53 == q && (u = (f.Ma + 371 - f.Qa) % 7, 4 == u || 3 == u && Y(f.Ra) || (q = 1));
              else {
                q = 52;
                var u = (f.Ma + 7 - f.Qa - 1) % 7;
                (4 == u || 5 == u && Y(f.Ra % 400 - 1)) && q++;
              }
              return g(q, 2);
            },
            "%w": (f) => f.Ma,
            "%W": (f) => g(Math.floor((f.Qa + 7 - (f.Ma + 6) % 7) / 7), 2),
            "%y": (f) => (f.Ra + 1900).toString().substring(2),
            "%Y": (f) => f.Ra + 1900,
            "%z": (f) => {
              f = f.ib;
              var q = 0 <= f;
              f = Math.abs(f) / 60;
              return (q ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);
            },
            "%Z": (f) => f.lb,
            "%%": () => "%"
          };
          c = c.replace(
            /%%/g,
            "\0\0"
          );
          for (y in w)
            c.includes(y) && (c = c.replace(new RegExp(y, "g"), w[y](d)));
          c = c.replace(/\0\0/g, "%");
          y = Qb(c);
          if (y.length > b)
            return 0;
          Rb(y, a);
          return y.length - 1;
        }
        S.Va();
        var Tb = [Ma, Na, ab, eb, fb, ib, jb, kb, lb, mb, nb, ob, pb, qb, rb, sb, yb, zb, Eb, Ib, Jb, Kb, Lb, Nb], Wb = {
          b: function(a, b, c) {
            a >>>= 0;
            new Ya(a).Va(b >>> 0, c >>> 0);
            Za = a;
            $a++;
            throw Za;
          },
          L: function(a) {
            Ub(a >>> 0, !A, 1, !ka, 131072, false);
            S.$a();
          },
          j: function(a) {
            a >>>= 0;
            D ? postMessage({ cmd: "cleanupThread", thread: a }) : S.Ya(S.La[a]);
          },
          H: bb,
          h: eb,
          S: fb,
          D: ib,
          F: jb,
          T: kb,
          Q: lb,
          J: mb,
          P: nb,
          n: ob,
          E: pb,
          B: qb,
          R: rb,
          C: sb,
          p: () => 1,
          z: function(a, b) {
            a >>>= 0;
            a == b >>> 0 ? setTimeout(Sa) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = S.La[a]) && a.postMessage({ cmd: "checkMailbox" });
          },
          I: function(a, b, c, d, h) {
            b >>>= 0;
            c >>>= 0;
            vb.length = d;
            h = h >>> 0 >>> 3;
            for (var g = 0; g < d; g++)
              vb[g] = ea()[h + g >>> 0];
            a = b ? Ea[b] : Tb[a];
            S.eb = c;
            c = a(...vb);
            S.eb = 0;
            return c;
          },
          K: tb,
          o: function(a) {
            B && S.La[a >>> 0].ref();
          },
          s: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            p()[c >>> 2 >>> 0] = a.getUTCSeconds();
            p()[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();
            p()[c + 8 >>> 2 >>> 0] = a.getUTCHours();
            p()[c + 12 >>> 2 >>> 0] = a.getUTCDate();
            p()[c + 16 >>> 2 >>> 0] = a.getUTCMonth();
            p()[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;
            p()[c + 24 >>> 2 >>> 0] = a.getUTCDay();
            a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;
            p()[c + 28 >>> 2 >>> 0] = a;
          },
          t: function(a, b, c) {
            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;
            c >>>= 0;
            a = new Date(1e3 * a);
            p()[c >>> 2 >>> 0] = a.getSeconds();
            p()[c + 4 >>> 2 >>> 0] = a.getMinutes();
            p()[c + 8 >>> 2 >>> 0] = a.getHours();
            p()[c + 12 >>> 2 >>> 0] = a.getDate();
            p()[c + 16 >>> 2 >>> 0] = a.getMonth();
            p()[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;
            p()[c + 24 >>> 2 >>> 0] = a.getDay();
            b = (Y(a.getFullYear()) ? wb : xb)[a.getMonth()] + a.getDate() - 1 | 0;
            p()[c + 28 >>> 2 >>> 0] = b;
            p()[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());
            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            a = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;
            p()[c + 32 >>> 2 >>> 0] = a;
          },
          u: function(a) {
            a >>>= 0;
            var b = new Date(p()[a + 20 >>> 2 >>> 0] + 1900, p()[a + 16 >>> 2 >>> 0], p()[a + 12 >>> 2 >>> 0], p()[a + 8 >>> 2 >>> 0], p()[a + 4 >>> 2 >>> 0], p()[a >>> 2 >>> 0], 0), c = p()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), h = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), g = new Date(
              b.getFullYear(),
              0,
              1
            ).getTimezoneOffset(), k = Math.min(g, h);
            0 > c ? p()[a + 32 >>> 2 >>> 0] = Number(h != g && k == d) : 0 < c != (k == d) && (h = Math.max(g, h), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : h) - d)));
            p()[a + 24 >>> 2 >>> 0] = b.getDay();
            c = (Y(b.getFullYear()) ? wb : xb)[b.getMonth()] + b.getDate() - 1 | 0;
            p()[a + 28 >>> 2 >>> 0] = c;
            p()[a >>> 2 >>> 0] = b.getSeconds();
            p()[a + 4 >>> 2 >>> 0] = b.getMinutes();
            p()[a + 8 >>> 2 >>> 0] = b.getHours();
            p()[a + 12 >>> 2 >>> 0] = b.getDate();
            p()[a + 16 >>> 2 >>> 0] = b.getMonth();
            p()[a + 20 >>> 2 >>> 0] = b.getYear();
            a = b.getTime();
            a = isNaN(a) ? -1 : a / 1e3;
            Vb((P = a, 1 <= +Math.abs(P) ? 0 < P ? +Math.floor(P / 4294967296) >>> 0 : ~~+Math.ceil((P - +(~~P >>> 0)) / 4294967296) >>> 0 : 0));
            return a >>> 0;
          },
          q: yb,
          r: zb,
          y: function(a, b, c, d) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            var h = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(h, 0, 1), k = new Date(h, 6, 1);
            h = g.getTimezoneOffset();
            var t = k.getTimezoneOffset(), C = Math.max(h, t);
            r()[a >>> 2 >>> 0] = 60 * C;
            p()[b >>> 2 >>> 0] = Number(h != t);
            a = (w) => w.toLocaleTimeString(void 0, { hour12: false, timeZoneName: "short" }).split(" ")[1];
            g = a(g);
            k = a(k);
            t < h ? (X(g, c, 17), X(k, d, 17)) : (X(g, d, 17), X(k, c, 17));
          },
          c: () => {
            ya("");
          },
          O: function(a, b, c) {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            Ab.length = 0;
            for (var d; d = n()[b++ >>> 0]; ) {
              var h = 105 != d;
              h &= 112 != d;
              c += h && c % 8 ? 4 : 0;
              Ab.push(112 == d ? r()[c >>> 2 >>> 0] : 105 == d ? p()[c >>> 2 >>> 0] : ea()[c >>> 3 >>> 0]);
              c += h ? 8 : 4;
            }
            return Ea[a](...Ab);
          },
          k: () => {
          },
          i: () => Date.now(),
          U: () => {
            T += 1;
            throw "unwind";
          },
          A: function() {
            return 4294901760;
          },
          e: () => performance.timeOrigin + performance.now(),
          f: () => B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,
          x: function(a) {
            a >>>= 0;
            var b = n().length;
            if (a <= b || 4294901760 < a)
              return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              var h = Math;
              d = Math.max(a, d);
              a: {
                h = (h.min.call(h, 4294901760, d + (65536 - d % 65536) % 65536) - e.buffer.byteLength + 65535) / 65536;
                try {
                  e.grow(h);
                  m();
                  var g = 1;
                  break a;
                } catch (k) {
                }
                g = void 0;
              }
              if (g)
                return true;
            }
            return false;
          },
          M: Eb,
          N: Ib,
          G: Oa,
          g: Jb,
          m: Kb,
          v: Lb,
          l: Nb,
          a: e || v.wasmMemory,
          w: Sb,
          d: function(a, b, c, d) {
            return Sb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);
          }
        }, Z = function() {
          function a(c, d) {
            Z = c.exports;
            Z = Xb();
            S.ab.push(Z.ya);
            Wa = Z.za;
            ua.unshift(Z.V);
            ra = d;
            xa();
            return Z;
          }
          var b = { a: Wb };
          M++;
          if (v.instantiateWasm)
            try {
              return v.instantiateWasm(
                b,
                a
              );
            } catch (c) {
              J(`Module.instantiateWasm callback failed with error: ${c}`), x(c);
            }
          Da(b, function(c) {
            a(c.instance, c.module);
          }).catch(x);
          return {};
        }();
        v._OrtInit = (a, b) => (v._OrtInit = Z.W)(a, b);
        v._OrtGetLastError = (a, b) => (v._OrtGetLastError = Z.X)(a, b);
        v._OrtCreateSessionOptions = (a, b, c, d, h, g, k, t, C, w) => (v._OrtCreateSessionOptions = Z.Y)(a, b, c, d, h, g, k, t, C, w);
        v._OrtAppendExecutionProvider = (a, b) => (v._OrtAppendExecutionProvider = Z.Z)(a, b);
        v._OrtAddFreeDimensionOverride = (a, b, c) => (v._OrtAddFreeDimensionOverride = Z._)(a, b, c);
        v._OrtAddSessionConfigEntry = (a, b, c) => (v._OrtAddSessionConfigEntry = Z.$)(a, b, c);
        v._OrtReleaseSessionOptions = (a) => (v._OrtReleaseSessionOptions = Z.aa)(a);
        v._OrtCreateSession = (a, b, c) => (v._OrtCreateSession = Z.ba)(a, b, c);
        v._OrtReleaseSession = (a) => (v._OrtReleaseSession = Z.ca)(a);
        v._OrtGetInputOutputCount = (a, b, c) => (v._OrtGetInputOutputCount = Z.da)(a, b, c);
        v._OrtGetInputName = (a, b) => (v._OrtGetInputName = Z.ea)(a, b);
        v._OrtGetOutputName = (a, b) => (v._OrtGetOutputName = Z.fa)(a, b);
        v._OrtFree = (a) => (v._OrtFree = Z.ga)(a);
        v._OrtCreateTensor = (a, b, c, d, h, g) => (v._OrtCreateTensor = Z.ha)(a, b, c, d, h, g);
        v._OrtGetTensorData = (a, b, c, d, h) => (v._OrtGetTensorData = Z.ia)(a, b, c, d, h);
        v._OrtReleaseTensor = (a) => (v._OrtReleaseTensor = Z.ja)(a);
        v._OrtCreateRunOptions = (a, b, c, d) => (v._OrtCreateRunOptions = Z.ka)(a, b, c, d);
        v._OrtAddRunConfigEntry = (a, b, c) => (v._OrtAddRunConfigEntry = Z.la)(a, b, c);
        v._OrtReleaseRunOptions = (a) => (v._OrtReleaseRunOptions = Z.ma)(a);
        v._OrtCreateBinding = (a) => (v._OrtCreateBinding = Z.na)(a);
        v._OrtBindInput = (a, b, c) => (v._OrtBindInput = Z.oa)(a, b, c);
        v._OrtBindOutput = (a, b, c, d) => (v._OrtBindOutput = Z.pa)(a, b, c, d);
        v._OrtClearBoundOutputs = (a) => (v._OrtClearBoundOutputs = Z.qa)(a);
        v._OrtReleaseBinding = (a) => (v._OrtReleaseBinding = Z.ra)(a);
        v._OrtRunWithBinding = (a, b, c, d, h) => (v._OrtRunWithBinding = Z.sa)(a, b, c, d, h);
        v._OrtRun = (a, b, c, d, h, g, k, t) => (v._OrtRun = Z.ta)(a, b, c, d, h, g, k, t);
        v._OrtEndProfiling = (a) => (v._OrtEndProfiling = Z.ua)(a);
        var W = v._pthread_self = () => (W = v._pthread_self = Z.va)();
        v._malloc = (a) => (v._malloc = Z.wa)(a);
        v._free = (a) => (v._free = Z.xa)(a);
        v.__emscripten_tls_init = () => (v.__emscripten_tls_init = Z.ya)();
        var Ub = v.__emscripten_thread_init = (a, b, c, d, h, g) => (Ub = v.__emscripten_thread_init = Z.Aa)(a, b, c, d, h, g);
        v.__emscripten_thread_crashed = () => (v.__emscripten_thread_crashed = Z.Ba)();
        var La = (a, b, c, d, h) => (La = Z.Ca)(a, b, c, d, h), Ra = (a) => (Ra = Z.Da)(a), Xa = v.__emscripten_thread_exit = (a) => (Xa = v.__emscripten_thread_exit = Z.Ea)(a), ub = () => (ub = Z.Fa)(), Vb = (a) => (Vb = Z.Ga)(a), Ua = (a, b) => (Ua = Z.Ha)(a, b), U = (a) => (U = Z.Ia)(a), Ka = (a) => (Ka = Z.Ja)(a), Ia = () => (Ia = Z.Ka)();
        function Xb() {
          var a = Z;
          a = Object.assign({}, a);
          var b = (d) => () => d() >>> 0, c = (d) => (h) => d(h) >>> 0;
          a.va = b(a.va);
          a.wa = c(a.wa);
          a.emscripten_main_runtime_thread_id = b(a.emscripten_main_runtime_thread_id);
          a.Ja = c(a.Ja);
          a.Ka = b(a.Ka);
          return a;
        }
        v.wasmMemory = e;
        v.stackSave = () => Ia();
        v.stackRestore = (a) => U(a);
        v.stackAlloc = (a) => Ka(a);
        v.keepRuntimeAlive = () => 0 < T;
        v.UTF8ToString = Q;
        v.stringToUTF8 = X;
        v.lengthBytesUTF8 = gb;
        v.ExitStatus = R;
        v.PThread = S;
        var Yb;
        N = function Zb() {
          Yb || $b();
          Yb || (N = Zb);
        };
        function $b() {
          if (!(0 < M))
            if (D)
              ha(v), D || Ta(ua), startWorker(v);
            else {
              if (v.preRun)
                for ("function" == typeof v.preRun && (v.preRun = [v.preRun]); v.preRun.length; )
                  ta.unshift(v.preRun.shift());
              Ta(ta);
              0 < M || Yb || (Yb = true, v.calledRun = true, K || (D || Ta(ua), ha(v), D || Ta(va)));
            }
        }
        $b();
        return readyPromise;
      };
    })();
    if (typeof exports === "object" && typeof module2 === "object")
      module2.exports = ortWasmThreaded;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasmThreaded);
  }
});

// web/lib/wasm/binding/ort-wasm-threaded.worker.js
var require_ort_wasm_threaded_worker = __commonJS({
  "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module2) {
    module2.exports = '"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");var vm=require("vm");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>vm.runInThisContext(fs.readFileSync(f,"utf8"),{filename:f}),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(...args){var text=args.join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\n");return}console.error(text)}function threadAlert(...args){var text=args.join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){Module["__emscripten_thread_crashed"]?.();throw ex}}self.onmessage=handleMessage;\n';
  }
});

// web/lib/wasm/wasm-factory.ts
var ortWasmFactory, ortWasmFactoryThreaded, wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, getWasmFileName, initializeWebAssembly, getInstance;
var init_wasm_factory = __esm({
  "web/lib/wasm/wasm-factory.ts"() {
    "use strict";
    init_node_path();
    if (true) {
      ortWasmFactory = require_ort_training_wasm_simd();
    } else {
      ortWasmFactory = true ? null : null;
    }
    ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;
    initialized = false;
    initializing = false;
    aborted = false;
    isMultiThreadSupported = (numThreads) => {
      if (numThreads === 1) {
        return false;
      }
      if (typeof SharedArrayBuffer === "undefined") {
        if (typeof self !== "undefined" && !self.crossOriginIsolated) {
          console.warn(
            "env.wasm.numThreads is set to " + numThreads + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."
          );
        }
        return false;
      }
      if (typeof process !== "undefined" && process.versions && process.versions.node) {
        console.warn(
          "env.wasm.numThreads is set to " + numThreads + ", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios."
        );
      }
      try {
        if (typeof MessageChannel !== "undefined") {
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
        }
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          5,
          4,
          1,
          3,
          1,
          1,
          10,
          11,
          1,
          9,
          0,
          65,
          0,
          254,
          16,
          2,
          0,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    isSimdSupported = () => {
      try {
        return WebAssembly.validate(new Uint8Array([
          0,
          97,
          115,
          109,
          1,
          0,
          0,
          0,
          1,
          4,
          1,
          96,
          0,
          0,
          3,
          2,
          1,
          0,
          10,
          30,
          1,
          28,
          0,
          65,
          0,
          253,
          15,
          253,
          12,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          253,
          186,
          1,
          26,
          11
        ]));
      } catch (e) {
        return false;
      }
    };
    getWasmFileName = (useSimd, useThreads) => {
      if (useSimd) {
        if (true) {
          return "ort-training-wasm-simd.wasm";
        }
        return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";
      } else {
        return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";
      }
    };
    initializeWebAssembly = async (flags) => {
      if (initialized) {
        return Promise.resolve();
      }
      if (initializing) {
        throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
      }
      if (aborted) {
        throw new Error("previous call to 'initializeWebAssembly()' failed.");
      }
      initializing = true;
      const timeout = flags.initTimeout;
      const numThreads = flags.numThreads;
      const simd = flags.simd;
      const useThreads = isMultiThreadSupported(numThreads);
      const useSimd = simd && isSimdSupported();
      const wasmPaths = flags.wasmPaths;
      const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;
      const wasmFileName = getWasmFileName(useSimd, useThreads);
      const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;
      let isTimeout = false;
      const tasks = [];
      if (timeout > 0) {
        tasks.push(new Promise((resolve) => {
          setTimeout(() => {
            isTimeout = true;
            resolve();
          }, timeout);
        }));
      }
      tasks.push(new Promise((resolve, reject) => {
        const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;
        const config = {
          locateFile: (fileName, scriptDirectory) => {
            if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {
              return URL.createObjectURL(new Blob(
                [
                  // This require() function is handled by esbuild plugin to load file content as string.
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  require_ort_wasm_threaded_worker()
                ],
                { type: "text/javascript" }
              ));
            }
            if (fileName.endsWith(".wasm")) {
              if (wasmPathOverride) {
                return wasmPathOverride;
              }
              const prefix = wasmPrefixOverride ?? scriptDirectory;
              if (false) {
                if (wasmFileName === "ort-wasm-simd.wasm") {
                  return prefix + "ort-wasm-simd.jsep.wasm";
                } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {
                  return prefix + "ort-wasm-simd-threaded.jsep.wasm";
                }
              }
              return prefix + wasmFileName;
            }
            return scriptDirectory + fileName;
          }
        };
        if (useThreads) {
          config.numThreads = numThreads;
          if (typeof Blob === "undefined") {
            config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");
          } else {
            const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;
            config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });
          }
        }
        factory(config).then(
          // wasm module initialized successfully
          (module2) => {
            initializing = false;
            initialized = true;
            wasm = module2;
            resolve();
          },
          // wasm module failed to initialize
          (what) => {
            initializing = false;
            aborted = true;
            reject(what);
          }
        );
      }));
      await Promise.race(tasks);
      if (isTimeout) {
        throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);
      }
    };
    getInstance = () => {
      if (initialized && wasm) {
        return wasm;
      }
      throw new Error("WebAssembly is not initialized yet.");
    };
  }
});

// web/lib/wasm/wasm-utils.ts
var allocWasmString, iterateExtraOptions, checkLastError;
var init_wasm_utils = __esm({
  "web/lib/wasm/wasm-utils.ts"() {
    "use strict";
    init_wasm_factory();
    allocWasmString = (data, allocs) => {
      const wasm2 = getInstance();
      const dataLength = wasm2.lengthBytesUTF8(data) + 1;
      const dataOffset = wasm2._malloc(dataLength);
      wasm2.stringToUTF8(data, dataOffset, dataLength);
      allocs.push(dataOffset);
      return dataOffset;
    };
    iterateExtraOptions = (options, prefix, seen, handler) => {
      if (typeof options == "object" && options !== null) {
        if (seen.has(options)) {
          throw new Error("Circular reference in options");
        } else {
          seen.add(options);
        }
      }
      Object.entries(options).forEach(([key, value]) => {
        const name = prefix ? prefix + key : key;
        if (typeof value === "object") {
          iterateExtraOptions(value, name + ".", seen, handler);
        } else if (typeof value === "string" || typeof value === "number") {
          handler(name, value.toString());
        } else if (typeof value === "boolean") {
          handler(name, value ? "1" : "0");
        } else {
          throw new Error(`Can't handle extra config type: ${typeof value}`);
        }
      });
    };
    checkLastError = (message) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const paramsOffset = wasm2.stackAlloc(8);
        wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);
        const errorCode = wasm2.HEAP32[paramsOffset / 4];
        const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];
        const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";
        throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
  }
});

// web/lib/wasm/run-options.ts
var setRunOptions;
var init_run_options = __esm({
  "web/lib/wasm/run-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    setRunOptions = (options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      const allocs = [];
      const runOptions = options || {};
      try {
        if (options?.logSeverityLevel === void 0) {
          runOptions.logSeverityLevel = 2;
        } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);
        }
        if (options?.logVerbosityLevel === void 0) {
          runOptions.logVerbosityLevel = 0;
        } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {
          throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);
        }
        if (options?.terminate === void 0) {
          runOptions.terminate = false;
        }
        let tagDataOffset = 0;
        if (options?.tag !== void 0) {
          tagDataOffset = allocWasmString(options.tag, allocs);
        }
        runOptionsHandle = wasm2._OrtCreateRunOptions(
          runOptions.logSeverityLevel,
          runOptions.logVerbosityLevel,
          !!runOptions.terminate,
          tagDataOffset
        );
        if (runOptionsHandle === 0) {
          checkLastError("Can't create run options.");
        }
        if (options?.extra !== void 0) {
          iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a run config entry: ${key} - ${value}.`);
            }
          });
        }
        return [runOptionsHandle, allocs];
      } catch (e) {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/session-options.ts
var getGraphOptimzationLevel, getExecutionMode, appendDefaultOptions, setExecutionProviders, setSessionOptions;
var init_session_options = __esm({
  "web/lib/wasm/session-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    getGraphOptimzationLevel = (graphOptimizationLevel) => {
      switch (graphOptimizationLevel) {
        case "disabled":
          return 0;
        case "basic":
          return 1;
        case "extended":
          return 2;
        case "all":
          return 99;
        default:
          throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);
      }
    };
    getExecutionMode = (executionMode) => {
      switch (executionMode) {
        case "sequential":
          return 0;
        case "parallel":
          return 1;
        default:
          throw new Error(`unsupported execution mode: ${executionMode}`);
      }
    };
    appendDefaultOptions = (options) => {
      if (!options.extra) {
        options.extra = {};
      }
      if (!options.extra.session) {
        options.extra.session = {};
      }
      const session = options.extra.session;
      if (!session.use_ort_model_bytes_directly) {
        session.use_ort_model_bytes_directly = "1";
      }
      if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {
        options.enableMemPattern = false;
      }
    };
    setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {
      for (const ep of executionProviders) {
        let epName = typeof ep === "string" ? ep : ep.name;
        switch (epName) {
          case "webnn":
            epName = "WEBNN";
            if (typeof ep !== "string") {
              const webnnOptions = ep;
              if (webnnOptions?.deviceType) {
                const keyDataOffset = allocWasmString("deviceType", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'deviceType' - ${webnnOptions.deviceType}.`);
                }
              }
              if (webnnOptions?.numThreads) {
                let numThreads = webnnOptions.numThreads;
                if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {
                  numThreads = 0;
                }
                const keyDataOffset = allocWasmString("numThreads", allocs);
                const valueDataOffset = allocWasmString(numThreads.toString(), allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'numThreads' - ${webnnOptions.numThreads}.`);
                }
              }
              if (webnnOptions?.powerPreference) {
                const keyDataOffset = allocWasmString("powerPreference", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'powerPreference' - ${webnnOptions.powerPreference}.`
                  );
                }
              }
            }
            break;
          case "webgpu":
            epName = "JS";
            if (typeof ep !== "string") {
              const webgpuOptions = ep;
              if (webgpuOptions?.preferredLayout) {
                if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {
                  throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${webgpuOptions.preferredLayout}`);
                }
                const keyDataOffset = allocWasmString("preferredLayout", allocs);
                const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'preferredLayout' - ${webgpuOptions.preferredLayout}.`
                  );
                }
              }
            }
            break;
          case "wasm":
          case "cpu":
            continue;
          default:
            throw new Error(`not supported execution provider: ${epName}`);
        }
        const epNameDataOffset = allocWasmString(epName, allocs);
        if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {
          checkLastError(`Can't append execution provider: ${epName}.`);
        }
      }
    };
    setSessionOptions = (options) => {
      const wasm2 = getInstance();
      let sessionOptionsHandle = 0;
      const allocs = [];
      const sessionOptions = options || {};
      appendDefaultOptions(sessionOptions);
      try {
        const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");
        const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");
        const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;
        const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;
        if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);
        }
        const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;
        if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {
          throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);
        }
        const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;
        sessionOptionsHandle = wasm2._OrtCreateSessionOptions(
          graphOptimizationLevel,
          !!sessionOptions.enableCpuMemArena,
          !!sessionOptions.enableMemPattern,
          executionMode,
          !!sessionOptions.enableProfiling,
          0,
          logIdDataOffset,
          logSeverityLevel,
          logVerbosityLevel,
          optimizedModelFilePathOffset
        );
        if (sessionOptionsHandle === 0) {
          checkLastError("Can't create session options.");
        }
        if (sessionOptions.executionProviders) {
          setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);
        }
        if (sessionOptions.enableGraphCapture !== void 0) {
          if (typeof sessionOptions.enableGraphCapture !== "boolean") {
            throw new Error(`enableGraphCapture must be a boolean value: ${sessionOptions.enableGraphCapture}`);
          }
          const keyDataOffset = allocWasmString("enableGraphCapture", allocs);
          const valueDataOffset = allocWasmString(sessionOptions.enableGraphCapture.toString(), allocs);
          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
            checkLastError(
              `Can't set a session config entry: 'enableGraphCapture' - ${sessionOptions.enableGraphCapture}.`
            );
          }
        }
        if (sessionOptions.freeDimensionOverrides) {
          for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {
            if (typeof name !== "string") {
              throw new Error(`free dimension override name must be a string: ${name}`);
            }
            if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
              throw new Error(`free dimension override value must be a non-negative integer: ${value}`);
            }
            const nameOffset = allocWasmString(name, allocs);
            if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {
              checkLastError(`Can't set a free dimension override: ${name} - ${value}.`);
            }
          }
        }
        if (sessionOptions.extra !== void 0) {
          iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a session config entry: ${key} - ${value}.`);
            }
          });
        }
        return [sessionOptionsHandle, allocs];
      } catch (e) {
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/wasm-common.ts
var tensorDataTypeStringToEnum, tensorDataTypeEnumToString, getTensorElementSize, tensorTypeToTypedArrayConstructor, logLevelStringToEnum, isGpuBufferSupportedType, dataLocationStringToEnum;
var init_wasm_common = __esm({
  "web/lib/wasm/wasm-common.ts"() {
    "use strict";
    tensorDataTypeStringToEnum = (type) => {
      switch (type) {
        case "int8":
          return 3 /* int8 */;
        case "uint8":
          return 2 /* uint8 */;
        case "bool":
          return 9 /* bool */;
        case "int16":
          return 5 /* int16 */;
        case "uint16":
          return 4 /* uint16 */;
        case "int32":
          return 6 /* int32 */;
        case "uint32":
          return 12 /* uint32 */;
        case "float16":
          return 10 /* float16 */;
        case "float32":
          return 1 /* float */;
        case "float64":
          return 11 /* double */;
        case "string":
          return 8 /* string */;
        case "int64":
          return 7 /* int64 */;
        case "uint64":
          return 13 /* uint64 */;
        default:
          throw new Error(`unsupported data type: ${type}`);
      }
    };
    tensorDataTypeEnumToString = (typeProto) => {
      switch (typeProto) {
        case 3 /* int8 */:
          return "int8";
        case 2 /* uint8 */:
          return "uint8";
        case 9 /* bool */:
          return "bool";
        case 5 /* int16 */:
          return "int16";
        case 4 /* uint16 */:
          return "uint16";
        case 6 /* int32 */:
          return "int32";
        case 12 /* uint32 */:
          return "uint32";
        case 10 /* float16 */:
          return "float16";
        case 1 /* float */:
          return "float32";
        case 11 /* double */:
          return "float64";
        case 8 /* string */:
          return "string";
        case 7 /* int64 */:
          return "int64";
        case 13 /* uint64 */:
          return "uint64";
        default:
          throw new Error(`unsupported data type: ${typeProto}`);
      }
    };
    getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];
    tensorTypeToTypedArrayConstructor = (type) => {
      switch (type) {
        case "float16":
          return typeof Float16Array !== "undefined" && Float16Array.from ? Float16Array : Uint16Array;
        case "float32":
          return Float32Array;
        case "uint8":
          return Uint8Array;
        case "int8":
          return Int8Array;
        case "uint16":
          return Uint16Array;
        case "int16":
          return Int16Array;
        case "int32":
          return Int32Array;
        case "bool":
          return Uint8Array;
        case "float64":
          return Float64Array;
        case "uint32":
          return Uint32Array;
        case "int64":
          return BigInt64Array;
        case "uint64":
          return BigUint64Array;
        default:
          throw new Error(`unsupported type: ${type}`);
      }
    };
    logLevelStringToEnum = (logLevel) => {
      switch (logLevel) {
        case "verbose":
          return 0;
        case "info":
          return 1;
        case "warning":
          return 2;
        case "error":
          return 3;
        case "fatal":
          return 4;
        default:
          throw new Error(`unsupported logging level: ${logLevel}`);
      }
    };
    isGpuBufferSupportedType = (type) => type === "float32" || type === "float16" || type === "int32" || type === "int64" || type === "uint32" || type === "uint8" || type === "bool";
    dataLocationStringToEnum = (location) => {
      switch (location) {
        case "none":
          return 0;
        case "cpu":
          return 1;
        case "cpu-pinned":
          return 2;
        case "texture":
          return 3;
        case "gpu-buffer":
          return 4;
        default:
          throw new Error(`unsupported data location: ${location}`);
      }
    };
  }
});

// nodejs-ignore:node:fs/promises
var readFile2;
var init_promises = __esm({
  "nodejs-ignore:node:fs/promises"() {
    readFile2 = void 0;
  }
});

// web/lib/wasm/wasm-utils-load-file.ts
var loadFile;
var init_wasm_utils_load_file = __esm({
  "web/lib/wasm/wasm-utils-load-file.ts"() {
    "use strict";
    init_fs();
    init_promises();
    loadFile = async (file) => {
      if (typeof file === "string") {
        if (typeof process !== "undefined" && process.versions && process.versions.node) {
          try {
            return new Uint8Array(await readFile2(file));
          } catch (e) {
            if (e.code === "ERR_FS_FILE_TOO_LARGE") {
              const stream = createReadStream(file);
              const chunks = [];
              for await (const chunk of stream) {
                chunks.push(chunk);
              }
              return new Uint8Array(Buffer.concat(chunks));
            }
            throw e;
          }
        } else {
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`failed to load external data file: ${file}`);
          }
          const contentLengthHeader = response.headers.get("Content-Length");
          const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
          if (fileSize < 1073741824) {
            return new Uint8Array(await response.arrayBuffer());
          } else {
            if (!response.body) {
              throw new Error(`failed to load external data file: ${file}, no response body.`);
            }
            const reader = response.body.getReader();
            let buffer;
            try {
              buffer = new ArrayBuffer(fileSize);
            } catch (e) {
              if (e instanceof RangeError) {
                const pages = Math.ceil(fileSize / 65536);
                buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;
              } else {
                throw e;
              }
            }
            let offset = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              const chunkSize = value.byteLength;
              const chunk = new Uint8Array(buffer, offset, chunkSize);
              chunk.set(value);
              offset += chunkSize;
            }
            return new Uint8Array(buffer, 0, fileSize);
          }
        }
      } else if (file instanceof Blob) {
        return new Uint8Array(await file.arrayBuffer());
      } else if (file instanceof Uint8Array) {
        return file;
      } else {
        return new Uint8Array(file);
      }
    };
  }
});

// web/lib/wasm/wasm-core-impl.ts
var initOrt, initRuntime, initEp, activeSessions, getSessionInputOutputCount, copyFromExternalBuffer, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling, extractTransferableBuffers;
var init_wasm_core_impl = __esm({
  "web/lib/wasm/wasm-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_factory();
    init_wasm_utils();
    init_wasm_utils_load_file();
    initOrt = (numThreads, loggingLevel) => {
      const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);
      if (errorCode !== 0) {
        checkLastError("Can't initialize onnxruntime.");
      }
    };
    initRuntime = async (env3) => {
      initOrt(env3.wasm.numThreads, logLevelStringToEnum(env3.logLevel));
    };
    initEp = async (env3, epName) => {
      if (false) {
        const initJsep = null.init;
        if (epName === "webgpu") {
          if (typeof navigator === "undefined" || !navigator.gpu) {
            throw new Error("WebGPU is not supported in current environment");
          }
          let adapter = env3.webgpu.adapter;
          if (!adapter) {
            const powerPreference = env3.webgpu.powerPreference;
            if (powerPreference !== void 0 && powerPreference !== "low-power" && powerPreference !== "high-performance") {
              throw new Error(`Invalid powerPreference setting: "${powerPreference}"`);
            }
            const forceFallbackAdapter = env3.webgpu.forceFallbackAdapter;
            if (forceFallbackAdapter !== void 0 && typeof forceFallbackAdapter !== "boolean") {
              throw new Error(`Invalid forceFallbackAdapter setting: "${forceFallbackAdapter}"`);
            }
            adapter = await navigator.gpu.requestAdapter({ powerPreference, forceFallbackAdapter });
            if (!adapter) {
              throw new Error(
                'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.'
              );
            }
          } else {
            if (typeof adapter.limits !== "object" || typeof adapter.features !== "object" || typeof adapter.requestDevice !== "function") {
              throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
            }
          }
          if (!env3.wasm.simd) {
            throw new Error(
              "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"
            );
          }
          await initJsep("webgpu", getInstance(), env3, adapter);
        }
        if (epName === "webnn") {
          if (typeof navigator === "undefined" || !navigator.ml) {
            throw new Error("WebNN is not supported in current environment");
          }
          await initJsep("webnn", getInstance(), env3);
        }
      }
    };
    activeSessions = /* @__PURE__ */ new Map();
    getSessionInputOutputCount = (sessionHandle) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);
        if (errorCode !== 0) {
          checkLastError("Can't get session input/output count.");
        }
        return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    copyFromExternalBuffer = (model) => {
      const wasm2 = getInstance();
      const modelDataOffset = wasm2._malloc(model.byteLength);
      if (modelDataOffset === 0) {
        throw new Error(`Can't create a session. failed to allocate a buffer of size ${model.byteLength}.`);
      }
      wasm2.HEAPU8.set(model, modelDataOffset);
      return [modelDataOffset, model.byteLength];
    };
    createSession = async (modelData, options) => {
      let modelDataOffset, modelDataLength;
      const wasm2 = getInstance();
      if (Array.isArray(modelData)) {
        [modelDataOffset, modelDataLength] = modelData;
      } else if (modelData.buffer === wasm2.HEAPU8.buffer) {
        [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];
      } else {
        [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);
      }
      let sessionHandle = 0;
      let sessionOptionsHandle = 0;
      let ioBindingHandle = 0;
      let allocs = [];
      const inputNamesUTF8Encoded = [];
      const outputNamesUTF8Encoded = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (options?.externalData && wasm2.mountExternalData) {
          const loadingPromises = [];
          for (const file of options.externalData) {
            const path = typeof file === "string" ? file : file.path;
            loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {
              wasm2.mountExternalData(path, data);
            }));
          }
          await Promise.all(loadingPromises);
        }
        sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);
        if (sessionHandle === 0) {
          checkLastError("Can't create a session.");
        }
        const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);
        const enableGraphCapture = !!options?.enableGraphCapture;
        const inputNames = [];
        const outputNames = [];
        const outputPreferredLocations = [];
        for (let i = 0; i < inputCount; i++) {
          const name = wasm2._OrtGetInputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an input name.");
          }
          inputNamesUTF8Encoded.push(name);
          inputNames.push(wasm2.UTF8ToString(name));
        }
        for (let i = 0; i < outputCount; i++) {
          const name = wasm2._OrtGetOutputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an output name.");
          }
          outputNamesUTF8Encoded.push(name);
          const nameString = wasm2.UTF8ToString(name);
          outputNames.push(nameString);
          if (false) {
            if (enableGraphCapture && options?.preferredOutputLocation === void 0) {
              outputPreferredLocations.push("gpu-buffer");
              continue;
            }
            const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";
            if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}.`);
            }
            if (enableGraphCapture && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);
            }
            outputPreferredLocations.push(location);
          }
        }
        let bindingState = null;
        if (false) {
          ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);
          if (ioBindingHandle === 0) {
            checkLastError("Can't create IO binding.");
          }
          bindingState = {
            handle: ioBindingHandle,
            outputPreferredLocations,
            outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))
          };
        }
        activeSessions.set(
          sessionHandle,
          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState, enableGraphCapture, false]
        );
        return [sessionHandle, inputNames, outputNames];
      } catch (e) {
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        if (ioBindingHandle !== 0) {
          wasm2._OrtReleaseBinding(ioBindingHandle);
        }
        if (sessionHandle !== 0) {
          wasm2._OrtReleaseSession(sessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(modelDataOffset);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        wasm2.unmountExternalData?.();
      }
    };
    releaseSession = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot release session. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture] = session;
      if (ioBindingState) {
        if (enableGraphCapture) {
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
        }
        wasm2._OrtReleaseBinding(ioBindingState.handle);
      }
      wasm2.jsepOnReleaseSession?.(sessionId);
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      wasm2._OrtReleaseSession(sessionHandle);
      activeSessions.delete(sessionId);
    };
    prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index, enableGraphCapture = false) => {
      if (!tensor) {
        tensorHandles.push(0);
        return;
      }
      const wasm2 = getInstance();
      const dataType = tensor[0];
      const dims = tensor[1];
      const location = tensor[3];
      let rawData;
      let dataByteLength;
      if (dataType === "string" && location === "gpu-buffer") {
        throw new Error("String tensor is not supported on GPU.");
      }
      if (enableGraphCapture && location !== "gpu-buffer") {
        throw new Error(
          `External buffer must be provided for input/output index ${index} when enableGraphCapture is true.`
        );
      }
      if (location === "gpu-buffer") {
        const gpuBuffer = tensor[2].gpuBuffer;
        const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));
        dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;
        const registerBuffer = wasm2.jsepRegisterBuffer;
        if (!registerBuffer) {
          throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
        }
        rawData = registerBuffer(sessionId, index, gpuBuffer, dataByteLength);
      } else {
        const data = tensor[2];
        if (Array.isArray(data)) {
          dataByteLength = 4 * data.length;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          let dataIndex = rawData / 4;
          for (let i = 0; i < data.length; i++) {
            if (typeof data[i] !== "string") {
              throw new TypeError(`tensor data at index ${i} is not a string`);
            }
            wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);
          }
        } else {
          dataByteLength = data.byteLength;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);
        }
      }
      const stack = wasm2.stackSave();
      const dimsOffset = wasm2.stackAlloc(4 * dims.length);
      try {
        let dimIndex = dimsOffset / 4;
        dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);
        const tensor2 = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(dataType),
          rawData,
          dataByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(location)
        );
        if (tensor2 === 0) {
          checkLastError(`Can't create tensor for input/output. session=${sessionId}, index=${index}.`);
        }
        tensorHandles.push(tensor2);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot run inference. invalid session id: ${sessionId}`);
      }
      const sessionHandle = session[0];
      const inputNamesUTF8Encoded = session[1];
      const outputNamesUTF8Encoded = session[2];
      const ioBindingState = session[3];
      const enableGraphCapture = session[4];
      const inputOutputBound = session[5];
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);
      const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);
      const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);
      const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        for (let i = 0; i < inputCount; i++) {
          prepareInputOutputTensor(
            inputTensors[i],
            inputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputIndices[i],
            enableGraphCapture
          );
        }
        for (let i = 0; i < outputCount; i++) {
          prepareInputOutputTensor(
            outputTensors[i],
            outputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputCount + outputIndices[i],
            enableGraphCapture
          );
        }
        let inputValuesIndex = inputValuesOffset / 4;
        let inputNamesIndex = inputNamesOffset / 4;
        let outputValuesIndex = outputValuesOffset / 4;
        let outputNamesIndex = outputNamesOffset / 4;
        for (let i = 0; i < inputCount; i++) {
          wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];
          wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];
        }
        for (let i = 0; i < outputCount; i++) {
          wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];
          wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];
        }
        if (false) {
          const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;
          if (inputNamesUTF8Encoded.length !== inputCount) {
            throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model's input count (${inputNamesUTF8Encoded.length}).`);
          }
          for (let i = 0; i < inputCount; i++) {
            const index = inputIndices[i];
            const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);
            if (errorCode2 !== 0) {
              checkLastError(`Can't bind input[${i}] for session=${sessionId}.`);
            }
          }
          for (let i = 0; i < outputCount; i++) {
            const index = outputIndices[i];
            const location = outputTensors[i]?.[3];
            if (location) {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind pre-allocated output[${i}] for session=${sessionId}.`);
              }
            } else {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);
              }
            }
          }
          activeSessions.set(
            sessionId,
            [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, true]
          );
        }
        wasm2.jsepOnRunStart?.(sessionHandle);
        let errorCode;
        if (false) {
          errorCode = await wasm2._OrtRunWithBinding(
            sessionHandle,
            ioBindingState.handle,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        } else {
          errorCode = await wasm2._OrtRun(
            sessionHandle,
            inputNamesOffset,
            inputValuesOffset,
            inputCount,
            outputNamesOffset,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        }
        if (errorCode !== 0) {
          checkLastError("failed to call OrtRun().");
        }
        const output = [];
        for (let i = 0; i < outputCount; i++) {
          const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
          if (tensor === outputTensorHandles[i]) {
            output.push(outputTensors[i]);
            continue;
          }
          const beforeGetTensorDataStack = wasm2.stackSave();
          const tensorDataOffset = wasm2.stackAlloc(4 * 4);
          let keepOutputTensor = false;
          let type, dataOffset = 0;
          try {
            const errorCode2 = wasm2._OrtGetTensorData(
              tensor,
              tensorDataOffset,
              tensorDataOffset + 4,
              tensorDataOffset + 8,
              tensorDataOffset + 12
            );
            if (errorCode2 !== 0) {
              checkLastError(`Can't access output tensor data on index ${i}.`);
            }
            let tensorDataIndex = tensorDataOffset / 4;
            const dataType = wasm2.HEAPU32[tensorDataIndex++];
            dataOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
            const dims = [];
            for (let i2 = 0; i2 < dimsLength; i2++) {
              dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
            }
            wasm2._OrtFree(dimsOffset);
            const size = dims.reduce((a, b) => a * b, 1);
            type = tensorDataTypeEnumToString(dataType);
            const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];
            if (type === "string") {
              if (preferredLocation === "gpu-buffer") {
                throw new Error("String tensor is not supported on GPU.");
              }
              const stringData = [];
              let dataIndex = dataOffset / 4;
              for (let i2 = 0; i2 < size; i2++) {
                const offset = wasm2.HEAPU32[dataIndex++];
                const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
                stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
              }
              output.push([type, dims, stringData, "cpu"]);
            } else {
              if (preferredLocation === "gpu-buffer" && size > 0) {
                const getBuffer = wasm2.jsepGetBuffer;
                if (!getBuffer) {
                  throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
                }
                const gpuBuffer = getBuffer(dataOffset);
                const elementSize = getTensorElementSize(dataType);
                if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {
                  throw new Error(`Unsupported data type: ${type}`);
                }
                keepOutputTensor = true;
                output.push([
                  type,
                  dims,
                  {
                    gpuBuffer,
                    download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),
                    dispose: () => {
                      wasm2._OrtReleaseTensor(tensor);
                    }
                  },
                  "gpu-buffer"
                ]);
              } else {
                const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
                const data = new typedArrayConstructor(size);
                new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
                output.push([type, dims, data, "cpu"]);
              }
            }
          } finally {
            wasm2.stackRestore(beforeGetTensorDataStack);
            if (type === "string" && dataOffset) {
              wasm2._free(dataOffset);
            }
            if (!keepOutputTensor) {
              wasm2._OrtReleaseTensor(tensor);
            }
          }
        }
        if (ioBindingState && !enableGraphCapture) {
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
          activeSessions.set(
            sessionId,
            [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, false]
          );
        }
        return output;
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    endProfiling = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error("invalid session id");
      }
      const sessionHandle = session[0];
      const profileFileName = wasm2._OrtEndProfiling(sessionHandle);
      if (profileFileName === 0) {
        checkLastError("Can't get an profile file name.");
      }
      wasm2._OrtFree(profileFileName);
    };
    extractTransferableBuffers = (tensors) => {
      const buffers = [];
      for (const tensor of tensors) {
        const data = tensor[2];
        if (!Array.isArray(data) && "buffer" in data) {
          buffers.push(data.buffer);
        }
      }
      return buffers;
    };
  }
});

// proxy-worker:./proxy-worker/main
var require_main = __commonJS({
  "proxy-worker:./proxy-worker/main"(exports, module2) {
    module2.exports = '/*!\n * ONNX Runtime Web v1.19.0\n * Copyright (c) Microsoft Corporation. All rights reserved.\n * Licensed under the MIT License.\n */\n"use strict";\n(() => {\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __esm = (fn, res) => function __init() {\n    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;\n  };\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __export = (target, all) => {\n    for (var name in all)\n      __defProp(target, name, { get: all[name], enumerable: true });\n  };\n  var __copyProps = (to, from, except, desc) => {\n    if (from && typeof from === "object" || typeof from === "function") {\n      for (let key of __getOwnPropNames(from))\n        if (!__hasOwnProp.call(to, key) && key !== except)\n          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });\n    }\n    return to;\n  };\n  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);\n\n  // nodejs-ignore:fs\n  var fs_exports = {};\n  __export(fs_exports, {\n    createReadStream: () => createReadStream,\n    readFile: () => readFile,\n    readFileSync: () => readFileSync\n  });\n  var readFile, readFileSync, createReadStream;\n  var init_fs = __esm({\n    "nodejs-ignore:fs"() {\n      readFile = void 0;\n      readFileSync = void 0;\n      createReadStream = void 0;\n    }\n  });\n\n  // nodejs-ignore:path\n  var path_exports = {};\n  __export(path_exports, {\n    join: () => join2\n  });\n  var join2;\n  var init_path = __esm({\n    "nodejs-ignore:path"() {\n      join2 = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-training-wasm-simd.js\n  var require_ort_training_wasm_simd = __commonJS({\n    "web/lib/wasm/binding/ort-training-wasm-simd.js"(exports, module) {\n      "use strict";\n      var ortWasm = (() => {\n        var _scriptDir = typeof document != "undefined" ? document.currentScript?.src : void 0;\n        if (typeof __filename != "undefined")\n          _scriptDir ||= __filename;\n        return function(moduleArg = {}) {\n          var e = moduleArg, k, l, readyPromise = new Promise((a, b) => {\n            k = a;\n            l = b;\n          }), u = Object.assign({}, e), v = "./this.program", aa = "object" == typeof window, w = "function" == typeof importScripts, ba = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, z = "", A, B, C;\n          if (ba) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), D = (init_path(), __toCommonJS(path_exports));\n            z = w ? D.dirname(z) + "/" : __dirname + "/";\n            A = (a, b) => {\n              a = E(a) ? new URL(a) : D.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            C = (a) => {\n              a = A(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            B = (a, b, c, d = true) => {\n              a = E(a) ? new URL(a) : D.normalize(a);\n              fs.readFile(a, d ? void 0 : "utf8", (g, h) => {\n                g ? c(g) : b(d ? h.buffer : h);\n              });\n            };\n            !e.thisProgram && 1 < process.argv.length && (v = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n          } else if (aa || w)\n            w ? z = self.location.href : "undefined" != typeof document && document.currentScript && (z = document.currentScript.src), _scriptDir && (z = _scriptDir), z.startsWith("blob:") ? z = "" : z = z.substr(0, z.replace(/[?#].*/, "").lastIndexOf("/") + 1), A = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, w && (C = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), B = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            };\n          var ca = console.log.bind(console), F = console.error.bind(console);\n          Object.assign(e, u);\n          u = null;\n          var G, da = false, H, I, J, K, ea;\n          function fa() {\n            var a = G.buffer;\n            e.HEAP8 = H = new Int8Array(a);\n            e.HEAP16 = new Int16Array(a);\n            e.HEAPU8 = I = new Uint8Array(a);\n            e.HEAPU16 = new Uint16Array(a);\n            e.HEAP32 = J = new Int32Array(a);\n            e.HEAPU32 = K = new Uint32Array(a);\n            e.HEAPF32 = new Float32Array(a);\n            e.HEAPF64 = ea = new Float64Array(a);\n          }\n          var L = [], M = [], ha = [], N = 0, O = null, P = null;\n          function ia(a) {\n            a = "Aborted(" + a + ")";\n            F(a);\n            da = true;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            l(a);\n            throw a;\n          }\n          var ja = (a) => a.startsWith("data:application/octet-stream;base64,"), E = (a) => a.startsWith("file://"), Q;\n          Q = "ort-training-wasm-simd.wasm";\n          if (!ja(Q)) {\n            var ka = Q;\n            Q = e.locateFile ? e.locateFile(ka, z) : z + ka;\n          }\n          function la(a) {\n            if (C)\n              return C(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function ma(a) {\n            if (aa || w) {\n              if ("function" == typeof fetch && !E(a))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw `failed to load wasm binary file at \'${a}\'`;\n                  return b.arrayBuffer();\n                }).catch(() => la(a));\n              if (B)\n                return new Promise((b, c) => {\n                  B(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => la(a));\n          }\n          function na(a, b, c) {\n            return ma(a).then((d) => WebAssembly.instantiate(d, b)).then(c, (d) => {\n              F(`failed to asynchronously prepare wasm: ${d}`);\n              ia(d);\n            });\n          }\n          function oa(a, b) {\n            var c = Q;\n            return "function" != typeof WebAssembly.instantiateStreaming || ja(c) || E(c) || ba || "function" != typeof fetch ? na(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(g) {\n              F(`wasm streaming compile failed: ${g}`);\n              F("falling back to ArrayBuffer instantiation");\n              return na(c, a, b);\n            }));\n          }\n          var R, pa = { 869704: (a, b, c, d) => {\n            if ("undefined" == typeof e || !e.La)\n              return 1;\n            a = S(a >>> 0);\n            a.startsWith("./") && (a = a.substring(2));\n            a = e.La.get(a);\n            if (!a)\n              return 2;\n            b >>>= 0;\n            c >>>= 0;\n            if (b + c > a.byteLength)\n              return 3;\n            try {\n              return I.set(a.subarray(b, b + c), d >>> 0 >>> 0), 0;\n            } catch {\n              return 4;\n            }\n          } };\n          class qa {\n            constructor(a) {\n              this.Ja = a - 24;\n            }\n          }\n          var ra = 0, sa = 0, ta = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, ua = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && ta)\n              return ta.decode(a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var g = a[b++];\n              if (g & 128) {\n                var h = a[b++] & 63;\n                if (192 == (g & 224))\n                  d += String.fromCharCode((g & 31) << 6 | h);\n                else {\n                  var m = a[b++] & 63;\n                  g = 224 == (g & 240) ? (g & 15) << 12 | h << 6 | m : (g & 7) << 18 | h << 12 | m << 6 | a[b++] & 63;\n                  65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));\n                }\n              } else\n                d += String.fromCharCode(g);\n            }\n            return d;\n          }, S = (a, b) => (a >>>= 0) ? ua(I, a, b) : "", va = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, T = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var g = c;\n            d = c + d - 1;\n            for (var h = 0; h < a.length; ++h) {\n              var m = a.charCodeAt(h);\n              if (55296 <= m && 57343 >= m) {\n                var q = a.charCodeAt(++h);\n                m = 65536 + ((m & 1023) << 10) | q & 1023;\n              }\n              if (127 >= m) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = m;\n              } else {\n                if (2047 >= m) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | m >> 6;\n                } else {\n                  if (65535 >= m) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | m >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | m >> 18;\n                    b[c++ >>> 0] = 128 | m >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | m >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | m & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - g;\n          }, U = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), za = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Aa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], V = [], W = {}, Ba = () => {\n            if (!X) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: v || "./this.program" }, b;\n              for (b in W)\n                void 0 === W[b] ? delete a[b] : a[b] = W[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              X = c;\n            }\n            return X;\n          }, X, Ca = [null, [], []], Da = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ea = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Fa(a) {\n            var b = Array(va(a) + 1);\n            T(a, b, 0, b.length);\n            return b;\n          }\n          function Ga(a, b, c, d) {\n            function g(f, n, p) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < n; )\n                f = p[0] + f;\n              return f;\n            }\n            function h(f, n) {\n              return g(f, n, "0");\n            }\n            function m(f, n) {\n              function p(wa) {\n                return 0 > wa ? -1 : 0 < wa ? 1 : 0;\n              }\n              var y;\n              0 === (y = p(f.getFullYear() - n.getFullYear())) && 0 === (y = p(f.getMonth() - n.getMonth())) && (y = p(f.getDate() - n.getDate()));\n              return y;\n            }\n            function q(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function x(f) {\n              var n = f.Fa;\n              for (f = new Date(new Date(f.Ga + 1900, 0, 1).getTime()); 0 < n; ) {\n                var p = f.getMonth(), y = (U(f.getFullYear()) ? Da : Ea)[p];\n                if (n > y - f.getDate())\n                  n -= y - f.getDate() + 1, f.setDate(1), 11 > p ? f.setMonth(p + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + n);\n                  break;\n                }\n              }\n              p = new Date(f.getFullYear() + 1, 0, 4);\n              n = q(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              p = q(p);\n              return 0 >= m(n, f) ? 0 >= m(p, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var r = K[d + 40 >>> 2 >>> 0];\n            d = { Oa: J[d >>> 2 >>> 0], Na: J[d + 4 >>> 2 >>> 0], Ha: J[d + 8 >>> 2 >>> 0], Ka: J[d + 12 >>> 2 >>> 0], Ia: J[d + 16 >>> 2 >>> 0], Ga: J[d + 20 >>> 2 >>> 0], Aa: J[d + 24 >>> 2 >>> 0], Fa: J[d + 28 >>> 2 >>> 0], Qa: J[d + 32 >>> 2 >>> 0], Ma: J[d + 36 >>> 2 >>> 0], Pa: r ? S(r) : "" };\n            c = S(c);\n            r = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var t in r)\n              c = c.replace(new RegExp(t, "g"), r[t]);\n            var xa = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), ya = "January February March April May June July August September October November December".split(" ");\n            r = {\n              "%a": (f) => xa[f.Aa].substring(0, 3),\n              "%A": (f) => xa[f.Aa],\n              "%b": (f) => ya[f.Ia].substring(0, 3),\n              "%B": (f) => ya[f.Ia],\n              "%C": (f) => h((f.Ga + 1900) / 100 | 0, 2),\n              "%d": (f) => h(f.Ka, 2),\n              "%e": (f) => g(f.Ka, 2, " "),\n              "%g": (f) => x(f).toString().substring(2),\n              "%G": x,\n              "%H": (f) => h(f.Ha, 2),\n              "%I": (f) => {\n                f = f.Ha;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return h(f, 2);\n              },\n              "%j": (f) => {\n                for (var n = 0, p = 0; p <= f.Ia - 1; n += (U(f.Ga + 1900) ? Da : Ea)[p++])\n                  ;\n                return h(f.Ka + n, 3);\n              },\n              "%m": (f) => h(f.Ia + 1, 2),\n              "%M": (f) => h(f.Na, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Ha && 12 > f.Ha ? "AM" : "PM",\n              "%S": (f) => h(f.Oa, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Aa || 7,\n              "%U": (f) => h(Math.floor((f.Fa + 7 - f.Aa) / 7), 2),\n              "%V": (f) => {\n                var n = Math.floor((f.Fa + 7 - (f.Aa + 6) % 7) / 7);\n                2 >= (f.Aa + 371 - f.Fa - 2) % 7 && n++;\n                if (n)\n                  53 == n && (p = (f.Aa + 371 - f.Fa) % 7, 4 == p || 3 == p && U(f.Ga) || (n = 1));\n                else {\n                  n = 52;\n                  var p = (f.Aa + 7 - f.Fa - 1) % 7;\n                  (4 == p || 5 == p && U(f.Ga % 400 - 1)) && n++;\n                }\n                return h(n, 2);\n              },\n              "%w": (f) => f.Aa,\n              "%W": (f) => h(Math.floor((f.Fa + 7 - (f.Aa + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Ga + 1900).toString().substring(2),\n              "%Y": (f) => f.Ga + 1900,\n              "%z": (f) => {\n                f = f.Ma;\n                var n = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (n ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.Pa,\n              "%%": () => "%"\n            };\n            c = c.replace(/%%/g, "\\0\\0");\n            for (t in r)\n              c.includes(t) && (c = c.replace(new RegExp(t, "g"), r[t](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            t = Fa(c);\n            if (t.length > b)\n              return 0;\n            H.set(t, a >>> 0);\n            return t.length - 1;\n          }\n          var Ia = { a: function(a, b, c) {\n            a >>>= 0;\n            var d = new qa(a);\n            K[d.Ja + 16 >>> 2 >>> 0] = 0;\n            K[d.Ja + 4 >>> 2 >>> 0] = b >>> 0;\n            K[d.Ja + 8 >>> 2 >>> 0] = c >>> 0;\n            ra = a;\n            sa++;\n            throw ra;\n          }, e: function() {\n            return 0;\n          }, H: function() {\n          }, x: function() {\n          }, z: function() {\n          }, J: function() {\n            return 0;\n          }, F: function() {\n          }, A: function() {\n          }, E: function() {\n          }, g: function() {\n          }, y: function() {\n          }, v: function() {\n          }, G: function() {\n          }, w: function() {\n          }, k: () => 1, I: function(a, b, c) {\n            b >>>= 0;\n            return I.copyWithin(a >>> 0 >>> 0, b >>> 0, b + (c >>> 0) >>> 0);\n          }, n: function(a, b, c) {\n            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n            c >>>= 0;\n            a = new Date(1e3 * a);\n            J[c >>> 2 >>> 0] = a.getUTCSeconds();\n            J[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n            J[c + 8 >>> 2 >>> 0] = a.getUTCHours();\n            J[c + 12 >>> 2 >>> 0] = a.getUTCDate();\n            J[c + 16 >>> 2 >>> 0] = a.getUTCMonth();\n            J[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n            J[c + 24 >>> 2 >>> 0] = a.getUTCDay();\n            J[c + 28 >>> 2 >>> 0] = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n          }, o: function(a, b, c) {\n            a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n            c >>>= 0;\n            a = new Date(1e3 * a);\n            J[c >>> 2 >>> 0] = a.getSeconds();\n            J[c + 4 >>> 2 >>> 0] = a.getMinutes();\n            J[c + 8 >>> 2 >>> 0] = a.getHours();\n            J[c + 12 >>> 2 >>> 0] = a.getDate();\n            J[c + 16 >>> 2 >>> 0] = a.getMonth();\n            J[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n            J[c + 24 >>> 2 >>> 0] = a.getDay();\n            J[c + 28 >>> 2 >>> 0] = (U(a.getFullYear()) ? za : Aa)[a.getMonth()] + a.getDate() - 1 | 0;\n            J[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n            b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n            J[c + 32 >>> 2 >>> 0] = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;\n          }, p: function(a) {\n            a >>>= 0;\n            var b = new Date(\n              J[a + 20 >>> 2 >>> 0] + 1900,\n              J[a + 16 >>> 2 >>> 0],\n              J[a + 12 >>> 2 >>> 0],\n              J[a + 8 >>> 2 >>> 0],\n              J[a + 4 >>> 2 >>> 0],\n              J[a >>> 2 >>> 0],\n              0\n            ), c = J[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(), m = Math.min(h, g);\n            0 > c ? J[a + 32 >>> 2 >>> 0] = Number(g != h && m == d) : 0 < c != (m == d) && (g = Math.max(h, g), b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - d)));\n            J[a + 24 >>> 2 >>> 0] = b.getDay();\n            J[a + 28 >>> 2 >>> 0] = (U(b.getFullYear()) ? za : Aa)[b.getMonth()] + b.getDate() - 1 | 0;\n            J[a >>> 2 >>> 0] = b.getSeconds();\n            J[a + 4 >>> 2 >>> 0] = b.getMinutes();\n            J[a + 8 >>> 2 >>> 0] = b.getHours();\n            J[a + 12 >>> 2 >>> 0] = b.getDate();\n            J[a + 16 >>> 2 >>> 0] = b.getMonth();\n            J[a + 20 >>> 2 >>> 0] = b.getYear();\n            a = b.getTime();\n            a = isNaN(a) ? -1 : a / 1e3;\n            Ha((R = a, 1 <= +Math.abs(R) ? 0 < R ? +Math.floor(R / 4294967296) >>> 0 : ~~+Math.ceil((R - +(~~R >>> 0)) / 4294967296) >>> 0 : 0));\n            return a >>> 0;\n          }, l: function() {\n            return -52;\n          }, m: function() {\n          }, t: function(a, b, c, d) {\n            c >>>= 0;\n            d >>>= 0;\n            var g = (/* @__PURE__ */ new Date()).getFullYear(), h = new Date(g, 0, 1), m = new Date(g, 6, 1);\n            g = h.getTimezoneOffset();\n            var q = m.getTimezoneOffset();\n            K[a >>> 0 >>> 2 >>> 0] = 60 * Math.max(g, q);\n            J[b >>> 0 >>> 2 >>> 0] = Number(g != q);\n            a = (x) => x.toLocaleTimeString(void 0, { hour12: false, timeZoneName: "short" }).split(" ")[1];\n            h = a(h);\n            m = a(m);\n            q < g ? (T(h, I, c, 17), T(m, I, d, 17)) : (T(h, I, d, 17), T(m, I, c, 17));\n          }, d: () => {\n            ia("");\n          }, B: function(a, b, c) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            V.length = 0;\n            for (var d; d = I[b++ >>> 0]; ) {\n              var g = 105 != d;\n              g &= 112 != d;\n              c += g && c % 8 ? 4 : 0;\n              V.push(112 == d ? K[c >>> 2 >>> 0] : 105 == d ? J[c >>> 2 >>> 0] : ea[c >>> 3 >>> 0]);\n              c += g ? 8 : 4;\n            }\n            return pa[a](...V);\n          }, h: () => Date.now(), u: function() {\n            return 4294901760;\n          }, b: () => performance.now(), s: function(a) {\n            a >>>= 0;\n            var b = I.length;\n            if (4294901760 < a)\n              return false;\n            for (var c = 1; 4 >= c; c *= 2) {\n              var d = b * (1 + 0.2 / c);\n              d = Math.min(d, a + 100663296);\n              var g = Math;\n              d = Math.max(a, d);\n              a: {\n                g = (g.min.call(g, 4294901760, d + (65536 - d % 65536) % 65536) - G.buffer.byteLength + 65535) / 65536;\n                try {\n                  G.grow(g);\n                  fa();\n                  var h = 1;\n                  break a;\n                } catch (m) {\n                }\n                h = void 0;\n              }\n              if (h)\n                return true;\n            }\n            return false;\n          }, C: function(a, b) {\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Ba().forEach((d, g) => {\n              var h = b + c;\n              g = K[a + 4 * g >>> 2 >>> 0] = h;\n              for (h = 0; h < d.length; ++h)\n                H[g++ >>> 0] = d.charCodeAt(h);\n              H[g >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }, D: function(a, b) {\n            a >>>= 0;\n            b >>>= 0;\n            var c = Ba();\n            K[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((g) => d += g.length + 1);\n            K[b >>> 2 >>> 0] = d;\n            return 0;\n          }, f: () => 52, j: function() {\n            return 52;\n          }, q: function() {\n            return 70;\n          }, i: function(a, b, c, d) {\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var g = 0, h = 0; h < c; h++) {\n              var m = K[b >>> 2 >>> 0], q = K[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var x = 0; x < q; x++) {\n                var r = I[m + x >>> 0], t = Ca[a];\n                0 === r || 10 === r ? ((1 === a ? ca : F)(ua(t, 0)), t.length = 0) : t.push(r);\n              }\n              g += q;\n            }\n            K[d >>> 2 >>> 0] = g;\n            return 0;\n          }, r: Ga, c: function(a, b, c, d) {\n            return Ga(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n          } }, Y = function() {\n            function a(c) {\n              Y = c.exports;\n              Y = Ja();\n              G = Y.K;\n              fa();\n              M.unshift(Y.L);\n              N--;\n              0 == N && (null !== O && (clearInterval(O), O = null), P && (c = P, P = null, c()));\n              return Y;\n            }\n            var b = { a: Ia };\n            N++;\n            if (e.instantiateWasm)\n              try {\n                return e.instantiateWasm(b, a);\n              } catch (c) {\n                F(`Module.instantiateWasm callback failed with error: ${c}`), l(c);\n              }\n            oa(b, function(c) {\n              a(c.instance);\n            }).catch(l);\n            return {};\n          }();\n          e._OrtInit = (a, b) => (e._OrtInit = Y.M)(a, b);\n          e._OrtGetLastError = (a, b) => (e._OrtGetLastError = Y.N)(a, b);\n          e._OrtCreateSessionOptions = (a, b, c, d, g, h, m, q, x, r) => (e._OrtCreateSessionOptions = Y.O)(a, b, c, d, g, h, m, q, x, r);\n          e._OrtAppendExecutionProvider = (a, b) => (e._OrtAppendExecutionProvider = Y.P)(a, b);\n          e._OrtAddFreeDimensionOverride = (a, b, c) => (e._OrtAddFreeDimensionOverride = Y.Q)(a, b, c);\n          e._OrtAddSessionConfigEntry = (a, b, c) => (e._OrtAddSessionConfigEntry = Y.R)(a, b, c);\n          e._OrtReleaseSessionOptions = (a) => (e._OrtReleaseSessionOptions = Y.S)(a);\n          e._OrtCreateSession = (a, b, c) => (e._OrtCreateSession = Y.T)(a, b, c);\n          e._OrtReleaseSession = (a) => (e._OrtReleaseSession = Y.U)(a);\n          e._OrtGetInputOutputCount = (a, b, c) => (e._OrtGetInputOutputCount = Y.V)(a, b, c);\n          e._OrtGetInputName = (a, b) => (e._OrtGetInputName = Y.W)(a, b);\n          e._OrtGetOutputName = (a, b) => (e._OrtGetOutputName = Y.X)(a, b);\n          e._OrtFree = (a) => (e._OrtFree = Y.Y)(a);\n          e._OrtCreateTensor = (a, b, c, d, g, h) => (e._OrtCreateTensor = Y.Z)(a, b, c, d, g, h);\n          e._OrtGetTensorData = (a, b, c, d, g) => (e._OrtGetTensorData = Y._)(a, b, c, d, g);\n          e._OrtReleaseTensor = (a) => (e._OrtReleaseTensor = Y.$)(a);\n          e._OrtCreateRunOptions = (a, b, c, d) => (e._OrtCreateRunOptions = Y.aa)(a, b, c, d);\n          e._OrtAddRunConfigEntry = (a, b, c) => (e._OrtAddRunConfigEntry = Y.ba)(a, b, c);\n          e._OrtReleaseRunOptions = (a) => (e._OrtReleaseRunOptions = Y.ca)(a);\n          e._OrtCreateBinding = (a) => (e._OrtCreateBinding = Y.da)(a);\n          e._OrtBindInput = (a, b, c) => (e._OrtBindInput = Y.ea)(a, b, c);\n          e._OrtBindOutput = (a, b, c, d) => (e._OrtBindOutput = Y.fa)(a, b, c, d);\n          e._OrtClearBoundOutputs = (a) => (e._OrtClearBoundOutputs = Y.ga)(a);\n          e._OrtReleaseBinding = (a) => (e._OrtReleaseBinding = Y.ha)(a);\n          e._OrtRunWithBinding = (a, b, c, d, g) => (e._OrtRunWithBinding = Y.ia)(a, b, c, d, g);\n          e._OrtRun = (a, b, c, d, g, h, m, q) => (e._OrtRun = Y.ja)(a, b, c, d, g, h, m, q);\n          e._OrtEndProfiling = (a) => (e._OrtEndProfiling = Y.ka)(a);\n          e._OrtTrainingLoadCheckpoint = (a, b) => (e._OrtTrainingLoadCheckpoint = Y.la)(a, b);\n          e._OrtTrainingReleaseCheckpoint = (a) => (e._OrtTrainingReleaseCheckpoint = Y.ma)(a);\n          e._OrtTrainingCreateSession = (a, b, c, d, g, h, m, q) => (e._OrtTrainingCreateSession = Y.na)(a, b, c, d, g, h, m, q);\n          e._OrtTrainingLazyResetGrad = (a) => (e._OrtTrainingLazyResetGrad = Y.oa)(a);\n          e._OrtTrainingRunTrainStep = (a, b, c, d, g, h) => (e._OrtTrainingRunTrainStep = Y.pa)(a, b, c, d, g, h);\n          e._OrtTrainingOptimizerStep = (a, b) => (e._OrtTrainingOptimizerStep = Y.qa)(a, b);\n          e._OrtTrainingEvalStep = (a, b, c, d, g, h) => (e._OrtTrainingEvalStep = Y.ra)(a, b, c, d, g, h);\n          e._OrtTrainingGetParametersSize = (a, b, c) => (e._OrtTrainingGetParametersSize = Y.sa)(a, b, c);\n          e._OrtTrainingCopyParametersToBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersToBuffer = Y.ta)(a, b, c, d);\n          e._OrtTrainingCopyParametersFromBuffer = (a, b, c, d) => (e._OrtTrainingCopyParametersFromBuffer = Y.ua)(a, b, c, d);\n          e._OrtTrainingGetModelInputOutputCount = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputCount = Y.va)(a, b, c, d);\n          e._OrtTrainingGetModelInputOutputName = (a, b, c, d) => (e._OrtTrainingGetModelInputOutputName = Y.wa)(a, b, c, d);\n          e._OrtTrainingReleaseSession = (a) => (e._OrtTrainingReleaseSession = Y.xa)(a);\n          e._malloc = (a) => (e._malloc = Y.ya)(a);\n          e._free = (a) => (e._free = Y.za)(a);\n          var Ha = (a) => (Ha = Y.Ba)(a), Ka = (a) => (Ka = Y.Ca)(a), La = (a) => (La = Y.Da)(a), Ma = () => (Ma = Y.Ea)();\n          function Ja() {\n            var a = Y;\n            a = Object.assign({}, a);\n            var b = (c) => (d) => c(d) >>> 0;\n            a.ya = b(a.ya);\n            a.Da = b(a.Da);\n            a.Ea = ((c) => () => c() >>> 0)(a.Ea);\n            return a;\n          }\n          e.stackSave = () => Ma();\n          e.stackRestore = (a) => Ka(a);\n          e.stackAlloc = (a) => La(a);\n          e.UTF8ToString = S;\n          e.stringToUTF8 = (a, b, c) => T(a, I, b, c);\n          e.lengthBytesUTF8 = va;\n          var Z;\n          P = function Na() {\n            Z || Oa();\n            Z || (P = Na);\n          };\n          function Oa() {\n            if (!(0 < N)) {\n              if (e.preRun)\n                for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length; ) {\n                  var a = e.preRun.shift();\n                  L.unshift(a);\n                }\n              for (; 0 < L.length; )\n                L.shift()(e);\n              if (!(0 < N || Z || (Z = true, e.calledRun = true, da))) {\n                for (; 0 < M.length; )\n                  M.shift()(e);\n                for (k(e); 0 < ha.length; )\n                  ha.shift()(e);\n              }\n            }\n          }\n          Oa();\n          return readyPromise;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasm;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasm);\n    }\n  });\n\n  // nodejs-ignore:worker_threads\n  var require_worker_threads = __commonJS({\n    "nodejs-ignore:worker_threads"() {\n    }\n  });\n\n  // nodejs-ignore:perf_hooks\n  var require_perf_hooks = __commonJS({\n    "nodejs-ignore:perf_hooks"() {\n    }\n  });\n\n  // nodejs-ignore:os\n  var os_exports = {};\n  __export(os_exports, {\n    cpus: () => cpus\n  });\n  var cpus;\n  var init_os = __esm({\n    "nodejs-ignore:os"() {\n      cpus = void 0;\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.js\n  var require_ort_wasm_threaded = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.js"(exports, module) {\n      "use strict";\n      var ortWasmThreaded = (() => {\n        var _scriptDir = typeof document != "undefined" ? document.currentScript?.src : void 0;\n        if (typeof __filename != "undefined")\n          _scriptDir ||= __filename;\n        return function(moduleArg = {}) {\n          function aa() {\n            e.buffer != l.buffer && m();\n            return l;\n          }\n          function n() {\n            e.buffer != l.buffer && m();\n            return ba;\n          }\n          function p() {\n            e.buffer != l.buffer && m();\n            return ca;\n          }\n          function r() {\n            e.buffer != l.buffer && m();\n            return da;\n          }\n          function ea() {\n            e.buffer != l.buffer && m();\n            return fa;\n          }\n          var v = moduleArg, ha, x, readyPromise = new Promise((a, b) => {\n            ha = a;\n            x = b;\n          }), ia = Object.assign({}, v), ja = "./this.program", z = (a, b) => {\n            throw b;\n          }, ka = "object" == typeof window, A = "function" == typeof importScripts, B = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, D = v.ENVIRONMENT_IS_PTHREAD || false, E = "";\n          function la(a) {\n            return v.locateFile ? v.locateFile(a, E) : E + a;\n          }\n          var ma, G, H;\n          if (B) {\n            var fs = (init_fs(), __toCommonJS(fs_exports)), na = (init_path(), __toCommonJS(path_exports));\n            E = A ? na.dirname(E) + "/" : __dirname + "/";\n            ma = (a, b) => {\n              a = I(a) ? new URL(a) : na.normalize(a);\n              return fs.readFileSync(a, b ? void 0 : "utf8");\n            };\n            H = (a) => {\n              a = ma(a, true);\n              a.buffer || (a = new Uint8Array(a));\n              return a;\n            };\n            G = (a, b, c, d = true) => {\n              a = I(a) ? new URL(a) : na.normalize(a);\n              fs.readFile(a, d ? void 0 : "utf8", (h, g) => {\n                h ? c(h) : b(d ? g.buffer : g);\n              });\n            };\n            !v.thisProgram && 1 < process.argv.length && (ja = process.argv[1].replace(/\\\\/g, "/"));\n            process.argv.slice(2);\n            z = (a, b) => {\n              process.exitCode = a;\n              throw b;\n            };\n            global.Worker = require_worker_threads().Worker;\n          } else if (ka || A)\n            A ? E = self.location.href : "undefined" != typeof document && document.currentScript && (E = document.currentScript.src), typeof _scriptDir !== "undefined" && _scriptDir && (E = _scriptDir), E.startsWith("blob:") ? E = "" : E = E.substr(0, E.replace(/[?#].*/, "").lastIndexOf("/") + 1), B || (ma = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.send(null);\n              return b.responseText;\n            }, A && (H = (a) => {\n              var b = new XMLHttpRequest();\n              b.open("GET", a, false);\n              b.responseType = "arraybuffer";\n              b.send(null);\n              return new Uint8Array(b.response);\n            }), G = (a, b, c) => {\n              var d = new XMLHttpRequest();\n              d.open("GET", a, true);\n              d.responseType = "arraybuffer";\n              d.onload = () => {\n                200 == d.status || 0 == d.status && d.response ? b(d.response) : c();\n              };\n              d.onerror = c;\n              d.send(null);\n            });\n          B && "undefined" == typeof performance && (global.performance = require_perf_hooks().performance);\n          var oa = console.log.bind(console), pa = console.error.bind(console);\n          B && (oa = (...a) => fs.writeSync(1, a.join(" ") + "\\n"), pa = (...a) => fs.writeSync(2, a.join(" ") + "\\n"));\n          var qa = oa, J = pa;\n          Object.assign(v, ia);\n          ia = null;\n          var e, ra, K = false, L, l, ba, ca, da, fa;\n          function m() {\n            var a = e.buffer;\n            v.HEAP8 = l = new Int8Array(a);\n            v.HEAP16 = new Int16Array(a);\n            v.HEAPU8 = ba = new Uint8Array(a);\n            v.HEAPU16 = new Uint16Array(a);\n            v.HEAP32 = ca = new Int32Array(a);\n            v.HEAPU32 = da = new Uint32Array(a);\n            v.HEAPF32 = new Float32Array(a);\n            v.HEAPF64 = fa = new Float64Array(a);\n          }\n          var sa = 16777216;\n          if (D)\n            e = v.wasmMemory;\n          else if (v.wasmMemory)\n            e = v.wasmMemory;\n          else if (e = new WebAssembly.Memory({ initial: sa / 65536, maximum: 65536, shared: true }), !(e.buffer instanceof SharedArrayBuffer))\n            throw J("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"), B && J("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"), Error("bad memory");\n          m();\n          sa = e.buffer.byteLength;\n          var ta = [], ua = [], va = [], M = 0, wa = null, N = null;\n          function xa() {\n            M--;\n            if (0 == M && (null !== wa && (clearInterval(wa), wa = null), N)) {\n              var a = N;\n              N = null;\n              a();\n            }\n          }\n          function ya(a) {\n            a = "Aborted(" + a + ")";\n            J(a);\n            K = true;\n            L = 1;\n            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");\n            x(a);\n            throw a;\n          }\n          var za = (a) => a.startsWith("data:application/octet-stream;base64,"), I = (a) => a.startsWith("file://"), O;\n          O = "ort-wasm-threaded.wasm";\n          za(O) || (O = la(O));\n          function Aa(a) {\n            if (H)\n              return H(a);\n            throw "both async and sync fetching of the wasm failed";\n          }\n          function Ba(a) {\n            if (ka || A) {\n              if ("function" == typeof fetch && !I(a))\n                return fetch(a, { credentials: "same-origin" }).then((b) => {\n                  if (!b.ok)\n                    throw `failed to load wasm binary file at \'${a}\'`;\n                  return b.arrayBuffer();\n                }).catch(() => Aa(a));\n              if (G)\n                return new Promise((b, c) => {\n                  G(a, (d) => b(new Uint8Array(d)), c);\n                });\n            }\n            return Promise.resolve().then(() => Aa(a));\n          }\n          function Ca(a, b, c) {\n            return Ba(a).then((d) => WebAssembly.instantiate(d, b)).then(c, (d) => {\n              J(`failed to asynchronously prepare wasm: ${d}`);\n              ya(d);\n            });\n          }\n          function Da(a, b) {\n            var c = O;\n            return "function" != typeof WebAssembly.instantiateStreaming || za(c) || I(c) || B || "function" != typeof fetch ? Ca(c, a, b) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, a).then(b, function(h) {\n              J(`wasm streaming compile failed: ${h}`);\n              J("falling back to ArrayBuffer instantiation");\n              return Ca(c, a, b);\n            }));\n          }\n          var P, Ea = { 799412: (a, b, c, d) => {\n            if ("undefined" == typeof v || !v.bb)\n              return 1;\n            a = Q(a >>> 0);\n            a.startsWith("./") && (a = a.substring(2));\n            a = v.bb.get(a);\n            if (!a)\n              return 2;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if (b + c > a.byteLength)\n              return 3;\n            try {\n              return n().set(a.subarray(b, b + c), d >>> 0), 0;\n            } catch {\n              return 4;\n            }\n          } };\n          function R(a) {\n            this.name = "ExitStatus";\n            this.message = `Program terminated with exit(${a})`;\n            this.status = a;\n          }\n          var Fa = (a) => {\n            a.terminate();\n            a.onmessage = () => {\n            };\n          }, Ha = (a) => {\n            0 == S.Oa.length && (Ga(), S.Xa(S.Oa[0]));\n            var b = S.Oa.pop();\n            if (!b)\n              return 6;\n            S.Pa.push(b);\n            S.La[a.Na] = b;\n            b.Na = a.Na;\n            var c = { cmd: "run", start_routine: a.gb, arg: a.cb, pthread_ptr: a.Na };\n            B && b.unref();\n            b.postMessage(c, a.mb);\n            return 0;\n          }, T = 0, Ja = (a) => {\n            var b = Ia();\n            a = a();\n            U(b);\n            return a;\n          }, V = (a, b, ...c) => Ja(() => {\n            for (var d = c.length, h = Ka(8 * d), g = h >>> 3, k = 0; k < c.length; k++) {\n              var t = c[k];\n              ea()[g + k >>> 0] = t;\n            }\n            return La(a, 0, d, h, b);\n          });\n          function Ma(a) {\n            if (D)\n              return V(0, 1, a);\n            L = a;\n            0 < T || (S.hb(), v.onExit?.(a), K = true);\n            z(a, new R(a));\n          }\n          var Oa = (a) => {\n            L = a;\n            if (D)\n              throw Na(a), "unwind";\n            Ma(a);\n          };\n          function Pa() {\n            for (var a = v.numThreads; a--; )\n              Ga();\n            ta.unshift(() => {\n              M++;\n              Qa(() => xa());\n            });\n          }\n          function Ga() {\n            var a = la("ort-wasm-threaded.worker.js");\n            a = new Worker(a);\n            S.Oa.push(a);\n          }\n          function Qa(a) {\n            D ? a() : Promise.all(S.Oa.map(S.Xa)).then(a);\n          }\n          var S = { Oa: [], Pa: [], ab: [], La: {}, Va() {\n            D ? (S.receiveObjectTransfer = S.fb, S.threadInitTLS = S.$a, S.setExitStatus = S.Za) : Pa();\n          }, Za: (a) => L = a, pb: ["$terminateWorker"], hb: () => {\n            for (var a of S.Pa)\n              Fa(a);\n            for (a of S.Oa)\n              Fa(a);\n            S.Oa = [];\n            S.Pa = [];\n            S.La = [];\n          }, Ya: (a) => {\n            var b = a.Na;\n            delete S.La[b];\n            S.Oa.push(a);\n            S.Pa.splice(S.Pa.indexOf(a), 1);\n            a.Na = 0;\n            Ra(b);\n          }, fb() {\n          }, $a() {\n            S.ab.forEach((a) => a());\n          }, Xa: (a) => new Promise((b) => {\n            a.onmessage = (g) => {\n              g = g.data;\n              var k = g.cmd;\n              if (g.targetThread && g.targetThread != W()) {\n                var t = S.La[g.targetThread];\n                t ? t.postMessage(g, g.transferList) : J(`Internal error! Worker sent a message "${k}" to target pthread ${g.targetThread}, but that thread no longer exists!`);\n              } else if ("checkMailbox" === k)\n                Sa();\n              else if ("spawnThread" === k)\n                Ha(g);\n              else if ("cleanupThread" === k)\n                S.Ya(S.La[g.thread]);\n              else if ("killThread" === k)\n                g = g.thread, k = S.La[g], delete S.La[g], Fa(k), Ra(g), S.Pa.splice(S.Pa.indexOf(k), 1), k.Na = 0;\n              else if ("cancelThread" === k)\n                S.La[g.thread].postMessage({ cmd: "cancel" });\n              else if ("loaded" === k)\n                a.loaded = true, B && !a.Na && a.unref(), b(a);\n              else if ("alert" === k)\n                alert(`Thread ${g.threadId}: ${g.text}`);\n              else if ("setimmediate" === g.target)\n                a.postMessage(g);\n              else if ("callHandler" === k)\n                v[g.handler](...g.args);\n              else\n                k && J(`worker sent an unknown command ${k}`);\n            };\n            a.onerror = (g) => {\n              J(`${"worker sent an error!"} ${g.filename}:${g.lineno}: ${g.message}`);\n              throw g;\n            };\n            B && (a.on("message", (g) => a.onmessage({ data: g })), a.on("error", (g) => a.onerror(g)));\n            var c = [], d = ["onExit"], h;\n            for (h of d)\n              v.hasOwnProperty(h) && c.push(h);\n            a.postMessage({ cmd: "load", handlers: c, urlOrBlob: v.mainScriptUrlOrBlob || _scriptDir, wasmMemory: e, wasmModule: ra });\n          }) };\n          v.PThread = S;\n          var Ta = (a) => {\n            for (; 0 < a.length; )\n              a.shift()(v);\n          };\n          v.establishStackSpace = () => {\n            var a = W(), b = r()[a + 52 >>> 2 >>> 0];\n            a = r()[a + 56 >>> 2 >>> 0];\n            Ua(b, b - a);\n            U(b);\n          };\n          function Na(a) {\n            if (D)\n              return V(1, 0, a);\n            Oa(a);\n          }\n          var Va = [], Wa;\n          v.invokeEntryPoint = (a, b) => {\n            T = 0;\n            var c = Va[a];\n            c || (a >= Va.length && (Va.length = a + 1), Va[a] = c = Wa.get(a));\n            a = c(b);\n            0 < T ? S.Za(a) : Xa(a);\n          };\n          class Ya {\n            constructor(a) {\n              this.Ua = a - 24;\n            }\n            Va(a, b) {\n              r()[this.Ua + 16 >>> 2 >>> 0] = 0;\n              r()[this.Ua + 4 >>> 2 >>> 0] = a;\n              r()[this.Ua + 8 >>> 2 >>> 0] = b;\n            }\n          }\n          var Za = 0, $a = 0;\n          function ab(a, b, c, d) {\n            return D ? V(2, 1, a, b, c, d) : bb(a, b, c, d);\n          }\n          function bb(a, b, c, d) {\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            if ("undefined" == typeof SharedArrayBuffer)\n              return J("Current environment does not support SharedArrayBuffer, pthreads are not available!"), 6;\n            var h = [];\n            if (D && 0 === h.length)\n              return ab(a, b, c, d);\n            a = { gb: c, Na: a, cb: d, mb: h };\n            return D ? (a.ob = "spawnThread", postMessage(a, h), 0) : Ha(a);\n          }\n          var cb = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, db = (a, b, c) => {\n            b >>>= 0;\n            var d = b + c;\n            for (c = b; a[c] && !(c >= d); )\n              ++c;\n            if (16 < c - b && a.buffer && cb)\n              return cb.decode(a.buffer instanceof SharedArrayBuffer ? a.slice(b, c) : a.subarray(b, c));\n            for (d = ""; b < c; ) {\n              var h = a[b++];\n              if (h & 128) {\n                var g = a[b++] & 63;\n                if (192 == (h & 224))\n                  d += String.fromCharCode((h & 31) << 6 | g);\n                else {\n                  var k = a[b++] & 63;\n                  h = 224 == (h & 240) ? (h & 15) << 12 | g << 6 | k : (h & 7) << 18 | g << 12 | k << 6 | a[b++] & 63;\n                  65536 > h ? d += String.fromCharCode(h) : (h -= 65536, d += String.fromCharCode(55296 | h >> 10, 56320 | h & 1023));\n                }\n              } else\n                d += String.fromCharCode(h);\n            }\n            return d;\n          }, Q = (a, b) => (a >>>= 0) ? db(n(), a, b) : "";\n          function eb(a, b, c) {\n            return D ? V(3, 1, a, b, c) : 0;\n          }\n          function fb(a, b) {\n            if (D)\n              return V(4, 1, a, b);\n          }\n          var gb = (a) => {\n            for (var b = 0, c = 0; c < a.length; ++c) {\n              var d = a.charCodeAt(c);\n              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;\n            }\n            return b;\n          }, hb = (a, b, c, d) => {\n            c >>>= 0;\n            if (!(0 < d))\n              return 0;\n            var h = c;\n            d = c + d - 1;\n            for (var g = 0; g < a.length; ++g) {\n              var k = a.charCodeAt(g);\n              if (55296 <= k && 57343 >= k) {\n                var t = a.charCodeAt(++g);\n                k = 65536 + ((k & 1023) << 10) | t & 1023;\n              }\n              if (127 >= k) {\n                if (c >= d)\n                  break;\n                b[c++ >>> 0] = k;\n              } else {\n                if (2047 >= k) {\n                  if (c + 1 >= d)\n                    break;\n                  b[c++ >>> 0] = 192 | k >> 6;\n                } else {\n                  if (65535 >= k) {\n                    if (c + 2 >= d)\n                      break;\n                    b[c++ >>> 0] = 224 | k >> 12;\n                  } else {\n                    if (c + 3 >= d)\n                      break;\n                    b[c++ >>> 0] = 240 | k >> 18;\n                    b[c++ >>> 0] = 128 | k >> 12 & 63;\n                  }\n                  b[c++ >>> 0] = 128 | k >> 6 & 63;\n                }\n                b[c++ >>> 0] = 128 | k & 63;\n              }\n            }\n            b[c >>> 0] = 0;\n            return c - h;\n          }, X = (a, b, c) => hb(a, n(), b, c);\n          function ib(a, b) {\n            if (D)\n              return V(5, 1, a, b);\n          }\n          function jb(a, b, c) {\n            if (D)\n              return V(6, 1, a, b, c);\n          }\n          function kb(a, b, c) {\n            return D ? V(7, 1, a, b, c) : 0;\n          }\n          function lb(a, b) {\n            if (D)\n              return V(8, 1, a, b);\n          }\n          function mb(a, b, c) {\n            if (D)\n              return V(9, 1, a, b, c);\n          }\n          function nb(a, b, c, d) {\n            if (D)\n              return V(10, 1, a, b, c, d);\n          }\n          function ob(a, b, c, d) {\n            if (D)\n              return V(11, 1, a, b, c, d);\n          }\n          function pb(a, b, c, d) {\n            if (D)\n              return V(12, 1, a, b, c, d);\n          }\n          function qb(a) {\n            if (D)\n              return V(13, 1, a);\n          }\n          function rb(a, b) {\n            if (D)\n              return V(14, 1, a, b);\n          }\n          function sb(a, b, c) {\n            if (D)\n              return V(15, 1, a, b, c);\n          }\n          function tb(a) {\n            a >>>= 0;\n            "function" === typeof Atomics.nb && (Atomics.nb(p(), a >>> 2, a).value.then(Sa), a += 128, Atomics.store(p(), a >>> 2, 1));\n          }\n          v.__emscripten_thread_mailbox_await = tb;\n          var Sa = () => {\n            var a = W();\n            if (a && (tb(a), a = ub, !K))\n              try {\n                if (a(), !(0 < T))\n                  try {\n                    D ? Xa(L) : Oa(L);\n                  } catch (b) {\n                    b instanceof R || "unwind" == b || z(1, b);\n                  }\n              } catch (b) {\n                b instanceof R || "unwind" == b || z(1, b);\n              }\n          };\n          v.checkMailbox = Sa;\n          var vb = [], Y = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), wb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], xb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n          function yb(a, b, c, d, h, g, k, t) {\n            return D ? V(16, 1, a, b, c, d, h, g, k, t) : -52;\n          }\n          function zb(a, b, c, d, h, g, k) {\n            if (D)\n              return V(17, 1, a, b, c, d, h, g, k);\n          }\n          var Ab = [], Bb = {}, Db = () => {\n            if (!Cb) {\n              var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ja || "./this.program" }, b;\n              for (b in Bb)\n                void 0 === Bb[b] ? delete a[b] : a[b] = Bb[b];\n              var c = [];\n              for (b in a)\n                c.push(`${b}=${a[b]}`);\n              Cb = c;\n            }\n            return Cb;\n          }, Cb;\n          function Eb(a, b) {\n            if (D)\n              return V(18, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = 0;\n            Db().forEach((d, h) => {\n              var g = b + c;\n              h = r()[a + 4 * h >>> 2 >>> 0] = g;\n              for (g = 0; g < d.length; ++g)\n                aa()[h++ >>> 0] = d.charCodeAt(g);\n              aa()[h >>> 0] = 0;\n              c += d.length + 1;\n            });\n            return 0;\n          }\n          function Ib(a, b) {\n            if (D)\n              return V(19, 1, a, b);\n            a >>>= 0;\n            b >>>= 0;\n            var c = Db();\n            r()[a >>> 2 >>> 0] = c.length;\n            var d = 0;\n            c.forEach((h) => d += h.length + 1);\n            r()[b >>> 2 >>> 0] = d;\n            return 0;\n          }\n          function Jb(a) {\n            return D ? V(20, 1, a) : 52;\n          }\n          function Kb(a, b, c, d) {\n            return D ? V(21, 1, a, b, c, d) : 52;\n          }\n          function Lb(a, b, c, d, h) {\n            return D ? V(22, 1, a, b, c, d, h) : 70;\n          }\n          var Mb = [null, [], []];\n          function Nb(a, b, c, d) {\n            if (D)\n              return V(23, 1, a, b, c, d);\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            for (var h = 0, g = 0; g < c; g++) {\n              var k = r()[b >>> 2 >>> 0], t = r()[b + 4 >>> 2 >>> 0];\n              b += 8;\n              for (var C = 0; C < t; C++) {\n                var w = n()[k + C >>> 0], y = Mb[a];\n                0 === w || 10 === w ? ((1 === a ? qa : J)(db(y, 0)), y.length = 0) : y.push(w);\n              }\n              h += t;\n            }\n            r()[d >>> 2 >>> 0] = h;\n            return 0;\n          }\n          var Ob = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Pb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n          function Qb(a) {\n            var b = Array(gb(a) + 1);\n            hb(a, b, 0, b.length);\n            return b;\n          }\n          var Rb = (a, b) => {\n            aa().set(a, b >>> 0);\n          };\n          function Sb(a, b, c, d) {\n            function h(f, q, u) {\n              for (f = "number" == typeof f ? f.toString() : f || ""; f.length < q; )\n                f = u[0] + f;\n              return f;\n            }\n            function g(f, q) {\n              return h(f, q, "0");\n            }\n            function k(f, q) {\n              function u(Fb) {\n                return 0 > Fb ? -1 : 0 < Fb ? 1 : 0;\n              }\n              var F;\n              0 === (F = u(f.getFullYear() - q.getFullYear())) && 0 === (F = u(f.getMonth() - q.getMonth())) && (F = u(f.getDate() - q.getDate()));\n              return F;\n            }\n            function t(f) {\n              switch (f.getDay()) {\n                case 0:\n                  return new Date(f.getFullYear() - 1, 11, 29);\n                case 1:\n                  return f;\n                case 2:\n                  return new Date(f.getFullYear(), 0, 3);\n                case 3:\n                  return new Date(\n                    f.getFullYear(),\n                    0,\n                    2\n                  );\n                case 4:\n                  return new Date(f.getFullYear(), 0, 1);\n                case 5:\n                  return new Date(f.getFullYear() - 1, 11, 31);\n                case 6:\n                  return new Date(f.getFullYear() - 1, 11, 30);\n              }\n            }\n            function C(f) {\n              var q = f.Qa;\n              for (f = new Date(new Date(f.Ra + 1900, 0, 1).getTime()); 0 < q; ) {\n                var u = f.getMonth(), F = (Y(f.getFullYear()) ? Ob : Pb)[u];\n                if (q > F - f.getDate())\n                  q -= F - f.getDate() + 1, f.setDate(1), 11 > u ? f.setMonth(u + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1));\n                else {\n                  f.setDate(f.getDate() + q);\n                  break;\n                }\n              }\n              u = new Date(f.getFullYear() + 1, 0, 4);\n              q = t(new Date(\n                f.getFullYear(),\n                0,\n                4\n              ));\n              u = t(u);\n              return 0 >= k(q, f) ? 0 >= k(u, f) ? f.getFullYear() + 1 : f.getFullYear() : f.getFullYear() - 1;\n            }\n            a >>>= 0;\n            b >>>= 0;\n            c >>>= 0;\n            d >>>= 0;\n            var w = r()[d + 40 >>> 2 >>> 0];\n            d = { kb: p()[d >>> 2 >>> 0], jb: p()[d + 4 >>> 2 >>> 0], Sa: p()[d + 8 >>> 2 >>> 0], Wa: p()[d + 12 >>> 2 >>> 0], Ta: p()[d + 16 >>> 2 >>> 0], Ra: p()[d + 20 >>> 2 >>> 0], Ma: p()[d + 24 >>> 2 >>> 0], Qa: p()[d + 28 >>> 2 >>> 0], qb: p()[d + 32 >>> 2 >>> 0], ib: p()[d + 36 >>> 2 >>> 0], lb: w ? Q(w) : "" };\n            c = Q(c);\n            w = {\n              "%c": "%a %b %d %H:%M:%S %Y",\n              "%D": "%m/%d/%y",\n              "%F": "%Y-%m-%d",\n              "%h": "%b",\n              "%r": "%I:%M:%S %p",\n              "%R": "%H:%M",\n              "%T": "%H:%M:%S",\n              "%x": "%m/%d/%y",\n              "%X": "%H:%M:%S",\n              "%Ec": "%c",\n              "%EC": "%C",\n              "%Ex": "%m/%d/%y",\n              "%EX": "%H:%M:%S",\n              "%Ey": "%y",\n              "%EY": "%Y",\n              "%Od": "%d",\n              "%Oe": "%e",\n              "%OH": "%H",\n              "%OI": "%I",\n              "%Om": "%m",\n              "%OM": "%M",\n              "%OS": "%S",\n              "%Ou": "%u",\n              "%OU": "%U",\n              "%OV": "%V",\n              "%Ow": "%w",\n              "%OW": "%W",\n              "%Oy": "%y"\n            };\n            for (var y in w)\n              c = c.replace(new RegExp(y, "g"), w[y]);\n            var Gb = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), Hb = "January February March April May June July August September October November December".split(" ");\n            w = {\n              "%a": (f) => Gb[f.Ma].substring(0, 3),\n              "%A": (f) => Gb[f.Ma],\n              "%b": (f) => Hb[f.Ta].substring(0, 3),\n              "%B": (f) => Hb[f.Ta],\n              "%C": (f) => g((f.Ra + 1900) / 100 | 0, 2),\n              "%d": (f) => g(f.Wa, 2),\n              "%e": (f) => h(f.Wa, 2, " "),\n              "%g": (f) => C(f).toString().substring(2),\n              "%G": C,\n              "%H": (f) => g(f.Sa, 2),\n              "%I": (f) => {\n                f = f.Sa;\n                0 == f ? f = 12 : 12 < f && (f -= 12);\n                return g(f, 2);\n              },\n              "%j": (f) => {\n                for (var q = 0, u = 0; u <= f.Ta - 1; q += (Y(f.Ra + 1900) ? Ob : Pb)[u++])\n                  ;\n                return g(f.Wa + q, 3);\n              },\n              "%m": (f) => g(f.Ta + 1, 2),\n              "%M": (f) => g(f.jb, 2),\n              "%n": () => "\\n",\n              "%p": (f) => 0 <= f.Sa && 12 > f.Sa ? "AM" : "PM",\n              "%S": (f) => g(f.kb, 2),\n              "%t": () => "	",\n              "%u": (f) => f.Ma || 7,\n              "%U": (f) => g(Math.floor((f.Qa + 7 - f.Ma) / 7), 2),\n              "%V": (f) => {\n                var q = Math.floor((f.Qa + 7 - (f.Ma + 6) % 7) / 7);\n                2 >= (f.Ma + 371 - f.Qa - 2) % 7 && q++;\n                if (q)\n                  53 == q && (u = (f.Ma + 371 - f.Qa) % 7, 4 == u || 3 == u && Y(f.Ra) || (q = 1));\n                else {\n                  q = 52;\n                  var u = (f.Ma + 7 - f.Qa - 1) % 7;\n                  (4 == u || 5 == u && Y(f.Ra % 400 - 1)) && q++;\n                }\n                return g(q, 2);\n              },\n              "%w": (f) => f.Ma,\n              "%W": (f) => g(Math.floor((f.Qa + 7 - (f.Ma + 6) % 7) / 7), 2),\n              "%y": (f) => (f.Ra + 1900).toString().substring(2),\n              "%Y": (f) => f.Ra + 1900,\n              "%z": (f) => {\n                f = f.ib;\n                var q = 0 <= f;\n                f = Math.abs(f) / 60;\n                return (q ? "+" : "-") + String("0000" + (f / 60 * 100 + f % 60)).slice(-4);\n              },\n              "%Z": (f) => f.lb,\n              "%%": () => "%"\n            };\n            c = c.replace(\n              /%%/g,\n              "\\0\\0"\n            );\n            for (y in w)\n              c.includes(y) && (c = c.replace(new RegExp(y, "g"), w[y](d)));\n            c = c.replace(/\\0\\0/g, "%");\n            y = Qb(c);\n            if (y.length > b)\n              return 0;\n            Rb(y, a);\n            return y.length - 1;\n          }\n          S.Va();\n          var Tb = [Ma, Na, ab, eb, fb, ib, jb, kb, lb, mb, nb, ob, pb, qb, rb, sb, yb, zb, Eb, Ib, Jb, Kb, Lb, Nb], Wb = {\n            b: function(a, b, c) {\n              a >>>= 0;\n              new Ya(a).Va(b >>> 0, c >>> 0);\n              Za = a;\n              $a++;\n              throw Za;\n            },\n            L: function(a) {\n              Ub(a >>> 0, !A, 1, !ka, 131072, false);\n              S.$a();\n            },\n            j: function(a) {\n              a >>>= 0;\n              D ? postMessage({ cmd: "cleanupThread", thread: a }) : S.Ya(S.La[a]);\n            },\n            H: bb,\n            h: eb,\n            S: fb,\n            D: ib,\n            F: jb,\n            T: kb,\n            Q: lb,\n            J: mb,\n            P: nb,\n            n: ob,\n            E: pb,\n            B: qb,\n            R: rb,\n            C: sb,\n            p: () => 1,\n            z: function(a, b) {\n              a >>>= 0;\n              a == b >>> 0 ? setTimeout(Sa) : D ? postMessage({ targetThread: a, cmd: "checkMailbox" }) : (a = S.La[a]) && a.postMessage({ cmd: "checkMailbox" });\n            },\n            I: function(a, b, c, d, h) {\n              b >>>= 0;\n              c >>>= 0;\n              vb.length = d;\n              h = h >>> 0 >>> 3;\n              for (var g = 0; g < d; g++)\n                vb[g] = ea()[h + g >>> 0];\n              a = b ? Ea[b] : Tb[a];\n              S.eb = c;\n              c = a(...vb);\n              S.eb = 0;\n              return c;\n            },\n            K: tb,\n            o: function(a) {\n              B && S.La[a >>> 0].ref();\n            },\n            s: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >>> 2 >>> 0] = a.getUTCSeconds();\n              p()[c + 4 >>> 2 >>> 0] = a.getUTCMinutes();\n              p()[c + 8 >>> 2 >>> 0] = a.getUTCHours();\n              p()[c + 12 >>> 2 >>> 0] = a.getUTCDate();\n              p()[c + 16 >>> 2 >>> 0] = a.getUTCMonth();\n              p()[c + 20 >>> 2 >>> 0] = a.getUTCFullYear() - 1900;\n              p()[c + 24 >>> 2 >>> 0] = a.getUTCDay();\n              a = (a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0;\n              p()[c + 28 >>> 2 >>> 0] = a;\n            },\n            t: function(a, b, c) {\n              a = b + 2097152 >>> 0 < 4194305 - !!a ? (a >>> 0) + 4294967296 * b : NaN;\n              c >>>= 0;\n              a = new Date(1e3 * a);\n              p()[c >>> 2 >>> 0] = a.getSeconds();\n              p()[c + 4 >>> 2 >>> 0] = a.getMinutes();\n              p()[c + 8 >>> 2 >>> 0] = a.getHours();\n              p()[c + 12 >>> 2 >>> 0] = a.getDate();\n              p()[c + 16 >>> 2 >>> 0] = a.getMonth();\n              p()[c + 20 >>> 2 >>> 0] = a.getFullYear() - 1900;\n              p()[c + 24 >>> 2 >>> 0] = a.getDay();\n              b = (Y(a.getFullYear()) ? wb : xb)[a.getMonth()] + a.getDate() - 1 | 0;\n              p()[c + 28 >>> 2 >>> 0] = b;\n              p()[c + 36 >>> 2 >>> 0] = -(60 * a.getTimezoneOffset());\n              b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();\n              var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();\n              a = (b != d && a.getTimezoneOffset() == Math.min(d, b)) | 0;\n              p()[c + 32 >>> 2 >>> 0] = a;\n            },\n            u: function(a) {\n              a >>>= 0;\n              var b = new Date(p()[a + 20 >>> 2 >>> 0] + 1900, p()[a + 16 >>> 2 >>> 0], p()[a + 12 >>> 2 >>> 0], p()[a + 8 >>> 2 >>> 0], p()[a + 4 >>> 2 >>> 0], p()[a >>> 2 >>> 0], 0), c = p()[a + 32 >>> 2 >>> 0], d = b.getTimezoneOffset(), h = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(), g = new Date(\n                b.getFullYear(),\n                0,\n                1\n              ).getTimezoneOffset(), k = Math.min(g, h);\n              0 > c ? p()[a + 32 >>> 2 >>> 0] = Number(h != g && k == d) : 0 < c != (k == d) && (h = Math.max(g, h), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : h) - d)));\n              p()[a + 24 >>> 2 >>> 0] = b.getDay();\n              c = (Y(b.getFullYear()) ? wb : xb)[b.getMonth()] + b.getDate() - 1 | 0;\n              p()[a + 28 >>> 2 >>> 0] = c;\n              p()[a >>> 2 >>> 0] = b.getSeconds();\n              p()[a + 4 >>> 2 >>> 0] = b.getMinutes();\n              p()[a + 8 >>> 2 >>> 0] = b.getHours();\n              p()[a + 12 >>> 2 >>> 0] = b.getDate();\n              p()[a + 16 >>> 2 >>> 0] = b.getMonth();\n              p()[a + 20 >>> 2 >>> 0] = b.getYear();\n              a = b.getTime();\n              a = isNaN(a) ? -1 : a / 1e3;\n              Vb((P = a, 1 <= +Math.abs(P) ? 0 < P ? +Math.floor(P / 4294967296) >>> 0 : ~~+Math.ceil((P - +(~~P >>> 0)) / 4294967296) >>> 0 : 0));\n              return a >>> 0;\n            },\n            q: yb,\n            r: zb,\n            y: function(a, b, c, d) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              d >>>= 0;\n              var h = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(h, 0, 1), k = new Date(h, 6, 1);\n              h = g.getTimezoneOffset();\n              var t = k.getTimezoneOffset(), C = Math.max(h, t);\n              r()[a >>> 2 >>> 0] = 60 * C;\n              p()[b >>> 2 >>> 0] = Number(h != t);\n              a = (w) => w.toLocaleTimeString(void 0, { hour12: false, timeZoneName: "short" }).split(" ")[1];\n              g = a(g);\n              k = a(k);\n              t < h ? (X(g, c, 17), X(k, d, 17)) : (X(g, d, 17), X(k, c, 17));\n            },\n            c: () => {\n              ya("");\n            },\n            O: function(a, b, c) {\n              a >>>= 0;\n              b >>>= 0;\n              c >>>= 0;\n              Ab.length = 0;\n              for (var d; d = n()[b++ >>> 0]; ) {\n                var h = 105 != d;\n                h &= 112 != d;\n                c += h && c % 8 ? 4 : 0;\n                Ab.push(112 == d ? r()[c >>> 2 >>> 0] : 105 == d ? p()[c >>> 2 >>> 0] : ea()[c >>> 3 >>> 0]);\n                c += h ? 8 : 4;\n              }\n              return Ea[a](...Ab);\n            },\n            k: () => {\n            },\n            i: () => Date.now(),\n            U: () => {\n              T += 1;\n              throw "unwind";\n            },\n            A: function() {\n              return 4294901760;\n            },\n            e: () => performance.timeOrigin + performance.now(),\n            f: () => B ? (init_os(), __toCommonJS(os_exports)).cpus().length : navigator.hardwareConcurrency,\n            x: function(a) {\n              a >>>= 0;\n              var b = n().length;\n              if (a <= b || 4294901760 < a)\n                return false;\n              for (var c = 1; 4 >= c; c *= 2) {\n                var d = b * (1 + 0.2 / c);\n                d = Math.min(d, a + 100663296);\n                var h = Math;\n                d = Math.max(a, d);\n                a: {\n                  h = (h.min.call(h, 4294901760, d + (65536 - d % 65536) % 65536) - e.buffer.byteLength + 65535) / 65536;\n                  try {\n                    e.grow(h);\n                    m();\n                    var g = 1;\n                    break a;\n                  } catch (k) {\n                  }\n                  g = void 0;\n                }\n                if (g)\n                  return true;\n              }\n              return false;\n            },\n            M: Eb,\n            N: Ib,\n            G: Oa,\n            g: Jb,\n            m: Kb,\n            v: Lb,\n            l: Nb,\n            a: e || v.wasmMemory,\n            w: Sb,\n            d: function(a, b, c, d) {\n              return Sb(a >>> 0, b >>> 0, c >>> 0, d >>> 0);\n            }\n          }, Z = function() {\n            function a(c, d) {\n              Z = c.exports;\n              Z = Xb();\n              S.ab.push(Z.ya);\n              Wa = Z.za;\n              ua.unshift(Z.V);\n              ra = d;\n              xa();\n              return Z;\n            }\n            var b = { a: Wb };\n            M++;\n            if (v.instantiateWasm)\n              try {\n                return v.instantiateWasm(\n                  b,\n                  a\n                );\n              } catch (c) {\n                J(`Module.instantiateWasm callback failed with error: ${c}`), x(c);\n              }\n            Da(b, function(c) {\n              a(c.instance, c.module);\n            }).catch(x);\n            return {};\n          }();\n          v._OrtInit = (a, b) => (v._OrtInit = Z.W)(a, b);\n          v._OrtGetLastError = (a, b) => (v._OrtGetLastError = Z.X)(a, b);\n          v._OrtCreateSessionOptions = (a, b, c, d, h, g, k, t, C, w) => (v._OrtCreateSessionOptions = Z.Y)(a, b, c, d, h, g, k, t, C, w);\n          v._OrtAppendExecutionProvider = (a, b) => (v._OrtAppendExecutionProvider = Z.Z)(a, b);\n          v._OrtAddFreeDimensionOverride = (a, b, c) => (v._OrtAddFreeDimensionOverride = Z._)(a, b, c);\n          v._OrtAddSessionConfigEntry = (a, b, c) => (v._OrtAddSessionConfigEntry = Z.$)(a, b, c);\n          v._OrtReleaseSessionOptions = (a) => (v._OrtReleaseSessionOptions = Z.aa)(a);\n          v._OrtCreateSession = (a, b, c) => (v._OrtCreateSession = Z.ba)(a, b, c);\n          v._OrtReleaseSession = (a) => (v._OrtReleaseSession = Z.ca)(a);\n          v._OrtGetInputOutputCount = (a, b, c) => (v._OrtGetInputOutputCount = Z.da)(a, b, c);\n          v._OrtGetInputName = (a, b) => (v._OrtGetInputName = Z.ea)(a, b);\n          v._OrtGetOutputName = (a, b) => (v._OrtGetOutputName = Z.fa)(a, b);\n          v._OrtFree = (a) => (v._OrtFree = Z.ga)(a);\n          v._OrtCreateTensor = (a, b, c, d, h, g) => (v._OrtCreateTensor = Z.ha)(a, b, c, d, h, g);\n          v._OrtGetTensorData = (a, b, c, d, h) => (v._OrtGetTensorData = Z.ia)(a, b, c, d, h);\n          v._OrtReleaseTensor = (a) => (v._OrtReleaseTensor = Z.ja)(a);\n          v._OrtCreateRunOptions = (a, b, c, d) => (v._OrtCreateRunOptions = Z.ka)(a, b, c, d);\n          v._OrtAddRunConfigEntry = (a, b, c) => (v._OrtAddRunConfigEntry = Z.la)(a, b, c);\n          v._OrtReleaseRunOptions = (a) => (v._OrtReleaseRunOptions = Z.ma)(a);\n          v._OrtCreateBinding = (a) => (v._OrtCreateBinding = Z.na)(a);\n          v._OrtBindInput = (a, b, c) => (v._OrtBindInput = Z.oa)(a, b, c);\n          v._OrtBindOutput = (a, b, c, d) => (v._OrtBindOutput = Z.pa)(a, b, c, d);\n          v._OrtClearBoundOutputs = (a) => (v._OrtClearBoundOutputs = Z.qa)(a);\n          v._OrtReleaseBinding = (a) => (v._OrtReleaseBinding = Z.ra)(a);\n          v._OrtRunWithBinding = (a, b, c, d, h) => (v._OrtRunWithBinding = Z.sa)(a, b, c, d, h);\n          v._OrtRun = (a, b, c, d, h, g, k, t) => (v._OrtRun = Z.ta)(a, b, c, d, h, g, k, t);\n          v._OrtEndProfiling = (a) => (v._OrtEndProfiling = Z.ua)(a);\n          var W = v._pthread_self = () => (W = v._pthread_self = Z.va)();\n          v._malloc = (a) => (v._malloc = Z.wa)(a);\n          v._free = (a) => (v._free = Z.xa)(a);\n          v.__emscripten_tls_init = () => (v.__emscripten_tls_init = Z.ya)();\n          var Ub = v.__emscripten_thread_init = (a, b, c, d, h, g) => (Ub = v.__emscripten_thread_init = Z.Aa)(a, b, c, d, h, g);\n          v.__emscripten_thread_crashed = () => (v.__emscripten_thread_crashed = Z.Ba)();\n          var La = (a, b, c, d, h) => (La = Z.Ca)(a, b, c, d, h), Ra = (a) => (Ra = Z.Da)(a), Xa = v.__emscripten_thread_exit = (a) => (Xa = v.__emscripten_thread_exit = Z.Ea)(a), ub = () => (ub = Z.Fa)(), Vb = (a) => (Vb = Z.Ga)(a), Ua = (a, b) => (Ua = Z.Ha)(a, b), U = (a) => (U = Z.Ia)(a), Ka = (a) => (Ka = Z.Ja)(a), Ia = () => (Ia = Z.Ka)();\n          function Xb() {\n            var a = Z;\n            a = Object.assign({}, a);\n            var b = (d) => () => d() >>> 0, c = (d) => (h) => d(h) >>> 0;\n            a.va = b(a.va);\n            a.wa = c(a.wa);\n            a.emscripten_main_runtime_thread_id = b(a.emscripten_main_runtime_thread_id);\n            a.Ja = c(a.Ja);\n            a.Ka = b(a.Ka);\n            return a;\n          }\n          v.wasmMemory = e;\n          v.stackSave = () => Ia();\n          v.stackRestore = (a) => U(a);\n          v.stackAlloc = (a) => Ka(a);\n          v.keepRuntimeAlive = () => 0 < T;\n          v.UTF8ToString = Q;\n          v.stringToUTF8 = X;\n          v.lengthBytesUTF8 = gb;\n          v.ExitStatus = R;\n          v.PThread = S;\n          var Yb;\n          N = function Zb() {\n            Yb || $b();\n            Yb || (N = Zb);\n          };\n          function $b() {\n            if (!(0 < M))\n              if (D)\n                ha(v), D || Ta(ua), startWorker(v);\n              else {\n                if (v.preRun)\n                  for ("function" == typeof v.preRun && (v.preRun = [v.preRun]); v.preRun.length; )\n                    ta.unshift(v.preRun.shift());\n                Ta(ta);\n                0 < M || Yb || (Yb = true, v.calledRun = true, K || (D || Ta(ua), ha(v), D || Ta(va)));\n              }\n          }\n          $b();\n          return readyPromise;\n        };\n      })();\n      if (typeof exports === "object" && typeof module === "object")\n        module.exports = ortWasmThreaded;\n      else if (typeof define === "function" && define["amd"])\n        define([], () => ortWasmThreaded);\n    }\n  });\n\n  // web/lib/wasm/binding/ort-wasm-threaded.worker.js\n  var require_ort_wasm_threaded_worker = __commonJS({\n    "web/lib/wasm/binding/ort-wasm-threaded.worker.js"(exports, module) {\n      module.exports = \'"use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",data=>onmessage({data:data}));var fs=require("fs");var vm=require("vm");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:f=>vm.runInThisContext(fs.readFileSync(f,"utf8"),{filename:f}),postMessage:msg=>parentPort.postMessage(msg),performance:global.performance||{now:Date.now}})}var initializedJS=false;function threadPrintErr(...args){var text=args.join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\\\\n");return}console.error(text)}function threadAlert(...args){var text=args.join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var module=Module["wasmModule"];Module["wasmModule"]=null;var instance=new WebAssembly.Instance(module,info);return receiveInstance(instance)};self.onunhandledrejection=e=>{throw e.reason||e};function handleMessage(e){try{if(e.data.cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);self.startWorker=instance=>{Module=instance;postMessage({"cmd":"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};Module["wasmModule"]=e.data.wasmModule;for(const handler of e.data.handlers){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler:handler,args:args})}}Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;if(typeof e.data.urlOrBlob=="string"){importScripts(e.data.urlOrBlob)}else{var objectUrl=URL.createObjectURL(e.data.urlOrBlob);importScripts(objectUrl);URL.revokeObjectURL(objectUrl)}ortWasmThreaded(Module)}else if(e.data.cmd==="run"){Module["__emscripten_thread_init"](e.data.pthread_ptr,/*is_main=*/0,/*is_runtime=*/0,/*can_block=*/1);Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="checkMailbox"){if(initializedJS){Module["checkMailbox"]()}}else if(e.data.cmd){err(`worker.js received unknown command ${e.data.cmd}`);err(e.data)}}catch(ex){Module["__emscripten_thread_crashed"]?.();throw ex}}self.onmessage=handleMessage;\\n\';\n    }\n  });\n\n  // nodejs-ignore:node:path\n  var join = void 0;\n\n  // web/lib/wasm/wasm-factory.ts\n  var ortWasmFactory;\n  if (true) {\n    ortWasmFactory = require_ort_training_wasm_simd();\n  } else {\n    ortWasmFactory = true ? null : null;\n  }\n  var ortWasmFactoryThreaded = true ? true ? require_ort_wasm_threaded() : null : ortWasmFactory;\n  var wasm;\n  var initialized = false;\n  var initializing = false;\n  var aborted = false;\n  var isMultiThreadSupported = (numThreads) => {\n    if (numThreads === 1) {\n      return false;\n    }\n    if (typeof SharedArrayBuffer === "undefined") {\n      if (typeof self !== "undefined" && !self.crossOriginIsolated) {\n        console.warn(\n          "env.wasm.numThreads is set to " + numThreads + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."\n        );\n      }\n      return false;\n    }\n    if (typeof process !== "undefined" && process.versions && process.versions.node) {\n      console.warn(\n        "env.wasm.numThreads is set to " + numThreads + ", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios."\n      );\n    }\n    try {\n      if (typeof MessageChannel !== "undefined") {\n        new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));\n      }\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        5,\n        4,\n        1,\n        3,\n        1,\n        1,\n        10,\n        11,\n        1,\n        9,\n        0,\n        65,\n        0,\n        254,\n        16,\n        2,\n        0,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var isSimdSupported = () => {\n    try {\n      return WebAssembly.validate(new Uint8Array([\n        0,\n        97,\n        115,\n        109,\n        1,\n        0,\n        0,\n        0,\n        1,\n        4,\n        1,\n        96,\n        0,\n        0,\n        3,\n        2,\n        1,\n        0,\n        10,\n        30,\n        1,\n        28,\n        0,\n        65,\n        0,\n        253,\n        15,\n        253,\n        12,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        0,\n        253,\n        186,\n        1,\n        26,\n        11\n      ]));\n    } catch (e) {\n      return false;\n    }\n  };\n  var getWasmFileName = (useSimd, useThreads) => {\n    if (useSimd) {\n      if (true) {\n        return "ort-training-wasm-simd.wasm";\n      }\n      return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";\n    } else {\n      return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";\n    }\n  };\n  var initializeWebAssembly = async (flags) => {\n    if (initialized) {\n      return Promise.resolve();\n    }\n    if (initializing) {\n      throw new Error("multiple calls to \'initializeWebAssembly()\' detected.");\n    }\n    if (aborted) {\n      throw new Error("previous call to \'initializeWebAssembly()\' failed.");\n    }\n    initializing = true;\n    const timeout = flags.initTimeout;\n    const numThreads = flags.numThreads;\n    const simd = flags.simd;\n    const useThreads = isMultiThreadSupported(numThreads);\n    const useSimd = simd && isSimdSupported();\n    const wasmPaths = flags.wasmPaths;\n    const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;\n    const wasmFileName = getWasmFileName(useSimd, useThreads);\n    const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;\n    let isTimeout = false;\n    const tasks = [];\n    if (timeout > 0) {\n      tasks.push(new Promise((resolve) => {\n        setTimeout(() => {\n          isTimeout = true;\n          resolve();\n        }, timeout);\n      }));\n    }\n    tasks.push(new Promise((resolve, reject) => {\n      const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;\n      const config = {\n        locateFile: (fileName, scriptDirectory) => {\n          if (useThreads && fileName.endsWith(".worker.js") && typeof Blob !== "undefined") {\n            return URL.createObjectURL(new Blob(\n              [\n                // This require() function is handled by esbuild plugin to load file content as string.\n                // eslint-disable-next-line @typescript-eslint/no-require-imports\n                require_ort_wasm_threaded_worker()\n              ],\n              { type: "text/javascript" }\n            ));\n          }\n          if (fileName.endsWith(".wasm")) {\n            if (wasmPathOverride) {\n              return wasmPathOverride;\n            }\n            const prefix = wasmPrefixOverride ?? scriptDirectory;\n            if (false) {\n              if (wasmFileName === "ort-wasm-simd.wasm") {\n                return prefix + "ort-wasm-simd.jsep.wasm";\n              } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {\n                return prefix + "ort-wasm-simd-threaded.jsep.wasm";\n              }\n            }\n            return prefix + wasmFileName;\n          }\n          return scriptDirectory + fileName;\n        }\n      };\n      if (useThreads) {\n        config.numThreads = numThreads;\n        if (typeof Blob === "undefined") {\n          config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");\n        } else {\n          const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;\n          config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });\n        }\n      }\n      factory(config).then(\n        // wasm module initialized successfully\n        (module) => {\n          initializing = false;\n          initialized = true;\n          wasm = module;\n          resolve();\n        },\n        // wasm module failed to initialize\n        (what) => {\n          initializing = false;\n          aborted = true;\n          reject(what);\n        }\n      );\n    }));\n    await Promise.race(tasks);\n    if (isTimeout) {\n      throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);\n    }\n  };\n  var getInstance = () => {\n    if (initialized && wasm) {\n      return wasm;\n    }\n    throw new Error("WebAssembly is not initialized yet.");\n  };\n\n  // web/lib/wasm/wasm-utils.ts\n  var allocWasmString = (data, allocs) => {\n    const wasm2 = getInstance();\n    const dataLength = wasm2.lengthBytesUTF8(data) + 1;\n    const dataOffset = wasm2._malloc(dataLength);\n    wasm2.stringToUTF8(data, dataOffset, dataLength);\n    allocs.push(dataOffset);\n    return dataOffset;\n  };\n  var iterateExtraOptions = (options, prefix, seen, handler) => {\n    if (typeof options == "object" && options !== null) {\n      if (seen.has(options)) {\n        throw new Error("Circular reference in options");\n      } else {\n        seen.add(options);\n      }\n    }\n    Object.entries(options).forEach(([key, value]) => {\n      const name = prefix ? prefix + key : key;\n      if (typeof value === "object") {\n        iterateExtraOptions(value, name + ".", seen, handler);\n      } else if (typeof value === "string" || typeof value === "number") {\n        handler(name, value.toString());\n      } else if (typeof value === "boolean") {\n        handler(name, value ? "1" : "0");\n      } else {\n        throw new Error(`Can\'t handle extra config type: ${typeof value}`);\n      }\n    });\n  };\n  var checkLastError = (message) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const paramsOffset = wasm2.stackAlloc(8);\n      wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);\n      const errorCode = wasm2.HEAP32[paramsOffset / 4];\n      const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];\n      const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";\n      throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n\n  // web/lib/wasm/run-options.ts\n  var setRunOptions = (options) => {\n    const wasm2 = getInstance();\n    let runOptionsHandle = 0;\n    const allocs = [];\n    const runOptions = options || {};\n    try {\n      if (options?.logSeverityLevel === void 0) {\n        runOptions.logSeverityLevel = 2;\n      } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);\n      }\n      if (options?.logVerbosityLevel === void 0) {\n        runOptions.logVerbosityLevel = 0;\n      } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {\n        throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);\n      }\n      if (options?.terminate === void 0) {\n        runOptions.terminate = false;\n      }\n      let tagDataOffset = 0;\n      if (options?.tag !== void 0) {\n        tagDataOffset = allocWasmString(options.tag, allocs);\n      }\n      runOptionsHandle = wasm2._OrtCreateRunOptions(\n        runOptions.logSeverityLevel,\n        runOptions.logVerbosityLevel,\n        !!runOptions.terminate,\n        tagDataOffset\n      );\n      if (runOptionsHandle === 0) {\n        checkLastError("Can\'t create run options.");\n      }\n      if (options?.extra !== void 0) {\n        iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a run config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [runOptionsHandle, allocs];\n    } catch (e) {\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/session-options.ts\n  var getGraphOptimzationLevel = (graphOptimizationLevel) => {\n    switch (graphOptimizationLevel) {\n      case "disabled":\n        return 0;\n      case "basic":\n        return 1;\n      case "extended":\n        return 2;\n      case "all":\n        return 99;\n      default:\n        throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);\n    }\n  };\n  var getExecutionMode = (executionMode) => {\n    switch (executionMode) {\n      case "sequential":\n        return 0;\n      case "parallel":\n        return 1;\n      default:\n        throw new Error(`unsupported execution mode: ${executionMode}`);\n    }\n  };\n  var appendDefaultOptions = (options) => {\n    if (!options.extra) {\n      options.extra = {};\n    }\n    if (!options.extra.session) {\n      options.extra.session = {};\n    }\n    const session = options.extra.session;\n    if (!session.use_ort_model_bytes_directly) {\n      session.use_ort_model_bytes_directly = "1";\n    }\n    if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {\n      options.enableMemPattern = false;\n    }\n  };\n  var setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {\n    for (const ep of executionProviders) {\n      let epName = typeof ep === "string" ? ep : ep.name;\n      switch (epName) {\n        case "webnn":\n          epName = "WEBNN";\n          if (typeof ep !== "string") {\n            const webnnOptions = ep;\n            if (webnnOptions?.deviceType) {\n              const keyDataOffset = allocWasmString("deviceType", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'deviceType\' - ${webnnOptions.deviceType}.`);\n              }\n            }\n            if (webnnOptions?.numThreads) {\n              let numThreads = webnnOptions.numThreads;\n              if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {\n                numThreads = 0;\n              }\n              const keyDataOffset = allocWasmString("numThreads", allocs);\n              const valueDataOffset = allocWasmString(numThreads.toString(), allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(`Can\'t set a session config entry: \'numThreads\' - ${webnnOptions.numThreads}.`);\n              }\n            }\n            if (webnnOptions?.powerPreference) {\n              const keyDataOffset = allocWasmString("powerPreference", allocs);\n              const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'powerPreference\' - ${webnnOptions.powerPreference}.`\n                );\n              }\n            }\n          }\n          break;\n        case "webgpu":\n          epName = "JS";\n          if (typeof ep !== "string") {\n            const webgpuOptions = ep;\n            if (webgpuOptions?.preferredLayout) {\n              if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {\n                throw new Error(`preferredLayout must be either \'NCHW\' or \'NHWC\': ${webgpuOptions.preferredLayout}`);\n              }\n              const keyDataOffset = allocWasmString("preferredLayout", allocs);\n              const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);\n              if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n                checkLastError(\n                  `Can\'t set a session config entry: \'preferredLayout\' - ${webgpuOptions.preferredLayout}.`\n                );\n              }\n            }\n          }\n          break;\n        case "wasm":\n        case "cpu":\n          continue;\n        default:\n          throw new Error(`not supported execution provider: ${epName}`);\n      }\n      const epNameDataOffset = allocWasmString(epName, allocs);\n      if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {\n        checkLastError(`Can\'t append execution provider: ${epName}.`);\n      }\n    }\n  };\n  var setSessionOptions = (options) => {\n    const wasm2 = getInstance();\n    let sessionOptionsHandle = 0;\n    const allocs = [];\n    const sessionOptions = options || {};\n    appendDefaultOptions(sessionOptions);\n    try {\n      const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");\n      const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");\n      const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;\n      const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;\n      if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {\n        throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);\n      }\n      const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;\n      if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {\n        throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);\n      }\n      const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;\n      sessionOptionsHandle = wasm2._OrtCreateSessionOptions(\n        graphOptimizationLevel,\n        !!sessionOptions.enableCpuMemArena,\n        !!sessionOptions.enableMemPattern,\n        executionMode,\n        !!sessionOptions.enableProfiling,\n        0,\n        logIdDataOffset,\n        logSeverityLevel,\n        logVerbosityLevel,\n        optimizedModelFilePathOffset\n      );\n      if (sessionOptionsHandle === 0) {\n        checkLastError("Can\'t create session options.");\n      }\n      if (sessionOptions.executionProviders) {\n        setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);\n      }\n      if (sessionOptions.enableGraphCapture !== void 0) {\n        if (typeof sessionOptions.enableGraphCapture !== "boolean") {\n          throw new Error(`enableGraphCapture must be a boolean value: ${sessionOptions.enableGraphCapture}`);\n        }\n        const keyDataOffset = allocWasmString("enableGraphCapture", allocs);\n        const valueDataOffset = allocWasmString(sessionOptions.enableGraphCapture.toString(), allocs);\n        if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n          checkLastError(\n            `Can\'t set a session config entry: \'enableGraphCapture\' - ${sessionOptions.enableGraphCapture}.`\n          );\n        }\n      }\n      if (sessionOptions.freeDimensionOverrides) {\n        for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {\n          if (typeof name !== "string") {\n            throw new Error(`free dimension override name must be a string: ${name}`);\n          }\n          if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {\n            throw new Error(`free dimension override value must be a non-negative integer: ${value}`);\n          }\n          const nameOffset = allocWasmString(name, allocs);\n          if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {\n            checkLastError(`Can\'t set a free dimension override: ${name} - ${value}.`);\n          }\n        }\n      }\n      if (sessionOptions.extra !== void 0) {\n        iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {\n          const keyDataOffset = allocWasmString(key, allocs);\n          const valueDataOffset = allocWasmString(value, allocs);\n          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {\n            checkLastError(`Can\'t set a session config entry: ${key} - ${value}.`);\n          }\n        });\n      }\n      return [sessionOptionsHandle, allocs];\n    } catch (e) {\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      throw e;\n    }\n  };\n\n  // web/lib/wasm/wasm-common.ts\n  var tensorDataTypeStringToEnum = (type) => {\n    switch (type) {\n      case "int8":\n        return 3 /* int8 */;\n      case "uint8":\n        return 2 /* uint8 */;\n      case "bool":\n        return 9 /* bool */;\n      case "int16":\n        return 5 /* int16 */;\n      case "uint16":\n        return 4 /* uint16 */;\n      case "int32":\n        return 6 /* int32 */;\n      case "uint32":\n        return 12 /* uint32 */;\n      case "float16":\n        return 10 /* float16 */;\n      case "float32":\n        return 1 /* float */;\n      case "float64":\n        return 11 /* double */;\n      case "string":\n        return 8 /* string */;\n      case "int64":\n        return 7 /* int64 */;\n      case "uint64":\n        return 13 /* uint64 */;\n      default:\n        throw new Error(`unsupported data type: ${type}`);\n    }\n  };\n  var tensorDataTypeEnumToString = (typeProto) => {\n    switch (typeProto) {\n      case 3 /* int8 */:\n        return "int8";\n      case 2 /* uint8 */:\n        return "uint8";\n      case 9 /* bool */:\n        return "bool";\n      case 5 /* int16 */:\n        return "int16";\n      case 4 /* uint16 */:\n        return "uint16";\n      case 6 /* int32 */:\n        return "int32";\n      case 12 /* uint32 */:\n        return "uint32";\n      case 10 /* float16 */:\n        return "float16";\n      case 1 /* float */:\n        return "float32";\n      case 11 /* double */:\n        return "float64";\n      case 8 /* string */:\n        return "string";\n      case 7 /* int64 */:\n        return "int64";\n      case 13 /* uint64 */:\n        return "uint64";\n      default:\n        throw new Error(`unsupported data type: ${typeProto}`);\n    }\n  };\n  var getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];\n  var tensorTypeToTypedArrayConstructor = (type) => {\n    switch (type) {\n      case "float16":\n        return typeof Float16Array !== "undefined" && Float16Array.from ? Float16Array : Uint16Array;\n      case "float32":\n        return Float32Array;\n      case "uint8":\n        return Uint8Array;\n      case "int8":\n        return Int8Array;\n      case "uint16":\n        return Uint16Array;\n      case "int16":\n        return Int16Array;\n      case "int32":\n        return Int32Array;\n      case "bool":\n        return Uint8Array;\n      case "float64":\n        return Float64Array;\n      case "uint32":\n        return Uint32Array;\n      case "int64":\n        return BigInt64Array;\n      case "uint64":\n        return BigUint64Array;\n      default:\n        throw new Error(`unsupported type: ${type}`);\n    }\n  };\n  var logLevelStringToEnum = (logLevel) => {\n    switch (logLevel) {\n      case "verbose":\n        return 0;\n      case "info":\n        return 1;\n      case "warning":\n        return 2;\n      case "error":\n        return 3;\n      case "fatal":\n        return 4;\n      default:\n        throw new Error(`unsupported logging level: ${logLevel}`);\n    }\n  };\n  var isGpuBufferSupportedType = (type) => type === "float32" || type === "float16" || type === "int32" || type === "int64" || type === "uint32" || type === "uint8" || type === "bool";\n  var dataLocationStringToEnum = (location) => {\n    switch (location) {\n      case "none":\n        return 0;\n      case "cpu":\n        return 1;\n      case "cpu-pinned":\n        return 2;\n      case "texture":\n        return 3;\n      case "gpu-buffer":\n        return 4;\n      default:\n        throw new Error(`unsupported data location: ${location}`);\n    }\n  };\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  init_fs();\n\n  // nodejs-ignore:node:fs/promises\n  var readFile2 = void 0;\n\n  // web/lib/wasm/wasm-utils-load-file.ts\n  var loadFile = async (file) => {\n    if (typeof file === "string") {\n      if (typeof process !== "undefined" && process.versions && process.versions.node) {\n        try {\n          return new Uint8Array(await readFile2(file));\n        } catch (e) {\n          if (e.code === "ERR_FS_FILE_TOO_LARGE") {\n            const stream = createReadStream(file);\n            const chunks = [];\n            for await (const chunk of stream) {\n              chunks.push(chunk);\n            }\n            return new Uint8Array(Buffer.concat(chunks));\n          }\n          throw e;\n        }\n      } else {\n        const response = await fetch(file);\n        if (!response.ok) {\n          throw new Error(`failed to load external data file: ${file}`);\n        }\n        const contentLengthHeader = response.headers.get("Content-Length");\n        const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;\n        if (fileSize < 1073741824) {\n          return new Uint8Array(await response.arrayBuffer());\n        } else {\n          if (!response.body) {\n            throw new Error(`failed to load external data file: ${file}, no response body.`);\n          }\n          const reader = response.body.getReader();\n          let buffer;\n          try {\n            buffer = new ArrayBuffer(fileSize);\n          } catch (e) {\n            if (e instanceof RangeError) {\n              const pages = Math.ceil(fileSize / 65536);\n              buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;\n            } else {\n              throw e;\n            }\n          }\n          let offset = 0;\n          while (true) {\n            const { done, value } = await reader.read();\n            if (done) {\n              break;\n            }\n            const chunkSize = value.byteLength;\n            const chunk = new Uint8Array(buffer, offset, chunkSize);\n            chunk.set(value);\n            offset += chunkSize;\n          }\n          return new Uint8Array(buffer, 0, fileSize);\n        }\n      }\n    } else if (file instanceof Blob) {\n      return new Uint8Array(await file.arrayBuffer());\n    } else if (file instanceof Uint8Array) {\n      return file;\n    } else {\n      return new Uint8Array(file);\n    }\n  };\n\n  // web/lib/wasm/wasm-core-impl.ts\n  var initOrt = (numThreads, loggingLevel) => {\n    const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);\n    if (errorCode !== 0) {\n      checkLastError("Can\'t initialize onnxruntime.");\n    }\n  };\n  var initRuntime = async (env) => {\n    initOrt(env.wasm.numThreads, logLevelStringToEnum(env.logLevel));\n  };\n  var initEp = async (env, epName) => {\n    if (false) {\n      const initJsep = null.init;\n      if (epName === "webgpu") {\n        if (typeof navigator === "undefined" || !navigator.gpu) {\n          throw new Error("WebGPU is not supported in current environment");\n        }\n        let adapter = env.webgpu.adapter;\n        if (!adapter) {\n          const powerPreference = env.webgpu.powerPreference;\n          if (powerPreference !== void 0 && powerPreference !== "low-power" && powerPreference !== "high-performance") {\n            throw new Error(`Invalid powerPreference setting: "${powerPreference}"`);\n          }\n          const forceFallbackAdapter = env.webgpu.forceFallbackAdapter;\n          if (forceFallbackAdapter !== void 0 && typeof forceFallbackAdapter !== "boolean") {\n            throw new Error(`Invalid forceFallbackAdapter setting: "${forceFallbackAdapter}"`);\n          }\n          adapter = await navigator.gpu.requestAdapter({ powerPreference, forceFallbackAdapter });\n          if (!adapter) {\n            throw new Error(\n              \'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.\'\n            );\n          }\n        } else {\n          if (typeof adapter.limits !== "object" || typeof adapter.features !== "object" || typeof adapter.requestDevice !== "function") {\n            throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");\n          }\n        }\n        if (!env.wasm.simd) {\n          throw new Error(\n            "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"\n          );\n        }\n        await initJsep("webgpu", getInstance(), env, adapter);\n      }\n      if (epName === "webnn") {\n        if (typeof navigator === "undefined" || !navigator.ml) {\n          throw new Error("WebNN is not supported in current environment");\n        }\n        await initJsep("webnn", getInstance(), env);\n      }\n    }\n  };\n  var activeSessions = /* @__PURE__ */ new Map();\n  var getSessionInputOutputCount = (sessionHandle) => {\n    const wasm2 = getInstance();\n    const stack = wasm2.stackSave();\n    try {\n      const dataOffset = wasm2.stackAlloc(8);\n      const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);\n      if (errorCode !== 0) {\n        checkLastError("Can\'t get session input/output count.");\n      }\n      return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var copyFromExternalBuffer = (model) => {\n    const wasm2 = getInstance();\n    const modelDataOffset = wasm2._malloc(model.byteLength);\n    if (modelDataOffset === 0) {\n      throw new Error(`Can\'t create a session. failed to allocate a buffer of size ${model.byteLength}.`);\n    }\n    wasm2.HEAPU8.set(model, modelDataOffset);\n    return [modelDataOffset, model.byteLength];\n  };\n  var createSession = async (modelData, options) => {\n    let modelDataOffset, modelDataLength;\n    const wasm2 = getInstance();\n    if (Array.isArray(modelData)) {\n      [modelDataOffset, modelDataLength] = modelData;\n    } else if (modelData.buffer === wasm2.HEAPU8.buffer) {\n      [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];\n    } else {\n      [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);\n    }\n    let sessionHandle = 0;\n    let sessionOptionsHandle = 0;\n    let ioBindingHandle = 0;\n    let allocs = [];\n    const inputNamesUTF8Encoded = [];\n    const outputNamesUTF8Encoded = [];\n    try {\n      [sessionOptionsHandle, allocs] = setSessionOptions(options);\n      if (options?.externalData && wasm2.mountExternalData) {\n        const loadingPromises = [];\n        for (const file of options.externalData) {\n          const path = typeof file === "string" ? file : file.path;\n          loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {\n            wasm2.mountExternalData(path, data);\n          }));\n        }\n        await Promise.all(loadingPromises);\n      }\n      sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);\n      if (sessionHandle === 0) {\n        checkLastError("Can\'t create a session.");\n      }\n      const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);\n      const enableGraphCapture = !!options?.enableGraphCapture;\n      const inputNames = [];\n      const outputNames = [];\n      const outputPreferredLocations = [];\n      for (let i = 0; i < inputCount; i++) {\n        const name = wasm2._OrtGetInputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an input name.");\n        }\n        inputNamesUTF8Encoded.push(name);\n        inputNames.push(wasm2.UTF8ToString(name));\n      }\n      for (let i = 0; i < outputCount; i++) {\n        const name = wasm2._OrtGetOutputName(sessionHandle, i);\n        if (name === 0) {\n          checkLastError("Can\'t get an output name.");\n        }\n        outputNamesUTF8Encoded.push(name);\n        const nameString = wasm2.UTF8ToString(name);\n        outputNames.push(nameString);\n        if (false) {\n          if (enableGraphCapture && options?.preferredOutputLocation === void 0) {\n            outputPreferredLocations.push("gpu-buffer");\n            continue;\n          }\n          const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";\n          if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}.`);\n          }\n          if (enableGraphCapture && location !== "gpu-buffer") {\n            throw new Error(`Not supported preferred output location: ${location}. Only \'gpu-buffer\' location is supported when enableGraphCapture is true.`);\n          }\n          outputPreferredLocations.push(location);\n        }\n      }\n      let bindingState = null;\n      if (false) {\n        ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);\n        if (ioBindingHandle === 0) {\n          checkLastError("Can\'t create IO binding.");\n        }\n        bindingState = {\n          handle: ioBindingHandle,\n          outputPreferredLocations,\n          outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))\n        };\n      }\n      activeSessions.set(\n        sessionHandle,\n        [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState, enableGraphCapture, false]\n      );\n      return [sessionHandle, inputNames, outputNames];\n    } catch (e) {\n      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n      if (ioBindingHandle !== 0) {\n        wasm2._OrtReleaseBinding(ioBindingHandle);\n      }\n      if (sessionHandle !== 0) {\n        wasm2._OrtReleaseSession(sessionHandle);\n      }\n      throw e;\n    } finally {\n      wasm2._free(modelDataOffset);\n      if (sessionOptionsHandle !== 0) {\n        wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);\n      }\n      allocs.forEach((alloc) => wasm2._free(alloc));\n      wasm2.unmountExternalData?.();\n    }\n  };\n  var releaseSession = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot release session. invalid session id: ${sessionId}`);\n    }\n    const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture] = session;\n    if (ioBindingState) {\n      if (enableGraphCapture) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n      }\n      wasm2._OrtReleaseBinding(ioBindingState.handle);\n    }\n    wasm2.jsepOnReleaseSession?.(sessionId);\n    inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));\n    wasm2._OrtReleaseSession(sessionHandle);\n    activeSessions.delete(sessionId);\n  };\n  var prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index, enableGraphCapture = false) => {\n    if (!tensor) {\n      tensorHandles.push(0);\n      return;\n    }\n    const wasm2 = getInstance();\n    const dataType = tensor[0];\n    const dims = tensor[1];\n    const location = tensor[3];\n    let rawData;\n    let dataByteLength;\n    if (dataType === "string" && location === "gpu-buffer") {\n      throw new Error("String tensor is not supported on GPU.");\n    }\n    if (enableGraphCapture && location !== "gpu-buffer") {\n      throw new Error(\n        `External buffer must be provided for input/output index ${index} when enableGraphCapture is true.`\n      );\n    }\n    if (location === "gpu-buffer") {\n      const gpuBuffer = tensor[2].gpuBuffer;\n      const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));\n      dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;\n      const registerBuffer = wasm2.jsepRegisterBuffer;\n      if (!registerBuffer) {\n        throw new Error(\'Tensor location "gpu-buffer" is not supported without using WebGPU.\');\n      }\n      rawData = registerBuffer(sessionId, index, gpuBuffer, dataByteLength);\n    } else {\n      const data = tensor[2];\n      if (Array.isArray(data)) {\n        dataByteLength = 4 * data.length;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        let dataIndex = rawData / 4;\n        for (let i = 0; i < data.length; i++) {\n          if (typeof data[i] !== "string") {\n            throw new TypeError(`tensor data at index ${i} is not a string`);\n          }\n          wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);\n        }\n      } else {\n        dataByteLength = data.byteLength;\n        rawData = wasm2._malloc(dataByteLength);\n        allocs.push(rawData);\n        wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);\n      }\n    }\n    const stack = wasm2.stackSave();\n    const dimsOffset = wasm2.stackAlloc(4 * dims.length);\n    try {\n      let dimIndex = dimsOffset / 4;\n      dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);\n      const tensor2 = wasm2._OrtCreateTensor(\n        tensorDataTypeStringToEnum(dataType),\n        rawData,\n        dataByteLength,\n        dimsOffset,\n        dims.length,\n        dataLocationStringToEnum(location)\n      );\n      if (tensor2 === 0) {\n        checkLastError(`Can\'t create tensor for input/output. session=${sessionId}, index=${index}.`);\n      }\n      tensorHandles.push(tensor2);\n    } finally {\n      wasm2.stackRestore(stack);\n    }\n  };\n  var run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error(`cannot run inference. invalid session id: ${sessionId}`);\n    }\n    const sessionHandle = session[0];\n    const inputNamesUTF8Encoded = session[1];\n    const outputNamesUTF8Encoded = session[2];\n    const ioBindingState = session[3];\n    const enableGraphCapture = session[4];\n    const inputOutputBound = session[5];\n    const inputCount = inputIndices.length;\n    const outputCount = outputIndices.length;\n    let runOptionsHandle = 0;\n    let runOptionsAllocs = [];\n    const inputTensorHandles = [];\n    const outputTensorHandles = [];\n    const inputOutputAllocs = [];\n    const beforeRunStack = wasm2.stackSave();\n    const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);\n    const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);\n    const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);\n    const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);\n    try {\n      [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);\n      for (let i = 0; i < inputCount; i++) {\n        prepareInputOutputTensor(\n          inputTensors[i],\n          inputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputIndices[i],\n          enableGraphCapture\n        );\n      }\n      for (let i = 0; i < outputCount; i++) {\n        prepareInputOutputTensor(\n          outputTensors[i],\n          outputTensorHandles,\n          inputOutputAllocs,\n          sessionId,\n          inputCount + outputIndices[i],\n          enableGraphCapture\n        );\n      }\n      let inputValuesIndex = inputValuesOffset / 4;\n      let inputNamesIndex = inputNamesOffset / 4;\n      let outputValuesIndex = outputValuesOffset / 4;\n      let outputNamesIndex = outputNamesOffset / 4;\n      for (let i = 0; i < inputCount; i++) {\n        wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];\n        wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];\n      }\n      for (let i = 0; i < outputCount; i++) {\n        wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];\n        wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];\n      }\n      if (false) {\n        const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;\n        if (inputNamesUTF8Encoded.length !== inputCount) {\n          throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model\'s input count (${inputNamesUTF8Encoded.length}).`);\n        }\n        for (let i = 0; i < inputCount; i++) {\n          const index = inputIndices[i];\n          const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t bind input[${i}] for session=${sessionId}.`);\n          }\n        }\n        for (let i = 0; i < outputCount; i++) {\n          const index = outputIndices[i];\n          const location = outputTensors[i]?.[3];\n          if (location) {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind pre-allocated output[${i}] for session=${sessionId}.`);\n            }\n          } else {\n            const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);\n            if (errorCode2 !== 0) {\n              checkLastError(`Can\'t bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);\n            }\n          }\n        }\n        activeSessions.set(\n          sessionId,\n          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, true]\n        );\n      }\n      wasm2.jsepOnRunStart?.(sessionHandle);\n      let errorCode;\n      if (false) {\n        errorCode = await wasm2._OrtRunWithBinding(\n          sessionHandle,\n          ioBindingState.handle,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      } else {\n        errorCode = await wasm2._OrtRun(\n          sessionHandle,\n          inputNamesOffset,\n          inputValuesOffset,\n          inputCount,\n          outputNamesOffset,\n          outputCount,\n          outputValuesOffset,\n          runOptionsHandle\n        );\n      }\n      if (errorCode !== 0) {\n        checkLastError("failed to call OrtRun().");\n      }\n      const output = [];\n      for (let i = 0; i < outputCount; i++) {\n        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];\n        if (tensor === outputTensorHandles[i]) {\n          output.push(outputTensors[i]);\n          continue;\n        }\n        const beforeGetTensorDataStack = wasm2.stackSave();\n        const tensorDataOffset = wasm2.stackAlloc(4 * 4);\n        let keepOutputTensor = false;\n        let type, dataOffset = 0;\n        try {\n          const errorCode2 = wasm2._OrtGetTensorData(\n            tensor,\n            tensorDataOffset,\n            tensorDataOffset + 4,\n            tensorDataOffset + 8,\n            tensorDataOffset + 12\n          );\n          if (errorCode2 !== 0) {\n            checkLastError(`Can\'t access output tensor data on index ${i}.`);\n          }\n          let tensorDataIndex = tensorDataOffset / 4;\n          const dataType = wasm2.HEAPU32[tensorDataIndex++];\n          dataOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];\n          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];\n          const dims = [];\n          for (let i2 = 0; i2 < dimsLength; i2++) {\n            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);\n          }\n          wasm2._OrtFree(dimsOffset);\n          const size = dims.reduce((a, b) => a * b, 1);\n          type = tensorDataTypeEnumToString(dataType);\n          const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];\n          if (type === "string") {\n            if (preferredLocation === "gpu-buffer") {\n              throw new Error("String tensor is not supported on GPU.");\n            }\n            const stringData = [];\n            let dataIndex = dataOffset / 4;\n            for (let i2 = 0; i2 < size; i2++) {\n              const offset = wasm2.HEAPU32[dataIndex++];\n              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;\n              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));\n            }\n            output.push([type, dims, stringData, "cpu"]);\n          } else {\n            if (preferredLocation === "gpu-buffer" && size > 0) {\n              const getBuffer = wasm2.jsepGetBuffer;\n              if (!getBuffer) {\n                throw new Error(\'preferredLocation "gpu-buffer" is not supported without using WebGPU.\');\n              }\n              const gpuBuffer = getBuffer(dataOffset);\n              const elementSize = getTensorElementSize(dataType);\n              if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {\n                throw new Error(`Unsupported data type: ${type}`);\n              }\n              keepOutputTensor = true;\n              output.push([\n                type,\n                dims,\n                {\n                  gpuBuffer,\n                  download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),\n                  dispose: () => {\n                    wasm2._OrtReleaseTensor(tensor);\n                  }\n                },\n                "gpu-buffer"\n              ]);\n            } else {\n              const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);\n              const data = new typedArrayConstructor(size);\n              new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));\n              output.push([type, dims, data, "cpu"]);\n            }\n          }\n        } finally {\n          wasm2.stackRestore(beforeGetTensorDataStack);\n          if (type === "string" && dataOffset) {\n            wasm2._free(dataOffset);\n          }\n          if (!keepOutputTensor) {\n            wasm2._OrtReleaseTensor(tensor);\n          }\n        }\n      }\n      if (ioBindingState && !enableGraphCapture) {\n        wasm2._OrtClearBoundOutputs(ioBindingState.handle);\n        activeSessions.set(\n          sessionId,\n          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, false]\n        );\n      }\n      return output;\n    } finally {\n      wasm2.stackRestore(beforeRunStack);\n      inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));\n      inputOutputAllocs.forEach((p) => wasm2._free(p));\n      if (runOptionsHandle !== 0) {\n        wasm2._OrtReleaseRunOptions(runOptionsHandle);\n      }\n      runOptionsAllocs.forEach((p) => wasm2._free(p));\n    }\n  };\n  var endProfiling = (sessionId) => {\n    const wasm2 = getInstance();\n    const session = activeSessions.get(sessionId);\n    if (!session) {\n      throw new Error("invalid session id");\n    }\n    const sessionHandle = session[0];\n    const profileFileName = wasm2._OrtEndProfiling(sessionHandle);\n    if (profileFileName === 0) {\n      checkLastError("Can\'t get an profile file name.");\n    }\n    wasm2._OrtFree(profileFileName);\n  };\n  var extractTransferableBuffers = (tensors) => {\n    const buffers = [];\n    for (const tensor of tensors) {\n      const data = tensor[2];\n      if (!Array.isArray(data) && "buffer" in data) {\n        buffers.push(data.buffer);\n      }\n    }\n    return buffers;\n  };\n\n  // web/lib/wasm/proxy-worker/main.ts\n  self.onmessage = (ev) => {\n    const { type, in: message } = ev.data;\n    try {\n      switch (type) {\n        case "init-wasm":\n          initializeWebAssembly(message.wasm).then(\n            () => {\n              initRuntime(message).then(\n                () => {\n                  postMessage({ type });\n                },\n                (err) => {\n                  postMessage({ type, err });\n                }\n              );\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        case "init-ep": {\n          const { epName, env } = message;\n          initEp(env, epName).then(\n            () => {\n              postMessage({ type });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "copy-from": {\n          const { buffer } = message;\n          const bufferData = copyFromExternalBuffer(buffer);\n          postMessage({ type, out: bufferData });\n          break;\n        }\n        case "create": {\n          const { model, options } = message;\n          createSession(model, options).then(\n            (sessionMetadata) => {\n              postMessage({ type, out: sessionMetadata });\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "release":\n          releaseSession(message);\n          postMessage({ type });\n          break;\n        case "run": {\n          const { sessionId, inputIndices, inputs, outputIndices, options } = message;\n          run(sessionId, inputIndices, inputs, outputIndices, new Array(outputIndices.length).fill(null), options).then(\n            (outputs) => {\n              if (outputs.some((o) => o[3] !== "cpu")) {\n                postMessage({ type, err: "Proxy does not support non-cpu tensor location." });\n              } else {\n                postMessage(\n                  { type, out: outputs },\n                  extractTransferableBuffers([...inputs, ...outputs])\n                );\n              }\n            },\n            (err) => {\n              postMessage({ type, err });\n            }\n          );\n          break;\n        }\n        case "end-profiling":\n          endProfiling(message);\n          postMessage({ type });\n          break;\n        default:\n      }\n    } catch (err) {\n      postMessage({ type, err });\n    }\n  };\n})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZWpzLWlnbm9yZTpmcyIsICJub2RlanMtaWdub3JlOnBhdGgiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzIiwgIm5vZGVqcy1pZ25vcmU6d29ya2VyX3RocmVhZHMiLCAibm9kZWpzLWlnbm9yZTpwZXJmX2hvb2tzIiwgIm5vZGVqcy1pZ25vcmU6b3MiLCAiLi4vLi4vbGliL3dhc20vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcyIsICIuLi8uLi9saWIvd2FzbS9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcyIsICJub2RlanMtaWdub3JlOm5vZGU6cGF0aCIsICIuLi8uLi9saWIvd2FzbS93YXNtLWZhY3RvcnkudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy50cyIsICIuLi8uLi9saWIvd2FzbS9ydW4tb3B0aW9ucy50cyIsICIuLi8uLi9saWIvd2FzbS9zZXNzaW9uLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1jb21tb24udHMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS11dGlscy1sb2FkLWZpbGUudHMiLCAibm9kZWpzLWlnbm9yZTpub2RlOmZzL3Byb21pc2VzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tY29yZS1pbXBsLnRzIiwgIi4uLy4uL2xpYi93YXNtL3Byb3h5LXdvcmtlci9tYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIlxudmFyIG9ydFdhc20gPSAoKCkgPT4ge1xuICB2YXIgX3NjcmlwdERpciA9IHR5cGVvZiBkb2N1bWVudCAhPSAndW5kZWZpbmVkJyA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQ/LnNyYyA6IHVuZGVmaW5lZDtcbiAgaWYgKHR5cGVvZiBfX2ZpbGVuYW1lICE9ICd1bmRlZmluZWQnKSBfc2NyaXB0RGlyIHx8PSBfX2ZpbGVuYW1lO1xuICByZXR1cm4gKFxuZnVuY3Rpb24obW9kdWxlQXJnID0ge30pIHtcblxudmFyIGU9bW9kdWxlQXJnLGssbCxyZWFkeVByb21pc2U9bmV3IFByb21pc2UoKGEsYik9PntrPWE7bD1ifSksdT1PYmplY3QuYXNzaWduKHt9LGUpLHY9XCIuL3RoaXMucHJvZ3JhbVwiLGFhPVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3csdz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpbXBvcnRTY3JpcHRzLGJhPVwib2JqZWN0XCI9PXR5cGVvZiBwcm9jZXNzJiZcIm9iamVjdFwiPT10eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyYmXCJzdHJpbmdcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMubm9kZSx6PVwiXCIsQSxCLEM7XG5pZihiYSl7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKSxEPXJlcXVpcmUoXCJwYXRoXCIpO3o9dz9ELmRpcm5hbWUoeikrXCIvXCI6X19kaXJuYW1lK1wiL1wiO0E9KGEsYik9PnthPUUoYSk/bmV3IFVSTChhKTpELm5vcm1hbGl6ZShhKTtyZXR1cm4gZnMucmVhZEZpbGVTeW5jKGEsYj92b2lkIDA6XCJ1dGY4XCIpfTtDPWE9PnthPUEoYSwhMCk7YS5idWZmZXJ8fChhPW5ldyBVaW50OEFycmF5KGEpKTtyZXR1cm4gYX07Qj0oYSxiLGMsZD0hMCk9PnthPUUoYSk/bmV3IFVSTChhKTpELm5vcm1hbGl6ZShhKTtmcy5yZWFkRmlsZShhLGQ/dm9pZCAwOlwidXRmOFwiLChnLGgpPT57Zz9jKGcpOmIoZD9oLmJ1ZmZlcjpoKX0pfTshZS50aGlzUHJvZ3JhbSYmMTxwcm9jZXNzLmFyZ3YubGVuZ3RoJiYodj1wcm9jZXNzLmFyZ3ZbMV0ucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSk7cHJvY2Vzcy5hcmd2LnNsaWNlKDIpfWVsc2UgaWYoYWF8fHcpdz96PXNlbGYubG9jYXRpb24uaHJlZjpcInVuZGVmaW5lZFwiIT10eXBlb2YgZG9jdW1lbnQmJlxuZG9jdW1lbnQuY3VycmVudFNjcmlwdCYmKHo9ZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMpLF9zY3JpcHREaXImJih6PV9zY3JpcHREaXIpLHouc3RhcnRzV2l0aChcImJsb2I6XCIpP3o9XCJcIjp6PXouc3Vic3RyKDAsei5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKSxBPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0sdyYmKEM9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLEI9KGEsYixjKT0+e3ZhciBkPW5ldyBYTUxIdHRwUmVxdWVzdDtkLm9wZW4oXCJHRVRcIixhLCEwKTtkLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7ZC5vbmxvYWQ9KCk9PnsyMDA9PWQuc3RhdHVzfHwwPT1kLnN0YXR1cyYmXG5kLnJlc3BvbnNlP2IoZC5yZXNwb25zZSk6YygpfTtkLm9uZXJyb3I9YztkLnNlbmQobnVsbCl9O3ZhciBjYT1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLEY9Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpO09iamVjdC5hc3NpZ24oZSx1KTt1PW51bGw7dmFyIEcsZGE9ITEsSCxJLEosSyxlYTtmdW5jdGlvbiBmYSgpe3ZhciBhPUcuYnVmZmVyO2UuSEVBUDg9SD1uZXcgSW50OEFycmF5KGEpO2UuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO2UuSEVBUFU4PUk9bmV3IFVpbnQ4QXJyYXkoYSk7ZS5IRUFQVTE2PW5ldyBVaW50MTZBcnJheShhKTtlLkhFQVAzMj1KPW5ldyBJbnQzMkFycmF5KGEpO2UuSEVBUFUzMj1LPW5ldyBVaW50MzJBcnJheShhKTtlLkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTtlLkhFQVBGNjQ9ZWE9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgTD1bXSxNPVtdLGhhPVtdLE49MCxPPW51bGwsUD1udWxsO1xuZnVuY3Rpb24gaWEoYSl7YT1cIkFib3J0ZWQoXCIrYStcIilcIjtGKGEpO2RhPSEwO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTtsKGEpO3Rocm93IGE7fXZhciBqYT1hPT5hLnN0YXJ0c1dpdGgoXCJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsXCIpLEU9YT0+YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKSxRO1E9XCJvcnQtdHJhaW5pbmctd2FzbS1zaW1kLndhc21cIjtpZighamEoUSkpe3ZhciBrYT1RO1E9ZS5sb2NhdGVGaWxlP2UubG9jYXRlRmlsZShrYSx6KTp6K2thfWZ1bmN0aW9uIGxhKGEpe2lmKEMpcmV0dXJuIEMoYSk7dGhyb3dcImJvdGggYXN5bmMgYW5kIHN5bmMgZmV0Y2hpbmcgb2YgdGhlIHdhc20gZmFpbGVkXCI7fVxuZnVuY3Rpb24gbWEoYSl7aWYoYWF8fHcpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGZldGNoJiYhRShhKSlyZXR1cm4gZmV0Y2goYSx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihiPT57aWYoIWIub2spdGhyb3dgZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnJHthfSdgO3JldHVybiBiLmFycmF5QnVmZmVyKCl9KS5jYXRjaCgoKT0+bGEoYSkpO2lmKEIpcmV0dXJuIG5ldyBQcm9taXNlKChiLGMpPT57QihhLGQ9PmIobmV3IFVpbnQ4QXJyYXkoZCkpLGMpfSl9cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCk9PmxhKGEpKX1mdW5jdGlvbiBuYShhLGIsYyl7cmV0dXJuIG1hKGEpLnRoZW4oZD0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZCxiKSkudGhlbihjLGQ9PntGKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7aWEoZCl9KX1cbmZ1bmN0aW9uIG9hKGEsYil7dmFyIGM9UTtyZXR1cm5cImZ1bmN0aW9uXCIhPXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZ3x8amEoYyl8fEUoYyl8fGJhfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD9uYShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihnKXtGKGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtnfWApO0YoXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4gbmEoYyxhLGIpfSkpfVxudmFyIFIscGE9ezg2OTcwNDooYSxiLGMsZCk9PntpZihcInVuZGVmaW5lZFwiPT10eXBlb2YgZXx8IWUuTGEpcmV0dXJuIDE7YT1TKGE+Pj4wKTthLnN0YXJ0c1dpdGgoXCIuL1wiKSYmKGE9YS5zdWJzdHJpbmcoMikpO2E9ZS5MYS5nZXQoYSk7aWYoIWEpcmV0dXJuIDI7Yj4+Pj0wO2M+Pj49MDtpZihiK2M+YS5ieXRlTGVuZ3RoKXJldHVybiAzO3RyeXtyZXR1cm4gSS5zZXQoYS5zdWJhcnJheShiLGIrYyksZD4+PjA+Pj4wKSwwfWNhdGNoe3JldHVybiA0fX19O2NsYXNzIHFhe2NvbnN0cnVjdG9yKGEpe3RoaXMuSmE9YS0yNH19XG52YXIgcmE9MCxzYT0wLHRhPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGY4XCIpOnZvaWQgMCx1YT0oYSxiLGMpPT57Yj4+Pj0wO3ZhciBkPWIrYztmb3IoYz1iO2FbY10mJiEoYz49ZCk7KSsrYztpZigxNjxjLWImJmEuYnVmZmVyJiZ0YSlyZXR1cm4gdGEuZGVjb2RlKGEuc3ViYXJyYXkoYixjKSk7Zm9yKGQ9XCJcIjtiPGM7KXt2YXIgZz1hW2IrK107aWYoZyYxMjgpe3ZhciBoPWFbYisrXSY2MztpZigxOTI9PShnJjIyNCkpZCs9U3RyaW5nLmZyb21DaGFyQ29kZSgoZyYzMSk8PDZ8aCk7ZWxzZXt2YXIgbT1hW2IrK10mNjM7Zz0yMjQ9PShnJjI0MCk/KGcmMTUpPDwxMnxoPDw2fG06KGcmNyk8PDE4fGg8PDEyfG08PDZ8YVtiKytdJjYzOzY1NTM2Pmc/ZCs9U3RyaW5nLmZyb21DaGFyQ29kZShnKTooZy09NjU1MzYsZCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxnPj4xMCw1NjMyMHxnJjEwMjMpKX19ZWxzZSBkKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGcpfXJldHVybiBkfSxcblM9KGEsYik9PihhPj4+PTApP3VhKEksYSxiKTpcIlwiLHZhPWE9Pntmb3IodmFyIGI9MCxjPTA7YzxhLmxlbmd0aDsrK2Mpe3ZhciBkPWEuY2hhckNvZGVBdChjKTsxMjc+PWQ/YisrOjIwNDc+PWQ/Yis9Mjo1NTI5Njw9ZCYmNTczNDM+PWQ/KGIrPTQsKytjKTpiKz0zfXJldHVybiBifSxUPShhLGIsYyxkKT0+e2M+Pj49MDtpZighKDA8ZCkpcmV0dXJuIDA7dmFyIGc9YztkPWMrZC0xO2Zvcih2YXIgaD0wO2g8YS5sZW5ndGg7KytoKXt2YXIgbT1hLmNoYXJDb2RlQXQoaCk7aWYoNTUyOTY8PW0mJjU3MzQzPj1tKXt2YXIgcT1hLmNoYXJDb2RlQXQoKytoKTttPTY1NTM2KygobSYxMDIzKTw8MTApfHEmMTAyM31pZigxMjc+PW0pe2lmKGM+PWQpYnJlYWs7YltjKys+Pj4wXT1tfWVsc2V7aWYoMjA0Nz49bSl7aWYoYysxPj1kKWJyZWFrO2JbYysrPj4+MF09MTkyfG0+PjZ9ZWxzZXtpZig2NTUzNT49bSl7aWYoYysyPj1kKWJyZWFrO2JbYysrPj4+MF09MjI0fG0+PjEyfWVsc2V7aWYoYyszPj1cbmQpYnJlYWs7YltjKys+Pj4wXT0yNDB8bT4+MTg7YltjKys+Pj4wXT0xMjh8bT4+MTImNjN9YltjKys+Pj4wXT0xMjh8bT4+NiY2M31iW2MrKz4+PjBdPTEyOHxtJjYzfX1iW2M+Pj4wXT0wO3JldHVybiBjLWd9LFU9YT0+MD09PWElNCYmKDAhPT1hJTEwMHx8MD09PWElNDAwKSx6YT1bMCwzMSw2MCw5MSwxMjEsMTUyLDE4MiwyMTMsMjQ0LDI3NCwzMDUsMzM1XSxBYT1bMCwzMSw1OSw5MCwxMjAsMTUxLDE4MSwyMTIsMjQzLDI3MywzMDQsMzM0XSxWPVtdLFc9e30sQmE9KCk9PntpZighWCl7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFwiX1wiKStcIi5VVEYtOFwiLF86dnx8XCIuL3RoaXMucHJvZ3JhbVwifSxiO2ZvcihiIGluIFcpdm9pZCAwPT09XG5XW2JdP2RlbGV0ZSBhW2JdOmFbYl09V1tiXTt2YXIgYz1bXTtmb3IoYiBpbiBhKWMucHVzaChgJHtifT0ke2FbYl19YCk7WD1jfXJldHVybiBYfSxYLENhPVtudWxsLFtdLFtdXSxEYT1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLEVhPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gRmEoYSl7dmFyIGI9QXJyYXkodmEoYSkrMSk7VChhLGIsMCxiLmxlbmd0aCk7cmV0dXJuIGJ9XG5mdW5jdGlvbiBHYShhLGIsYyxkKXtmdW5jdGlvbiBnKGYsbixwKXtmb3IoZj1cIm51bWJlclwiPT10eXBlb2YgZj9mLnRvU3RyaW5nKCk6Znx8XCJcIjtmLmxlbmd0aDxuOylmPXBbMF0rZjtyZXR1cm4gZn1mdW5jdGlvbiBoKGYsbil7cmV0dXJuIGcoZixuLFwiMFwiKX1mdW5jdGlvbiBtKGYsbil7ZnVuY3Rpb24gcCh3YSl7cmV0dXJuIDA+d2E/LTE6MDx3YT8xOjB9dmFyIHk7MD09PSh5PXAoZi5nZXRGdWxsWWVhcigpLW4uZ2V0RnVsbFllYXIoKSkpJiYwPT09KHk9cChmLmdldE1vbnRoKCktbi5nZXRNb250aCgpKSkmJih5PXAoZi5nZXREYXRlKCktbi5nZXREYXRlKCkpKTtyZXR1cm4geX1mdW5jdGlvbiBxKGYpe3N3aXRjaChmLmdldERheSgpKXtjYXNlIDA6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKS0xLDExLDI5KTtjYXNlIDE6cmV0dXJuIGY7Y2FzZSAyOnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksMCwzKTtjYXNlIDM6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSxcbjAsMik7Y2FzZSA0OnJldHVybiBuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksMCwxKTtjYXNlIDU6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKS0xLDExLDMxKTtjYXNlIDY6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKS0xLDExLDMwKX19ZnVuY3Rpb24geChmKXt2YXIgbj1mLkZhO2ZvcihmPW5ldyBEYXRlKChuZXcgRGF0ZShmLkdhKzE5MDAsMCwxKSkuZ2V0VGltZSgpKTswPG47KXt2YXIgcD1mLmdldE1vbnRoKCkseT0oVShmLmdldEZ1bGxZZWFyKCkpP0RhOkVhKVtwXTtpZihuPnktZi5nZXREYXRlKCkpbi09eS1mLmdldERhdGUoKSsxLGYuc2V0RGF0ZSgxKSwxMT5wP2Yuc2V0TW9udGgocCsxKTooZi5zZXRNb250aCgwKSxmLnNldEZ1bGxZZWFyKGYuZ2V0RnVsbFllYXIoKSsxKSk7ZWxzZXtmLnNldERhdGUoZi5nZXREYXRlKCkrbik7YnJlYWt9fXA9bmV3IERhdGUoZi5nZXRGdWxsWWVhcigpKzEsMCw0KTtuPXEobmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCw0KSk7cD1xKHApO3JldHVybiAwPj1tKG4sZik/MD49bShwLGYpP2YuZ2V0RnVsbFllYXIoKSsxOmYuZ2V0RnVsbFllYXIoKTpmLmdldEZ1bGxZZWFyKCktMX1hPj4+PTA7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7dmFyIHI9S1tkKzQwPj4+Mj4+PjBdO2Q9e09hOkpbZD4+PjI+Pj4wXSxOYTpKW2QrND4+PjI+Pj4wXSxIYTpKW2QrOD4+PjI+Pj4wXSxLYTpKW2QrMTI+Pj4yPj4+MF0sSWE6SltkKzE2Pj4+Mj4+PjBdLEdhOkpbZCsyMD4+PjI+Pj4wXSxBYTpKW2QrMjQ+Pj4yPj4+MF0sRmE6SltkKzI4Pj4+Mj4+PjBdLFFhOkpbZCszMj4+PjI+Pj4wXSxNYTpKW2QrMzY+Pj4yPj4+MF0sUGE6cj9TKHIpOlwiXCJ9O2M9UyhjKTtyPXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXCIlWFwiOlwiJUg6JU06JVNcIixcblwiJUVjXCI6XCIlY1wiLFwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIHQgaW4gciljPWMucmVwbGFjZShuZXcgUmVnRXhwKHQsXCJnXCIpLHJbdF0pO3ZhciB4YT1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLHlhPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTtyPXtcIiVhXCI6Zj0+eGFbZi5BYV0uc3Vic3RyaW5nKDAsMyksXCIlQVwiOmY9PnhhW2YuQWFdLFxuXCIlYlwiOmY9PnlhW2YuSWFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT55YVtmLklhXSxcIiVDXCI6Zj0+aCgoZi5HYSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6Zj0+aChmLkthLDIpLFwiJWVcIjpmPT5nKGYuS2EsMixcIiBcIiksXCIlZ1wiOmY9PngoZikudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOngsXCIlSFwiOmY9PmgoZi5IYSwyKSxcIiVJXCI6Zj0+e2Y9Zi5IYTswPT1mP2Y9MTI6MTI8ZiYmKGYtPTEyKTtyZXR1cm4gaChmLDIpfSxcIiVqXCI6Zj0+e2Zvcih2YXIgbj0wLHA9MDtwPD1mLklhLTE7bis9KFUoZi5HYSsxOTAwKT9EYTpFYSlbcCsrXSk7cmV0dXJuIGgoZi5LYStuLDMpfSxcIiVtXCI6Zj0+aChmLklhKzEsMiksXCIlTVwiOmY9PmgoZi5OYSwyKSxcIiVuXCI6KCk9PlwiXFxuXCIsXCIlcFwiOmY9PjA8PWYuSGEmJjEyPmYuSGE/XCJBTVwiOlwiUE1cIixcIiVTXCI6Zj0+aChmLk9hLDIpLFwiJXRcIjooKT0+XCJcXHRcIixcIiV1XCI6Zj0+Zi5BYXx8NyxcIiVVXCI6Zj0+aChNYXRoLmZsb29yKChmLkZhKzctZi5BYSkvNyksMiksXCIlVlwiOmY9Plxue3ZhciBuPU1hdGguZmxvb3IoKGYuRmErNy0oZi5BYSs2KSU3KS83KTsyPj0oZi5BYSszNzEtZi5GYS0yKSU3JiZuKys7aWYobik1Mz09biYmKHA9KGYuQWErMzcxLWYuRmEpJTcsND09cHx8Mz09cCYmVShmLkdhKXx8KG49MSkpO2Vsc2V7bj01Mjt2YXIgcD0oZi5BYSs3LWYuRmEtMSklNzsoND09cHx8NT09cCYmVShmLkdhJTQwMC0xKSkmJm4rK31yZXR1cm4gaChuLDIpfSxcIiV3XCI6Zj0+Zi5BYSxcIiVXXCI6Zj0+aChNYXRoLmZsb29yKChmLkZhKzctKGYuQWErNiklNykvNyksMiksXCIleVwiOmY9PihmLkdhKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjpmPT5mLkdhKzE5MDAsXCIlelwiOmY9PntmPWYuTWE7dmFyIG49MDw9ZjtmPU1hdGguYWJzKGYpLzYwO3JldHVybihuP1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKGYvNjAqMTAwK2YlNjApKS5zbGljZSgtNCl9LFwiJVpcIjpmPT5mLlBhLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFwiXFx4MDBcXHgwMFwiKTtmb3IodCBpbiByKWMuaW5jbHVkZXModCkmJlxuKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAodCxcImdcIiksclt0XShkKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7dD1GYShjKTtpZih0Lmxlbmd0aD5iKXJldHVybiAwO0guc2V0KHQsYT4+PjApO3JldHVybiB0Lmxlbmd0aC0xfVxudmFyIElhPXthOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7dmFyIGQ9bmV3IHFhKGEpO0tbZC5KYSsxNj4+PjI+Pj4wXT0wO0tbZC5KYSs0Pj4+Mj4+PjBdPWI+Pj4wO0tbZC5KYSs4Pj4+Mj4+PjBdPWM+Pj4wO3JhPWE7c2ErKzt0aHJvdyByYTt9LGU6ZnVuY3Rpb24oKXtyZXR1cm4gMH0sSDpmdW5jdGlvbigpe30seDpmdW5jdGlvbigpe30sejpmdW5jdGlvbigpe30sSjpmdW5jdGlvbigpe3JldHVybiAwfSxGOmZ1bmN0aW9uKCl7fSxBOmZ1bmN0aW9uKCl7fSxFOmZ1bmN0aW9uKCl7fSxnOmZ1bmN0aW9uKCl7fSx5OmZ1bmN0aW9uKCl7fSx2OmZ1bmN0aW9uKCl7fSxHOmZ1bmN0aW9uKCl7fSx3OmZ1bmN0aW9uKCl7fSxrOigpPT4xLEk6ZnVuY3Rpb24oYSxiLGMpe2I+Pj49MDtyZXR1cm4gSS5jb3B5V2l0aGluKGE+Pj4wPj4+MCxiPj4+MCxiKyhjPj4+MCk+Pj4wKX0sbjpmdW5jdGlvbihhLGIsYyl7YT1iKzIwOTcxNTI+Pj4wPDQxOTQzMDUtISFhPyhhPj4+MCkrNDI5NDk2NzI5NipiOlxuTmFOO2M+Pj49MDthPW5ldyBEYXRlKDFFMyphKTtKW2M+Pj4yPj4+MF09YS5nZXRVVENTZWNvbmRzKCk7SltjKzQ+Pj4yPj4+MF09YS5nZXRVVENNaW51dGVzKCk7SltjKzg+Pj4yPj4+MF09YS5nZXRVVENIb3VycygpO0pbYysxMj4+PjI+Pj4wXT1hLmdldFVUQ0RhdGUoKTtKW2MrMTY+Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO0pbYysyMD4+PjI+Pj4wXT1hLmdldFVUQ0Z1bGxZZWFyKCktMTkwMDtKW2MrMjQ+Pj4yPj4+MF09YS5nZXRVVENEYXkoKTtKW2MrMjg+Pj4yPj4+MF09KGEuZ2V0VGltZSgpLURhdGUuVVRDKGEuZ2V0VVRDRnVsbFllYXIoKSwwLDEsMCwwLDAsMCkpLzg2NEU1fDB9LG86ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO0pbYz4+PjI+Pj4wXT1hLmdldFNlY29uZHMoKTtKW2MrND4+PjI+Pj4wXT1hLmdldE1pbnV0ZXMoKTtKW2MrOD4+PjI+Pj5cbjBdPWEuZ2V0SG91cnMoKTtKW2MrMTI+Pj4yPj4+MF09YS5nZXREYXRlKCk7SltjKzE2Pj4+Mj4+PjBdPWEuZ2V0TW9udGgoKTtKW2MrMjA+Pj4yPj4+MF09YS5nZXRGdWxsWWVhcigpLTE5MDA7SltjKzI0Pj4+Mj4+PjBdPWEuZ2V0RGF5KCk7SltjKzI4Pj4+Mj4+PjBdPShVKGEuZ2V0RnVsbFllYXIoKSk/emE6QWEpW2EuZ2V0TW9udGgoKV0rYS5nZXREYXRlKCktMXwwO0pbYyszNj4+PjI+Pj4wXT0tKDYwKmEuZ2V0VGltZXpvbmVPZmZzZXQoKSk7Yj0obmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLDYsMSkpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGQ9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO0pbYyszMj4+PjI+Pj4wXT0oYiE9ZCYmYS5nZXRUaW1lem9uZU9mZnNldCgpPT1NYXRoLm1pbihkLGIpKXwwfSxwOmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj1uZXcgRGF0ZShKW2ErMjA+Pj4yPj4+MF0rMTkwMCxKW2ErMTY+Pj4yPj4+MF0sXG5KW2ErMTI+Pj4yPj4+MF0sSlthKzg+Pj4yPj4+MF0sSlthKzQ+Pj4yPj4+MF0sSlthPj4+Mj4+PjBdLDApLGM9SlthKzMyPj4+Mj4+PjBdLGQ9Yi5nZXRUaW1lem9uZU9mZnNldCgpLGc9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGg9KG5ldyBEYXRlKGIuZ2V0RnVsbFllYXIoKSwwLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLG09TWF0aC5taW4oaCxnKTswPmM/SlthKzMyPj4+Mj4+PjBdPU51bWJlcihnIT1oJiZtPT1kKTowPGMhPShtPT1kKSYmKGc9TWF0aC5tYXgoaCxnKSxiLnNldFRpbWUoYi5nZXRUaW1lKCkrNkU0KigoMDxjP206ZyktZCkpKTtKW2ErMjQ+Pj4yPj4+MF09Yi5nZXREYXkoKTtKW2ErMjg+Pj4yPj4+MF09KFUoYi5nZXRGdWxsWWVhcigpKT96YTpBYSlbYi5nZXRNb250aCgpXStiLmdldERhdGUoKS0xfDA7SlthPj4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO0pbYSs0Pj4+Mj4+PjBdPWIuZ2V0TWludXRlcygpO0pbYStcbjg+Pj4yPj4+MF09Yi5nZXRIb3VycygpO0pbYSsxMj4+PjI+Pj4wXT1iLmdldERhdGUoKTtKW2ErMTY+Pj4yPj4+MF09Yi5nZXRNb250aCgpO0pbYSsyMD4+PjI+Pj4wXT1iLmdldFllYXIoKTthPWIuZ2V0VGltZSgpO2E9aXNOYU4oYSk/LTE6YS8xRTM7SGEoKFI9YSwxPD0rTWF0aC5hYnMoUik/MDxSPytNYXRoLmZsb29yKFIvNDI5NDk2NzI5Nik+Pj4wOn5+K01hdGguY2VpbCgoUi0rKH5+Uj4+PjApKS80Mjk0OTY3Mjk2KT4+PjA6MCkpO3JldHVybiBhPj4+MH0sbDpmdW5jdGlvbigpe3JldHVybi01Mn0sbTpmdW5jdGlvbigpe30sdDpmdW5jdGlvbihhLGIsYyxkKXtjPj4+PTA7ZD4+Pj0wO3ZhciBnPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxoPW5ldyBEYXRlKGcsMCwxKSxtPW5ldyBEYXRlKGcsNiwxKTtnPWguZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgcT1tLmdldFRpbWV6b25lT2Zmc2V0KCk7S1thPj4+MD4+PjI+Pj4wXT02MCpNYXRoLm1heChnLHEpO0pbYj4+PjA+Pj4yPj4+XG4wXT1OdW1iZXIoZyE9cSk7YT14PT54LnRvTG9jYWxlVGltZVN0cmluZyh2b2lkIDAse2hvdXIxMjohMSx0aW1lWm9uZU5hbWU6XCJzaG9ydFwifSkuc3BsaXQoXCIgXCIpWzFdO2g9YShoKTttPWEobSk7cTxnPyhUKGgsSSxjLDE3KSxUKG0sSSxkLDE3KSk6KFQoaCxJLGQsMTcpLFQobSxJLGMsMTcpKX0sZDooKT0+e2lhKFwiXCIpfSxCOmZ1bmN0aW9uKGEsYixjKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtWLmxlbmd0aD0wO2Zvcih2YXIgZDtkPUlbYisrPj4+MF07KXt2YXIgZz0xMDUhPWQ7ZyY9MTEyIT1kO2MrPWcmJmMlOD80OjA7Vi5wdXNoKDExMj09ZD9LW2M+Pj4yPj4+MF06MTA1PT1kP0pbYz4+PjI+Pj4wXTplYVtjPj4+Mz4+PjBdKTtjKz1nPzg6NH1yZXR1cm4gcGFbYV0oLi4uVil9LGg6KCk9PkRhdGUubm93KCksdTpmdW5jdGlvbigpe3JldHVybiA0Mjk0OTAxNzYwfSxiOigpPT5wZXJmb3JtYW5jZS5ub3coKSxzOmZ1bmN0aW9uKGEpe2E+Pj49MDt2YXIgYj1JLmxlbmd0aDtpZig0Mjk0OTAxNzYwPFxuYSlyZXR1cm4hMTtmb3IodmFyIGM9MTs0Pj1jO2MqPTIpe3ZhciBkPWIqKDErLjIvYyk7ZD1NYXRoLm1pbihkLGErMTAwNjYzMjk2KTt2YXIgZz1NYXRoO2Q9TWF0aC5tYXgoYSxkKTthOntnPShnLm1pbi5jYWxsKGcsNDI5NDkwMTc2MCxkKyg2NTUzNi1kJTY1NTM2KSU2NTUzNiktRy5idWZmZXIuYnl0ZUxlbmd0aCs2NTUzNSkvNjU1MzY7dHJ5e0cuZ3JvdyhnKTtmYSgpO3ZhciBoPTE7YnJlYWsgYX1jYXRjaChtKXt9aD12b2lkIDB9aWYoaClyZXR1cm4hMH1yZXR1cm4hMX0sQzpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPj4+PTA7dmFyIGM9MDtCYSgpLmZvckVhY2goKGQsZyk9Pnt2YXIgaD1iK2M7Zz1LW2ErNCpnPj4+Mj4+PjBdPWg7Zm9yKGg9MDtoPGQubGVuZ3RoOysraClIW2crKz4+PjBdPWQuY2hhckNvZGVBdChoKTtIW2c+Pj4wXT0wO2MrPWQubGVuZ3RoKzF9KTtyZXR1cm4gMH0sRDpmdW5jdGlvbihhLGIpe2E+Pj49MDtiPj4+PTA7dmFyIGM9QmEoKTtLW2E+Pj4yPj4+MF09XG5jLmxlbmd0aDt2YXIgZD0wO2MuZm9yRWFjaChnPT5kKz1nLmxlbmd0aCsxKTtLW2I+Pj4yPj4+MF09ZDtyZXR1cm4gMH0sZjooKT0+NTIsajpmdW5jdGlvbigpe3JldHVybiA1Mn0scTpmdW5jdGlvbigpe3JldHVybiA3MH0saTpmdW5jdGlvbihhLGIsYyxkKXtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDtmb3IodmFyIGc9MCxoPTA7aDxjO2grKyl7dmFyIG09S1tiPj4+Mj4+PjBdLHE9S1tiKzQ+Pj4yPj4+MF07Yis9ODtmb3IodmFyIHg9MDt4PHE7eCsrKXt2YXIgcj1JW20reD4+PjBdLHQ9Q2FbYV07MD09PXJ8fDEwPT09cj8oKDE9PT1hP2NhOkYpKHVhKHQsMCkpLHQubGVuZ3RoPTApOnQucHVzaChyKX1nKz1xfUtbZD4+PjI+Pj4wXT1nO3JldHVybiAwfSxyOkdhLGM6ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIEdhKGE+Pj4wLGI+Pj4wLGM+Pj4wLGQ+Pj4wKX19LFk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGMpe1k9Yy5leHBvcnRzO1k9SmEoKTtHPVkuSztmYSgpO00udW5zaGlmdChZLkwpO1xuTi0tOzA9PU4mJihudWxsIT09TyYmKGNsZWFySW50ZXJ2YWwoTyksTz1udWxsKSxQJiYoYz1QLFA9bnVsbCxjKCkpKTtyZXR1cm4gWX12YXIgYj17YTpJYX07TisrO2lmKGUuaW5zdGFudGlhdGVXYXNtKXRyeXtyZXR1cm4gZS5pbnN0YW50aWF0ZVdhc20oYixhKX1jYXRjaChjKXtGKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2N9YCksbChjKX1vYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSl9KS5jYXRjaChsKTtyZXR1cm57fX0oKTtlLl9PcnRJbml0PShhLGIpPT4oZS5fT3J0SW5pdD1ZLk0pKGEsYik7ZS5fT3J0R2V0TGFzdEVycm9yPShhLGIpPT4oZS5fT3J0R2V0TGFzdEVycm9yPVkuTikoYSxiKTtlLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZCxnLGgsbSxxLHgscik9PihlLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1ZLk8pKGEsYixjLGQsZyxoLG0scSx4LHIpO1xuZS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGEsYik9PihlLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1ZLlApKGEsYik7ZS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShhLGIsYyk9PihlLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9WS5RKShhLGIsYyk7ZS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9PihlLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9WS5SKShhLGIsYyk7ZS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9PihlLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9WS5TKShhKTtlLl9PcnRDcmVhdGVTZXNzaW9uPShhLGIsYyk9PihlLl9PcnRDcmVhdGVTZXNzaW9uPVkuVCkoYSxiLGMpO2UuX09ydFJlbGVhc2VTZXNzaW9uPWE9PihlLl9PcnRSZWxlYXNlU2Vzc2lvbj1ZLlUpKGEpO2UuX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KGUuX09ydEdldElucHV0T3V0cHV0Q291bnQ9WS5WKShhLGIsYyk7XG5lLl9PcnRHZXRJbnB1dE5hbWU9KGEsYik9PihlLl9PcnRHZXRJbnB1dE5hbWU9WS5XKShhLGIpO2UuX09ydEdldE91dHB1dE5hbWU9KGEsYik9PihlLl9PcnRHZXRPdXRwdXROYW1lPVkuWCkoYSxiKTtlLl9PcnRGcmVlPWE9PihlLl9PcnRGcmVlPVkuWSkoYSk7ZS5fT3J0Q3JlYXRlVGVuc29yPShhLGIsYyxkLGcsaCk9PihlLl9PcnRDcmVhdGVUZW5zb3I9WS5aKShhLGIsYyxkLGcsaCk7ZS5fT3J0R2V0VGVuc29yRGF0YT0oYSxiLGMsZCxnKT0+KGUuX09ydEdldFRlbnNvckRhdGE9WS5fKShhLGIsYyxkLGcpO2UuX09ydFJlbGVhc2VUZW5zb3I9YT0+KGUuX09ydFJlbGVhc2VUZW5zb3I9WS4kKShhKTtlLl9PcnRDcmVhdGVSdW5PcHRpb25zPShhLGIsYyxkKT0+KGUuX09ydENyZWF0ZVJ1bk9wdGlvbnM9WS5hYSkoYSxiLGMsZCk7ZS5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KGEsYixjKT0+KGUuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PVkuYmEpKGEsYixjKTtcbmUuX09ydFJlbGVhc2VSdW5PcHRpb25zPWE9PihlLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1ZLmNhKShhKTtlLl9PcnRDcmVhdGVCaW5kaW5nPWE9PihlLl9PcnRDcmVhdGVCaW5kaW5nPVkuZGEpKGEpO2UuX09ydEJpbmRJbnB1dD0oYSxiLGMpPT4oZS5fT3J0QmluZElucHV0PVkuZWEpKGEsYixjKTtlLl9PcnRCaW5kT3V0cHV0PShhLGIsYyxkKT0+KGUuX09ydEJpbmRPdXRwdXQ9WS5mYSkoYSxiLGMsZCk7ZS5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9YT0+KGUuX09ydENsZWFyQm91bmRPdXRwdXRzPVkuZ2EpKGEpO2UuX09ydFJlbGVhc2VCaW5kaW5nPWE9PihlLl9PcnRSZWxlYXNlQmluZGluZz1ZLmhhKShhKTtlLl9PcnRSdW5XaXRoQmluZGluZz0oYSxiLGMsZCxnKT0+KGUuX09ydFJ1bldpdGhCaW5kaW5nPVkuaWEpKGEsYixjLGQsZyk7ZS5fT3J0UnVuPShhLGIsYyxkLGcsaCxtLHEpPT4oZS5fT3J0UnVuPVkuamEpKGEsYixjLGQsZyxoLG0scSk7XG5lLl9PcnRFbmRQcm9maWxpbmc9YT0+KGUuX09ydEVuZFByb2ZpbGluZz1ZLmthKShhKTtlLl9PcnRUcmFpbmluZ0xvYWRDaGVja3BvaW50PShhLGIpPT4oZS5fT3J0VHJhaW5pbmdMb2FkQ2hlY2twb2ludD1ZLmxhKShhLGIpO2UuX09ydFRyYWluaW5nUmVsZWFzZUNoZWNrcG9pbnQ9YT0+KGUuX09ydFRyYWluaW5nUmVsZWFzZUNoZWNrcG9pbnQ9WS5tYSkoYSk7ZS5fT3J0VHJhaW5pbmdDcmVhdGVTZXNzaW9uPShhLGIsYyxkLGcsaCxtLHEpPT4oZS5fT3J0VHJhaW5pbmdDcmVhdGVTZXNzaW9uPVkubmEpKGEsYixjLGQsZyxoLG0scSk7ZS5fT3J0VHJhaW5pbmdMYXp5UmVzZXRHcmFkPWE9PihlLl9PcnRUcmFpbmluZ0xhenlSZXNldEdyYWQ9WS5vYSkoYSk7ZS5fT3J0VHJhaW5pbmdSdW5UcmFpblN0ZXA9KGEsYixjLGQsZyxoKT0+KGUuX09ydFRyYWluaW5nUnVuVHJhaW5TdGVwPVkucGEpKGEsYixjLGQsZyxoKTtcbmUuX09ydFRyYWluaW5nT3B0aW1pemVyU3RlcD0oYSxiKT0+KGUuX09ydFRyYWluaW5nT3B0aW1pemVyU3RlcD1ZLnFhKShhLGIpO2UuX09ydFRyYWluaW5nRXZhbFN0ZXA9KGEsYixjLGQsZyxoKT0+KGUuX09ydFRyYWluaW5nRXZhbFN0ZXA9WS5yYSkoYSxiLGMsZCxnLGgpO2UuX09ydFRyYWluaW5nR2V0UGFyYW1ldGVyc1NpemU9KGEsYixjKT0+KGUuX09ydFRyYWluaW5nR2V0UGFyYW1ldGVyc1NpemU9WS5zYSkoYSxiLGMpO2UuX09ydFRyYWluaW5nQ29weVBhcmFtZXRlcnNUb0J1ZmZlcj0oYSxiLGMsZCk9PihlLl9PcnRUcmFpbmluZ0NvcHlQYXJhbWV0ZXJzVG9CdWZmZXI9WS50YSkoYSxiLGMsZCk7ZS5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc0Zyb21CdWZmZXI9KGEsYixjLGQpPT4oZS5fT3J0VHJhaW5pbmdDb3B5UGFyYW1ldGVyc0Zyb21CdWZmZXI9WS51YSkoYSxiLGMsZCk7XG5lLl9PcnRUcmFpbmluZ0dldE1vZGVsSW5wdXRPdXRwdXRDb3VudD0oYSxiLGMsZCk9PihlLl9PcnRUcmFpbmluZ0dldE1vZGVsSW5wdXRPdXRwdXRDb3VudD1ZLnZhKShhLGIsYyxkKTtlLl9PcnRUcmFpbmluZ0dldE1vZGVsSW5wdXRPdXRwdXROYW1lPShhLGIsYyxkKT0+KGUuX09ydFRyYWluaW5nR2V0TW9kZWxJbnB1dE91dHB1dE5hbWU9WS53YSkoYSxiLGMsZCk7ZS5fT3J0VHJhaW5pbmdSZWxlYXNlU2Vzc2lvbj1hPT4oZS5fT3J0VHJhaW5pbmdSZWxlYXNlU2Vzc2lvbj1ZLnhhKShhKTtlLl9tYWxsb2M9YT0+KGUuX21hbGxvYz1ZLnlhKShhKTtlLl9mcmVlPWE9PihlLl9mcmVlPVkuemEpKGEpO3ZhciBIYT1hPT4oSGE9WS5CYSkoYSksS2E9YT0+KEthPVkuQ2EpKGEpLExhPWE9PihMYT1ZLkRhKShhKSxNYT0oKT0+KE1hPVkuRWEpKCk7XG5mdW5jdGlvbiBKYSgpe3ZhciBhPVk7YT1PYmplY3QuYXNzaWduKHt9LGEpO3ZhciBiPWM9PmQ9PmMoZCk+Pj4wO2EueWE9YihhLnlhKTthLkRhPWIoYS5EYSk7YS5FYT0oYz0+KCk9PmMoKT4+PjApKGEuRWEpO3JldHVybiBhfWUuc3RhY2tTYXZlPSgpPT5NYSgpO2Uuc3RhY2tSZXN0b3JlPWE9PkthKGEpO2Uuc3RhY2tBbGxvYz1hPT5MYShhKTtlLlVURjhUb1N0cmluZz1TO2Uuc3RyaW5nVG9VVEY4PShhLGIsYyk9PlQoYSxJLGIsYyk7ZS5sZW5ndGhCeXRlc1VURjg9dmE7dmFyIFo7UD1mdW5jdGlvbiBOYSgpe1p8fE9hKCk7Wnx8KFA9TmEpfTtcbmZ1bmN0aW9uIE9hKCl7aWYoISgwPE4pKXtpZihlLnByZVJ1bilmb3IoXCJmdW5jdGlvblwiPT10eXBlb2YgZS5wcmVSdW4mJihlLnByZVJ1bj1bZS5wcmVSdW5dKTtlLnByZVJ1bi5sZW5ndGg7KXt2YXIgYT1lLnByZVJ1bi5zaGlmdCgpO0wudW5zaGlmdChhKX1mb3IoOzA8TC5sZW5ndGg7KUwuc2hpZnQoKShlKTtpZighKDA8Tnx8Wnx8KFo9ITAsZS5jYWxsZWRSdW49ITAsZGEpKSl7Zm9yKDswPE0ubGVuZ3RoOylNLnNoaWZ0KCkoZSk7Zm9yKGsoZSk7MDxoYS5sZW5ndGg7KWhhLnNoaWZ0KCkoZSl9fX1PYSgpO1xuXG5cbiAgcmV0dXJuIHJlYWR5UHJvbWlzZVxufVxuKTtcbn0pKCk7XG5pZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuICBtb2R1bGUuZXhwb3J0cyA9IG9ydFdhc207XG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pXG4gIGRlZmluZShbXSwgKCkgPT4gb3J0V2FzbSk7XG4iLCAiIiwgIiIsICJleHBvcnQgY29uc3QgY3B1cyA9IHVuZGVmaW5lZDsiLCAiXG52YXIgb3J0V2FzbVRocmVhZGVkID0gKCgpID0+IHtcbiAgdmFyIF9zY3JpcHREaXIgPSB0eXBlb2YgZG9jdW1lbnQgIT0gJ3VuZGVmaW5lZCcgPyBkb2N1bWVudC5jdXJyZW50U2NyaXB0Py5zcmMgOiB1bmRlZmluZWQ7XG4gIGlmICh0eXBlb2YgX19maWxlbmFtZSAhPSAndW5kZWZpbmVkJykgX3NjcmlwdERpciB8fD0gX19maWxlbmFtZTtcbiAgcmV0dXJuIChcbmZ1bmN0aW9uKG1vZHVsZUFyZyA9IHt9KSB7XG5cbmZ1bmN0aW9uIGFhKCl7ZS5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGx9ZnVuY3Rpb24gbigpe2UuYnVmZmVyIT1sLmJ1ZmZlciYmbSgpO3JldHVybiBiYX1mdW5jdGlvbiBwKCl7ZS5idWZmZXIhPWwuYnVmZmVyJiZtKCk7cmV0dXJuIGNhfWZ1bmN0aW9uIHIoKXtlLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gZGF9ZnVuY3Rpb24gZWEoKXtlLmJ1ZmZlciE9bC5idWZmZXImJm0oKTtyZXR1cm4gZmF9XG52YXIgdj1tb2R1bGVBcmcsaGEseCxyZWFkeVByb21pc2U9bmV3IFByb21pc2UoKGEsYik9PntoYT1hO3g9Yn0pLGlhPU9iamVjdC5hc3NpZ24oe30sdiksamE9XCIuL3RoaXMucHJvZ3JhbVwiLHo9KGEsYik9Pnt0aHJvdyBiO30sa2E9XCJvYmplY3RcIj09dHlwZW9mIHdpbmRvdyxBPVwiZnVuY3Rpb25cIj09dHlwZW9mIGltcG9ydFNjcmlwdHMsQj1cIm9iamVjdFwiPT10eXBlb2YgcHJvY2VzcyYmXCJvYmplY3RcIj09dHlwZW9mIHByb2Nlc3MudmVyc2lvbnMmJlwic3RyaW5nXCI9PXR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGUsRD12LkVOVklST05NRU5UX0lTX1BUSFJFQUR8fCExLEU9XCJcIjtmdW5jdGlvbiBsYShhKXtyZXR1cm4gdi5sb2NhdGVGaWxlP3YubG9jYXRlRmlsZShhLEUpOkUrYX12YXIgbWEsRyxIO1xuaWYoQil7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKSxuYT1yZXF1aXJlKFwicGF0aFwiKTtFPUE/bmEuZGlybmFtZShFKStcIi9cIjpfX2Rpcm5hbWUrXCIvXCI7bWE9KGEsYik9PnthPUkoYSk/bmV3IFVSTChhKTpuYS5ub3JtYWxpemUoYSk7cmV0dXJuIGZzLnJlYWRGaWxlU3luYyhhLGI/dm9pZCAwOlwidXRmOFwiKX07SD1hPT57YT1tYShhLCEwKTthLmJ1ZmZlcnx8KGE9bmV3IFVpbnQ4QXJyYXkoYSkpO3JldHVybiBhfTtHPShhLGIsYyxkPSEwKT0+e2E9SShhKT9uZXcgVVJMKGEpOm5hLm5vcm1hbGl6ZShhKTtmcy5yZWFkRmlsZShhLGQ/dm9pZCAwOlwidXRmOFwiLChoLGcpPT57aD9jKGgpOmIoZD9nLmJ1ZmZlcjpnKX0pfTshdi50aGlzUHJvZ3JhbSYmMTxwcm9jZXNzLmFyZ3YubGVuZ3RoJiYoamE9cHJvY2Vzcy5hcmd2WzFdLnJlcGxhY2UoL1xcXFwvZyxcIi9cIikpO3Byb2Nlc3MuYXJndi5zbGljZSgyKTt6PShhLGIpPT57cHJvY2Vzcy5leGl0Q29kZT1hO3Rocm93IGI7fTtnbG9iYWwuV29ya2VyPXJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKS5Xb3JrZXJ9ZWxzZSBpZihrYXx8XG5BKUE/RT1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoRT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksKHR5cGVvZiBfc2NyaXB0RGlyICE9PSBcInVuZGVmaW5lZFwiICYmIF9zY3JpcHREaXIpJiYoRT1fc2NyaXB0RGlyKSxFLnN0YXJ0c1dpdGgoXCJibG9iOlwiKT9FPVwiXCI6RT1FLnN1YnN0cigwLEUucmVwbGFjZSgvWz8jXS4qLyxcIlwiKS5sYXN0SW5kZXhPZihcIi9cIikrMSksQnx8KG1hPWE9Pnt2YXIgYj1uZXcgWE1MSHR0cFJlcXVlc3Q7Yi5vcGVuKFwiR0VUXCIsYSwhMSk7Yi5zZW5kKG51bGwpO3JldHVybiBiLnJlc3BvbnNlVGV4dH0sQSYmKEg9YT0+e3ZhciBiPW5ldyBYTUxIdHRwUmVxdWVzdDtiLm9wZW4oXCJHRVRcIixhLCExKTtiLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCI7Yi5zZW5kKG51bGwpO3JldHVybiBuZXcgVWludDhBcnJheShiLnJlc3BvbnNlKX0pLEc9KGEsYixjKT0+e3ZhciBkPW5ldyBYTUxIdHRwUmVxdWVzdDtkLm9wZW4oXCJHRVRcIixhLCEwKTtkLnJlc3BvbnNlVHlwZT1cblwiYXJyYXlidWZmZXJcIjtkLm9ubG9hZD0oKT0+ezIwMD09ZC5zdGF0dXN8fDA9PWQuc3RhdHVzJiZkLnJlc3BvbnNlP2IoZC5yZXNwb25zZSk6YygpfTtkLm9uZXJyb3I9YztkLnNlbmQobnVsbCl9KTtCJiZcInVuZGVmaW5lZFwiPT10eXBlb2YgcGVyZm9ybWFuY2UmJihnbG9iYWwucGVyZm9ybWFuY2U9cmVxdWlyZShcInBlcmZfaG9va3NcIikucGVyZm9ybWFuY2UpO3ZhciBvYT1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLHBhPWNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtCJiYob2E9KC4uLmEpPT5mcy53cml0ZVN5bmMoMSxhLmpvaW4oXCIgXCIpK1wiXFxuXCIpLHBhPSguLi5hKT0+ZnMud3JpdGVTeW5jKDIsYS5qb2luKFwiIFwiKStcIlxcblwiKSk7dmFyIHFhPW9hLEo9cGE7T2JqZWN0LmFzc2lnbih2LGlhKTtpYT1udWxsO3ZhciBlLHJhLEs9ITEsTCxsLGJhLGNhLGRhLGZhO1xuZnVuY3Rpb24gbSgpe3ZhciBhPWUuYnVmZmVyO3YuSEVBUDg9bD1uZXcgSW50OEFycmF5KGEpO3YuSEVBUDE2PW5ldyBJbnQxNkFycmF5KGEpO3YuSEVBUFU4PWJhPW5ldyBVaW50OEFycmF5KGEpO3YuSEVBUFUxNj1uZXcgVWludDE2QXJyYXkoYSk7di5IRUFQMzI9Y2E9bmV3IEludDMyQXJyYXkoYSk7di5IRUFQVTMyPWRhPW5ldyBVaW50MzJBcnJheShhKTt2LkhFQVBGMzI9bmV3IEZsb2F0MzJBcnJheShhKTt2LkhFQVBGNjQ9ZmE9bmV3IEZsb2F0NjRBcnJheShhKX12YXIgc2E9MTY3NzcyMTY7XG5pZihEKWU9di53YXNtTWVtb3J5O2Vsc2UgaWYodi53YXNtTWVtb3J5KWU9di53YXNtTWVtb3J5O2Vsc2UgaWYoZT1uZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHtpbml0aWFsOnNhLzY1NTM2LG1heGltdW06NjU1MzYsc2hhcmVkOiEwfSksIShlLmJ1ZmZlciBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyKSl0aHJvdyBKKFwicmVxdWVzdGVkIGEgc2hhcmVkIFdlYkFzc2VtYmx5Lk1lbW9yeSBidXQgdGhlIHJldHVybmVkIGJ1ZmZlciBpcyBub3QgYSBTaGFyZWRBcnJheUJ1ZmZlciwgaW5kaWNhdGluZyB0aGF0IHdoaWxlIHRoZSBicm93c2VyIGhhcyBTaGFyZWRBcnJheUJ1ZmZlciBpdCBkb2VzIG5vdCBoYXZlIFdlYkFzc2VtYmx5IHRocmVhZHMgc3VwcG9ydCAtIHlvdSBtYXkgbmVlZCB0byBzZXQgYSBmbGFnXCIpLEImJkooXCIob24gbm9kZSB5b3UgbWF5IG5lZWQ6IC0tZXhwZXJpbWVudGFsLXdhc20tdGhyZWFkcyAtLWV4cGVyaW1lbnRhbC13YXNtLWJ1bGstbWVtb3J5IGFuZC9vciByZWNlbnQgdmVyc2lvbilcIiksXG5FcnJvcihcImJhZCBtZW1vcnlcIik7bSgpO3NhPWUuYnVmZmVyLmJ5dGVMZW5ndGg7dmFyIHRhPVtdLHVhPVtdLHZhPVtdLE09MCx3YT1udWxsLE49bnVsbDtmdW5jdGlvbiB4YSgpe00tLTtpZigwPT1NJiYobnVsbCE9PXdhJiYoY2xlYXJJbnRlcnZhbCh3YSksd2E9bnVsbCksTikpe3ZhciBhPU47Tj1udWxsO2EoKX19ZnVuY3Rpb24geWEoYSl7YT1cIkFib3J0ZWQoXCIrYStcIilcIjtKKGEpO0s9ITA7TD0xO2E9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihhK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKTt4KGEpO3Rocm93IGE7fXZhciB6YT1hPT5hLnN0YXJ0c1dpdGgoXCJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsXCIpLEk9YT0+YS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKSxPO089XCJvcnQtd2FzbS10aHJlYWRlZC53YXNtXCI7emEoTyl8fChPPWxhKE8pKTtcbmZ1bmN0aW9uIEFhKGEpe2lmKEgpcmV0dXJuIEgoYSk7dGhyb3dcImJvdGggYXN5bmMgYW5kIHN5bmMgZmV0Y2hpbmcgb2YgdGhlIHdhc20gZmFpbGVkXCI7fWZ1bmN0aW9uIEJhKGEpe2lmKGthfHxBKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBmZXRjaCYmIUkoYSkpcmV0dXJuIGZldGNoKGEse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pLnRoZW4oYj0+e2lmKCFiLm9rKXRocm93YGZhaWxlZCB0byBsb2FkIHdhc20gYmluYXJ5IGZpbGUgYXQgJyR7YX0nYDtyZXR1cm4gYi5hcnJheUJ1ZmZlcigpfSkuY2F0Y2goKCk9PkFhKGEpKTtpZihHKXJldHVybiBuZXcgUHJvbWlzZSgoYixjKT0+e0coYSxkPT5iKG5ldyBVaW50OEFycmF5KGQpKSxjKX0pfXJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpPT5BYShhKSl9XG5mdW5jdGlvbiBDYShhLGIsYyl7cmV0dXJuIEJhKGEpLnRoZW4oZD0+V2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoZCxiKSkudGhlbihjLGQ9PntKKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2R9YCk7eWEoZCl9KX1mdW5jdGlvbiBEYShhLGIpe3ZhciBjPU87cmV0dXJuXCJmdW5jdGlvblwiIT10eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmd8fHphKGMpfHxJKGMpfHxCfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBmZXRjaD9DYShjLGEsYik6ZmV0Y2goYyx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSkudGhlbihkPT5XZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhkLGEpLnRoZW4oYixmdW5jdGlvbihoKXtKKGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtofWApO0ooXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKTtyZXR1cm4gQ2EoYyxhLGIpfSkpfVxudmFyIFAsRWE9ezc5OTQxMjooYSxiLGMsZCk9PntpZihcInVuZGVmaW5lZFwiPT10eXBlb2Ygdnx8IXYuYmIpcmV0dXJuIDE7YT1RKGE+Pj4wKTthLnN0YXJ0c1dpdGgoXCIuL1wiKSYmKGE9YS5zdWJzdHJpbmcoMikpO2E9di5iYi5nZXQoYSk7aWYoIWEpcmV0dXJuIDI7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7aWYoYitjPmEuYnl0ZUxlbmd0aClyZXR1cm4gMzt0cnl7cmV0dXJuIG4oKS5zZXQoYS5zdWJhcnJheShiLGIrYyksZD4+PjApLDB9Y2F0Y2h7cmV0dXJuIDR9fX07ZnVuY3Rpb24gUihhKXt0aGlzLm5hbWU9XCJFeGl0U3RhdHVzXCI7dGhpcy5tZXNzYWdlPWBQcm9ncmFtIHRlcm1pbmF0ZWQgd2l0aCBleGl0KCR7YX0pYDt0aGlzLnN0YXR1cz1hfVxudmFyIEZhPWE9PnthLnRlcm1pbmF0ZSgpO2Eub25tZXNzYWdlPSgpPT57fX0sSGE9YT0+ezA9PVMuT2EubGVuZ3RoJiYoR2EoKSxTLlhhKFMuT2FbMF0pKTt2YXIgYj1TLk9hLnBvcCgpO2lmKCFiKXJldHVybiA2O1MuUGEucHVzaChiKTtTLkxhW2EuTmFdPWI7Yi5OYT1hLk5hO3ZhciBjPXtjbWQ6XCJydW5cIixzdGFydF9yb3V0aW5lOmEuZ2IsYXJnOmEuY2IscHRocmVhZF9wdHI6YS5OYX07QiYmYi51bnJlZigpO2IucG9zdE1lc3NhZ2UoYyxhLm1iKTtyZXR1cm4gMH0sVD0wLEphPWE9Pnt2YXIgYj1JYSgpO2E9YSgpO1UoYik7cmV0dXJuIGF9LFY9KGEsYiwuLi5jKT0+SmEoKCk9Pntmb3IodmFyIGQ9Yy5sZW5ndGgsaD1LYSg4KmQpLGc9aD4+PjMsaz0wO2s8Yy5sZW5ndGg7aysrKXt2YXIgdD1jW2tdO2VhKClbZytrPj4+MF09dH1yZXR1cm4gTGEoYSwwLGQsaCxiKX0pO1xuZnVuY3Rpb24gTWEoYSl7aWYoRClyZXR1cm4gVigwLDEsYSk7TD1hOzA8VHx8KFMuaGIoKSx2Lm9uRXhpdD8uKGEpLEs9ITApO3ooYSxuZXcgUihhKSl9dmFyIE9hPWE9PntMPWE7aWYoRCl0aHJvdyBOYShhKSxcInVud2luZFwiO01hKGEpfTtmdW5jdGlvbiBQYSgpe2Zvcih2YXIgYT12Lm51bVRocmVhZHM7YS0tOylHYSgpO3RhLnVuc2hpZnQoKCk9PntNKys7UWEoKCk9PnhhKCkpfSl9ZnVuY3Rpb24gR2EoKXt2YXIgYT1sYShcIm9ydC13YXNtLXRocmVhZGVkLndvcmtlci5qc1wiKTthPW5ldyBXb3JrZXIoYSk7Uy5PYS5wdXNoKGEpfWZ1bmN0aW9uIFFhKGEpe0Q/YSgpOlByb21pc2UuYWxsKFMuT2EubWFwKFMuWGEpKS50aGVuKGEpfVxudmFyIFM9e09hOltdLFBhOltdLGFiOltdLExhOnt9LFZhKCl7RD8oUy5yZWNlaXZlT2JqZWN0VHJhbnNmZXI9Uy5mYixTLnRocmVhZEluaXRUTFM9Uy4kYSxTLnNldEV4aXRTdGF0dXM9Uy5aYSk6UGEoKX0sWmE6YT0+TD1hLHBiOltcIiR0ZXJtaW5hdGVXb3JrZXJcIl0saGI6KCk9Pntmb3IodmFyIGEgb2YgUy5QYSlGYShhKTtmb3IoYSBvZiBTLk9hKUZhKGEpO1MuT2E9W107Uy5QYT1bXTtTLkxhPVtdfSxZYTphPT57dmFyIGI9YS5OYTtkZWxldGUgUy5MYVtiXTtTLk9hLnB1c2goYSk7Uy5QYS5zcGxpY2UoUy5QYS5pbmRleE9mKGEpLDEpO2EuTmE9MDtSYShiKX0sZmIoKXt9LCRhKCl7Uy5hYi5mb3JFYWNoKGE9PmEoKSl9LFhhOmE9Pm5ldyBQcm9taXNlKGI9PnthLm9ubWVzc2FnZT1nPT57Zz1nLmRhdGE7dmFyIGs9Zy5jbWQ7aWYoZy50YXJnZXRUaHJlYWQmJmcudGFyZ2V0VGhyZWFkIT1XKCkpe3ZhciB0PVMuTGFbZy50YXJnZXRUaHJlYWRdO3Q/dC5wb3N0TWVzc2FnZShnLGcudHJhbnNmZXJMaXN0KTpcbkooYEludGVybmFsIGVycm9yISBXb3JrZXIgc2VudCBhIG1lc3NhZ2UgXCIke2t9XCIgdG8gdGFyZ2V0IHB0aHJlYWQgJHtnLnRhcmdldFRocmVhZH0sIGJ1dCB0aGF0IHRocmVhZCBubyBsb25nZXIgZXhpc3RzIWApfWVsc2UgaWYoXCJjaGVja01haWxib3hcIj09PWspU2EoKTtlbHNlIGlmKFwic3Bhd25UaHJlYWRcIj09PWspSGEoZyk7ZWxzZSBpZihcImNsZWFudXBUaHJlYWRcIj09PWspUy5ZYShTLkxhW2cudGhyZWFkXSk7ZWxzZSBpZihcImtpbGxUaHJlYWRcIj09PWspZz1nLnRocmVhZCxrPVMuTGFbZ10sZGVsZXRlIFMuTGFbZ10sRmEoayksUmEoZyksUy5QYS5zcGxpY2UoUy5QYS5pbmRleE9mKGspLDEpLGsuTmE9MDtlbHNlIGlmKFwiY2FuY2VsVGhyZWFkXCI9PT1rKVMuTGFbZy50aHJlYWRdLnBvc3RNZXNzYWdlKHtjbWQ6XCJjYW5jZWxcIn0pO2Vsc2UgaWYoXCJsb2FkZWRcIj09PWspYS5sb2FkZWQ9ITAsQiYmIWEuTmEmJmEudW5yZWYoKSxiKGEpO2Vsc2UgaWYoXCJhbGVydFwiPT09aylhbGVydChgVGhyZWFkICR7Zy50aHJlYWRJZH06ICR7Zy50ZXh0fWApO1xuZWxzZSBpZihcInNldGltbWVkaWF0ZVwiPT09Zy50YXJnZXQpYS5wb3N0TWVzc2FnZShnKTtlbHNlIGlmKFwiY2FsbEhhbmRsZXJcIj09PWspdltnLmhhbmRsZXJdKC4uLmcuYXJncyk7ZWxzZSBrJiZKKGB3b3JrZXIgc2VudCBhbiB1bmtub3duIGNvbW1hbmQgJHtrfWApfTthLm9uZXJyb3I9Zz0+e0ooYCR7XCJ3b3JrZXIgc2VudCBhbiBlcnJvciFcIn0gJHtnLmZpbGVuYW1lfToke2cubGluZW5vfTogJHtnLm1lc3NhZ2V9YCk7dGhyb3cgZzt9O0ImJihhLm9uKFwibWVzc2FnZVwiLGc9PmEub25tZXNzYWdlKHtkYXRhOmd9KSksYS5vbihcImVycm9yXCIsZz0+YS5vbmVycm9yKGcpKSk7dmFyIGM9W10sZD1bXCJvbkV4aXRcIl0saDtmb3IoaCBvZiBkKXYuaGFzT3duUHJvcGVydHkoaCkmJmMucHVzaChoKTthLnBvc3RNZXNzYWdlKHtjbWQ6XCJsb2FkXCIsaGFuZGxlcnM6Yyx1cmxPckJsb2I6di5tYWluU2NyaXB0VXJsT3JCbG9ifHxfc2NyaXB0RGlyLHdhc21NZW1vcnk6ZSx3YXNtTW9kdWxlOnJhfSl9KX07XG52LlBUaHJlYWQ9Uzt2YXIgVGE9YT0+e2Zvcig7MDxhLmxlbmd0aDspYS5zaGlmdCgpKHYpfTt2LmVzdGFibGlzaFN0YWNrU3BhY2U9KCk9Pnt2YXIgYT1XKCksYj1yKClbYSs1Mj4+PjI+Pj4wXTthPXIoKVthKzU2Pj4+Mj4+PjBdO1VhKGIsYi1hKTtVKGIpfTtmdW5jdGlvbiBOYShhKXtpZihEKXJldHVybiBWKDEsMCxhKTtPYShhKX12YXIgVmE9W10sV2E7di5pbnZva2VFbnRyeVBvaW50PShhLGIpPT57VD0wO3ZhciBjPVZhW2FdO2N8fChhPj1WYS5sZW5ndGgmJihWYS5sZW5ndGg9YSsxKSxWYVthXT1jPVdhLmdldChhKSk7YT1jKGIpOzA8VD9TLlphKGEpOlhhKGEpfTtjbGFzcyBZYXtjb25zdHJ1Y3RvcihhKXt0aGlzLlVhPWEtMjR9VmEoYSxiKXtyKClbdGhpcy5VYSsxNj4+PjI+Pj4wXT0wO3IoKVt0aGlzLlVhKzQ+Pj4yPj4+MF09YTtyKClbdGhpcy5VYSs4Pj4+Mj4+PjBdPWJ9fXZhciBaYT0wLCRhPTA7XG5mdW5jdGlvbiBhYihhLGIsYyxkKXtyZXR1cm4gRD9WKDIsMSxhLGIsYyxkKTpiYihhLGIsYyxkKX1mdW5jdGlvbiBiYihhLGIsYyxkKXthPj4+PTA7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyKXJldHVybiBKKFwiQ3VycmVudCBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IFNoYXJlZEFycmF5QnVmZmVyLCBwdGhyZWFkcyBhcmUgbm90IGF2YWlsYWJsZSFcIiksNjt2YXIgaD1bXTtpZihEJiYwPT09aC5sZW5ndGgpcmV0dXJuIGFiKGEsYixjLGQpO2E9e2diOmMsTmE6YSxjYjpkLG1iOmh9O3JldHVybiBEPyhhLm9iPVwic3Bhd25UaHJlYWRcIixwb3N0TWVzc2FnZShhLGgpLDApOkhhKGEpfVxudmFyIGNiPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXIoXCJ1dGY4XCIpOnZvaWQgMCxkYj0oYSxiLGMpPT57Yj4+Pj0wO3ZhciBkPWIrYztmb3IoYz1iO2FbY10mJiEoYz49ZCk7KSsrYztpZigxNjxjLWImJmEuYnVmZmVyJiZjYilyZXR1cm4gY2IuZGVjb2RlKGEuYnVmZmVyIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXI/YS5zbGljZShiLGMpOmEuc3ViYXJyYXkoYixjKSk7Zm9yKGQ9XCJcIjtiPGM7KXt2YXIgaD1hW2IrK107aWYoaCYxMjgpe3ZhciBnPWFbYisrXSY2MztpZigxOTI9PShoJjIyNCkpZCs9U3RyaW5nLmZyb21DaGFyQ29kZSgoaCYzMSk8PDZ8Zyk7ZWxzZXt2YXIgaz1hW2IrK10mNjM7aD0yMjQ9PShoJjI0MCk/KGgmMTUpPDwxMnxnPDw2fGs6KGgmNyk8PDE4fGc8PDEyfGs8PDZ8YVtiKytdJjYzOzY1NTM2Pmg/ZCs9U3RyaW5nLmZyb21DaGFyQ29kZShoKTooaC09NjU1MzYsZCs9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxoPj5cbjEwLDU2MzIwfGgmMTAyMykpfX1lbHNlIGQrPVN0cmluZy5mcm9tQ2hhckNvZGUoaCl9cmV0dXJuIGR9LFE9KGEsYik9PihhPj4+PTApP2RiKG4oKSxhLGIpOlwiXCI7ZnVuY3Rpb24gZWIoYSxiLGMpe3JldHVybiBEP1YoMywxLGEsYixjKTowfWZ1bmN0aW9uIGZiKGEsYil7aWYoRClyZXR1cm4gVig0LDEsYSxiKX1cbnZhciBnYj1hPT57Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7KytjKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI3Pj1kP2IrKzoyMDQ3Pj1kP2IrPTI6NTUyOTY8PWQmJjU3MzQzPj1kPyhiKz00LCsrYyk6Yis9M31yZXR1cm4gYn0saGI9KGEsYixjLGQpPT57Yz4+Pj0wO2lmKCEoMDxkKSlyZXR1cm4gMDt2YXIgaD1jO2Q9YytkLTE7Zm9yKHZhciBnPTA7ZzxhLmxlbmd0aDsrK2cpe3ZhciBrPWEuY2hhckNvZGVBdChnKTtpZig1NTI5Njw9ayYmNTczNDM+PWspe3ZhciB0PWEuY2hhckNvZGVBdCgrK2cpO2s9NjU1MzYrKChrJjEwMjMpPDwxMCl8dCYxMDIzfWlmKDEyNz49ayl7aWYoYz49ZClicmVhaztiW2MrKz4+PjBdPWt9ZWxzZXtpZigyMDQ3Pj1rKXtpZihjKzE+PWQpYnJlYWs7YltjKys+Pj4wXT0xOTJ8az4+Nn1lbHNle2lmKDY1NTM1Pj1rKXtpZihjKzI+PWQpYnJlYWs7YltjKys+Pj4wXT0yMjR8az4+MTJ9ZWxzZXtpZihjKzM+PWQpYnJlYWs7YltjKys+Pj4wXT0yNDB8az4+XG4xODtiW2MrKz4+PjBdPTEyOHxrPj4xMiY2M31iW2MrKz4+PjBdPTEyOHxrPj42JjYzfWJbYysrPj4+MF09MTI4fGsmNjN9fWJbYz4+PjBdPTA7cmV0dXJuIGMtaH0sWD0oYSxiLGMpPT5oYihhLG4oKSxiLGMpO2Z1bmN0aW9uIGliKGEsYil7aWYoRClyZXR1cm4gVig1LDEsYSxiKX1mdW5jdGlvbiBqYihhLGIsYyl7aWYoRClyZXR1cm4gVig2LDEsYSxiLGMpfWZ1bmN0aW9uIGtiKGEsYixjKXtyZXR1cm4gRD9WKDcsMSxhLGIsYyk6MH1mdW5jdGlvbiBsYihhLGIpe2lmKEQpcmV0dXJuIFYoOCwxLGEsYil9ZnVuY3Rpb24gbWIoYSxiLGMpe2lmKEQpcmV0dXJuIFYoOSwxLGEsYixjKX1mdW5jdGlvbiBuYihhLGIsYyxkKXtpZihEKXJldHVybiBWKDEwLDEsYSxiLGMsZCl9ZnVuY3Rpb24gb2IoYSxiLGMsZCl7aWYoRClyZXR1cm4gVigxMSwxLGEsYixjLGQpfWZ1bmN0aW9uIHBiKGEsYixjLGQpe2lmKEQpcmV0dXJuIFYoMTIsMSxhLGIsYyxkKX1cbmZ1bmN0aW9uIHFiKGEpe2lmKEQpcmV0dXJuIFYoMTMsMSxhKX1mdW5jdGlvbiByYihhLGIpe2lmKEQpcmV0dXJuIFYoMTQsMSxhLGIpfWZ1bmN0aW9uIHNiKGEsYixjKXtpZihEKXJldHVybiBWKDE1LDEsYSxiLGMpfWZ1bmN0aW9uIHRiKGEpe2E+Pj49MDtcImZ1bmN0aW9uXCI9PT10eXBlb2YgQXRvbWljcy5uYiYmKEF0b21pY3MubmIocCgpLGE+Pj4yLGEpLnZhbHVlLnRoZW4oU2EpLGErPTEyOCxBdG9taWNzLnN0b3JlKHAoKSxhPj4+MiwxKSl9di5fX2Vtc2NyaXB0ZW5fdGhyZWFkX21haWxib3hfYXdhaXQ9dGI7dmFyIFNhPSgpPT57dmFyIGE9VygpO2lmKGEmJih0YihhKSxhPXViLCFLKSl0cnl7aWYoYSgpLCEoMDxUKSl0cnl7RD9YYShMKTpPYShMKX1jYXRjaChiKXtiIGluc3RhbmNlb2YgUnx8XCJ1bndpbmRcIj09Ynx8eigxLGIpfX1jYXRjaChiKXtiIGluc3RhbmNlb2YgUnx8XCJ1bndpbmRcIj09Ynx8eigxLGIpfX07di5jaGVja01haWxib3g9U2E7XG52YXIgdmI9W10sWT1hPT4wPT09YSU0JiYoMCE9PWElMTAwfHwwPT09YSU0MDApLHdiPVswLDMxLDYwLDkxLDEyMSwxNTIsMTgyLDIxMywyNDQsMjc0LDMwNSwzMzVdLHhiPVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdO2Z1bmN0aW9uIHliKGEsYixjLGQsaCxnLGssdCl7cmV0dXJuIEQ/VigxNiwxLGEsYixjLGQsaCxnLGssdCk6LTUyfWZ1bmN0aW9uIHpiKGEsYixjLGQsaCxnLGspe2lmKEQpcmV0dXJuIFYoMTcsMSxhLGIsYyxkLGgsZyxrKX1cbnZhciBBYj1bXSxCYj17fSxEYj0oKT0+e2lmKCFDYil7dmFyIGE9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFwiX1wiKStcIi5VVEYtOFwiLF86amF8fFwiLi90aGlzLnByb2dyYW1cIn0sYjtmb3IoYiBpbiBCYil2b2lkIDA9PT1CYltiXT9kZWxldGUgYVtiXTphW2JdPUJiW2JdO3ZhciBjPVtdO2ZvcihiIGluIGEpYy5wdXNoKGAke2J9PSR7YVtiXX1gKTtDYj1jfXJldHVybiBDYn0sQ2I7XG5mdW5jdGlvbiBFYihhLGIpe2lmKEQpcmV0dXJuIFYoMTgsMSxhLGIpO2E+Pj49MDtiPj4+PTA7dmFyIGM9MDtEYigpLmZvckVhY2goKGQsaCk9Pnt2YXIgZz1iK2M7aD1yKClbYSs0Kmg+Pj4yPj4+MF09Zztmb3IoZz0wO2c8ZC5sZW5ndGg7KytnKWFhKClbaCsrPj4+MF09ZC5jaGFyQ29kZUF0KGcpO2FhKClbaD4+PjBdPTA7Yys9ZC5sZW5ndGgrMX0pO3JldHVybiAwfWZ1bmN0aW9uIEliKGEsYil7aWYoRClyZXR1cm4gVigxOSwxLGEsYik7YT4+Pj0wO2I+Pj49MDt2YXIgYz1EYigpO3IoKVthPj4+Mj4+PjBdPWMubGVuZ3RoO3ZhciBkPTA7Yy5mb3JFYWNoKGg9PmQrPWgubGVuZ3RoKzEpO3IoKVtiPj4+Mj4+PjBdPWQ7cmV0dXJuIDB9ZnVuY3Rpb24gSmIoYSl7cmV0dXJuIEQ/VigyMCwxLGEpOjUyfWZ1bmN0aW9uIEtiKGEsYixjLGQpe3JldHVybiBEP1YoMjEsMSxhLGIsYyxkKTo1Mn1mdW5jdGlvbiBMYihhLGIsYyxkLGgpe3JldHVybiBEP1YoMjIsMSxhLGIsYyxkLGgpOjcwfVxudmFyIE1iPVtudWxsLFtdLFtdXTtmdW5jdGlvbiBOYihhLGIsYyxkKXtpZihEKXJldHVybiBWKDIzLDEsYSxiLGMsZCk7Yj4+Pj0wO2M+Pj49MDtkPj4+PTA7Zm9yKHZhciBoPTAsZz0wO2c8YztnKyspe3ZhciBrPXIoKVtiPj4+Mj4+PjBdLHQ9cigpW2IrND4+PjI+Pj4wXTtiKz04O2Zvcih2YXIgQz0wO0M8dDtDKyspe3ZhciB3PW4oKVtrK0M+Pj4wXSx5PU1iW2FdOzA9PT13fHwxMD09PXc/KCgxPT09YT9xYTpKKShkYih5LDApKSx5Lmxlbmd0aD0wKTp5LnB1c2godyl9aCs9dH1yKClbZD4+PjI+Pj4wXT1oO3JldHVybiAwfXZhciBPYj1bMzEsMjksMzEsMzAsMzEsMzAsMzEsMzEsMzAsMzEsMzAsMzFdLFBiPVszMSwyOCwzMSwzMCwzMSwzMCwzMSwzMSwzMCwzMSwzMCwzMV07ZnVuY3Rpb24gUWIoYSl7dmFyIGI9QXJyYXkoZ2IoYSkrMSk7aGIoYSxiLDAsYi5sZW5ndGgpO3JldHVybiBifXZhciBSYj0oYSxiKT0+e2FhKCkuc2V0KGEsYj4+PjApfTtcbmZ1bmN0aW9uIFNiKGEsYixjLGQpe2Z1bmN0aW9uIGgoZixxLHUpe2ZvcihmPVwibnVtYmVyXCI9PXR5cGVvZiBmP2YudG9TdHJpbmcoKTpmfHxcIlwiO2YubGVuZ3RoPHE7KWY9dVswXStmO3JldHVybiBmfWZ1bmN0aW9uIGcoZixxKXtyZXR1cm4gaChmLHEsXCIwXCIpfWZ1bmN0aW9uIGsoZixxKXtmdW5jdGlvbiB1KEZiKXtyZXR1cm4gMD5GYj8tMTowPEZiPzE6MH12YXIgRjswPT09KEY9dShmLmdldEZ1bGxZZWFyKCktcS5nZXRGdWxsWWVhcigpKSkmJjA9PT0oRj11KGYuZ2V0TW9udGgoKS1xLmdldE1vbnRoKCkpKSYmKEY9dShmLmdldERhdGUoKS1xLmdldERhdGUoKSkpO3JldHVybiBGfWZ1bmN0aW9uIHQoZil7c3dpdGNoKGYuZ2V0RGF5KCkpe2Nhc2UgMDpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMjkpO2Nhc2UgMTpyZXR1cm4gZjtjYXNlIDI6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDMpO2Nhc2UgMzpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLFxuMCwyKTtjYXNlIDQ6cmV0dXJuIG5ldyBEYXRlKGYuZ2V0RnVsbFllYXIoKSwwLDEpO2Nhc2UgNTpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzEpO2Nhc2UgNjpyZXR1cm4gbmV3IERhdGUoZi5nZXRGdWxsWWVhcigpLTEsMTEsMzApfX1mdW5jdGlvbiBDKGYpe3ZhciBxPWYuUWE7Zm9yKGY9bmV3IERhdGUoKG5ldyBEYXRlKGYuUmErMTkwMCwwLDEpKS5nZXRUaW1lKCkpOzA8cTspe3ZhciB1PWYuZ2V0TW9udGgoKSxGPShZKGYuZ2V0RnVsbFllYXIoKSk/T2I6UGIpW3VdO2lmKHE+Ri1mLmdldERhdGUoKSlxLT1GLWYuZ2V0RGF0ZSgpKzEsZi5zZXREYXRlKDEpLDExPnU/Zi5zZXRNb250aCh1KzEpOihmLnNldE1vbnRoKDApLGYuc2V0RnVsbFllYXIoZi5nZXRGdWxsWWVhcigpKzEpKTtlbHNle2Yuc2V0RGF0ZShmLmdldERhdGUoKStxKTticmVha319dT1uZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCkrMSwwLDQpO3E9dChuZXcgRGF0ZShmLmdldEZ1bGxZZWFyKCksXG4wLDQpKTt1PXQodSk7cmV0dXJuIDA+PWsocSxmKT8wPj1rKHUsZik/Zi5nZXRGdWxsWWVhcigpKzE6Zi5nZXRGdWxsWWVhcigpOmYuZ2V0RnVsbFllYXIoKS0xfWE+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgdz1yKClbZCs0MD4+PjI+Pj4wXTtkPXtrYjpwKClbZD4+PjI+Pj4wXSxqYjpwKClbZCs0Pj4+Mj4+PjBdLFNhOnAoKVtkKzg+Pj4yPj4+MF0sV2E6cCgpW2QrMTI+Pj4yPj4+MF0sVGE6cCgpW2QrMTY+Pj4yPj4+MF0sUmE6cCgpW2QrMjA+Pj4yPj4+MF0sTWE6cCgpW2QrMjQ+Pj4yPj4+MF0sUWE6cCgpW2QrMjg+Pj4yPj4+MF0scWI6cCgpW2QrMzI+Pj4yPj4+MF0saWI6cCgpW2QrMzY+Pj4yPj4+MF0sbGI6dz9RKHcpOlwiXCJ9O2M9UShjKTt3PXtcIiVjXCI6XCIlYSAlYiAlZCAlSDolTTolUyAlWVwiLFwiJURcIjpcIiVtLyVkLyV5XCIsXCIlRlwiOlwiJVktJW0tJWRcIixcIiVoXCI6XCIlYlwiLFwiJXJcIjpcIiVJOiVNOiVTICVwXCIsXCIlUlwiOlwiJUg6JU1cIixcIiVUXCI6XCIlSDolTTolU1wiLFwiJXhcIjpcIiVtLyVkLyV5XCIsXG5cIiVYXCI6XCIlSDolTTolU1wiLFwiJUVjXCI6XCIlY1wiLFwiJUVDXCI6XCIlQ1wiLFwiJUV4XCI6XCIlbS8lZC8leVwiLFwiJUVYXCI6XCIlSDolTTolU1wiLFwiJUV5XCI6XCIleVwiLFwiJUVZXCI6XCIlWVwiLFwiJU9kXCI6XCIlZFwiLFwiJU9lXCI6XCIlZVwiLFwiJU9IXCI6XCIlSFwiLFwiJU9JXCI6XCIlSVwiLFwiJU9tXCI6XCIlbVwiLFwiJU9NXCI6XCIlTVwiLFwiJU9TXCI6XCIlU1wiLFwiJU91XCI6XCIldVwiLFwiJU9VXCI6XCIlVVwiLFwiJU9WXCI6XCIlVlwiLFwiJU93XCI6XCIld1wiLFwiJU9XXCI6XCIlV1wiLFwiJU95XCI6XCIleVwifTtmb3IodmFyIHkgaW4gdyljPWMucmVwbGFjZShuZXcgUmVnRXhwKHksXCJnXCIpLHdbeV0pO3ZhciBHYj1cIlN1bmRheSBNb25kYXkgVHVlc2RheSBXZWRuZXNkYXkgVGh1cnNkYXkgRnJpZGF5IFNhdHVyZGF5XCIuc3BsaXQoXCIgXCIpLEhiPVwiSmFudWFyeSBGZWJydWFyeSBNYXJjaCBBcHJpbCBNYXkgSnVuZSBKdWx5IEF1Z3VzdCBTZXB0ZW1iZXIgT2N0b2JlciBOb3ZlbWJlciBEZWNlbWJlclwiLnNwbGl0KFwiIFwiKTt3PXtcIiVhXCI6Zj0+R2JbZi5NYV0uc3Vic3RyaW5nKDAsMyksXG5cIiVBXCI6Zj0+R2JbZi5NYV0sXCIlYlwiOmY9PkhiW2YuVGFdLnN1YnN0cmluZygwLDMpLFwiJUJcIjpmPT5IYltmLlRhXSxcIiVDXCI6Zj0+ZygoZi5SYSsxOTAwKS8xMDB8MCwyKSxcIiVkXCI6Zj0+ZyhmLldhLDIpLFwiJWVcIjpmPT5oKGYuV2EsMixcIiBcIiksXCIlZ1wiOmY9PkMoZikudG9TdHJpbmcoKS5zdWJzdHJpbmcoMiksXCIlR1wiOkMsXCIlSFwiOmY9PmcoZi5TYSwyKSxcIiVJXCI6Zj0+e2Y9Zi5TYTswPT1mP2Y9MTI6MTI8ZiYmKGYtPTEyKTtyZXR1cm4gZyhmLDIpfSxcIiVqXCI6Zj0+e2Zvcih2YXIgcT0wLHU9MDt1PD1mLlRhLTE7cSs9KFkoZi5SYSsxOTAwKT9PYjpQYilbdSsrXSk7cmV0dXJuIGcoZi5XYStxLDMpfSxcIiVtXCI6Zj0+ZyhmLlRhKzEsMiksXCIlTVwiOmY9PmcoZi5qYiwyKSxcIiVuXCI6KCk9PlwiXFxuXCIsXCIlcFwiOmY9PjA8PWYuU2EmJjEyPmYuU2E/XCJBTVwiOlwiUE1cIixcIiVTXCI6Zj0+ZyhmLmtiLDIpLFwiJXRcIjooKT0+XCJcXHRcIixcIiV1XCI6Zj0+Zi5NYXx8NyxcIiVVXCI6Zj0+ZyhNYXRoLmZsb29yKChmLlFhK1xuNy1mLk1hKS83KSwyKSxcIiVWXCI6Zj0+e3ZhciBxPU1hdGguZmxvb3IoKGYuUWErNy0oZi5NYSs2KSU3KS83KTsyPj0oZi5NYSszNzEtZi5RYS0yKSU3JiZxKys7aWYocSk1Mz09cSYmKHU9KGYuTWErMzcxLWYuUWEpJTcsND09dXx8Mz09dSYmWShmLlJhKXx8KHE9MSkpO2Vsc2V7cT01Mjt2YXIgdT0oZi5NYSs3LWYuUWEtMSklNzsoND09dXx8NT09dSYmWShmLlJhJTQwMC0xKSkmJnErK31yZXR1cm4gZyhxLDIpfSxcIiV3XCI6Zj0+Zi5NYSxcIiVXXCI6Zj0+ZyhNYXRoLmZsb29yKChmLlFhKzctKGYuTWErNiklNykvNyksMiksXCIleVwiOmY9PihmLlJhKzE5MDApLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFwiJVlcIjpmPT5mLlJhKzE5MDAsXCIlelwiOmY9PntmPWYuaWI7dmFyIHE9MDw9ZjtmPU1hdGguYWJzKGYpLzYwO3JldHVybihxP1wiK1wiOlwiLVwiKStTdHJpbmcoXCIwMDAwXCIrKGYvNjAqMTAwK2YlNjApKS5zbGljZSgtNCl9LFwiJVpcIjpmPT5mLmxiLFwiJSVcIjooKT0+XCIlXCJ9O2M9Yy5yZXBsYWNlKC8lJS9nLFxuXCJcXHgwMFxceDAwXCIpO2Zvcih5IGluIHcpYy5pbmNsdWRlcyh5KSYmKGM9Yy5yZXBsYWNlKG5ldyBSZWdFeHAoeSxcImdcIiksd1t5XShkKSkpO2M9Yy5yZXBsYWNlKC9cXDBcXDAvZyxcIiVcIik7eT1RYihjKTtpZih5Lmxlbmd0aD5iKXJldHVybiAwO1JiKHksYSk7cmV0dXJuIHkubGVuZ3RoLTF9Uy5WYSgpO1xudmFyIFRiPVtNYSxOYSxhYixlYixmYixpYixqYixrYixsYixtYixuYixvYixwYixxYixyYixzYix5Yix6YixFYixJYixKYixLYixMYixOYl0sV2I9e2I6ZnVuY3Rpb24oYSxiLGMpe2E+Pj49MDsobmV3IFlhKGEpKS5WYShiPj4+MCxjPj4+MCk7WmE9YTskYSsrO3Rocm93IFphO30sTDpmdW5jdGlvbihhKXtVYihhPj4+MCwhQSwxLCFrYSwxMzEwNzIsITEpO1MuJGEoKX0sajpmdW5jdGlvbihhKXthPj4+PTA7RD9wb3N0TWVzc2FnZSh7Y21kOlwiY2xlYW51cFRocmVhZFwiLHRocmVhZDphfSk6Uy5ZYShTLkxhW2FdKX0sSDpiYixoOmViLFM6ZmIsRDppYixGOmpiLFQ6a2IsUTpsYixKOm1iLFA6bmIsbjpvYixFOnBiLEI6cWIsUjpyYixDOnNiLHA6KCk9PjEsejpmdW5jdGlvbihhLGIpe2E+Pj49MDthPT1iPj4+MD9zZXRUaW1lb3V0KFNhKTpEP3Bvc3RNZXNzYWdlKHt0YXJnZXRUaHJlYWQ6YSxjbWQ6XCJjaGVja01haWxib3hcIn0pOihhPVMuTGFbYV0pJiZhLnBvc3RNZXNzYWdlKHtjbWQ6XCJjaGVja01haWxib3hcIn0pfSxcbkk6ZnVuY3Rpb24oYSxiLGMsZCxoKXtiPj4+PTA7Yz4+Pj0wO3ZiLmxlbmd0aD1kO2g9aD4+PjA+Pj4zO2Zvcih2YXIgZz0wO2c8ZDtnKyspdmJbZ109ZWEoKVtoK2c+Pj4wXTthPWI/RWFbYl06VGJbYV07Uy5lYj1jO2M9YSguLi52Yik7Uy5lYj0wO3JldHVybiBjfSxLOnRiLG86ZnVuY3Rpb24oYSl7QiYmUy5MYVthPj4+MF0ucmVmKCl9LHM6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3AoKVtjPj4+Mj4+PjBdPWEuZ2V0VVRDU2Vjb25kcygpO3AoKVtjKzQ+Pj4yPj4+MF09YS5nZXRVVENNaW51dGVzKCk7cCgpW2MrOD4+PjI+Pj4wXT1hLmdldFVUQ0hvdXJzKCk7cCgpW2MrMTI+Pj4yPj4+MF09YS5nZXRVVENEYXRlKCk7cCgpW2MrMTY+Pj4yPj4+MF09YS5nZXRVVENNb250aCgpO3AoKVtjKzIwPj4+Mj4+PjBdPWEuZ2V0VVRDRnVsbFllYXIoKS0xOTAwO3AoKVtjK1xuMjQ+Pj4yPj4+MF09YS5nZXRVVENEYXkoKTthPShhLmdldFRpbWUoKS1EYXRlLlVUQyhhLmdldFVUQ0Z1bGxZZWFyKCksMCwxLDAsMCwwLDApKS84NjRFNXwwO3AoKVtjKzI4Pj4+Mj4+PjBdPWF9LHQ6ZnVuY3Rpb24oYSxiLGMpe2E9YisyMDk3MTUyPj4+MDw0MTk0MzA1LSEhYT8oYT4+PjApKzQyOTQ5NjcyOTYqYjpOYU47Yz4+Pj0wO2E9bmV3IERhdGUoMUUzKmEpO3AoKVtjPj4+Mj4+PjBdPWEuZ2V0U2Vjb25kcygpO3AoKVtjKzQ+Pj4yPj4+MF09YS5nZXRNaW51dGVzKCk7cCgpW2MrOD4+PjI+Pj4wXT1hLmdldEhvdXJzKCk7cCgpW2MrMTI+Pj4yPj4+MF09YS5nZXREYXRlKCk7cCgpW2MrMTY+Pj4yPj4+MF09YS5nZXRNb250aCgpO3AoKVtjKzIwPj4+Mj4+PjBdPWEuZ2V0RnVsbFllYXIoKS0xOTAwO3AoKVtjKzI0Pj4+Mj4+PjBdPWEuZ2V0RGF5KCk7Yj0oWShhLmdldEZ1bGxZZWFyKCkpP3diOnhiKVthLmdldE1vbnRoKCldK2EuZ2V0RGF0ZSgpLTF8MDtwKClbYysyOD4+PjI+Pj5cbjBdPWI7cCgpW2MrMzY+Pj4yPj4+MF09LSg2MCphLmdldFRpbWV6b25lT2Zmc2V0KCkpO2I9KG5ldyBEYXRlKGEuZ2V0RnVsbFllYXIoKSw2LDEpKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBkPShuZXcgRGF0ZShhLmdldEZ1bGxZZWFyKCksMCwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKTthPShiIT1kJiZhLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKGQsYikpfDA7cCgpW2MrMzI+Pj4yPj4+MF09YX0sdTpmdW5jdGlvbihhKXthPj4+PTA7dmFyIGI9bmV3IERhdGUocCgpW2ErMjA+Pj4yPj4+MF0rMTkwMCxwKClbYSsxNj4+PjI+Pj4wXSxwKClbYSsxMj4+PjI+Pj4wXSxwKClbYSs4Pj4+Mj4+PjBdLHAoKVthKzQ+Pj4yPj4+MF0scCgpW2E+Pj4yPj4+MF0sMCksYz1wKClbYSszMj4+PjI+Pj4wXSxkPWIuZ2V0VGltZXpvbmVPZmZzZXQoKSxoPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksNiwxKSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxnPShuZXcgRGF0ZShiLmdldEZ1bGxZZWFyKCksXG4wLDEpKS5nZXRUaW1lem9uZU9mZnNldCgpLGs9TWF0aC5taW4oZyxoKTswPmM/cCgpW2ErMzI+Pj4yPj4+MF09TnVtYmVyKGghPWcmJms9PWQpOjA8YyE9KGs9PWQpJiYoaD1NYXRoLm1heChnLGgpLGIuc2V0VGltZShiLmdldFRpbWUoKSs2RTQqKCgwPGM/azpoKS1kKSkpO3AoKVthKzI0Pj4+Mj4+PjBdPWIuZ2V0RGF5KCk7Yz0oWShiLmdldEZ1bGxZZWFyKCkpP3diOnhiKVtiLmdldE1vbnRoKCldK2IuZ2V0RGF0ZSgpLTF8MDtwKClbYSsyOD4+PjI+Pj4wXT1jO3AoKVthPj4+Mj4+PjBdPWIuZ2V0U2Vjb25kcygpO3AoKVthKzQ+Pj4yPj4+MF09Yi5nZXRNaW51dGVzKCk7cCgpW2ErOD4+PjI+Pj4wXT1iLmdldEhvdXJzKCk7cCgpW2ErMTI+Pj4yPj4+MF09Yi5nZXREYXRlKCk7cCgpW2ErMTY+Pj4yPj4+MF09Yi5nZXRNb250aCgpO3AoKVthKzIwPj4+Mj4+PjBdPWIuZ2V0WWVhcigpO2E9Yi5nZXRUaW1lKCk7YT1pc05hTihhKT8tMTphLzFFMztWYigoUD1hLDE8PStNYXRoLmFicyhQKT9cbjA8UD8rTWF0aC5mbG9vcihQLzQyOTQ5NjcyOTYpPj4+MDp+fitNYXRoLmNlaWwoKFAtKyh+flA+Pj4wKSkvNDI5NDk2NzI5Nik+Pj4wOjApKTtyZXR1cm4gYT4+PjB9LHE6eWIscjp6Yix5OmZ1bmN0aW9uKGEsYixjLGQpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO2Q+Pj49MDt2YXIgaD0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCksZz1uZXcgRGF0ZShoLDAsMSksaz1uZXcgRGF0ZShoLDYsMSk7aD1nLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIHQ9ay5nZXRUaW1lem9uZU9mZnNldCgpLEM9TWF0aC5tYXgoaCx0KTtyKClbYT4+PjI+Pj4wXT02MCpDO3AoKVtiPj4+Mj4+PjBdPU51bWJlcihoIT10KTthPXc9PncudG9Mb2NhbGVUaW1lU3RyaW5nKHZvaWQgMCx7aG91cjEyOiExLHRpbWVab25lTmFtZTpcInNob3J0XCJ9KS5zcGxpdChcIiBcIilbMV07Zz1hKGcpO2s9YShrKTt0PGg/KFgoZyxjLDE3KSxYKGssZCwxNykpOihYKGcsZCwxNyksWChrLGMsMTcpKX0sYzooKT0+e3lhKFwiXCIpfSxPOmZ1bmN0aW9uKGEsXG5iLGMpe2E+Pj49MDtiPj4+PTA7Yz4+Pj0wO0FiLmxlbmd0aD0wO2Zvcih2YXIgZDtkPW4oKVtiKys+Pj4wXTspe3ZhciBoPTEwNSE9ZDtoJj0xMTIhPWQ7Yys9aCYmYyU4PzQ6MDtBYi5wdXNoKDExMj09ZD9yKClbYz4+PjI+Pj4wXToxMDU9PWQ/cCgpW2M+Pj4yPj4+MF06ZWEoKVtjPj4+Mz4+PjBdKTtjKz1oPzg6NH1yZXR1cm4gRWFbYV0oLi4uQWIpfSxrOigpPT57fSxpOigpPT5EYXRlLm5vdygpLFU6KCk9PntUKz0xO3Rocm93XCJ1bndpbmRcIjt9LEE6ZnVuY3Rpb24oKXtyZXR1cm4gNDI5NDkwMTc2MH0sZTooKT0+cGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKSxmOigpPT5CP3JlcXVpcmUoXCJvc1wiKS5jcHVzKCkubGVuZ3RoOm5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5LHg6ZnVuY3Rpb24oYSl7YT4+Pj0wO3ZhciBiPW4oKS5sZW5ndGg7aWYoYTw9Ynx8NDI5NDkwMTc2MDxhKXJldHVybiExO2Zvcih2YXIgYz0xOzQ+PWM7Yyo9Mil7dmFyIGQ9YiooMStcbi4yL2MpO2Q9TWF0aC5taW4oZCxhKzEwMDY2MzI5Nik7dmFyIGg9TWF0aDtkPU1hdGgubWF4KGEsZCk7YTp7aD0oaC5taW4uY2FsbChoLDQyOTQ5MDE3NjAsZCsoNjU1MzYtZCU2NTUzNiklNjU1MzYpLWUuYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2O3RyeXtlLmdyb3coaCk7bSgpO3ZhciBnPTE7YnJlYWsgYX1jYXRjaChrKXt9Zz12b2lkIDB9aWYoZylyZXR1cm4hMH1yZXR1cm4hMX0sTTpFYixOOkliLEc6T2EsZzpKYixtOktiLHY6TGIsbDpOYixhOmV8fHYud2FzbU1lbW9yeSx3OlNiLGQ6ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIFNiKGE+Pj4wLGI+Pj4wLGM+Pj4wLGQ+Pj4wKX19LFo9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGMsZCl7Wj1jLmV4cG9ydHM7Wj1YYigpO1MuYWIucHVzaChaLnlhKTtXYT1aLnphO3VhLnVuc2hpZnQoWi5WKTtyYT1kO3hhKCk7cmV0dXJuIFp9dmFyIGI9e2E6V2J9O00rKztpZih2Lmluc3RhbnRpYXRlV2FzbSl0cnl7cmV0dXJuIHYuaW5zdGFudGlhdGVXYXNtKGIsXG5hKX1jYXRjaChjKXtKKGBNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAke2N9YCkseChjKX1EYShiLGZ1bmN0aW9uKGMpe2EoYy5pbnN0YW5jZSxjLm1vZHVsZSl9KS5jYXRjaCh4KTtyZXR1cm57fX0oKTt2Ll9PcnRJbml0PShhLGIpPT4odi5fT3J0SW5pdD1aLlcpKGEsYik7di5fT3J0R2V0TGFzdEVycm9yPShhLGIpPT4odi5fT3J0R2V0TGFzdEVycm9yPVouWCkoYSxiKTt2Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0oYSxiLGMsZCxoLGcsayx0LEMsdyk9Pih2Ll9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1aLlkpKGEsYixjLGQsaCxnLGssdCxDLHcpO3YuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShhLGIpPT4odi5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9Wi5aKShhLGIpO3YuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oYSxiLGMpPT4odi5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPVouXykoYSxiLGMpO1xudi5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShhLGIsYyk9Pih2Ll9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9Wi4kKShhLGIsYyk7di5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWE9Pih2Ll9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9Wi5hYSkoYSk7di5fT3J0Q3JlYXRlU2Vzc2lvbj0oYSxiLGMpPT4odi5fT3J0Q3JlYXRlU2Vzc2lvbj1aLmJhKShhLGIsYyk7di5fT3J0UmVsZWFzZVNlc3Npb249YT0+KHYuX09ydFJlbGVhc2VTZXNzaW9uPVouY2EpKGEpO3YuX09ydEdldElucHV0T3V0cHV0Q291bnQ9KGEsYixjKT0+KHYuX09ydEdldElucHV0T3V0cHV0Q291bnQ9Wi5kYSkoYSxiLGMpO3YuX09ydEdldElucHV0TmFtZT0oYSxiKT0+KHYuX09ydEdldElucHV0TmFtZT1aLmVhKShhLGIpO3YuX09ydEdldE91dHB1dE5hbWU9KGEsYik9Pih2Ll9PcnRHZXRPdXRwdXROYW1lPVouZmEpKGEsYik7di5fT3J0RnJlZT1hPT4odi5fT3J0RnJlZT1aLmdhKShhKTtcbnYuX09ydENyZWF0ZVRlbnNvcj0oYSxiLGMsZCxoLGcpPT4odi5fT3J0Q3JlYXRlVGVuc29yPVouaGEpKGEsYixjLGQsaCxnKTt2Ll9PcnRHZXRUZW5zb3JEYXRhPShhLGIsYyxkLGgpPT4odi5fT3J0R2V0VGVuc29yRGF0YT1aLmlhKShhLGIsYyxkLGgpO3YuX09ydFJlbGVhc2VUZW5zb3I9YT0+KHYuX09ydFJlbGVhc2VUZW5zb3I9Wi5qYSkoYSk7di5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0oYSxiLGMsZCk9Pih2Ll9PcnRDcmVhdGVSdW5PcHRpb25zPVoua2EpKGEsYixjLGQpO3YuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShhLGIsYyk9Pih2Ll9PcnRBZGRSdW5Db25maWdFbnRyeT1aLmxhKShhLGIsYyk7di5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9YT0+KHYuX09ydFJlbGVhc2VSdW5PcHRpb25zPVoubWEpKGEpO3YuX09ydENyZWF0ZUJpbmRpbmc9YT0+KHYuX09ydENyZWF0ZUJpbmRpbmc9Wi5uYSkoYSk7XG52Ll9PcnRCaW5kSW5wdXQ9KGEsYixjKT0+KHYuX09ydEJpbmRJbnB1dD1aLm9hKShhLGIsYyk7di5fT3J0QmluZE91dHB1dD0oYSxiLGMsZCk9Pih2Ll9PcnRCaW5kT3V0cHV0PVoucGEpKGEsYixjLGQpO3YuX09ydENsZWFyQm91bmRPdXRwdXRzPWE9Pih2Ll9PcnRDbGVhckJvdW5kT3V0cHV0cz1aLnFhKShhKTt2Ll9PcnRSZWxlYXNlQmluZGluZz1hPT4odi5fT3J0UmVsZWFzZUJpbmRpbmc9Wi5yYSkoYSk7di5fT3J0UnVuV2l0aEJpbmRpbmc9KGEsYixjLGQsaCk9Pih2Ll9PcnRSdW5XaXRoQmluZGluZz1aLnNhKShhLGIsYyxkLGgpO3YuX09ydFJ1bj0oYSxiLGMsZCxoLGcsayx0KT0+KHYuX09ydFJ1bj1aLnRhKShhLGIsYyxkLGgsZyxrLHQpO3YuX09ydEVuZFByb2ZpbGluZz1hPT4odi5fT3J0RW5kUHJvZmlsaW5nPVoudWEpKGEpO3ZhciBXPXYuX3B0aHJlYWRfc2VsZj0oKT0+KFc9di5fcHRocmVhZF9zZWxmPVoudmEpKCk7di5fbWFsbG9jPWE9Pih2Ll9tYWxsb2M9Wi53YSkoYSk7XG52Ll9mcmVlPWE9Pih2Ll9mcmVlPVoueGEpKGEpO3YuX19lbXNjcmlwdGVuX3Rsc19pbml0PSgpPT4odi5fX2Vtc2NyaXB0ZW5fdGxzX2luaXQ9Wi55YSkoKTt2YXIgVWI9di5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2luaXQ9KGEsYixjLGQsaCxnKT0+KFViPXYuX19lbXNjcmlwdGVuX3RocmVhZF9pbml0PVouQWEpKGEsYixjLGQsaCxnKTt2Ll9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZD0oKT0+KHYuX19lbXNjcmlwdGVuX3RocmVhZF9jcmFzaGVkPVouQmEpKCk7XG52YXIgTGE9KGEsYixjLGQsaCk9PihMYT1aLkNhKShhLGIsYyxkLGgpLFJhPWE9PihSYT1aLkRhKShhKSxYYT12Ll9fZW1zY3JpcHRlbl90aHJlYWRfZXhpdD1hPT4oWGE9di5fX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXQ9Wi5FYSkoYSksdWI9KCk9Pih1Yj1aLkZhKSgpLFZiPWE9PihWYj1aLkdhKShhKSxVYT0oYSxiKT0+KFVhPVouSGEpKGEsYiksVT1hPT4oVT1aLklhKShhKSxLYT1hPT4oS2E9Wi5KYSkoYSksSWE9KCk9PihJYT1aLkthKSgpO2Z1bmN0aW9uIFhiKCl7dmFyIGE9WjthPU9iamVjdC5hc3NpZ24oe30sYSk7dmFyIGI9ZD0+KCk9PmQoKT4+PjAsYz1kPT5oPT5kKGgpPj4+MDthLnZhPWIoYS52YSk7YS53YT1jKGEud2EpO2EuZW1zY3JpcHRlbl9tYWluX3J1bnRpbWVfdGhyZWFkX2lkPWIoYS5lbXNjcmlwdGVuX21haW5fcnVudGltZV90aHJlYWRfaWQpO2EuSmE9YyhhLkphKTthLkthPWIoYS5LYSk7cmV0dXJuIGF9di53YXNtTWVtb3J5PWU7di5zdGFja1NhdmU9KCk9PklhKCk7XG52LnN0YWNrUmVzdG9yZT1hPT5VKGEpO3Yuc3RhY2tBbGxvYz1hPT5LYShhKTt2LmtlZXBSdW50aW1lQWxpdmU9KCk9PjA8VDt2LlVURjhUb1N0cmluZz1RO3Yuc3RyaW5nVG9VVEY4PVg7di5sZW5ndGhCeXRlc1VURjg9Z2I7di5FeGl0U3RhdHVzPVI7di5QVGhyZWFkPVM7dmFyIFliO049ZnVuY3Rpb24gWmIoKXtZYnx8JGIoKTtZYnx8KE49WmIpfTtmdW5jdGlvbiAkYigpe2lmKCEoMDxNKSlpZihEKWhhKHYpLER8fFRhKHVhKSxzdGFydFdvcmtlcih2KTtlbHNle2lmKHYucHJlUnVuKWZvcihcImZ1bmN0aW9uXCI9PXR5cGVvZiB2LnByZVJ1biYmKHYucHJlUnVuPVt2LnByZVJ1bl0pO3YucHJlUnVuLmxlbmd0aDspdGEudW5zaGlmdCh2LnByZVJ1bi5zaGlmdCgpKTtUYSh0YSk7MDxNfHxZYnx8KFliPSEwLHYuY2FsbGVkUnVuPSEwLEt8fChEfHxUYSh1YSksaGEodiksRHx8VGEodmEpKSl9fSRiKCk7XG5cblxuICByZXR1cm4gcmVhZHlQcm9taXNlXG59XG4pO1xufSkoKTtcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbVRocmVhZGVkO1xuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKVxuICBkZWZpbmUoW10sICgpID0+IG9ydFdhc21UaHJlYWRlZCk7XG4iLCAiXCJ1c2Ugc3RyaWN0XCI7dmFyIE1vZHVsZT17fTt2YXIgRU5WSVJPTk1FTlRfSVNfTk9ERT10eXBlb2YgcHJvY2Vzcz09XCJvYmplY3RcIiYmdHlwZW9mIHByb2Nlc3MudmVyc2lvbnM9PVwib2JqZWN0XCImJnR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGU9PVwic3RyaW5nXCI7aWYoRU5WSVJPTk1FTlRfSVNfTk9ERSl7dmFyIG5vZGVXb3JrZXJUaHJlYWRzPXJlcXVpcmUoXCJ3b3JrZXJfdGhyZWFkc1wiKTt2YXIgcGFyZW50UG9ydD1ub2RlV29ya2VyVGhyZWFkcy5wYXJlbnRQb3J0O3BhcmVudFBvcnQub24oXCJtZXNzYWdlXCIsZGF0YT0+b25tZXNzYWdlKHtkYXRhOmRhdGF9KSk7dmFyIGZzPXJlcXVpcmUoXCJmc1wiKTt2YXIgdm09cmVxdWlyZShcInZtXCIpO09iamVjdC5hc3NpZ24oZ2xvYmFsLHtzZWxmOmdsb2JhbCxyZXF1aXJlOnJlcXVpcmUsTW9kdWxlOk1vZHVsZSxsb2NhdGlvbjp7aHJlZjpfX2ZpbGVuYW1lfSxXb3JrZXI6bm9kZVdvcmtlclRocmVhZHMuV29ya2VyLGltcG9ydFNjcmlwdHM6Zj0+dm0ucnVuSW5UaGlzQ29udGV4dChmcy5yZWFkRmlsZVN5bmMoZixcInV0ZjhcIikse2ZpbGVuYW1lOmZ9KSxwb3N0TWVzc2FnZTptc2c9PnBhcmVudFBvcnQucG9zdE1lc3NhZ2UobXNnKSxwZXJmb3JtYW5jZTpnbG9iYWwucGVyZm9ybWFuY2V8fHtub3c6RGF0ZS5ub3d9fSl9dmFyIGluaXRpYWxpemVkSlM9ZmFsc2U7ZnVuY3Rpb24gdGhyZWFkUHJpbnRFcnIoLi4uYXJncyl7dmFyIHRleHQ9YXJncy5qb2luKFwiIFwiKTtpZihFTlZJUk9OTUVOVF9JU19OT0RFKXtmcy53cml0ZVN5bmMoMix0ZXh0K1wiXFxuXCIpO3JldHVybn1jb25zb2xlLmVycm9yKHRleHQpfWZ1bmN0aW9uIHRocmVhZEFsZXJ0KC4uLmFyZ3Mpe3ZhciB0ZXh0PWFyZ3Muam9pbihcIiBcIik7cG9zdE1lc3NhZ2Uoe2NtZDpcImFsZXJ0XCIsdGV4dDp0ZXh0LHRocmVhZElkOk1vZHVsZVtcIl9wdGhyZWFkX3NlbGZcIl0oKX0pfXZhciBlcnI9dGhyZWFkUHJpbnRFcnI7c2VsZi5hbGVydD10aHJlYWRBbGVydDtNb2R1bGVbXCJpbnN0YW50aWF0ZVdhc21cIl09KGluZm8scmVjZWl2ZUluc3RhbmNlKT0+e3ZhciBtb2R1bGU9TW9kdWxlW1wid2FzbU1vZHVsZVwiXTtNb2R1bGVbXCJ3YXNtTW9kdWxlXCJdPW51bGw7dmFyIGluc3RhbmNlPW5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShtb2R1bGUsaW5mbyk7cmV0dXJuIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSl9O3NlbGYub251bmhhbmRsZWRyZWplY3Rpb249ZT0+e3Rocm93IGUucmVhc29ufHxlfTtmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKGUpe3RyeXtpZihlLmRhdGEuY21kPT09XCJsb2FkXCIpe2xldCBtZXNzYWdlUXVldWU9W107c2VsZi5vbm1lc3NhZ2U9ZT0+bWVzc2FnZVF1ZXVlLnB1c2goZSk7c2VsZi5zdGFydFdvcmtlcj1pbnN0YW5jZT0+e01vZHVsZT1pbnN0YW5jZTtwb3N0TWVzc2FnZSh7XCJjbWRcIjpcImxvYWRlZFwifSk7Zm9yKGxldCBtc2cgb2YgbWVzc2FnZVF1ZXVlKXtoYW5kbGVNZXNzYWdlKG1zZyl9c2VsZi5vbm1lc3NhZ2U9aGFuZGxlTWVzc2FnZX07TW9kdWxlW1wid2FzbU1vZHVsZVwiXT1lLmRhdGEud2FzbU1vZHVsZTtmb3IoY29uc3QgaGFuZGxlciBvZiBlLmRhdGEuaGFuZGxlcnMpe01vZHVsZVtoYW5kbGVyXT0oLi4uYXJncyk9Pntwb3N0TWVzc2FnZSh7Y21kOlwiY2FsbEhhbmRsZXJcIixoYW5kbGVyOmhhbmRsZXIsYXJnczphcmdzfSl9fU1vZHVsZVtcIndhc21NZW1vcnlcIl09ZS5kYXRhLndhc21NZW1vcnk7TW9kdWxlW1wiYnVmZmVyXCJdPU1vZHVsZVtcIndhc21NZW1vcnlcIl0uYnVmZmVyO01vZHVsZVtcIkVOVklST05NRU5UX0lTX1BUSFJFQURcIl09dHJ1ZTtpZih0eXBlb2YgZS5kYXRhLnVybE9yQmxvYj09XCJzdHJpbmdcIil7aW1wb3J0U2NyaXB0cyhlLmRhdGEudXJsT3JCbG9iKX1lbHNle3ZhciBvYmplY3RVcmw9VVJMLmNyZWF0ZU9iamVjdFVSTChlLmRhdGEudXJsT3JCbG9iKTtpbXBvcnRTY3JpcHRzKG9iamVjdFVybCk7VVJMLnJldm9rZU9iamVjdFVSTChvYmplY3RVcmwpfW9ydFdhc21UaHJlYWRlZChNb2R1bGUpfWVsc2UgaWYoZS5kYXRhLmNtZD09PVwicnVuXCIpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfaW5pdFwiXShlLmRhdGEucHRocmVhZF9wdHIsLyppc19tYWluPSovMCwvKmlzX3J1bnRpbWU9Ki8wLC8qY2FuX2Jsb2NrPSovMSk7TW9kdWxlW1wiX19lbXNjcmlwdGVuX3RocmVhZF9tYWlsYm94X2F3YWl0XCJdKGUuZGF0YS5wdGhyZWFkX3B0cik7TW9kdWxlW1wiZXN0YWJsaXNoU3RhY2tTcGFjZVwiXSgpO01vZHVsZVtcIlBUaHJlYWRcIl0ucmVjZWl2ZU9iamVjdFRyYW5zZmVyKGUuZGF0YSk7TW9kdWxlW1wiUFRocmVhZFwiXS50aHJlYWRJbml0VExTKCk7aWYoIWluaXRpYWxpemVkSlMpe2luaXRpYWxpemVkSlM9dHJ1ZX10cnl7TW9kdWxlW1wiaW52b2tlRW50cnlQb2ludFwiXShlLmRhdGEuc3RhcnRfcm91dGluZSxlLmRhdGEuYXJnKX1jYXRjaChleCl7aWYoZXghPVwidW53aW5kXCIpe3Rocm93IGV4fX19ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjYW5jZWxcIil7aWYoTW9kdWxlW1wiX3B0aHJlYWRfc2VsZlwiXSgpKXtNb2R1bGVbXCJfX2Vtc2NyaXB0ZW5fdGhyZWFkX2V4aXRcIl0oLTEpfX1lbHNlIGlmKGUuZGF0YS50YXJnZXQ9PT1cInNldGltbWVkaWF0ZVwiKXt9ZWxzZSBpZihlLmRhdGEuY21kPT09XCJjaGVja01haWxib3hcIil7aWYoaW5pdGlhbGl6ZWRKUyl7TW9kdWxlW1wiY2hlY2tNYWlsYm94XCJdKCl9fWVsc2UgaWYoZS5kYXRhLmNtZCl7ZXJyKGB3b3JrZXIuanMgcmVjZWl2ZWQgdW5rbm93biBjb21tYW5kICR7ZS5kYXRhLmNtZH1gKTtlcnIoZS5kYXRhKX19Y2F0Y2goZXgpe01vZHVsZVtcIl9fZW1zY3JpcHRlbl90aHJlYWRfY3Jhc2hlZFwiXT8uKCk7dGhyb3cgZXh9fXNlbGYub25tZXNzYWdlPWhhbmRsZU1lc3NhZ2U7XG4iLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQge0Vudn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHtPcnRXYXNtTW9kdWxlfSBmcm9tICcuL2JpbmRpbmcvb3J0LXdhc20nO1xuaW1wb3J0IHtPcnRXYXNtVGhyZWFkZWRNb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cbmxldCBvcnRXYXNtRmFjdG9yeTogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT47XG5cbmlmICghQlVJTERfREVGUy5ESVNBQkxFX1RSQUlOSU5HKSB7XG4gIG9ydFdhc21GYWN0b3J5ID0gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC10cmFpbmluZy13YXNtLXNpbWQuanMnKTtcbn0gZWxzZSB7XG4gIG9ydFdhc21GYWN0b3J5ID1cbiAgICAgIEJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgPyByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20uanMnKSA6IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLmpzZXAuanMnKTtcbn1cblxuY29uc3Qgb3J0V2FzbUZhY3RvcnlUaHJlYWRlZDogRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT4gPSAhQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEID9cbiAgICAoQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcycpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAuanMnKSkgOlxuICAgIG9ydFdhc21GYWN0b3J5O1xuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG5cbmxldCB3YXNtOiBPcnRXYXNtTW9kdWxlfHVuZGVmaW5lZDtcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlO1xubGV0IGluaXRpYWxpemluZyA9IGZhbHNlO1xubGV0IGFib3J0ZWQgPSBmYWxzZTtcblxuY29uc3QgaXNNdWx0aVRocmVhZFN1cHBvcnRlZCA9IChudW1UaHJlYWRzOiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgLy8gV2ViQXNzZW1ibHkgdGhyZWFkcyBhcmUgc2V0IHRvIDEgKHNpbmdsZSB0aHJlYWQpLlxuICBpZiAobnVtVGhyZWFkcyA9PT0gMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIElmICdTaGFyZWRBcnJheUJ1ZmZlcicgaXMgbm90IGF2YWlsYWJsZSwgV2ViQXNzZW1ibHkgdGhyZWFkcyB3aWxsIG5vdCB3b3JrLlxuICBpZiAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiYgIXNlbGYuY3Jvc3NPcmlnaW5Jc29sYXRlZCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAnZW52Lndhc20ubnVtVGhyZWFkcyBpcyBzZXQgdG8gJyArIG51bVRocmVhZHMgK1xuICAgICAgICAgICcsIGJ1dCB0aGlzIHdpbGwgbm90IHdvcmsgdW5sZXNzIHlvdSBlbmFibGUgY3Jvc3NPcmlnaW5Jc29sYXRlZCBtb2RlLiAnICtcbiAgICAgICAgICAnU2VlIGh0dHBzOi8vd2ViLmRldi9jcm9zcy1vcmlnaW4taXNvbGF0aW9uLWd1aWRlLyBmb3IgbW9yZSBpbmZvLicpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBvbm54cnVudGltZS13ZWIgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aS10aHJlYWRzIGluIE5vZGUuanMuXG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLm5vZGUpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ2Vudi53YXNtLm51bVRocmVhZHMgaXMgc2V0IHRvICcgKyBudW1UaHJlYWRzICtcbiAgICAgICAgJywgaG93ZXZlciwgY3VycmVudGx5IG9ubnhydW50aW1lLXdlYiBkb2VzIG5vdCBzdXBwb3J0IG11bHRpLXRocmVhZHMgaW4gTm9kZS5qcy4gJyArXG4gICAgICAgICdQbGVhc2UgY29uc2lkZXIgdXNpbmcgb25ueHJ1bnRpbWUtbm9kZSBmb3IgcGVyZm9ybWFuY2UgY3JpdGljYWwgc2NlbmFyaW9zLicpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBUZXN0IGZvciB0cmFuc2ZlcmFiaWxpdHkgb2YgU0FCcyAoZm9yIGJyb3dzZXJzLiBuZWVkZWQgZm9yIEZpcmVmb3gpXG4gICAgLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIW1zZy9tb3ppbGxhLmRldi5wbGF0Zm9ybS9JSGtCWmxIRVRwQS9kd3NNTmNoV0VRQUpcbiAgICBpZiAodHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgbmV3IE1lc3NhZ2VDaGFubmVsKCkucG9ydDEucG9zdE1lc3NhZ2UobmV3IFNoYXJlZEFycmF5QnVmZmVyKDEpKTtcbiAgICB9XG5cbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSB0aHJlYWRzIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgdGhyZWFkZWQgaW5zdHJ1Y3Rpb25zLlxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShuZXcgVWludDhBcnJheShbXG4gICAgICAwLCA5NywgMTE1LCAxMDksIDEsIDAsICAwLCAgMCwgMSwgNCwgMSwgIDk2LCAwLCAgIDAsICAzLCAyLCAxLCAgMCwgNSxcbiAgICAgIDQsIDEsICAzLCAgIDEsICAgMSwgMTAsIDExLCAxLCA5LCAwLCA2NSwgMCwgIDI1NCwgMTYsIDIsIDAsIDI2LCAxMVxuICAgIF0pKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgaXNTaW1kU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IFNJTUQgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXG4gICAgLy8gVGhpcyB0eXBlZCBhcnJheSBpcyBhIFdlYkFzc2VtYmx5IHByb2dyYW0gY29udGFpbmluZyBTSU1EIGluc3RydWN0aW9ucy5cblxuICAgIC8vIFRoZSBiaW5hcnkgZGF0YSBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgZm9sbG93aW5nIGNvZGUgYnkgd2F0Mndhc206XG4gICAgLy9cbiAgICAvLyAobW9kdWxlXG4gICAgLy8gICAodHlwZSAkdDAgKGZ1bmMpKVxuICAgIC8vICAgKGZ1bmMgJGYwICh0eXBlICR0MClcbiAgICAvLyAgICAgKGRyb3BcbiAgICAvLyAgICAgICAoaTMyeDQuZG90X2kxNng4X3NcbiAgICAvLyAgICAgICAgIChpOHgxNi5zcGxhdFxuICAgIC8vICAgICAgICAgICAoaTMyLmNvbnN0IDApKVxuICAgIC8vICAgICAgICAgKHYxMjguY29uc3QgaTMyeDQgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCkpKSkpXG5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUobmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgMCwgICA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDQsIDEsIDk2LCAwLCAwLCAzLCAyLCAxLCAwLCAxMCwgMzAsIDEsICAgMjgsICAwLCA2NSwgMCxcbiAgICAgIDI1MywgMTUsIDI1MywgMTIsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsICAyNTMsIDE4NiwgMSwgMjYsIDExXG4gICAgXSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBnZXRXYXNtRmlsZU5hbWUgPSAodXNlU2ltZDogYm9vbGVhbiwgdXNlVGhyZWFkczogYm9vbGVhbikgPT4ge1xuICBpZiAodXNlU2ltZCkge1xuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1RSQUlOSU5HKSB7XG4gICAgICByZXR1cm4gJ29ydC10cmFpbmluZy13YXNtLXNpbWQud2FzbSc7XG4gICAgfVxuICAgIHJldHVybiB1c2VUaHJlYWRzID8gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScgOiAnb3J0LXdhc20tc2ltZC53YXNtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS53YXNtJztcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGluaXRpYWxpemVXZWJBc3NlbWJseSA9IGFzeW5jKGZsYWdzOiBFbnYuV2ViQXNzZW1ibHlGbGFncyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbiAgaWYgKGluaXRpYWxpemluZykge1xuICAgIHRocm93IG5ldyBFcnJvcignbXVsdGlwbGUgY2FsbHMgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZGV0ZWN0ZWQuJyk7XG4gIH1cbiAgaWYgKGFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZXZpb3VzIGNhbGwgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZmFpbGVkLicpO1xuICB9XG5cbiAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICAvLyB3YXNtIGZsYWdzIGFyZSBhbHJlYWR5IGluaXRpYWxpemVkXG4gIGNvbnN0IHRpbWVvdXQgPSBmbGFncy5pbml0VGltZW91dCE7XG4gIGNvbnN0IG51bVRocmVhZHMgPSBmbGFncy5udW1UaHJlYWRzITtcbiAgY29uc3Qgc2ltZCA9IGZsYWdzLnNpbWQhO1xuXG4gIGNvbnN0IHVzZVRocmVhZHMgPSBpc011bHRpVGhyZWFkU3VwcG9ydGVkKG51bVRocmVhZHMpO1xuICBjb25zdCB1c2VTaW1kID0gc2ltZCAmJiBpc1NpbWRTdXBwb3J0ZWQoKTtcblxuICBjb25zdCB3YXNtUGF0aHMgPSBmbGFncy53YXNtUGF0aHM7XG4gIGNvbnN0IHdhc21QcmVmaXhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdzdHJpbmcnID8gd2FzbVBhdGhzIDogdW5kZWZpbmVkO1xuICBjb25zdCB3YXNtRmlsZU5hbWUgPSBnZXRXYXNtRmlsZU5hbWUodXNlU2ltZCwgdXNlVGhyZWFkcyk7XG4gIGNvbnN0IHdhc21QYXRoT3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnb2JqZWN0JyA/IHdhc21QYXRoc1t3YXNtRmlsZU5hbWVdIDogdW5kZWZpbmVkO1xuXG4gIGxldCBpc1RpbWVvdXQgPSBmYWxzZTtcblxuICBjb25zdCB0YXNrczogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBbXTtcblxuICAvLyBwcm9taXNlIGZvciB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ID4gMCkge1xuICAgIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpc1RpbWVvdXQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9KSk7XG4gIH1cblxuICAvLyBwcm9taXNlIGZvciBtb2R1bGUgaW5pdGlhbGl6YXRpb25cbiAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZmFjdG9yeSA9IHVzZVRocmVhZHMgPyBvcnRXYXNtRmFjdG9yeVRocmVhZGVkIDogb3J0V2FzbUZhY3Rvcnk7XG4gICAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE9ydFdhc21Nb2R1bGU+ID0ge1xuICAgICAgbG9jYXRlRmlsZTogKGZpbGVOYW1lOiBzdHJpbmcsIHNjcmlwdERpcmVjdG9yeTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fVEhSRUFEICYmIHVzZVRocmVhZHMgJiYgZmlsZU5hbWUuZW5kc1dpdGgoJy53b3JrZXIuanMnKSAmJlxuICAgICAgICAgICAgdHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHJlcXVpcmUoKSBmdW5jdGlvbiBpcyBoYW5kbGVkIGJ5IGVzYnVpbGQgcGx1Z2luIHRvIGxvYWQgZmlsZSBjb250ZW50IGFzIHN0cmluZy5cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xuICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC53b3JrZXIuanMnKVxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy53YXNtJykpIHtcbiAgICAgICAgICBpZiAod2FzbVBhdGhPdmVycmlkZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdhc21QYXRoT3ZlcnJpZGU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcHJlZml4ID0gd2FzbVByZWZpeE92ZXJyaWRlID8/IHNjcmlwdERpcmVjdG9yeTtcblxuICAgICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xuICAgICAgICAgICAgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdhc21GaWxlTmFtZSA9PT0gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAud2FzbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIHdhc21GaWxlTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JpcHREaXJlY3RvcnkgKyBmaWxlTmFtZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcykge1xuICAgICAgY29uZmlnLm51bVRocmVhZHMgPSBudW1UaHJlYWRzO1xuICAgICAgaWYgKHR5cGVvZiBCbG9iID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdvcnQtd2FzbS10aHJlYWRlZC5qcycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2NyaXB0U291cmNlQ29kZSA9IGB2YXIgb3J0V2FzbVRocmVhZGVkPSR7ZmFjdG9yeS50b1N0cmluZygpfTtgO1xuICAgICAgICBjb25maWcubWFpblNjcmlwdFVybE9yQmxvYiA9IG5ldyBCbG9iKFtzY3JpcHRTb3VyY2VDb2RlXSwge3R5cGU6ICd0ZXh0L2phdmFzY3JpcHQnfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmFjdG9yeShjb25maWcpLnRoZW4oXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICBtb2R1bGUgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB3YXNtID0gbW9kdWxlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gd2FzbSBtb2R1bGUgZmFpbGVkIHRvIGluaXRpYWxpemVcbiAgICAgICAgKHdoYXQpID0+IHtcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICByZWplY3Qod2hhdCk7XG4gICAgICAgIH0pO1xuICB9KSk7XG5cbiAgYXdhaXQgUHJvbWlzZS5yYWNlKHRhc2tzKTtcblxuICBpZiAoaXNUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBXZWJBc3NlbWJseSBiYWNrZW5kIGluaXRpYWxpemluZyBmYWlsZWQgZHVlIHRvIHRpbWVvdXQ6ICR7dGltZW91dH1tc2ApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SW5zdGFuY2UgPSAoKTogT3J0V2FzbU1vZHVsZSA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiB3YXNtKSB7XG4gICAgcmV0dXJuIHdhc207XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkFzc2VtYmx5IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQuJyk7XG59O1xuXG5leHBvcnQgY29uc3QgZGlzcG9zZSA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmICFpbml0aWFsaXppbmcgJiYgIWFib3J0ZWQpIHtcbiAgICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gICAgKHdhc20gYXMgT3J0V2FzbVRocmVhZGVkTW9kdWxlKS5QVGhyZWFkPy50ZXJtaW5hdGVBbGxUaHJlYWRzKCk7XG4gICAgd2FzbSA9IHVuZGVmaW5lZDtcblxuICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgIGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgYWJvcnRlZCA9IHRydWU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcblxuZXhwb3J0IGNvbnN0IGFsbG9jV2FzbVN0cmluZyA9IChkYXRhOiBzdHJpbmcsIGFsbG9jczogbnVtYmVyW10pOiBudW1iZXIgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBkYXRhTGVuZ3RoID0gd2FzbS5sZW5ndGhCeXRlc1VURjgoZGF0YSkgKyAxO1xuICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKGRhdGFMZW5ndGgpO1xuICB3YXNtLnN0cmluZ1RvVVRGOChkYXRhLCBkYXRhT2Zmc2V0LCBkYXRhTGVuZ3RoKTtcbiAgYWxsb2NzLnB1c2goZGF0YU9mZnNldCk7XG5cbiAgcmV0dXJuIGRhdGFPZmZzZXQ7XG59O1xuXG5pbnRlcmZhY2UgRXh0cmFPcHRpb25zSGFuZGxlciB7XG4gIChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgaXRlcmF0ZUV4dHJhT3B0aW9ucyA9XG4gICAgKG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBwcmVmaXg6IHN0cmluZywgc2VlbjogV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4sXG4gICAgIGhhbmRsZXI6IEV4dHJhT3B0aW9uc0hhbmRsZXIpOiB2b2lkID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChzZWVuLmhhcyhvcHRpb25zKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2lyY3VsYXIgcmVmZXJlbmNlIGluIG9wdGlvbnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWVuLmFkZChvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuZW50cmllcyhvcHRpb25zKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChwcmVmaXgpID8gcHJlZml4ICsga2V5IDoga2V5O1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIG5hbWUgKyAnLicsIHNlZW4sIGhhbmRsZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGhhbmRsZXIobmFtZSwgdmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBoYW5kbGVyKG5hbWUsICh2YWx1ZSkgPyAnMScgOiAnMCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgaGFuZGxlIGV4dHJhIGNvbmZpZyB0eXBlOiAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuLyoqXG4gKiBjaGVjayB3ZWIgYXNzZW1ibHkgQVBJJ3MgbGFzdCBlcnJvciBhbmQgdGhyb3cgZXJyb3IgaWYgYW55IGVycm9yIG9jY3VycmVkLlxuICogQHBhcmFtIG1lc3NhZ2UgYSBtZXNzYWdlIHVzZWQgd2hlbiBhbiBlcnJvciBvY2N1cnJlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNoZWNrTGFzdEVycm9yID0gKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyYW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIHdhc20uX09ydEdldExhc3RFcnJvcihwYXJhbXNPZmZzZXQsIHBhcmFtc09mZnNldCArIDQpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uSEVBUDMyW3BhcmFtc09mZnNldCAvIDRdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZVBvaW50ZXIgPSB3YXNtLkhFQVBVMzJbcGFyYW1zT2Zmc2V0IC8gNCArIDFdO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZVBvaW50ZXIgPyB3YXNtLlVURjhUb1N0cmluZyhlcnJvck1lc3NhZ2VQb2ludGVyKSA6ICcnO1xuICAgIHRocm93IG5ldyBFcnJvcihgJHttZXNzYWdlfSBFUlJPUl9DT0RFOiAke2Vycm9yQ29kZX0sIEVSUk9SX01FU1NBR0U6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnN9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmV4cG9ydCBjb25zdCBzZXRSdW5PcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBydW5PcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRyeSB7XG4gICAgaWYgKG9wdGlvbnM/LmxvZ1NldmVyaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID0gMjsgIC8vIERlZmF1bHQgdG8gd2FybmluZ1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHR5cGVvZiBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCkgfHxcbiAgICAgICAgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsIDwgMCB8fCBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8ubG9nVmVyYm9zaXR5TGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA9IDA7ICAvLyBEZWZhdWx0IHRvIDBcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy50ZXJtaW5hdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy50ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgdGFnRGF0YU9mZnNldCA9IDA7XG4gICAgaWYgKG9wdGlvbnM/LnRhZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWdEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG9wdGlvbnMudGFnLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIHJ1bk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVSdW5PcHRpb25zKFxuICAgICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwhLCBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsISwgISFydW5PcHRpb25zLnRlcm1pbmF0ZSEsIHRhZ0RhdGFPZmZzZXQpO1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgcnVuIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmV4dHJhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnMob3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRSdW5Db25maWdFbnRyeShydW5PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHJ1biBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3J1bk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuY29uc3QgZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsID0gKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWw6IHN0cmluZ3x1bmtub3duKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChncmFwaE9wdGltaXphdGlvbkxldmVsKSB7XG4gICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnYmFzaWMnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnZXh0ZW5kZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIHJldHVybiA5OTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBncmFwaCBvcHRpbWl6YXRpb24gbGV2ZWw6ICR7Z3JhcGhPcHRpbWl6YXRpb25MZXZlbH1gKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0RXhlY3V0aW9uTW9kZSA9IChleGVjdXRpb25Nb2RlOiAnc2VxdWVudGlhbCd8J3BhcmFsbGVsJyk6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAoZXhlY3V0aW9uTW9kZSkge1xuICAgIGNhc2UgJ3NlcXVlbnRpYWwnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAncGFyYWxsZWwnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZXhlY3V0aW9uIG1vZGU6ICR7ZXhlY3V0aW9uTW9kZX1gKTtcbiAgfVxufTtcblxuY29uc3QgYXBwZW5kRGVmYXVsdE9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IHZvaWQgPT4ge1xuICBpZiAoIW9wdGlvbnMuZXh0cmEpIHtcbiAgICBvcHRpb25zLmV4dHJhID0ge307XG4gIH1cbiAgaWYgKCFvcHRpb25zLmV4dHJhLnNlc3Npb24pIHtcbiAgICBvcHRpb25zLmV4dHJhLnNlc3Npb24gPSB7fTtcbiAgfVxuICBjb25zdCBzZXNzaW9uID0gb3B0aW9ucy5leHRyYS5zZXNzaW9uIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGlmICghc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSA9ICcxJztcbiAgfVxuXG4gIC8vIGlmIHVzaW5nIEpTRVAgd2l0aCBXZWJHUFUsIGFsd2F5cyBkaXNhYmxlIG1lbW9yeSBwYXR0ZXJuXG4gIGlmIChvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycyAmJlxuICAgICAgb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMuc29tZShlcCA9PiAodHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZSkgPT09ICd3ZWJncHUnKSkge1xuICAgIG9wdGlvbnMuZW5hYmxlTWVtUGF0dGVybiA9IGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBzZXRFeGVjdXRpb25Qcm92aWRlcnMgPVxuICAgIChzZXNzaW9uT3B0aW9uc0hhbmRsZTogbnVtYmVyLCBleGVjdXRpb25Qcm92aWRlcnM6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uRXhlY3V0aW9uUHJvdmlkZXJDb25maWdbXSxcbiAgICAgYWxsb2NzOiBudW1iZXJbXSk6IHZvaWQgPT4ge1xuICAgICAgZm9yIChjb25zdCBlcCBvZiBleGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgICAgbGV0IGVwTmFtZSA9IHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWU7XG5cbiAgICAgICAgLy8gY2hlY2sgRVAgbmFtZVxuICAgICAgICBzd2l0Y2ggKGVwTmFtZSkge1xuICAgICAgICAgIGNhc2UgJ3dlYm5uJzpcbiAgICAgICAgICAgIGVwTmFtZSA9ICdXRUJOTic7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVwICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb25zdCB3ZWJubk9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5ORXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LmRldmljZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdkZXZpY2VUeXBlJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2Vibm5PcHRpb25zLmRldmljZVR5cGUsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnZGV2aWNlVHlwZScgLSAke3dlYm5uT3B0aW9ucy5kZXZpY2VUeXBlfS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHdlYm5uT3B0aW9ucz8ubnVtVGhyZWFkcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1UaHJlYWRzID0gd2Vibm5PcHRpb25zLm51bVRocmVhZHM7XG4gICAgICAgICAgICAgICAgLy8gSnVzdCBpZ25vcmUgaW52YWxpZCB3ZWJubk9wdGlvbnMubnVtVGhyZWFkcy5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bVRocmVhZHMgIT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIobnVtVGhyZWFkcykgfHwgbnVtVGhyZWFkcyA8IDApIHtcbiAgICAgICAgICAgICAgICAgIG51bVRocmVhZHMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdudW1UaHJlYWRzJywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobnVtVGhyZWFkcy50b1N0cmluZygpLCBhbGxvY3MpO1xuICAgICAgICAgICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09XG4gICAgICAgICAgICAgICAgICAgIDApIHtcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ251bVRocmVhZHMnIC0gJHt3ZWJubk9wdGlvbnMubnVtVGhyZWFkc30uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LnBvd2VyUHJlZmVyZW5jZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ3Bvd2VyUHJlZmVyZW5jZScsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHdlYm5uT3B0aW9ucy5wb3dlclByZWZlcmVuY2UsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncG93ZXJQcmVmZXJlbmNlJyAtICR7d2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZX0uYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd3ZWJncHUnOlxuICAgICAgICAgICAgZXBOYW1lID0gJ0pTJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHdlYmdwdU9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYkdwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucz8ucHJlZmVycmVkTGF5b3V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHdlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0ICE9PSAnTkNIVycgJiYgd2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOSFdDJykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBwcmVmZXJyZWRMYXlvdXQgbXVzdCBiZSBlaXRoZXIgJ05DSFcnIG9yICdOSFdDJzogJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncHJlZmVycmVkTGF5b3V0JywgYWxsb2NzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQsIGFsbG9jcyk7XG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cbiAgICAgICAgICAgICAgICAgICAgMCkge1xuICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncHJlZmVycmVkTGF5b3V0JyAtICR7d2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXR9LmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnd2FzbSc6XG4gICAgICAgICAgY2FzZSAnY3B1JzpcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vdCBzdXBwb3J0ZWQgZXhlY3V0aW9uIHByb3ZpZGVyOiAke2VwTmFtZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVwTmFtZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoZXBOYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAoZ2V0SW5zdGFuY2UoKS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXIoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGVwTmFtZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFwcGVuZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbmV4cG9ydCBjb25zdCBzZXRTZXNzaW9uT3B0aW9ucyA9IChvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3Qgc2Vzc2lvbk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBhcHBlbmREZWZhdWx0T3B0aW9ucyhzZXNzaW9uT3B0aW9ucyk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBncmFwaE9wdGltaXphdGlvbkxldmVsID0gZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsKHNlc3Npb25PcHRpb25zLmdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPz8gJ2FsbCcpO1xuICAgIGNvbnN0IGV4ZWN1dGlvbk1vZGUgPSBnZXRFeGVjdXRpb25Nb2RlKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvbk1vZGUgPz8gJ3NlcXVlbnRpYWwnKTtcbiAgICBjb25zdCBsb2dJZERhdGFPZmZzZXQgPVxuICAgICAgICB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMubG9nSWQgPT09ICdzdHJpbmcnID8gYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLmxvZ0lkLCBhbGxvY3MpIDogMDtcblxuICAgIGNvbnN0IGxvZ1NldmVyaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID8/IDI7ICAvLyBEZWZhdWx0IHRvIDIgLSB3YXJuaW5nXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1NldmVyaXR5TGV2ZWwpIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPCAwIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgbG9nVmVyYm9zaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA/PyAwOyAgLy8gRGVmYXVsdCB0byAwIC0gdmVyYm9zZVxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihsb2dWZXJib3NpdHlMZXZlbCkgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPCAwIHx8IGxvZ1ZlcmJvc2l0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtsb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0ID0gdHlwZW9mIHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGggPT09ICdzdHJpbmcnID9cbiAgICAgICAgYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGgsIGFsbG9jcykgOlxuICAgICAgICAwO1xuXG4gICAgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucyhcbiAgICAgICAgZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVDcHVNZW1BcmVuYSwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuLCBleGVjdXRpb25Nb2RlLFxuICAgICAgICAhIXNlc3Npb25PcHRpb25zLmVuYWJsZVByb2ZpbGluZywgMCwgbG9nSWREYXRhT2Zmc2V0LCBsb2dTZXZlcml0eUxldmVsLCBsb2dWZXJib3NpdHlMZXZlbCxcbiAgICAgICAgb3B0aW1pemVkTW9kZWxGaWxlUGF0aE9mZnNldCk7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgc2Vzc2lvbiBvcHRpb25zLicpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgIHNldEV4ZWN1dGlvblByb3ZpZGVycyhzZXNzaW9uT3B0aW9uc0hhbmRsZSwgc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmUgIT09ICdib29sZWFuJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGVuYWJsZUdyYXBoQ2FwdHVyZSBtdXN0IGJlIGEgYm9vbGVhbiB2YWx1ZTogJHtzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmV9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdlbmFibGVHcmFwaENhcHR1cmUnLCBhbGxvY3MpO1xuICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZS50b1N0cmluZygpLCBhbGxvY3MpO1xuICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcihcbiAgICAgICAgICAgIGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ2VuYWJsZUdyYXBoQ2FwdHVyZScgLSAke3Nlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZX0uYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSBuYW1lIG11c3QgYmUgYSBzdHJpbmc6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSB2YWx1ZSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXI6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhuYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAod2FzbS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlKHNlc3Npb25PcHRpb25zSGFuZGxlLCBuYW1lT2Zmc2V0LCB2YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuLy8gYSBkdW1teSB0eXBlIGRlY2xhcmF0aW9uIGZvciBGbG9hdDE2QXJyYXkgaW4gY2FzZSBhbnkgcG9seWZpbGwgaXMgYXZhaWxhYmxlLlxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIGNvbnN0IEZsb2F0MTZBcnJheTogYW55O1xufVxuXG4vLyBUaGlzIGZpbGUgaW5jbHVkZXMgY29tbW9uIGRlZmluaXRpb25zLiBUaGV5IGRvIE5PVCBoYXZlIGRlcGVuZGVuY3kgb24gdGhlIFdlYkFzc2VtYmx5IGluc3RhbmNlLlxuXG4vKipcbiAqIENvcGllZCBmcm9tIE9OTlggZGVmaW5pdGlvbi4gVXNlIHRoaXMgdG8gZHJvcCBkZXBlbmRlbmN5ICdvbm54X3Byb3RvJyB0byBkZWNyZWFzZSBjb21waWxlZCAuanMgZmlsZSBzaXplLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBEYXRhVHlwZSB7XG4gIHVuZGVmaW5lZCA9IDAsXG4gIGZsb2F0ID0gMSxcbiAgdWludDggPSAyLFxuICBpbnQ4ID0gMyxcbiAgdWludDE2ID0gNCxcbiAgaW50MTYgPSA1LFxuICBpbnQzMiA9IDYsXG4gIGludDY0ID0gNyxcbiAgc3RyaW5nID0gOCxcbiAgYm9vbCA9IDksXG4gIGZsb2F0MTYgPSAxMCxcbiAgZG91YmxlID0gMTEsXG4gIHVpbnQzMiA9IDEyLFxuICB1aW50NjQgPSAxMyxcbiAgY29tcGxleDY0ID0gMTQsXG4gIGNvbXBsZXgxMjggPSAxNSxcbiAgYmZsb2F0MTYgPSAxNlxufVxuXG4vKipcbiAqIE1hcCBzdHJpbmcgdGVuc29yIGRhdGEgdG8gZW51bSB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0gPSAodHlwZTogc3RyaW5nKTogRGF0YVR5cGUgPT4ge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdpbnQ4JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ4O1xuICAgIGNhc2UgJ3VpbnQ4JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50ODtcbiAgICBjYXNlICdib29sJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5ib29sO1xuICAgIGNhc2UgJ2ludDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQxNjtcbiAgICBjYXNlICd1aW50MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQxNjtcbiAgICBjYXNlICdpbnQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50MzI7XG4gICAgY2FzZSAndWludDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50MzI7XG4gICAgY2FzZSAnZmxvYXQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQxNjtcbiAgICBjYXNlICdmbG9hdDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5mbG9hdDtcbiAgICBjYXNlICdmbG9hdDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5kb3VibGU7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5zdHJpbmc7XG4gICAgY2FzZSAnaW50NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDY0O1xuICAgIGNhc2UgJ3VpbnQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDY0O1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gIH1cbn07XG5cbi8qKlxuICogTWFwIGVudW0gdmFsdWUgdG8gc3RyaW5nIHRlbnNvciBkYXRhXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZyA9ICh0eXBlUHJvdG86IERhdGFUeXBlKTogVGVuc29yLlR5cGUgPT4ge1xuICBzd2l0Y2ggKHR5cGVQcm90bykge1xuICAgIGNhc2UgRGF0YVR5cGUuaW50ODpcbiAgICAgIHJldHVybiAnaW50OCc7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50ODpcbiAgICAgIHJldHVybiAndWludDgnO1xuICAgIGNhc2UgRGF0YVR5cGUuYm9vbDpcbiAgICAgIHJldHVybiAnYm9vbCc7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQxNjpcbiAgICAgIHJldHVybiAnaW50MTYnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDE2OlxuICAgICAgcmV0dXJuICd1aW50MTYnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50MzI6XG4gICAgICByZXR1cm4gJ2ludDMyJztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQzMjpcbiAgICAgIHJldHVybiAndWludDMyJztcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0MTY6XG4gICAgICByZXR1cm4gJ2Zsb2F0MTYnO1xuICAgIGNhc2UgRGF0YVR5cGUuZmxvYXQ6XG4gICAgICByZXR1cm4gJ2Zsb2F0MzInO1xuICAgIGNhc2UgRGF0YVR5cGUuZG91YmxlOlxuICAgICAgcmV0dXJuICdmbG9hdDY0JztcbiAgICBjYXNlIERhdGFUeXBlLnN0cmluZzpcbiAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICBjYXNlIERhdGFUeXBlLmludDY0OlxuICAgICAgcmV0dXJuICdpbnQ2NCc7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50NjQ6XG4gICAgICByZXR1cm4gJ3VpbnQ2NCc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZVByb3RvfWApO1xuICB9XG59O1xuXG4vKipcbiAqIGdldCB0ZW5zb3IgZWxlbWVudCBzaXplIGluIGJ5dGVzIGJ5IHRoZSBnaXZlbiBkYXRhIHR5cGVcbiAqIEByZXR1cm5zIHNpemUgaW4gaW50ZWdlciBvciB1bmRlZmluZWQgaWYgdGhlIGRhdGEgdHlwZSBpcyBub3Qgc3VwcG9ydGVkXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRUZW5zb3JFbGVtZW50U2l6ZSA9IChkYXRlVHlwZTogbnVtYmVyKTogbnVtYmVyfFxuICAgIHVuZGVmaW5lZCA9PiBbdW5kZWZpbmVkLCA0LCAxLCAxLCAyLCAyLCA0LCA4LCB1bmRlZmluZWQsIDEsIDIsIDgsIDQsIDgsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWRdW2RhdGVUeXBlXTtcblxuLyoqXG4gKiBnZXQgdHlwZWQgYXJyYXkgY29uc3RydWN0b3IgYnkgdGhlIGdpdmVuIHRlbnNvciB0eXBlXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3IgPSAodHlwZTogVGVuc29yLlR5cGUpOiBGbG9hdDMyQXJyYXlDb25zdHJ1Y3RvcnxVaW50OEFycmF5Q29uc3RydWN0b3J8XG4gICAgSW50OEFycmF5Q29uc3RydWN0b3J8VWludDE2QXJyYXlDb25zdHJ1Y3RvcnxJbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MzJBcnJheUNvbnN0cnVjdG9yfEJpZ0ludDY0QXJyYXlDb25zdHJ1Y3RvcnxcbiAgICBVaW50OEFycmF5Q29uc3RydWN0b3J8RmxvYXQ2NEFycmF5Q29uc3RydWN0b3J8VWludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdVaW50NjRBcnJheUNvbnN0cnVjdG9yID0+IHtcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdmbG9hdDE2JzpcbiAgICAgICAgICAvLyBhbGxvdyBGbG9hdDE2QXJyYXkgcG9seWZpbGwuXG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiBGbG9hdDE2QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIEZsb2F0MTZBcnJheS5mcm9tID8gRmxvYXQxNkFycmF5IDogVWludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgICAgIHJldHVybiBGbG9hdDMyQXJyYXk7XG4gICAgICAgIGNhc2UgJ3VpbnQ4JzpcbiAgICAgICAgICByZXR1cm4gVWludDhBcnJheTtcbiAgICAgICAgY2FzZSAnaW50OCc6XG4gICAgICAgICAgcmV0dXJuIEludDhBcnJheTtcbiAgICAgICAgY2FzZSAndWludDE2JzpcbiAgICAgICAgICByZXR1cm4gVWludDE2QXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDE2JzpcbiAgICAgICAgICByZXR1cm4gSW50MTZBcnJheTtcbiAgICAgICAgY2FzZSAnaW50MzInOlxuICAgICAgICAgIHJldHVybiBJbnQzMkFycmF5O1xuICAgICAgICBjYXNlICdib29sJzpcbiAgICAgICAgICByZXR1cm4gVWludDhBcnJheTtcbiAgICAgICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICAgICAgcmV0dXJuIEZsb2F0NjRBcnJheTtcbiAgICAgICAgY2FzZSAndWludDMyJzpcbiAgICAgICAgICByZXR1cm4gVWludDMyQXJyYXk7XG4gICAgICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgICAgICByZXR1cm4gQmlnSW50NjRBcnJheTtcbiAgICAgICAgY2FzZSAndWludDY0JzpcbiAgICAgICAgICByZXR1cm4gQmlnVWludDY0QXJyYXk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCB0eXBlOiAke3R5cGV9YCk7XG4gICAgICB9XG4gICAgfTtcblxuLyoqXG4gKiBNYXAgc3RyaW5nIGxvZyBsZXZlbCB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBsb2dMZXZlbFN0cmluZ1RvRW51bSA9IChsb2dMZXZlbD86ICd2ZXJib3NlJ3wnaW5mbyd8J3dhcm5pbmcnfCdlcnJvcid8J2ZhdGFsJyk6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAobG9nTGV2ZWwpIHtcbiAgICBjYXNlICd2ZXJib3NlJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ2luZm8nOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnd2FybmluZyc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICdlcnJvcic6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICdmYXRhbCc6XG4gICAgICByZXR1cm4gNDtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBsb2dnaW5nIGxldmVsOiAke2xvZ0xldmVsfWApO1xuICB9XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIHRlbnNvciB0eXBlIGlzIHN1cHBvcnRlZCBieSBHUFUgYnVmZmVyXG4gKi9cbmV4cG9ydCBjb25zdCBpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUgPSAodHlwZTogVGVuc29yLlR5cGUpOiB0eXBlIGlzIFRlbnNvci5HcHVCdWZmZXJEYXRhVHlwZXMgPT4gdHlwZSA9PT0gJ2Zsb2F0MzInIHx8XG4gICAgdHlwZSA9PT0gJ2Zsb2F0MTYnIHx8IHR5cGUgPT09ICdpbnQzMicgfHwgdHlwZSA9PT0gJ2ludDY0JyB8fCB0eXBlID09PSAndWludDMyJyB8fCB0eXBlID09PSAndWludDgnIHx8XG4gICAgdHlwZSA9PT0gJ2Jvb2wnO1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgZGF0YSBsb2NhdGlvbiB0byBpbnRlZ2VyIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0gPSAobG9jYXRpb246IFRlbnNvci5EYXRhTG9jYXRpb24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XG4gICAgY2FzZSAnbm9uZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIHJldHVybiAzO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgaW50ZWdlciBkYXRhIGxvY2F0aW9uIHRvIHN0cmluZyB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uRW51bVRvU3RyaW5nID0gKGxvY2F0aW9uOiBudW1iZXIpOiBUZW5zb3IuRGF0YUxvY2F0aW9ufHVuZGVmaW5lZCA9PlxuICAgIChbJ25vbmUnLCAnY3B1JywgJ2NwdS1waW5uZWQnLCAndGV4dHVyZScsICdncHUtYnVmZmVyJ10gYXMgY29uc3QpW2xvY2F0aW9uXTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHtyZWFkRmlsZX0gZnJvbSAnbm9kZTpmcy9wcm9taXNlcyc7XG5cbi8qKlxuICogTG9hZCBhIGZpbGUgaW50byBhIFVpbnQ4QXJyYXkuXG4gKlxuICogQHBhcmFtIGZpbGUgLSB0aGUgZmlsZSB0byBsb2FkLiBDYW4gYmUgYSBVUkwvcGF0aCwgYSBCbG9iLCBhbiBBcnJheUJ1ZmZlciwgb3IgYSBVaW50OEFycmF5LlxuICogQHJldHVybnMgYSBVaW50OEFycmF5IGNvbnRhaW5pbmcgdGhlIGZpbGUgZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRGaWxlID0gYXN5bmMoZmlsZTogc3RyaW5nfEJsb2J8QXJyYXlCdWZmZXJMaWtlfFVpbnQ4QXJyYXkpOiBQcm9taXNlPFVpbnQ4QXJyYXk+ID0+IHtcbiAgaWYgKHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLm5vZGUpIHtcbiAgICAgIC8vIGxvYWQgZmlsZSBpbnRvIEFycmF5QnVmZmVyIGluIE5vZGUuanNcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCByZWFkRmlsZShmaWxlKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlLmNvZGUgPT09ICdFUlJfRlNfRklMRV9UT09fTEFSR0UnKSB7XG4gICAgICAgICAgLy8gZmlsZSBpcyB0b28gbGFyZ2UsIHVzZSBmcy5jcmVhdGVSZWFkU3RyZWFtIGluc3RlYWRcbiAgICAgICAgICBjb25zdCBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUpO1xuICAgICAgICAgIGNvbnN0IGNodW5rczogVWludDhBcnJheVtdID0gW107XG4gICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBzdHJlYW0pIHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KEJ1ZmZlci5jb25jYXQoY2h1bmtzKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbG9hZCBmaWxlIGludG8gQXJyYXlCdWZmZXIgaW4gYnJvd3NlcnNcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZmlsZSk7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBjb250ZW50TGVuZ3RoSGVhZGVyID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtTGVuZ3RoJyk7XG4gICAgICBjb25zdCBmaWxlU2l6ZSA9IGNvbnRlbnRMZW5ndGhIZWFkZXIgPyBwYXJzZUludChjb250ZW50TGVuZ3RoSGVhZGVyLCAxMCkgOiAwO1xuICAgICAgaWYgKGZpbGVTaXplIDwgMTA3Mzc0MTgyNCAvKiAxR0IgKi8pIHtcbiAgICAgICAgLy8gd2hlbiBDb250ZW50LUxlbmd0aCBoZWFkZXIgaXMgbm90IHNldCwgd2UgY2Fubm90IGRldGVybWluZSB0aGUgZmlsZSBzaXplLiBXZSBhc3N1bWUgaXQgaXMgc21hbGwgZW5vdWdoIHRvXG4gICAgICAgIC8vIGxvYWQgaW50byBtZW1vcnkuXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCByZXNwb25zZS5hcnJheUJ1ZmZlcigpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZpbGUgaXMgdG9vIGxhcmdlLCB1c2Ugc3RyZWFtIGluc3RlYWRcbiAgICAgICAgaWYgKCFyZXNwb25zZS5ib2R5KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmYWlsZWQgdG8gbG9hZCBleHRlcm5hbCBkYXRhIGZpbGU6ICR7ZmlsZX0sIG5vIHJlc3BvbnNlIGJvZHkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKTtcblxuICAgICAgICBsZXQgYnVmZmVyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIHRyeSB0byBjcmVhdGUgQXJyYXlCdWZmZXIgZGlyZWN0bHlcbiAgICAgICAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoZmlsZVNpemUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBSYW5nZUVycm9yKSB7XG4gICAgICAgICAgICAvLyB1c2UgV2ViQXNzZW1ibHkgTWVtb3J5IHRvIGFsbG9jYXRlIGxhcmdlciBBcnJheUJ1ZmZlclxuICAgICAgICAgICAgY29uc3QgcGFnZXMgPSBNYXRoLmNlaWwoZmlsZVNpemUgLyA2NTUzNik7XG4gICAgICAgICAgICBidWZmZXIgPSBuZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHtpbml0aWFsOiBwYWdlcywgbWF4aW11bTogcGFnZXN9KS5idWZmZXI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9mZnNldCA9IDA7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjb25zdCB7ZG9uZSwgdmFsdWV9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGNodW5rU2l6ZSA9IHZhbHVlLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgY29uc3QgY2h1bmsgPSBuZXcgVWludDhBcnJheShidWZmZXIsIG9mZnNldCwgY2h1bmtTaXplKTtcbiAgICAgICAgICBjaHVuay5zZXQodmFsdWUpO1xuICAgICAgICAgIG9mZnNldCArPSBjaHVua1NpemU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgMCwgZmlsZVNpemUpO1xuICAgICAgfVxuICAgIH1cblxuICB9IGVsc2UgaWYgKGZpbGUgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IGZpbGUuYXJyYXlCdWZmZXIoKSk7XG4gIH0gZWxzZSBpZiAoZmlsZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICByZXR1cm4gZmlsZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZmlsZSk7XG4gIH1cbn07XG4iLCAiZXhwb3J0IGNvbnN0IHJlYWRGaWxlID0gdW5kZWZpbmVkO2V4cG9ydCBjb25zdCByZWFkRmlsZVN5bmMgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IGNyZWF0ZVJlYWRTdHJlYW0gPSB1bmRlZmluZWQ7IiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge0VudiwgSW5mZXJlbmNlU2Vzc2lvbiwgVGVuc29yfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge1NlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyLCBTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGEsIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhLCBUZW5zb3JNZXRhZGF0YX0gZnJvbSAnLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge3NldFJ1bk9wdGlvbnN9IGZyb20gJy4vcnVuLW9wdGlvbnMnO1xuaW1wb3J0IHtzZXRTZXNzaW9uT3B0aW9uc30gZnJvbSAnLi9zZXNzaW9uLW9wdGlvbnMnO1xuaW1wb3J0IHtkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0sIGdldFRlbnNvckVsZW1lbnRTaXplLCBpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUsIGxvZ0xldmVsU3RyaW5nVG9FbnVtLCB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZywgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0sIHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcn0gZnJvbSAnLi93YXNtLWNvbW1vbic7XG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge2FsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3J9IGZyb20gJy4vd2FzbS11dGlscyc7XG5pbXBvcnQge2xvYWRGaWxlfSBmcm9tICcuL3dhc20tdXRpbHMtbG9hZC1maWxlJztcblxuLy8gI3JlZ2lvbiBJbml0aWFsaXphdGlvbnNcblxuLyoqXG4gKiBUaGVyZSBhcmUgNCBkaWZmZXJlbnQgXCJpbml0aWFsaXphdGlvblwiIHN0ZXBzIGZvciBPUlQuIFRoZXkgaGFwcGVuIGluIGRpZmZlcmVudCBwbGFjZXMgYW5kIGRpZmZlcmVudCB0aW1lLlxuICpcbiAqIDEuIEphdmFTY3JpcHQgaW5pdGlhbGl6YXRpb24gZm9yIG9ubnhydW50aW1lLWNvbW1vbiBhbmQgb25ueHJ1bnRpbWUtd2ViLlxuICogICAgVGhpcyBpcyB0aGUgZmlyc3QgaW5pdGlhbGl6YXRpb24gc3RlcC4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgY2FsbHMgb25ueHJ1bnRpbWUtY29tbW9uJ3MgcmVnaXN0ZXJCYWNrZW5kKClcbiAqIGZ1bmN0aW9uIG11bHRpcGxlIHRpbWVzIHRvIHJlZ2lzdGVyIGFsbCB0aGUgYXZhaWxhYmxlIGJhY2tlbmRzLiBUaGUgYmFja2VuZCByZWdpc3RyYXRpb24gaXMgdmVyeSBmYXN0LiBJdCBvbmx5XG4gKiByZWdpc3RlcnMgdGhlIGJhY2tlbmQgbmFtZSB3aXRoIHRoZSB1bmluaXRpYWxpemVkIGJhY2tlbmQgb2JqZWN0LiBObyBoZWF2eSBpbml0aWFsaXphdGlvbiBpcyBkb25lIGluIHRoaXMgc3RlcC5cbiAqICAgIFJlZmVyIHRvIHdlYi9saWIvaW5kZXgudHMgZm9yIHRoZSBiYWNrZW5kIHJlZ2lzdHJhdGlvbi5cbiAqXG4gKiAyLiBXZWJBc3NlbWJseSBhcnRpZmFjdCBpbml0aWFsaXphdGlvbi5cbiAqICAgIFRoaXMgaGFwcGVucyB3aGVuIGFueSByZWdpc3RlcmVkIHdhc20gYmFja2VuZCBpcyB1c2VkIGZvciB0aGUgZmlyc3QgdGltZSAoaWUuIGBvcnQuSW5mZXJlbmNlU2Vzc2lvbi5jcmVhdGUoKWAgb3JcbiAqIGBvcnQuVHJhaW5pbmdTZXNzaW9uLmNyZWF0ZSgpYCBpcyBjYWxsZWQpLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBkb2VzIHRoZSBmb2xsb3dpbmdzOlxuICogICAgIC0gY3JlYXRlIGEgcHJveHkgd29ya2VyIGFuZCBtYWtlIHN1cmUgdGhlIHByb3h5IHdvcmtlciBpcyByZWFkeSB0byByZWNlaXZlIG1lc3NhZ2VzLCBpZiBwcm94eSBpcyBlbmFibGVkLlxuICogICAgIC0gcGVyZm9ybSBmZWF0dXJlIGRldGVjdGlvbiwgbG9jYXRlIGNvcnJlY3QgV2ViQXNzZW1ibHkgYXJ0aWZhY3QgcGF0aCBhbmQgY2FsbCB0aGUgRW1zY3JpcHRlbiBnZW5lcmF0ZWRcbiAqIEphdmFTY3JpcHQgY29kZSB0byBpbml0aWFsaXplIHRoZSBXZWJBc3NlbWJseSBydW50aW1lLlxuICogICAgICAgICAtIGlmIHByb3h5IGlzIGVuYWJsZWQsIHRoaXMgc3RlcCBoYXBwZW5zIGluIHRoZSBwcm94eSB3b3JrZXIgdXNpbmcgbWVzc2FnZSAnaW5pdC13YXNtJy5cbiAqICAgICAgICAgLSBkb3dubG9hZGluZyB0aGUgJ29ydC13YXNtey4uLn0ud2FzbScgZmlsZSBpcyBkb25lIGluIHRoaXMgc3RlcC5cbiAqICAgICAgICAgLSBpZiBtdWx0aS10aHJlYWQgaXMgZW5hYmxlZCwgb25lIG9yIG1vcmUgd2Vid29ya2VyIHdpbGwgYmUgY3JlYXRlZCB0byBpbml0aWFsaXplIHRoZSBQVGhyZWFkIHRocmVhZHBvb2wuXG4gKlxuICogMy4gT1JUIGVudmlyb25tZW50IGluaXRpYWxpemF0aW9uLlxuICogICAgVGhpcyBoYXBwZW5zIGFmdGVyIHN0ZXAgMi4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgcGVyZm9ybXMgT05OWCBSdW50aW1lIGVudmlyb25tZW50IGluaXRpYWxpemF0aW9uLlxuICogRnVuY3Rpb24gYF9PcnRJbml0KClgIGlzIGNhbGxlZCBpbiB0aGlzIHN0ZXAuXG4gKiAgICAgLSBpZiBwcm94eSBpcyBlbmFibGVkLCB0aGlzIHN0ZXAgaGFwcGVucyBpbiB0aGUgcHJveHkgd29ya2VyIHVzaW5nIG1lc3NhZ2UgJ2luaXQtb3J0Jy5cbiAqICAgICAtIGxvZ2dpbmcgbGV2ZWwgKG9ydC5lbnYubG9nTGV2ZWwpIGFuZCB0aHJlYWQgbnVtYmVyIChvcnQuZW52Lndhc20ubnVtVGhyZWFkcykgYXJlIHNldCBpbiB0aGlzIHN0ZXAuXG4gKlxuICogNC4gU2Vzc2lvbiBpbml0aWFsaXphdGlvbi5cbiAqICAgIFRoaXMgaGFwcGVucyB3aGVuIGBvcnQuSW5mZXJlbmNlU2Vzc2lvbi5jcmVhdGUoKWAgb3IgYG9ydC5UcmFpbmluZ1Nlc3Npb24uY3JlYXRlKClgIGlzIGNhbGxlZC4gVW5saWtlIHRoZSBmaXJzdCAzXG4gKiBzdGVwcyAodGhleSBvbmx5IGNhbGxlZCBvbmNlKSwgdGhpcyBzdGVwIHdpbGwgYmUgZG9uZSBmb3IgZWFjaCBzZXNzaW9uLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBkb2VzIHRoZVxuICogZm9sbG93aW5nczpcbiAqICAgIElmIHRoZSBwYXJhbWV0ZXIgaXMgYSBVUkw6XG4gKiAgICAtIGRvd25sb2FkIHRoZSBtb2RlbCBkYXRhIGZyb20gdGhlIFVSTC5cbiAqICAgIC0gY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLiAocHJveHk6ICdjb3B5LWZyb20nKVxuICogICAgLSBkZXJlZmVyZW5jZSB0aGUgbW9kZWwgYnVmZmVyLiBUaGlzIHN0ZXAgYWxsb3dzIHRoZSBvcmlnaW5hbCBBcnJheUJ1ZmZlciB0byBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cbiAqICAgIC0gY2FsbCBgX09ydENyZWF0ZVNlc3Npb24oKWAgdG8gY3JlYXRlIHRoZSBzZXNzaW9uLiAocHJveHk6ICdjcmVhdGUnKVxuICpcbiAqICAgIElmIHRoZSBwYXJhbWV0ZXIgaXMgYSBVaW50OEFycmF5IG9iamVjdDpcbiAqICAgIC0gY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLiAocHJveHk6ICdjb3B5LWZyb20nKVxuICogICAgLSBjYWxsIGBfT3J0Q3JlYXRlU2Vzc2lvbigpYCB0byBjcmVhdGUgdGhlIHNlc3Npb24uIChwcm94eTogJ2NyZWF0ZScpXG4gKlxuICpcbiAqL1xuXG4vKipcbiAqIGluaXRpYWxpemUgT1JUIGVudmlyb25tZW50LlxuICpcbiAqIEBwYXJhbSBudW1UaHJlYWRzIFNldEdsb2JhbEludHJhT3BOdW1UaHJlYWRzKG51bVRocmVhZHMpXG4gKiBAcGFyYW0gbG9nZ2luZ0xldmVsIENyZWF0ZUVudihzdGF0aWNfY2FzdDxPcnRMb2dnaW5nTGV2ZWw+KGxvZ2dpbmdfbGV2ZWwpKVxuICovXG5jb25zdCBpbml0T3J0ID0gKG51bVRocmVhZHM6IG51bWJlciwgbG9nZ2luZ0xldmVsOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgY29uc3QgZXJyb3JDb2RlID0gZ2V0SW5zdGFuY2UoKS5fT3J0SW5pdChudW1UaHJlYWRzLCBsb2dnaW5nTGV2ZWwpO1xuICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgaW5pdGlhbGl6ZSBvbm54cnVudGltZS4nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBpbnRpYWxpemUgcnVudGltZSBlbnZpcm9ubWVudC5cbiAqIEBwYXJhbSBlbnYgcGFzc2VkIGluIHRoZSBlbnZpcm9ubWVudCBjb25maWcgb2JqZWN0LlxuICovXG5leHBvcnQgY29uc3QgaW5pdFJ1bnRpbWUgPSBhc3luYyhlbnY6IEVudik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAvLyBpbml0IE9SVFxuICBpbml0T3J0KGVudi53YXNtLm51bVRocmVhZHMhLCBsb2dMZXZlbFN0cmluZ1RvRW51bShlbnYubG9nTGV2ZWwpKTtcbn07XG5cbi8qKlxuICogcGVyZm9ybSBFUCBzcGVjaWZpYyBpbml0aWFsaXphdGlvbi5cbiAqXG4gKiBAcGFyYW0gZW52XG4gKiBAcGFyYW0gZXBOYW1lXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0RXAgPSBhc3luYyhlbnY6IEVudiwgZXBOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMsIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgICBjb25zdCBpbml0SnNlcCA9IHJlcXVpcmUoJy4vanNlcC9pbml0JykuaW5pdDtcblxuICAgIGlmIChlcE5hbWUgPT09ICd3ZWJncHUnKSB7XG4gICAgICAvLyBwZXJmb3JtIFdlYkdQVSBhdmFpbGFiaWxpdHkgY2hlY2tcbiAgICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyB8fCAhbmF2aWdhdG9yLmdwdSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkdQVSBpcyBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnQnKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGFkYXB0ZXIgPSBlbnYud2ViZ3B1LmFkYXB0ZXIgYXMgR1BVQWRhcHRlciB8IG51bGw7XG4gICAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgLy8gaWYgYWRhcHRlciBpcyBub3Qgc2V0LCByZXF1ZXN0IGEgbmV3IGFkYXB0ZXIuXG4gICAgICAgIGNvbnN0IHBvd2VyUHJlZmVyZW5jZSA9IGVudi53ZWJncHUucG93ZXJQcmVmZXJlbmNlO1xuICAgICAgICBpZiAocG93ZXJQcmVmZXJlbmNlICE9PSB1bmRlZmluZWQgJiYgcG93ZXJQcmVmZXJlbmNlICE9PSAnbG93LXBvd2VyJyAmJlxuICAgICAgICAgICAgcG93ZXJQcmVmZXJlbmNlICE9PSAnaGlnaC1wZXJmb3JtYW5jZScpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcG93ZXJQcmVmZXJlbmNlIHNldHRpbmc6IFwiJHtwb3dlclByZWZlcmVuY2V9XCJgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb3JjZUZhbGxiYWNrQWRhcHRlciA9IGVudi53ZWJncHUuZm9yY2VGYWxsYmFja0FkYXB0ZXI7XG4gICAgICAgIGlmIChmb3JjZUZhbGxiYWNrQWRhcHRlciAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBmb3JjZUZhbGxiYWNrQWRhcHRlciAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGZvcmNlRmFsbGJhY2tBZGFwdGVyIHNldHRpbmc6IFwiJHtmb3JjZUZhbGxiYWNrQWRhcHRlcn1cImApO1xuICAgICAgICB9XG4gICAgICAgIGFkYXB0ZXIgPSBhd2FpdCBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKHtwb3dlclByZWZlcmVuY2UsIGZvcmNlRmFsbGJhY2tBZGFwdGVyfSk7XG4gICAgICAgIGlmICghYWRhcHRlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0ZhaWxlZCB0byBnZXQgR1BVIGFkYXB0ZXIuICcgK1xuICAgICAgICAgICAgICAnWW91IG1heSBuZWVkIHRvIGVuYWJsZSBmbGFnIFwiLS1lbmFibGUtdW5zYWZlLXdlYmdwdVwiIGlmIHlvdSBhcmUgdXNpbmcgQ2hyb21lLicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiBhZGFwdGVyIGlzIHNldCwgdmFsaWRhdGUgaXQuXG4gICAgICAgIGlmICh0eXBlb2YgYWRhcHRlci5saW1pdHMgIT09ICdvYmplY3QnIHx8IHR5cGVvZiBhZGFwdGVyLmZlYXR1cmVzICE9PSAnb2JqZWN0JyB8fFxuICAgICAgICAgICAgdHlwZW9mIGFkYXB0ZXIucmVxdWVzdERldmljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBHUFUgYWRhcHRlciBzZXQgaW4gYGVudi53ZWJncHUuYWRhcHRlcmAuIEl0IG11c3QgYmUgYSBHUFVBZGFwdGVyIG9iamVjdC4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWVudi53YXNtLnNpbWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ05vdCBzdXBwb3J0ZWQgZm9yIFdlYkdQVT1PTiBhbmQgU0lNRD1PRkYuIFBsZWFzZSBzZXQgYGVudi53YXNtLnNpbWRgIHRvIHRydWUgd2hlbiB1c2luZyBgd2ViZ3B1YCBFUCcpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBpbml0SnNlcCgnd2ViZ3B1JywgZ2V0SW5zdGFuY2UoKSwgZW52LCBhZGFwdGVyKTtcbiAgICB9XG4gICAgaWYgKGVwTmFtZSA9PT0gJ3dlYm5uJykge1xuICAgICAgLy8gcGVyZm9ybSBXZWJOTiBhdmFpbGFiaWxpdHkgY2hlY2tcbiAgICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyB8fCAhKG5hdmlnYXRvciBhcyB1bmtub3duIGFzIHttbDogdW5rbm93bn0pLm1sKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViTk4gaXMgbm90IHN1cHBvcnRlZCBpbiBjdXJyZW50IGVudmlyb25tZW50Jyk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IGluaXRKc2VwKCd3ZWJubicsIGdldEluc3RhbmNlKCksIGVudik7XG4gICAgfVxuICB9XG59O1xuXG4vLyAjZW5kcmVnaW9uIEluaXRpYWxpemF0aW9uc1xuXG4vKipcbiAqIHZhbGlkIGRhdGEgbG9jYXRpb25zIGZvciBpbnB1dC9vdXRwdXQgdGVuc29ycy5cbiAqL1xudHlwZSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dCA9ICdjcHUnfCdjcHUtcGlubmVkJ3wnZ3B1LWJ1ZmZlcic7XG5cbnR5cGUgSU9CaW5kaW5nU3RhdGUgPSB7XG4gIC8qKlxuICAgKiB0aGUgaGFuZGxlIG9mIElPIGJpbmRpbmcuXG4gICAqL1xuICByZWFkb25seSBoYW5kbGU6IG51bWJlcjtcblxuICAvKipcbiAgICogdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKlxuICAgKiB2YWx1ZSBpcyBvbmUgb2YgJ2NwdScsICdjcHUtcGlubmVkJywgJ2dwdS1idWZmZXInLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiByZWFkb25seSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdO1xuXG4gIC8qKlxuICAgKiBlbnVtIHZhbHVlIG9mIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIGVhY2ggb3V0cHV0IHRlbnNvci5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IHJlYWRvbmx5IG51bWJlcltdO1xufTtcblxuLyoqXG4gKiAgdHVwbGUgZWxlbWVudHMgYXJlOiBJbmZlcmVuY2VTZXNzaW9uIElEOyBpbnB1dE5hbWVzVVRGOEVuY29kZWQ7IG91dHB1dE5hbWVzVVRGOEVuY29kZWQ7IGJpbmRpbmdTdGF0ZVxuICovXG50eXBlIFNlc3Npb25NZXRhZGF0YSA9IFtcbiAgaW5mZXJlbmNlU2Vzc2lvbklkOiBudW1iZXIsIGlucHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sIG91dHB1dE5hbWVzVVRGOEVuY29kZWQ6IG51bWJlcltdLFxuICBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGwsIGVuYWJsZUdyYXBoQ2FwdHVyZTogYm9vbGVhbiwgaW5wdXRPdXRwdXRCb3VuZDogYm9vbGVhblxuXTtcblxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwPG51bWJlciwgU2Vzc2lvbk1ldGFkYXRhPigpO1xuXG4vKipcbiAqIGdldCB0aGUgaW5wdXQvb3V0cHV0IGNvdW50IG9mIHRoZSBzZXNzaW9uLlxuICogQHBhcmFtIHNlc3Npb25IYW5kbGUgdGhlIGhhbmRsZSByZXByZXNlbnRpbmcgdGhlIHNlc3Npb24uIHNob3VsZCBiZSBub24temVyby5cbiAqIEByZXR1cm5zIGEgdHVwbGUgaW5jbHVkaW5nIDIgbnVtYmVycywgcmVwcmVzZW50aW5nIHRoZSBpbnB1dCBjb3VudCBhbmQgb3V0cHV0IGNvdW50LlxuICovXG5jb25zdCBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudCA9IChzZXNzaW9uSGFuZGxlOiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldElucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSwgZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIDQpO1xuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBzZXNzaW9uIGlucHV0L291dHB1dCBjb3VudC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIFt3YXNtLkhFQVAzMltkYXRhT2Zmc2V0IC8gNF0sIHdhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0ICsgMV1dO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgfVxufTtcblxuLyoqXG4gKiBhbGxvY2F0ZSB0aGUgbWVtb3J5IGFuZCBtZW1jcHkgdGhlIGV4dGVybmFsIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWwgLSB0aGUgZXh0ZXJuYWwgYnVmZmVyIGNvbnRhaW5pbmcgdGhlIG1vZGVsIGRhdGEuIE11c3Qgbm90IGJlIHRoZSBzYW1lIGJ1ZmZlciBhcyB0aGUgV0FTTSBoZWFwLlxuICogQHJldHVybnMgYSAyLWVsZW1lbnRzIHR1cGxlIC0gdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIGFsbG9jYXRlZCBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIgPSAobW9kZWw6IFVpbnQ4QXJyYXkpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IG1vZGVsRGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhtb2RlbC5ieXRlTGVuZ3RoKTtcbiAgaWYgKG1vZGVsRGF0YU9mZnNldCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY3JlYXRlIGEgc2Vzc2lvbi4gZmFpbGVkIHRvIGFsbG9jYXRlIGEgYnVmZmVyIG9mIHNpemUgJHttb2RlbC5ieXRlTGVuZ3RofS5gKTtcbiAgfVxuICB3YXNtLkhFQVBVOC5zZXQobW9kZWwsIG1vZGVsRGF0YU9mZnNldCk7XG4gIHJldHVybiBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbC5ieXRlTGVuZ3RoXTtcbn07XG5cbi8qKlxuICogY3JlYXRlIGFuIGluZmVyZW5jZSBzZXNzaW9uIGZyb20gYSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWxEYXRhIC0gZWl0aGVyIGEgVWludDhBcnJheSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBtb2RlbCBkYXRhLCBvciBhIDItZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyB0aGVcbiAqICAgICBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIHNlc3Npb24gb3B0aW9ucyBvYmplY3QuXG4gKiBAcmV0dXJucyBhIDMtZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyBbc2Vzc2lvbiBoYW5kbGUsIGlucHV0IG5hbWVzLCBvdXRwdXQgbmFtZXNdXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID0gYXN5bmMoXG4gICAgbW9kZWxEYXRhOiBVaW50OEFycmF5fFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyLFxuICAgIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+ID0+IHtcbiAgbGV0IG1vZGVsRGF0YU9mZnNldDogbnVtYmVyLCBtb2RlbERhdGFMZW5ndGg6IG51bWJlcjtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkobW9kZWxEYXRhKSkge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgaXMgYW4gYXJyYXksIGl0IG11c3QgYmUgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGFcbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gbW9kZWxEYXRhO1xuICB9IGVsc2UgaWYgKG1vZGVsRGF0YS5idWZmZXIgPT09IHdhc20uSEVBUFU4LmJ1ZmZlcikge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgdXNlcyB0aGUgc2FtZSBidWZmZXIgYXMgdGhlIFdBU00gaGVhcCwgd2UgZG9uJ3QgbmVlZCB0byBjb3B5IGl0LlxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBbbW9kZWxEYXRhLmJ5dGVPZmZzZXQsIG1vZGVsRGF0YS5ieXRlTGVuZ3RoXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBvdGhlcndpc2UsIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC5cbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihtb2RlbERhdGEpO1xuICB9XG5cbiAgbGV0IHNlc3Npb25IYW5kbGUgPSAwO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBsZXQgaW9CaW5kaW5nSGFuZGxlID0gMDtcbiAgbGV0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXROYW1lc1VURjhFbmNvZGVkID0gW107XG4gIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcblxuICB0cnkge1xuICAgIFtzZXNzaW9uT3B0aW9uc0hhbmRsZSwgYWxsb2NzXSA9IHNldFNlc3Npb25PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnM/LmV4dGVybmFsRGF0YSAmJiB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhKSB7XG4gICAgICBjb25zdCBsb2FkaW5nUHJvbWlzZXMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBvcHRpb25zLmV4dGVybmFsRGF0YSkge1xuICAgICAgICBjb25zdCBwYXRoID0gdHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUucGF0aDtcbiAgICAgICAgbG9hZGluZ1Byb21pc2VzLnB1c2gobG9hZEZpbGUodHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUuZGF0YSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhIShwYXRoLCBkYXRhKTtcbiAgICAgICAgfSkpO1xuICAgICAgfVxuXG4gICAgICAvLyB3YWl0IGZvciBhbGwgZXh0ZXJuYWwgZGF0YSBmaWxlcyB0byBiZSBsb2FkZWRcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGxvYWRpbmdQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgc2Vzc2lvbkhhbmRsZSA9IGF3YWl0IHdhc20uX09ydENyZWF0ZVNlc3Npb24obW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGgsIHNlc3Npb25PcHRpb25zSGFuZGxlKTtcbiAgICBpZiAoc2Vzc2lvbkhhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgY3JlYXRlIGEgc2Vzc2lvbi4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBbaW5wdXRDb3VudCwgb3V0cHV0Q291bnRdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICBjb25zdCBlbmFibGVHcmFwaENhcHR1cmUgPSAhIW9wdGlvbnM/LmVuYWJsZUdyYXBoQ2FwdHVyZTtcblxuICAgIGNvbnN0IGlucHV0TmFtZXMgPSBbXTtcbiAgICBjb25zdCBvdXRwdXROYW1lcyA9IFtdO1xuICAgIGNvbnN0IG91dHB1dFByZWZlcnJlZExvY2F0aW9uczogU3VwcG9ydGVkVGVuc29yRGF0YUxvY2F0aW9uRm9ySW5wdXRPdXRwdXRbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0SW5wdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xuICAgICAgaWYgKG5hbWUgPT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgZ2V0IGFuIGlucHV0IG5hbWUuJyk7XG4gICAgICB9XG4gICAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWQucHVzaChuYW1lKTtcbiAgICAgIGlucHV0TmFtZXMucHVzaCh3YXNtLlVURjhUb1N0cmluZyhuYW1lKSk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgbmFtZSA9IHdhc20uX09ydEdldE91dHB1dE5hbWUoc2Vzc2lvbkhhbmRsZSwgaSk7XG4gICAgICBpZiAobmFtZSA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gb3V0cHV0IG5hbWUuJyk7XG4gICAgICB9XG4gICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XG4gICAgICBjb25zdCBuYW1lU3RyaW5nID0gd2FzbS5VVEY4VG9TdHJpbmcobmFtZSk7XG4gICAgICBvdXRwdXROYW1lcy5wdXNoKG5hbWVTdHJpbmcpO1xuXG4gICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUpIHtcbiAgICAgICAgaWYgKGVuYWJsZUdyYXBoQ2FwdHVyZSAmJiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnB1c2goJ2dwdS1idWZmZXInKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHR5cGVvZiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICAgb3B0aW9ucy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA6XG4gICAgICAgICAgICBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbj8uW25hbWVTdHJpbmddID8/ICdjcHUnO1xuICAgICAgICBpZiAobG9jYXRpb24gIT09ICdjcHUnICYmIGxvY2F0aW9uICE9PSAnY3B1LXBpbm5lZCcgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke2xvY2F0aW9ufS5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlICYmIGxvY2F0aW9uICE9PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBzdXBwb3J0ZWQgcHJlZmVycmVkIG91dHB1dCBsb2NhdGlvbjogJHtcbiAgICAgICAgICAgICAgbG9jYXRpb259LiBPbmx5ICdncHUtYnVmZmVyJyBsb2NhdGlvbiBpcyBzdXBwb3J0ZWQgd2hlbiBlbmFibGVHcmFwaENhcHR1cmUgaXMgdHJ1ZS5gKTtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMucHVzaChsb2NhdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdXNlIElPIGJpbmRpbmcgb25seSB3aGVuIGF0IGxlYXN0IG9uZSBvdXRwdXQgaXMgcHJlZmZlcmVkIHRvIGJlIG9uIEdQVS5cbiAgICBsZXQgYmluZGluZ1N0YXRlOiBJT0JpbmRpbmdTdGF0ZXxudWxsID0gbnVsbDtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnNvbWUobCA9PiBsID09PSAnZ3B1LWJ1ZmZlcicpKSB7XG4gICAgICBpb0JpbmRpbmdIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVCaW5kaW5nKHNlc3Npb25IYW5kbGUpO1xuICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgSU8gYmluZGluZy4nKTtcbiAgICAgIH1cblxuICAgICAgYmluZGluZ1N0YXRlID0ge1xuICAgICAgICBoYW5kbGU6IGlvQmluZGluZ0hhbmRsZSxcbiAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLFxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkOiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMubWFwKGwgPT4gZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGwpKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgYWN0aXZlU2Vzc2lvbnMuc2V0KFxuICAgICAgICBzZXNzaW9uSGFuZGxlLFxuICAgICAgICBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBiaW5kaW5nU3RhdGUsIGVuYWJsZUdyYXBoQ2FwdHVyZSwgZmFsc2VdKTtcbiAgICByZXR1cm4gW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXMsIG91dHB1dE5hbWVzXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcblxuICAgIGlmIChpb0JpbmRpbmdIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25IYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uKHNlc3Npb25IYW5kbGUpO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uX2ZyZWUobW9kZWxEYXRhT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcblxuICAgIC8vIHVubW91bnQgZXh0ZXJuYWwgZGF0YSBpZiBuZWNlc3NhcnlcbiAgICB3YXNtLnVubW91bnRFeHRlcm5hbERhdGE/LigpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVsZWFzZVNlc3Npb24gPSAoc2Vzc2lvbklkOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgaWYgKCFzZXNzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgcmVsZWFzZSBzZXNzaW9uLiBpbnZhbGlkIHNlc3Npb24gaWQ6ICR7c2Vzc2lvbklkfWApO1xuICB9XG4gIGNvbnN0IFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlLCBlbmFibGVHcmFwaENhcHR1cmVdID0gc2Vzc2lvbjtcblxuICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlKSB7XG4gICAgICB3YXNtLl9PcnRDbGVhckJvdW5kT3V0cHV0cyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICAgIH1cbiAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xuICB9XG5cbiAgd2FzbS5qc2VwT25SZWxlYXNlU2Vzc2lvbj8uKHNlc3Npb25JZCk7XG5cbiAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSk7XG4gIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvciA9XG4gICAgKHRlbnNvcjogVGVuc29yTWV0YWRhdGF8bnVsbCwgdGVuc29ySGFuZGxlczogbnVtYmVyW10sIGFsbG9jczogbnVtYmVyW10sIHNlc3Npb25JZDogbnVtYmVyLCBpbmRleDogbnVtYmVyLFxuICAgICBlbmFibGVHcmFwaENhcHR1cmUgPSBmYWxzZSk6IHZvaWQgPT4ge1xuICAgICAgaWYgKCF0ZW5zb3IpIHtcbiAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKDApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gICAgICBjb25zdCBkYXRhVHlwZSA9IHRlbnNvclswXTtcbiAgICAgIGNvbnN0IGRpbXMgPSB0ZW5zb3JbMV07XG4gICAgICBjb25zdCBsb2NhdGlvbiA9IHRlbnNvclszXTtcblxuICAgICAgbGV0IHJhd0RhdGE6IG51bWJlcjtcbiAgICAgIGxldCBkYXRhQnl0ZUxlbmd0aDogbnVtYmVyO1xuXG4gICAgICBpZiAoZGF0YVR5cGUgPT09ICdzdHJpbmcnICYmIGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdHJpbmcgdGVuc29yIGlzIG5vdCBzdXBwb3J0ZWQgb24gR1BVLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlICYmIGxvY2F0aW9uICE9PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEV4dGVybmFsIGJ1ZmZlciBtdXN0IGJlIHByb3ZpZGVkIGZvciBpbnB1dC9vdXRwdXQgaW5kZXggJHtpbmRleH0gd2hlbiBlbmFibGVHcmFwaENhcHR1cmUgaXMgdHJ1ZS5gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gdGVuc29yWzJdLmdwdUJ1ZmZlciBhcyBHUFVCdWZmZXI7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRTaXplSW5CeXRlcyA9IGdldFRlbnNvckVsZW1lbnRTaXplKHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSkhO1xuICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRpbXMucmVkdWNlKChhLCBiKSA9PiBhICogYiwgMSkgKiBlbGVtZW50U2l6ZUluQnl0ZXM7XG5cbiAgICAgICAgY29uc3QgcmVnaXN0ZXJCdWZmZXIgPSB3YXNtLmpzZXBSZWdpc3RlckJ1ZmZlcjtcbiAgICAgICAgaWYgKCFyZWdpc3RlckJ1ZmZlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVuc29yIGxvY2F0aW9uIFwiZ3B1LWJ1ZmZlclwiIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCB1c2luZyBXZWJHUFUuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmF3RGF0YSA9IHJlZ2lzdGVyQnVmZmVyKHNlc3Npb25JZCwgaW5kZXgsIGdwdUJ1ZmZlciwgZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IDQgKiBkYXRhLmxlbmd0aDtcbiAgICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gcmF3RGF0YSAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHRlbnNvciBkYXRhIGF0IGluZGV4ICR7aX0gaXMgbm90IGEgc3RyaW5nYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGFsbG9jcy5wdXNoKHJhd0RhdGEpO1xuICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoNCAqIGRpbXMubGVuZ3RoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBkaW1JbmRleCA9IGRpbXNPZmZzZXQgLyA0O1xuICAgICAgICBkaW1zLmZvckVhY2goZCA9PiB3YXNtLkhFQVAzMltkaW1JbmRleCsrXSA9IGQpO1xuICAgICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLl9PcnRDcmVhdGVUZW5zb3IoXG4gICAgICAgICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksIHJhd0RhdGEsIGRhdGFCeXRlTGVuZ3RoLCBkaW1zT2Zmc2V0LCBkaW1zLmxlbmd0aCxcbiAgICAgICAgICAgIGRhdGFMb2NhdGlvblN0cmluZ1RvRW51bShsb2NhdGlvbikpO1xuICAgICAgICBpZiAodGVuc29yID09PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgICAgICB9XG4gICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCh0ZW5zb3IpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICAgICAgfVxuICAgIH07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcbiAgICBzZXNzaW9uSWQ6IG51bWJlciwgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSwgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLCBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG4gIGNvbnN0IGlucHV0TmFtZXNVVEY4RW5jb2RlZCA9IHNlc3Npb25bMV07XG4gIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBzZXNzaW9uWzJdO1xuICBjb25zdCBpb0JpbmRpbmdTdGF0ZSA9IHNlc3Npb25bM107XG4gIGNvbnN0IGVuYWJsZUdyYXBoQ2FwdHVyZSA9IHNlc3Npb25bNF07XG4gIGNvbnN0IGlucHV0T3V0cHV0Qm91bmQgPSBzZXNzaW9uWzVdO1xuXG4gIGNvbnN0IGlucHV0Q291bnQgPSBpbnB1dEluZGljZXMubGVuZ3RoO1xuICBjb25zdCBvdXRwdXRDb3VudCA9IG91dHB1dEluZGljZXMubGVuZ3RoO1xuXG4gIGxldCBydW5PcHRpb25zSGFuZGxlID0gMDtcbiAgbGV0IHJ1bk9wdGlvbnNBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgaW5wdXRUZW5zb3JIYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBvdXRwdXRUZW5zb3JIYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbnB1dE91dHB1dEFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBiZWZvcmVSdW5TdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIGNvbnN0IGlucHV0VmFsdWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKGlucHV0Q291bnQgKiA0KTtcbiAgY29uc3QgaW5wdXROYW1lc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XG4gIGNvbnN0IG91dHB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhvdXRwdXRDb3VudCAqIDQpO1xuICBjb25zdCBvdXRwdXROYW1lc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhvdXRwdXRDb3VudCAqIDQpO1xuXG4gIHRyeSB7XG4gICAgW3J1bk9wdGlvbnNIYW5kbGUsIHJ1bk9wdGlvbnNBbGxvY3NdID0gc2V0UnVuT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIC8vIGNyZWF0ZSBpbnB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIHByZXBhcmVJbnB1dE91dHB1dFRlbnNvcihcbiAgICAgICAgICBpbnB1dFRlbnNvcnNbaV0sIGlucHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzW2ldLCBlbmFibGVHcmFwaENhcHR1cmUpO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBvdXRwdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKFxuICAgICAgICAgIG91dHB1dFRlbnNvcnNbaV0sIG91dHB1dFRlbnNvckhhbmRsZXMsIGlucHV0T3V0cHV0QWxsb2NzLCBzZXNzaW9uSWQsIGlucHV0Q291bnQgKyBvdXRwdXRJbmRpY2VzW2ldLFxuICAgICAgICAgIGVuYWJsZUdyYXBoQ2FwdHVyZSk7XG4gICAgfVxuXG4gICAgbGV0IGlucHV0VmFsdWVzSW5kZXggPSBpbnB1dFZhbHVlc09mZnNldCAvIDQ7XG4gICAgbGV0IGlucHV0TmFtZXNJbmRleCA9IGlucHV0TmFtZXNPZmZzZXQgLyA0O1xuICAgIGxldCBvdXRwdXRWYWx1ZXNJbmRleCA9IG91dHB1dFZhbHVlc09mZnNldCAvIDQ7XG4gICAgbGV0IG91dHB1dE5hbWVzSW5kZXggPSBvdXRwdXROYW1lc09mZnNldCAvIDQ7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dFZhbHVlc0luZGV4KytdID0gaW5wdXRUZW5zb3JIYW5kbGVzW2ldO1xuICAgICAgd2FzbS5IRUFQVTMyW2lucHV0TmFtZXNJbmRleCsrXSA9IGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbnB1dEluZGljZXNbaV1dO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgIHdhc20uSEVBUFUzMltvdXRwdXRWYWx1ZXNJbmRleCsrXSA9IG91dHB1dFRlbnNvckhhbmRsZXNbaV07XG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0TmFtZXNJbmRleCsrXSA9IG91dHB1dE5hbWVzVVRGOEVuY29kZWRbb3V0cHV0SW5kaWNlc1tpXV07XG4gICAgfVxuXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIGlvQmluZGluZ1N0YXRlICYmICFpbnB1dE91dHB1dEJvdW5kKSB7XG4gICAgICBjb25zdCB7aGFuZGxlLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWR9ID0gaW9CaW5kaW5nU3RhdGU7XG5cbiAgICAgIGlmIChpbnB1dE5hbWVzVVRGOEVuY29kZWQubGVuZ3RoICE9PSBpbnB1dENvdW50KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW5wdXQgY291bnQgZnJvbSBmZWVkcyAoJHtcbiAgICAgICAgICAgIGlucHV0Q291bnR9KSBpcyBleHBlY3RlZCB0byBiZSBhbHdheXMgZXF1YWwgdG8gbW9kZWwncyBpbnB1dCBjb3VudCAoJHtpbnB1dE5hbWVzVVRGOEVuY29kZWQubGVuZ3RofSkuYCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgaW5wdXRzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IGlucHV0SW5kaWNlc1tpXTtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gYXdhaXQgd2FzbS5fT3J0QmluZElucHV0KGhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgaW5wdXRUZW5zb3JIYW5kbGVzW2ldKTtcbiAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIGlucHV0WyR7aX1dIGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIHByZS1hbGxvY2F0ZWQgb3V0cHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gb3V0cHV0SW5kaWNlc1tpXTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBvdXRwdXRUZW5zb3JzW2ldPy5bM107ICAvLyB1bmRlZmluZWQgbWVhbnMgb3V0cHV0IGlzIG5vdCBwcmUtYWxsb2NhdGVkLlxuXG4gICAgICAgIGlmIChsb2NhdGlvbikge1xuICAgICAgICAgIC8vIG91dHB1dCBpcyBwcmUtYWxsb2NhdGVkLiBiaW5kIHRoZSB0ZW5zb3IuXG4gICAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldLCAwKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBwcmUtYWxsb2NhdGVkIG91dHB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC4gcmVzZXQgcHJlZmVycmVkIGxvY2F0aW9uLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9XG4gICAgICAgICAgICAgIHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgMCwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZFtpbmRleF0pO1xuICAgICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIG91dHB1dFske2l9XSB0byAke291dHB1dFByZWZlcnJlZExvY2F0aW9uc1tpXX0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYWN0aXZlU2Vzc2lvbnMuc2V0KFxuICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBpb0JpbmRpbmdTdGF0ZSwgZW5hYmxlR3JhcGhDYXB0dXJlLCB0cnVlXSk7XG4gICAgfVxuXG4gICAgd2FzbS5qc2VwT25SdW5TdGFydD8uKHNlc3Npb25IYW5kbGUpO1xuICAgIGxldCBlcnJvckNvZGU6IG51bWJlcjtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XRUJHUFUgJiYgaW9CaW5kaW5nU3RhdGUpIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlvQmluZGluZ1N0YXRlLmhhbmRsZSwgb3V0cHV0Q291bnQsIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgICBzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzT2Zmc2V0LCBpbnB1dFZhbHVlc09mZnNldCwgaW5wdXRDb3VudCwgb3V0cHV0TmFtZXNPZmZzZXQsIG91dHB1dENvdW50LFxuICAgICAgICAgIG91dHB1dFZhbHVlc09mZnNldCwgcnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFjY2VzcyBvdXRwdXQgdGVuc29yIGRhdGEgb24gaW5kZXggJHtpfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGVuc29yRGF0YUluZGV4ID0gdGVuc29yRGF0YU9mZnNldCAvIDQ7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XG4gICAgICAgIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLkhFQVBVMzJbdGVuc29yRGF0YUluZGV4KytdO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gd2FzbS5IRUFQVTMyW3RlbnNvckRhdGFJbmRleCsrXTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaCh3YXNtLkhFQVBVMzJbZGltc09mZnNldCAvIDQgKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KTtcblxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBsZXQgZGF0YUluZGV4ID0gZGF0YU9mZnNldCAvIDQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogd2FzbS5IRUFQVTMyW2RhdGFJbmRleF0gLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ2V0QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyO1xuICAgICAgICAgICAgaWYgKCFnZXRCdWZmZXIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwcmVmZXJyZWRMb2NhdGlvbiBcImdwdS1idWZmZXJcIiBpcyBub3Qgc3VwcG9ydGVkIHdpdGhvdXQgdXNpbmcgV2ViR1BVLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZ3B1QnVmZmVyID0gZ2V0QnVmZmVyKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudFNpemUgPSBnZXRUZW5zb3JFbGVtZW50U2l6ZShkYXRhVHlwZSk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgdHlwZSwgZGltcywge1xuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlciEoZ3B1QnVmZmVyLCBzaXplICogZWxlbWVudFNpemUsIHR5cGUpLFxuICAgICAgICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VUZW5zb3IodGVuc29yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdncHUtYnVmZmVyJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcih0eXBlKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgdHlwZWRBcnJheUNvbnN0cnVjdG9yKHNpemUpO1xuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKVxuICAgICAgICAgICAgICAgIC5zZXQod2FzbS5IRUFQVTguc3ViYXJyYXkoZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIGRhdGEuYnl0ZUxlbmd0aCkpO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIGRhdGEsICdjcHUnXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2spO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgZGF0YU9mZnNldCkge1xuICAgICAgICAgIHdhc20uX2ZyZWUoZGF0YU9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFrZWVwT3V0cHV0VGVuc29yKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlvQmluZGluZ1N0YXRlICYmICFlbmFibGVHcmFwaENhcHR1cmUpIHtcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XG4gICAgICBhY3RpdmVTZXNzaW9ucy5zZXQoXG4gICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlLCBlbmFibGVHcmFwaENhcHR1cmUsIGZhbHNlXSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoYmVmb3JlUnVuU3RhY2spO1xuXG4gICAgaW5wdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBvdXRwdXRUZW5zb3JIYW5kbGVzLmZvckVhY2godiA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBpbnB1dE91dHB1dEFsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XG5cbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIHJ1bk9wdGlvbnNBbGxvY3MuZm9yRWFjaChwID0+IHdhc20uX2ZyZWUocCkpO1xuICB9XG59O1xuXG4vKipcbiAqIGVuZCBwcm9maWxpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGVuZFByb2ZpbGluZyA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2Vzc2lvbiBpZCcpO1xuICB9XG4gIGNvbnN0IHNlc3Npb25IYW5kbGUgPSBzZXNzaW9uWzBdO1xuXG4gIC8vIHByb2ZpbGUgZmlsZSBuYW1lIGlzIG5vdCB1c2VkIHlldCwgYnV0IGl0IG11c3QgYmUgZnJlZWQuXG4gIGNvbnN0IHByb2ZpbGVGaWxlTmFtZSA9IHdhc20uX09ydEVuZFByb2ZpbGluZyhzZXNzaW9uSGFuZGxlKTtcbiAgaWYgKHByb2ZpbGVGaWxlTmFtZSA9PT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBwcm9maWxlIGZpbGUgbmFtZS4nKTtcbiAgfVxuICB3YXNtLl9PcnRGcmVlKHByb2ZpbGVGaWxlTmFtZSk7XG59O1xuXG5leHBvcnQgY29uc3QgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMgPSAodGVuc29yczogcmVhZG9ubHkgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXSk6IEFycmF5QnVmZmVyTGlrZVtdID0+IHtcbiAgY29uc3QgYnVmZmVyczogQXJyYXlCdWZmZXJMaWtlW10gPSBbXTtcbiAgZm9yIChjb25zdCB0ZW5zb3Igb2YgdGVuc29ycykge1xuICAgIGNvbnN0IGRhdGEgPSB0ZW5zb3JbMl07XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGRhdGEpICYmICdidWZmZXInIGluIGRhdGEpIHtcbiAgICAgIGJ1ZmZlcnMucHVzaChkYXRhLmJ1ZmZlcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBidWZmZXJzO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLy8vIDxyZWZlcmVuY2UgbGliPVwid2Vid29ya2VyXCIgLz5cblxuLy9cbi8vICogdHlwZSBoYWNrIGZvciBcIkhUTUxJbWFnZUVsZW1lbnRcIlxuLy9cbi8vIGluIHR5cGVzY3JpcHQsIHRoZSB0eXBlIG9mIFwiSFRNTEltYWdlRWxlbWVudFwiIGlzIGRlZmluZWQgaW4gbGliLmRvbS5kLnRzLCB3aGljaCBpcyBjb25mbGljdCB3aXRoIGxpYi53ZWJ3b3JrZXIuZC50cy5cbi8vIHdoZW4gd2UgdXNlIHdlYndvcmtlciwgdGhlIGxpYi53ZWJ3b3JrZXIuZC50cyB3aWxsIGJlIHVzZWQsIHdoaWNoIGRvZXMgbm90IGhhdmUgSFRNTEltYWdlRWxlbWVudCBkZWZpbmVkLlxuLy9cbi8vIHdlIHdpbGwgZ2V0IHRoZSBmb2xsb3dpbmcgZXJyb3JzIGNvbXBsYWluaW5nIHRoYXQgSFRNTEltYWdlRWxlbWVudCBpcyBub3QgZGVmaW5lZDpcbi8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy9cbi8vIC4uL2NvbW1vbi9kaXN0L2Nqcy90ZW5zb3ItZmFjdG9yeS5kLnRzOjE4NzoyOSAtIGVycm9yIFRTMjU1MjogQ2Fubm90IGZpbmQgbmFtZSAnSFRNTEltYWdlRWxlbWVudCcuIERpZCB5b3UgbWVhblxuLy8gJ0hUTUxMSUVsZW1lbnQnP1xuLy9cbi8vIDE4NyAgICAgZnJvbUltYWdlKGltYWdlRWxlbWVudDogSFRNTEltYWdlRWxlbWVudCwgb3B0aW9ucz86IFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zKTpcbi8vIFByb21pc2U8VHlwZWRUZW5zb3I8J2Zsb2F0MzInPiB8IFR5cGVkVGVuc29yPCd1aW50OCc+Pjtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfn5+fn5+fn5+fn5+fn5+flxuLy9cbi8vIG5vZGVfbW9kdWxlcy9Ad2ViZ3B1L3R5cGVzL2Rpc3QvaW5kZXguZC50czo4Mzo3IC0gZXJyb3IgVFMyNTUyOiBDYW5ub3QgZmluZCBuYW1lICdIVE1MSW1hZ2VFbGVtZW50Jy4gRGlkIHlvdSBtZWFuXG4vLyAnSFRNTExJRWxlbWVudCc/XG4vL1xuLy8gODMgICAgIHwgSFRNTEltYWdlRWxlbWVudFxuLy8gICAgICAgICAgfn5+fn5+fn5+fn5+fn5+flxuLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vL1xuLy8gYEhUTUxJbWFnZUVsZW1lbnRgIGlzIG9ubHkgdXNlZCBpbiB0eXBlIGRlY2xhcmF0aW9uIGFuZCBub3QgaW4gcmVhbCBjb2RlLiBTbyB3ZSBkZWZpbmUgaXQgYXMgYHVua25vd25gIGhlcmUgdG9cbi8vIGJ5cGFzcyB0aGUgdHlwZSBjaGVjay5cbi8vXG5kZWNsYXJlIGdsb2JhbCB7XG4gIHR5cGUgSFRNTEltYWdlRWxlbWVudCA9IHVua25vd247XG59XG5cbmltcG9ydCB7T3J0V2FzbU1lc3NhZ2UsIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhfSBmcm9tICcuLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQge2NyZWF0ZVNlc3Npb24sIGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIsIGVuZFByb2ZpbGluZywgZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMsIGluaXRFcCwgaW5pdFJ1bnRpbWUsIHJlbGVhc2VTZXNzaW9uLCBydW59IGZyb20gJy4uL3dhc20tY29yZS1pbXBsJztcbmltcG9ydCB7aW5pdGlhbGl6ZVdlYkFzc2VtYmx5fSBmcm9tICcuLi93YXNtLWZhY3RvcnknO1xuXG5zZWxmLm9ubWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50PE9ydFdhc21NZXNzYWdlPik6IHZvaWQgPT4ge1xuICBjb25zdCB7dHlwZSwgaW4gOiBtZXNzYWdlfSA9IGV2LmRhdGE7XG4gIHRyeSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdpbml0LXdhc20nOlxuICAgICAgICBpbml0aWFsaXplV2ViQXNzZW1ibHkobWVzc2FnZSEud2FzbSlcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGluaXRSdW50aW1lKG1lc3NhZ2UhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbml0LWVwJzoge1xuICAgICAgICBjb25zdCB7ZXBOYW1lLCBlbnZ9ID0gbWVzc2FnZSE7XG4gICAgICAgIGluaXRFcChlbnYsIGVwTmFtZSlcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycn0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2NvcHktZnJvbSc6IHtcbiAgICAgICAgY29uc3Qge2J1ZmZlcn0gPSBtZXNzYWdlITtcbiAgICAgICAgY29uc3QgYnVmZmVyRGF0YSA9IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIoYnVmZmVyKTtcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIG91dDogYnVmZmVyRGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2NyZWF0ZSc6IHtcbiAgICAgICAgY29uc3Qge21vZGVsLCBvcHRpb25zfSA9IG1lc3NhZ2UhO1xuICAgICAgICBjcmVhdGVTZXNzaW9uKG1vZGVsLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgc2Vzc2lvbk1ldGFkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBvdXQ6IHNlc3Npb25NZXRhZGF0YX0gYXMgT3J0V2FzbU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdyZWxlYXNlJzpcbiAgICAgICAgcmVsZWFzZVNlc3Npb24obWVzc2FnZSEpO1xuICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZX0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3J1bic6IHtcbiAgICAgICAgY29uc3Qge3Nlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG9wdGlvbnN9ID0gbWVzc2FnZSE7XG4gICAgICAgIHJ1bihzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBuZXcgQXJyYXkob3V0cHV0SW5kaWNlcy5sZW5ndGgpLmZpbGwobnVsbCksIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICBvdXRwdXRzID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChvdXRwdXRzLnNvbWUobyA9PiBvWzNdICE9PSAnY3B1JykpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2Uoe3R5cGUsIGVycjogJ1Byb3h5IGRvZXMgbm90IHN1cHBvcnQgbm9uLWNwdSB0ZW5zb3IgbG9jYXRpb24uJ30pO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICB7dHlwZSwgb3V0OiBvdXRwdXRzfSBhcyBPcnRXYXNtTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RUcmFuc2ZlcmFibGVCdWZmZXJzKFsuLi5pbnB1dHMsIC4uLm91dHB1dHNdIGFzIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhW10pKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7dHlwZSwgZXJyfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnZW5kLXByb2ZpbGluZyc6XG4gICAgICAgIGVuZFByb2ZpbGluZyhtZXNzYWdlISk7XG4gICAgICAgIHBvc3RNZXNzYWdlKHt0eXBlfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHBvc3RNZXNzYWdlKHt0eXBlLCBlcnJ9IGFzIE9ydFdhc21NZXNzYWdlKTtcbiAgfVxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBYSxVQUFrQyxjQUFzQztBQUFyRjtBQUFBO0FBQU8sTUFBTSxXQUFXO0FBQWlCLE1BQU0sZUFBZTtBQUFpQixNQUFNLG1CQUFtQjtBQUFBO0FBQUE7OztBQ0F4RztBQUFBO0FBQUEsZ0JBQUFBO0FBQUE7QUFBQSxNQUFhQTtBQUFiO0FBQUE7QUFBTyxNQUFNQSxRQUFPO0FBQUE7QUFBQTs7O0FDQXBCO0FBQUE7QUFBQTtBQUNBLFVBQUksV0FBVyxNQUFNO0FBQ25CLFlBQUksYUFBYSxPQUFPLFlBQVksY0FBYyxTQUFTLGVBQWUsTUFBTTtB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QUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsSUFBRSxFQUFFLENBQUMsSUFBRSxHQUFFO0FBQUUsZ0JBQUUsRUFBRSxDQUFDO0FBQUUsZ0JBQUU7QUFBQSxjQUFDLE1BQUs7QUFBQSxjQUF1QixNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBSyxNQUFLO0FBQUEsY0FBYyxNQUFLO0FBQUEsY0FBUSxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FBVyxNQUFLO0FBQUEsY0FDN2UsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQVcsT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLGNBQUssT0FBTTtBQUFBLFlBQUk7QUFBRSxxQkFBUSxLQUFLO0FBQUUsa0JBQUUsRUFBRSxRQUFRLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRSxFQUFFLENBQUMsQ0FBQztBQUFFLGdCQUFJLEtBQUcsMkRBQTJELE1BQU0sR0FBRyxHQUFFLEtBQUcsd0ZBQXdGLE1BQU0sR0FBRztBQUFFLGdCQUFFO0FBQUEsY0FBQyxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFO0FBQUEsY0FDdGYsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRTtBQUFBLGNBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxLQUFHLFFBQU0sTUFBSSxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsR0FBRSxHQUFHO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQztBQUFBLGNBQUUsTUFBSztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRztBQUFDLG9CQUFFLEVBQUU7QUFBRyxxQkFBRyxJQUFFLElBQUUsS0FBRyxLQUFHLE1BQUksS0FBRztBQUFJLHVCQUFPLEVBQUUsR0FBRSxDQUFDO0FBQUEsY0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHO0FBQUMseUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFHLEVBQUUsS0FBRyxHQUFFLE1BQUksRUFBRSxFQUFFLEtBQUcsSUFBSSxJQUFFLEtBQUcsSUFBSSxHQUFHO0FBQUU7QUFBQyx1QkFBTyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLEtBQUcsR0FBRSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQztBQUFBLGNBQUUsTUFBSyxNQUFJO0FBQUEsY0FBSyxNQUFLLE9BQUcsS0FBRyxFQUFFLE1BQUksS0FBRyxFQUFFLEtBQUcsT0FBSztBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssTUFBSTtBQUFBLGNBQUssTUFBSyxPQUFHLEVBQUUsTUFBSTtBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxJQUFFLEVBQUUsTUFBSSxDQUFDLEdBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUN2ZjtBQUFDLG9CQUFJLElBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQztBQUFFLHNCQUFJLEVBQUUsS0FBRyxNQUFJLEVBQUUsS0FBRyxLQUFHLEtBQUc7QUFBSSxvQkFBRztBQUFFLHdCQUFJLE1BQUksS0FBRyxFQUFFLEtBQUcsTUFBSSxFQUFFLE1BQUksR0FBRSxLQUFHLEtBQUcsS0FBRyxLQUFHLEVBQUUsRUFBRSxFQUFFLE1BQUksSUFBRTtBQUFBLHFCQUFRO0FBQUMsc0JBQUU7QUFBRyxzQkFBSSxLQUFHLEVBQUUsS0FBRyxJQUFFLEVBQUUsS0FBRyxLQUFHO0FBQUUsbUJBQUMsS0FBRyxLQUFHLEtBQUcsS0FBRyxFQUFFLEVBQUUsS0FBRyxNQUFJLENBQUMsTUFBSTtBQUFBLGdCQUFHO0FBQUMsdUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRTtBQUFBLGNBQUcsTUFBSyxPQUFHLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLEVBQUUsS0FBRyxLQUFHLEtBQUcsQ0FBQyxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssUUFBSSxFQUFFLEtBQUcsTUFBTSxTQUFTLEVBQUUsVUFBVSxDQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxLQUFHO0FBQUEsY0FBSyxNQUFLLE9BQUc7QUFBQyxvQkFBRSxFQUFFO0FBQUcsb0JBQUksSUFBRSxLQUFHO0FBQUUsb0JBQUUsS0FBSyxJQUFJLENBQUMsSUFBRTtBQUFHLHdCQUFPLElBQUUsTUFBSSxPQUFLLE9BQU8sVUFBUSxJQUFFLEtBQUcsTUFBSSxJQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRTtBQUFBLGNBQUcsTUFBSyxNQUFJO0FBQUEsWUFBRztBQUFFLGdCQUFFLEVBQUUsUUFBUSxPQUFNLE1BQVU7QUFBRSxpQkFBSSxLQUFLO0FBQUUsZ0JBQUUsU0FBUyxDQUFDLE1BQ3JnQixJQUFFLEVBQUUsUUFBUSxJQUFJLE9BQU8sR0FBRSxHQUFHLEdBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUcsZ0JBQUUsRUFBRSxRQUFRLFNBQVEsR0FBRztBQUFFLGdCQUFFLEdBQUcsQ0FBQztBQUFFLGdCQUFHLEVBQUUsU0FBTztBQUFFLHFCQUFPO0FBQUUsY0FBRSxJQUFJLEdBQUUsTUFBSSxDQUFDO0FBQUUsbUJBQU8sRUFBRSxTQUFPO0FBQUEsVUFBQztBQUNqSSxjQUFJLEtBQUcsRUFBQyxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyxtQkFBSztBQUFFLGdCQUFJLElBQUUsSUFBSSxHQUFHLENBQUM7QUFBRSxjQUFFLEVBQUUsS0FBRyxPQUFLLE1BQUksQ0FBQyxJQUFFO0FBQUUsY0FBRSxFQUFFLEtBQUcsTUFBSSxNQUFJLENBQUMsSUFBRSxNQUFJO0FBQUUsY0FBRSxFQUFFLEtBQUcsTUFBSSxNQUFJLENBQUMsSUFBRSxNQUFJO0FBQUUsaUJBQUc7QUFBRTtBQUFLLGtCQUFNO0FBQUEsVUFBRyxHQUFFLEdBQUUsV0FBVTtBQUFDLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFDLG1CQUFPO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxXQUFVO0FBQUEsVUFBQyxHQUFFLEdBQUUsV0FBVTtBQUFBLFVBQUMsR0FBRSxHQUFFLFdBQVU7QUFBQSxVQUFDLEdBQUUsR0FBRSxNQUFJLEdBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMsbUJBQUs7QUFBRSxtQkFBTyxFQUFFLFdBQVcsTUFBSSxNQUFJLEdBQUUsTUFBSSxHQUFFLEtBQUcsTUFBSSxPQUFLLENBQUM7QUFBQSxVQUFDLEdBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUUsSUFBRSxZQUFVLElBQUUsVUFBUSxDQUFDLENBQUMsS0FBRyxNQUFJLEtBQUcsYUFBVyxJQUNwZjtBQUFJLG1CQUFLO0FBQUUsZ0JBQUUsSUFBSSxLQUFLLE1BQUksQ0FBQztBQUFFLGNBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxjQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLGNBQWM7QUFBRSxjQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFdBQVc7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLGVBQWUsSUFBRTtBQUFLLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsVUFBVTtBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxLQUFHLEVBQUUsUUFBUSxJQUFFLEtBQUssSUFBSSxFQUFFLGVBQWUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxLQUFHLFFBQU07QUFBQSxVQUFDLEdBQUUsR0FBRSxTQUFTLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUUsSUFBRSxZQUFVLElBQUUsVUFBUSxDQUFDLENBQUMsS0FBRyxNQUFJLEtBQUcsYUFBVyxJQUFFO0FBQUksbUJBQUs7QUFBRSxnQkFBRSxJQUFJLEtBQUssTUFBSSxDQUFDO0FBQUUsY0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGNBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGNBQUUsSUFBRSxNQUFJLE1BQ25mLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFFBQVE7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFLLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsT0FBTztBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxLQUFHLEVBQUUsRUFBRSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsY0FBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsRUFBRSxLQUFHLEVBQUUsa0JBQWtCO0FBQUcsZ0JBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUFFLGdCQUFJLElBQUcsSUFBSSxLQUFLLEVBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFHLGtCQUFrQjtBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxLQUFHLEtBQUcsS0FBRyxFQUFFLGtCQUFrQixLQUFHLEtBQUssSUFBSSxHQUFFLENBQUMsS0FBRztBQUFBLFVBQUMsR0FBRSxHQUFFLFNBQVMsR0FBRTtBQUFDLG1CQUFLO0FBQUUsZ0JBQUksSUFBRSxJQUFJO0FBQUEsY0FBSyxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRTtBQUFBLGNBQUssRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDO0FBQUEsY0FDcmYsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDO0FBQUEsY0FBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUM7QUFBQSxjQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQztBQUFBLGNBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQztBQUFBLGNBQUU7QUFBQSxZQUFDLEdBQUUsSUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFFLEVBQUUsa0JBQWtCLEdBQUUsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRyxJQUFJLEtBQUssRUFBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUcsa0JBQWtCLEdBQUUsSUFBRSxLQUFLLElBQUksR0FBRSxDQUFDO0FBQUUsZ0JBQUUsSUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxPQUFPLEtBQUcsS0FBRyxLQUFHLENBQUMsSUFBRSxJQUFFLE1BQUksS0FBRyxPQUFLLElBQUUsS0FBSyxJQUFJLEdBQUUsQ0FBQyxHQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsSUFBRSxRQUFNLElBQUUsSUFBRSxJQUFFLEtBQUcsRUFBRTtBQUFHLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsT0FBTztBQUFFLGNBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxLQUFHLEVBQUUsRUFBRSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUksRUFBRSxTQUFTLENBQUMsSUFBRSxFQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsY0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGNBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGNBQUUsSUFDbmYsTUFBSSxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFFBQVE7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFNBQVM7QUFBRSxjQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFFBQVE7QUFBRSxnQkFBRSxFQUFFLFFBQVE7QUFBRSxnQkFB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SUFBRTtBQUFFLGNBQUUsUUFBUSxPQUFHLEtBQUcsRUFBRSxTQUFPLENBQUM7QUFBRSxjQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsSUFBRTtBQUFFLG1CQUFPO0FBQUEsVUFBQztBQUFDLG1CQUFTLEdBQUcsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRTtBQUFDLG1CQUFPLElBQUUsRUFBRSxJQUFHLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsVUFBRTtBQUFDLG1CQUFTLEdBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsbUJBQU8sSUFBRSxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLFVBQUU7QUFDbmYsY0FBSSxLQUFHLENBQUMsTUFBSyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0FBQUUsbUJBQVMsR0FBRyxHQUFFLEdBQUUsR0FBRSxHQUFFO0FBQUMsZ0JBQUc7QUFBRSxxQkFBTyxFQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLG1CQUFLO0FBQUUscUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBSTtBQUFDLGtCQUFJLElBQUUsRUFBRSxFQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQztBQUFFLG1CQUFHO0FBQUUsdUJBQVEsSUFBRSxHQUFFLElBQUUsR0FBRSxLQUFJO0FBQUMsb0JBQUksSUFBRSxFQUFFLEVBQUUsSUFBRSxNQUFJLENBQUMsR0FBRSxJQUFFLEdBQUcsQ0FBQztBQUFFLHNCQUFJLEtBQUcsT0FBSyxNQUFJLE1BQUksSUFBRSxLQUFHLEdBQUcsR0FBRyxHQUFFLENBQUMsQ0FBQyxHQUFFLEVBQUUsU0FBTyxLQUFHLEVBQUUsS0FBSyxDQUFDO0FBQUEs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LENBQUMsR0FBRSxFQUFFLFlBQVksRUFBRSxZQUFZLElBQUUsQ0FBQztBQUFBLHFCQUFPO0FBQUMsb0JBQUUsUUFBUSxFQUFFLFFBQVEsSUFBRSxDQUFDO0FBQUU7QUFBQSxnQkFBSztBQUFBLGNBQUM7QUFBQyxrQkFBRSxJQUFJLEtBQUssRUFBRSxZQUFZLElBQUUsR0FBRSxHQUFFLENBQUM7QUFBRSxrQkFBRSxFQUFFLElBQUk7QUFBQSxnQkFBSyxFQUFFLFlBQVk7QUFBQSxnQkFDbmY7QUFBQSxnQkFBRTtBQUFBLGNBQUMsQ0FBQztBQUFFLGtCQUFFLEVBQUUsQ0FBQztBQUFFLHFCQUFPLEtBQUcsRUFBRSxHQUFFLENBQUMsSUFBRSxLQUFHLEVBQUUsR0FBRSxDQUFDLElBQUUsRUFBRSxZQUFZLElBQUUsSUFBRSxFQUFFLFlBQVksSUFBRSxFQUFFLFlBQVksSUFBRTtBQUFBLFlBQUM7QUFBQyxtQkFBSztBQUFFLG1CQUFLO0FBQUUsbUJBQUs7QUFBRSxtQkFBSztBQUFFLGdCQUFJLElBQUUsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUM7QUFBRSxnQkFBRSxFQUFDLElBQUcsRUFBRSxFQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUcsRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxJQUFHLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsSUFBRyxJQUFFLEVBQUUsQ0FBQyxJQUFFLEdBQUU7QUFBRSxnQkFBRSxFQUFFLENBQUM7QUFBRSxnQkFBRTtBQUFBLGNBQUMsTUFBSztBQUFBLGNBQXVCLE1BQUs7QUFBQSxjQUFXLE1BQUs7QUFBQSxjQUFXLE1BQUs7QUFBQSxjQUFLLE1BQUs7QUFBQSxjQUFjLE1BQUs7QUFBQSxjQUFRLE1BQUs7QUFBQSxjQUFXLE1BQUs7QUFBQSxjQUNuZixNQUFLO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBVyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsY0FBSyxPQUFNO0FBQUEsWUFBSTtBQUFFLHFCQUFRLEtBQUs7QUFBRSxrQkFBRSxFQUFFLFFBQVEsSUFBSSxPQUFPLEdBQUUsR0FBRyxHQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUUsZ0JBQUksS0FBRywyREFBMkQsTUFBTSxHQUFHLEdBQUUsS0FBRyx3RkFBd0YsTUFBTSxHQUFHO0FBQUUsZ0JBQUU7QUFBQSxjQUFDLE1BQUssT0FBRyxHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsR0FBRSxDQUFDO0FBQUEsY0FDcmYsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFO0FBQUEsY0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLEdBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEdBQUcsRUFBRSxFQUFFO0FBQUEsY0FBRSxNQUFLLE9BQUcsR0FBRyxFQUFFLEtBQUcsUUFBTSxNQUFJLEdBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHLEVBQUUsRUFBRSxJQUFHLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxHQUFFLEdBQUc7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDO0FBQUEsY0FBRSxNQUFLO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHO0FBQUMsb0JBQUUsRUFBRTtBQUFHLHFCQUFHLElBQUUsSUFBRSxLQUFHLEtBQUcsTUFBSSxLQUFHO0FBQUksdUJBQU8sRUFBRSxHQUFFLENBQUM7QUFBQSxjQUFDO0FBQUEsY0FBRSxNQUFLLE9BQUc7QUFBQyx5QkFBUSxJQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUcsRUFBRSxLQUFHLEdBQUUsTUFBSSxFQUFFLEVBQUUsS0FBRyxJQUFJLElBQUUsS0FBRyxJQUFJLEdBQUc7QUFBRTtBQUFDLHVCQUFPLEVBQUUsRUFBRSxLQUFHLEdBQUUsQ0FBQztBQUFBLGNBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsS0FBRyxHQUFFLENBQUM7QUFBQSxjQUFFLE1BQUssT0FBRyxFQUFFLEVBQUUsSUFBRyxDQUFDO0FBQUEsY0FBRSxNQUFLLE1BQUk7QUFBQSxjQUFLLE1BQUssT0FBRyxLQUFHLEVBQUUsTUFBSSxLQUFHLEVBQUUsS0FBRyxPQUFLO0FBQUEsY0FBSyxNQUFLLE9BQUcsRUFBRSxFQUFFLElBQUcsQ0FBQztBQUFBLGNBQUUsTUFBSyxNQUFJO0FBQUEsY0FBSyxNQUFLLE9BQUcsRUFBRSxNQUFJO0FBQUEsY0FBRSxNQUFLLE9BQUcsRUFBRSxLQUFLLE9BQU8sRUFBRSxLQUNsZixJQUFFLEVBQUUsTUFBSSxDQUFDLEdBQUUsQ0FBQztBQUFBLGNBQUUsTUFBSyxPQUFHO0FBQUMsb0JBQUksSUFBRSxLQUFLLE9BQU8sRUFBRSxLQUFHLEtBQUcsRUFBRSxLQUFHLEtBQUcsS0FBRyxDQUFDO0FBQUUsc0JBQUksRUFBRSxLQUFHLE1BQUksRUFBRSxLQUFHLEtBQUcsS0FBRztB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QUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFlBQVk7QUFBRSxnQkFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLGVBQWUsSUFBRTtBQUFLLGdCQUFFLEVBQUUsSUFDdGYsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLFVBQVU7QUFBRSxtQkFBRyxFQUFFLFFBQVEsSUFBRSxLQUFLLElBQUksRUFBRSxlQUFlLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsS0FBRyxRQUFNO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUU7QUFBQSxZQUFDO0FBQUEsWUFBRSxHQUFFLFNBQVMsR0FBRSxHQUFFLEdBQUU7QUFBQyxrQkFBRSxJQUFFLFlBQVUsSUFBRSxVQUFRLENBQUMsQ0FBQyxLQUFHLE1BQUksS0FBRyxhQUFXLElBQUU7QUFBSSxxQkFBSztBQUFFLGtCQUFFLElBQUksS0FBSyxNQUFJLENBQUM7QUFBRSxnQkFBRSxFQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxXQUFXO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsRUFBRSxRQUFRO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsRUFBRSxTQUFTO0FBQUUsZ0JBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsRUFBRSxZQUFZLElBQUU7QUFBSyxnQkFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLE9BQU87QUFBRSxtQkFBRyxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUUsS0FBRyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUUsRUFBRSxRQUFRLElBQUUsSUFBRTtBQUFFLGdCQUFFLEVBQUUsSUFBRSxPQUFLLE1BQ25mLENBQUMsSUFBRTtBQUFFLGdCQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsS0FBRyxFQUFFLGtCQUFrQjtBQUFHLGtCQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0I7QUFBRSxrQkFBSSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0I7QUFBRSxtQkFBRyxLQUFHLEtBQUcsRUFBRSxrQkFBa0IsS0FBRyxLQUFLLElBQUksR0FBRSxDQUFDLEtBQUc7QUFBRSxnQkFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRTtBQUFBLFlBQUM7QUFBQSxZQUFFLEdBQUUsU0FBUyxHQUFFO0FBQUMscUJBQUs7QUFBRSxrQkFBSSxJQUFFLElBQUksS0FBSyxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLE1BQUssRUFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLEVBQUUsRUFBRSxJQUFFLE1BQUksTUFBSSxDQUFDLEdBQUUsRUFBRSxFQUFFLElBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxFQUFFLEVBQUUsTUFBSSxNQUFJLENBQUMsR0FBRSxDQUFDLEdBQUUsSUFBRSxFQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBRSxrQkFBa0IsR0FBRSxJQUFHLElBQUksS0FBSyxFQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRyxrQkFBa0IsR0FBRSxJQUFHLElBQUk7QUFBQSxnQkFBSyxFQUFFLFlBQVk7QUFBQSxnQkFDeGY7QUFBQSxnQkFBRTtBQUFBLGNBQUMsRUFBRyxrQkFBa0IsR0FBRSxJQUFFLEtBQUssSUFBSSxHQUFFLENBQUM7QUFBRSxrQkFBRSxJQUFFLEVBQUUsRUFBRSxJQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsT0FBTyxLQUFHLEtBQUcsS0FBRyxDQUFDLElBQUUsSUFBRSxNQUFJLEtBQUcsT0FBSyxJQUFFLEtBQUssSUFBSSxHQUFFLENBQUMsR0FBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLElBQUUsUUFBTSxJQUFFLElBQUUsSUFBRSxLQUFHLEVBQUU7QUFBRyxnQkFBRSxFQUFFLElBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxFQUFFLE9BQU87QUFBRSxtQkFBRyxFQUFFLEVBQUUsWUFBWSxDQUFDLElBQUUsS0FBRyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUUsRUFBRSxRQUFRLElBQUUsSUFBRTtBQUFFLGdCQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFO0FBQUUsZ0JBQUUsRUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsV0FBVztBQUFFLGdCQUFFLEVBQUUsSUFBRSxNQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGdCQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsUUFBUTtBQUFFLGdCQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsU0FBUztBQUFFLGdCQUFFLEVBQUUsSUFBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLEVBQUUsUUFBUTtBQUFFLGtCQUFFLEVBQUUsUUFBUTtBQUFFLGtCQUFFLE1BQU0sQ0FBQyxJQUFFLEtBQUcsSUFBRTtBQUFJLGtCQUFJLElBQUUsR0FBRSxLQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsSUFDdGYsSUFBRSxJQUFFLENBQUMsS0FBSyxNQUFNLElBQUUsVUFBVSxNQUFJLElBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLElBQUUsRUFBRSxDQUFDLENBQUMsTUFBSSxNQUFJLFVBQVUsTUFBSSxJQUFFLEVBQUU7QUFBRSxxQkFBTyxNQUFJO0FBQUEsWUFBQztBQUFBLFlBQUUsR0FBRTtBQUFBLFlBQUcsR0FBRTtBQUFBLFlBQUcsR0FBRSxTQUFTLEdBQUUsR0FB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QUksV0FBVyxjQUFjLFFBQVEsZUFBZSxJQUFJLE1BQU0sY0FBYyxNQUFNLEVBQUUsS0FBSyxJQUFJLEdBQUcsT0FBTyxFQUNsRztBQUFBLFlBQ0csYUFBVztBQUNULGtCQUFJLFFBQVEsS0FBSyxPQUFLLEVBQUUsQ0FBQyxNQUFNLEtBQUssR0FBRztBQUNyQyw0QkFBWSxFQUFDLE1BQU0sS0FBSyxrREFBaUQsQ0FBQztBQUFBLGNBQzVFLE9BQU87QUFDTDtBQUFBLGtCQUNJLEVBQUMsTUFBTSxLQUFLLFFBQU87QUFBQSxrQkFDbkIsMkJBQTJCLENBQUMsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFpQztBQUFBLGdCQUFDO0FBQUEsY0FDekY7QUFBQSxZQUNGO0FBQUEsWUFDQSxTQUFPO0FBQ0wsMEJBQVksRUFBQyxNQUFNLElBQUcsQ0FBQztBQUFBLFlBQ3pCO0FBQUEsVUFBQztBQUNUO0FBQUEsUUFDRjtBQUFBLFFBQ0EsS0FBSztBQUNILHVCQUFhLE9BQVE7QUFDckIsc0JBQVksRUFBQyxLQUFJLENBQUM7QUFDbEI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsU0FBUyxLQUFLO0FBQ1osa0JBQVksRUFBQyxNQUFNLElBQUcsQ0FBbUI7QUFBQSxJQUMzQztBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbImpvaW4iLCAid2FzbSIsICJ3YXNtIiwgIndhc20iLCAicmVhZEZpbGUiLCAicmVhZEZpbGUiLCAid2FzbSIsICJ0ZW5zb3IiLCAiZXJyb3JDb2RlIiwgImkiXQp9Cg==\n';
  }
});

// web/lib/wasm/proxy-wrapper.ts
var isProxy, proxyWorker, initializing2, initialized2, aborted2, initWasmCallbacks, queuedCallbacks, enqueueCallbacks, ensureWorker, onProxyWorkerMessage, scriptSrc, initializeWebAssemblyAndOrtRuntime, initializeOrtEp, copyFromExternalBuffer2, createSession2, releaseSession2, run2, endProfiling2;
var init_proxy_wrapper = __esm({
  "web/lib/wasm/proxy-wrapper.ts"() {
    "use strict";
    init_esm();
    init_wasm_core_impl();
    init_wasm_factory();
    isProxy = () => !!env2.wasm.proxy && typeof document !== "undefined";
    initializing2 = false;
    initialized2 = false;
    aborted2 = false;
    queuedCallbacks = /* @__PURE__ */ new Map();
    enqueueCallbacks = (type, callbacks) => {
      const queue = queuedCallbacks.get(type);
      if (queue) {
        queue.push(callbacks);
      } else {
        queuedCallbacks.set(type, [callbacks]);
      }
    };
    ensureWorker = () => {
      if (initializing2 || !initialized2 || aborted2 || !proxyWorker) {
        throw new Error("worker not ready");
      }
    };
    onProxyWorkerMessage = (ev) => {
      switch (ev.data.type) {
        case "init-wasm":
          initializing2 = false;
          if (ev.data.err) {
            aborted2 = true;
            initWasmCallbacks[1](ev.data.err);
          } else {
            initialized2 = true;
            initWasmCallbacks[0]();
          }
          break;
        case "init-ep":
        case "copy-from":
        case "create":
        case "release":
        case "run":
        case "end-profiling": {
          const callbacks = queuedCallbacks.get(ev.data.type);
          if (ev.data.err) {
            callbacks.shift()[1](ev.data.err);
          } else {
            callbacks.shift()[0](ev.data.out);
          }
          break;
        }
        default:
      }
    };
    scriptSrc = typeof document !== "undefined" ? document?.currentScript?.src : void 0;
    initializeWebAssemblyAndOrtRuntime = async () => {
      if (initialized2) {
        return;
      }
      if (initializing2) {
        throw new Error("multiple calls to 'initWasm()' detected.");
      }
      if (aborted2) {
        throw new Error("previous call to 'initWasm()' failed.");
      }
      initializing2 = true;
      if (isProxy()) {
        if (env2.wasm.wasmPaths === void 0) {
          if (scriptSrc && scriptSrc.indexOf("blob:") !== 0) {
            env2.wasm.wasmPaths = scriptSrc.substr(0, +scriptSrc.lastIndexOf("/") + 1);
          }
        }
        return new Promise((resolve, reject) => {
          proxyWorker?.terminate();
          const workerUrl = URL.createObjectURL(new Blob(
            [
              // This require() function is handled by esbuild plugin to load file content as string.
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              require_main()
            ],
            { type: "text/javascript" }
          ));
          proxyWorker = new Worker(workerUrl, { name: "ort-wasm-proxy-worker" });
          proxyWorker.onerror = (ev) => reject(ev);
          proxyWorker.onmessage = onProxyWorkerMessage;
          URL.revokeObjectURL(workerUrl);
          initWasmCallbacks = [resolve, reject];
          const message = { type: "init-wasm", in: env2 };
          proxyWorker.postMessage(message);
        });
      } else {
        try {
          await initializeWebAssembly(env2.wasm);
          await initRuntime(env2);
          initialized2 = true;
        } catch (e) {
          aborted2 = true;
          throw e;
        } finally {
          initializing2 = false;
        }
      }
    };
    initializeOrtEp = async (epName) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("init-ep", [resolve, reject]);
          const message = { type: "init-ep", in: { epName, env: env2 } };
          proxyWorker.postMessage(message);
        });
      } else {
        await initEp(env2, epName);
      }
    };
    copyFromExternalBuffer2 = async (buffer) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("copy-from", [resolve, reject]);
          const message = { type: "copy-from", in: { buffer } };
          proxyWorker.postMessage(message, [buffer.buffer]);
        });
      } else {
        return copyFromExternalBuffer(buffer);
      }
    };
    createSession2 = async (model, options) => {
      if (isProxy()) {
        if (options?.preferredOutputLocation) {
          throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("create", [resolve, reject]);
          const message = { type: "create", in: { model, options: { ...options } } };
          const transferable = [];
          if (model instanceof Uint8Array) {
            transferable.push(model.buffer);
          }
          proxyWorker.postMessage(message, transferable);
        });
      } else {
        return createSession(model, options);
      }
    };
    releaseSession2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("release", [resolve, reject]);
          const message = { type: "release", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        releaseSession(sessionId);
      }
    };
    run2 = async (sessionId, inputIndices, inputs, outputIndices, outputs, options) => {
      if (isProxy()) {
        if (inputs.some((t) => t[3] !== "cpu")) {
          throw new Error("input tensor on GPU is not supported for proxy.");
        }
        if (outputs.some((t) => t)) {
          throw new Error("pre-allocated output tensor is not supported for proxy.");
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("run", [resolve, reject]);
          const serializableInputs = inputs;
          const message = { type: "run", in: { sessionId, inputIndices, inputs: serializableInputs, outputIndices, options } };
          proxyWorker.postMessage(message, extractTransferableBuffers(serializableInputs));
        });
      } else {
        return run(sessionId, inputIndices, inputs, outputIndices, outputs, options);
      }
    };
    endProfiling2 = async (sessionId) => {
      if (isProxy()) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("end-profiling", [resolve, reject]);
          const message = { type: "end-profiling", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        endProfiling(sessionId);
      }
    };
  }
});

// web/lib/wasm/session-handler-inference.ts
var encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
var init_session_handler_inference = __esm({
  "web/lib/wasm/session-handler-inference.ts"() {
    "use strict";
    init_esm();
    init_proxy_wrapper();
    init_wasm_common();
    init_wasm_utils_load_file();
    encodeTensorMetadata = (tensor, getName) => {
      switch (tensor.location) {
        case "cpu":
          return [tensor.type, tensor.dims, tensor.data, "cpu"];
        case "gpu-buffer":
          return [tensor.type, tensor.dims, { gpuBuffer: tensor.gpuBuffer }, "gpu-buffer"];
        default:
          throw new Error(`invalid data location: ${tensor.location} for ${getName()}`);
      }
    };
    decodeTensorMetadata = (tensor) => {
      switch (tensor[3]) {
        case "cpu":
          return new Tensor2(tensor[0], tensor[2], tensor[1]);
        case "gpu-buffer": {
          const dataType = tensor[0];
          if (!isGpuBufferSupportedType(dataType)) {
            throw new Error(`not supported data type: ${dataType} for deserializing GPU tensor`);
          }
          const { gpuBuffer, download, dispose } = tensor[2];
          return Tensor2.fromGpuBuffer(gpuBuffer, { dataType, dims: tensor[1], download, dispose });
        }
        default:
          throw new Error(`invalid data location: ${tensor[3]}`);
      }
    };
    OnnxruntimeWebAssemblySessionHandler = class {
      async fetchModelAndCopyToWasmMemory(path) {
        return copyFromExternalBuffer2(await loadFile(path));
      }
      async loadModel(pathOrBuffer, options) {
        TRACE_FUNC_BEGIN();
        let model;
        if (typeof pathOrBuffer === "string") {
          if (typeof process !== "undefined" && process.versions && process.versions.node) {
            model = await loadFile(pathOrBuffer);
          } else {
            model = await this.fetchModelAndCopyToWasmMemory(pathOrBuffer);
          }
        } else {
          model = pathOrBuffer;
        }
        [this.sessionId, this.inputNames, this.outputNames] = await createSession2(model, options);
        TRACE_FUNC_END();
      }
      async dispose() {
        return releaseSession2(this.sessionId);
      }
      async run(feeds, fetches, options) {
        TRACE_FUNC_BEGIN();
        const inputArray = [];
        const inputIndices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.inputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}'`);
          }
          inputArray.push(tensor);
          inputIndices.push(index);
        });
        const outputArray = [];
        const outputIndices = [];
        Object.entries(fetches).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.outputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid output '${name}'`);
          }
          outputArray.push(tensor);
          outputIndices.push(index);
        });
        const inputs = inputArray.map((t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`));
        const outputs = outputArray.map(
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await run2(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        TRACE_FUNC_END();
        return resultMap;
      }
      startProfiling() {
      }
      endProfiling() {
        void endProfiling2(this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm.ts
var initializeFlags, OnnxruntimeWebAssemblyBackend;
var init_backend_wasm = __esm({
  "web/lib/backend-wasm.ts"() {
    "use strict";
    init_node_os();
    init_esm();
    init_proxy_wrapper();
    init_session_handler_inference();
    initializeFlags = () => {
      if (typeof env2.wasm.initTimeout !== "number" || env2.wasm.initTimeout < 0) {
        env2.wasm.initTimeout = 0;
      }
      if (typeof env2.wasm.simd !== "boolean") {
        env2.wasm.simd = true;
      }
      if (typeof env2.wasm.proxy !== "boolean") {
        env2.wasm.proxy = false;
      }
      if (typeof env2.wasm.trace !== "boolean") {
        env2.wasm.trace = false;
      }
      if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
        if (typeof self !== "undefined" && !self.crossOriginIsolated || typeof process !== "undefined" && process.versions && process.versions.node) {
          env2.wasm.numThreads = 1;
        }
        const numCpuLogicalCores = typeof navigator === "undefined" ? cpus().length : navigator.hardwareConcurrency;
        env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
      }
    };
    OnnxruntimeWebAssemblyBackend = class {
      /**
       * This function initializes the WebAssembly backend.
       *
       * This function will be called only once for each backend name. It will be called the first time when
       * `ort.InferenceSession.create()` is called with a registered backend name.
       *
       * @param backendName - the registered backend name.
       */
      async init(backendName) {
        initializeFlags();
        await initializeWebAssemblyAndOrtRuntime();
        await initializeOrtEp(backendName);
      }
      async createInferenceSessionHandler(pathOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblySessionHandler();
        await handler.loadModel(pathOrBuffer, options);
        return Promise.resolve(handler);
      }
    };
  }
});

// web/lib/wasm/wasm-training-core-impl.ts
var NO_TRAIN_FUNCS_MSG, ifErrCodeCheckLastError, createCheckpointHandle, getModelInputOutputCount, getModelInputOutputNamesLoop, getModelInputOutputNames, createTrainingSessionHandle, createAndAllocateTensors, moveOutputToTensorMetadataArr, lazyResetGrad, runTrainStep, runOptimizerStep, runEvalStep, getParametersSize, getContiguousParameters, loadParametersBuffer, releaseTrainingSessionAndCheckpoint;
var init_wasm_training_core_impl = __esm({
  "web/lib/wasm/wasm-training-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_core_impl();
    init_wasm_factory();
    init_wasm_utils();
    NO_TRAIN_FUNCS_MSG = "Built without training API's enabled. Use the onnxruntime-web/training import for training functionality, and make sure that all the correct artifacts are built & moved to the correct folder if using a custom build. Check https://onnxruntime.ai/docs/build/web.html for more information.";
    ifErrCodeCheckLastError = (errCode, message, checkNeqZero = true) => {
      if (checkNeqZero && errCode !== 0) {
        checkLastError(message);
      } else if (!checkNeqZero && errCode === 0) {
        checkLastError(message);
      }
    };
    createCheckpointHandle = (checkpointData) => {
      const wasm2 = getInstance();
      const [checkpointDataOffset, checkpointDataLength] = checkpointData;
      let checkpointHandle = 0;
      try {
        if (wasm2._OrtTrainingLoadCheckpoint) {
          checkpointHandle = wasm2._OrtTrainingLoadCheckpoint(checkpointDataOffset, checkpointDataLength);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        ifErrCodeCheckLastError(checkpointHandle, "Error occurred when trying to create a CheckpointState", false);
        return checkpointHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseCheckpoint && checkpointHandle !== 0) {
          wasm2._OrtTrainingReleaseCheckpoint(checkpointHandle);
        }
        throw e;
      } finally {
        wasm2._OrtFree(checkpointData[0]);
      }
    };
    getModelInputOutputCount = (trainingSessionId, isEvalModel) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const dataOffset = wasm2.stackAlloc(8);
        if (wasm2._OrtTrainingGetModelInputOutputCount) {
          const errorCode = wasm2._OrtTrainingGetModelInputOutputCount(trainingSessionId, dataOffset, dataOffset + 4, isEvalModel);
          ifErrCodeCheckLastError(errorCode, "Can't get session input/output count.");
          return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getModelInputOutputNamesLoop = (trainingSessionId, count, isInput, isEvalModel) => {
      const names = [];
      const wasm2 = getInstance();
      for (let i = 0; i < count; i++) {
        if (wasm2._OrtTrainingGetModelInputOutputName) {
          const name = wasm2._OrtTrainingGetModelInputOutputName(trainingSessionId, i, isInput, isEvalModel);
          ifErrCodeCheckLastError(name, `Can't get input or output name -- is input: ${isInput}, index ${i}`, false);
          names.push(wasm2.UTF8ToString(name));
          wasm2._free(name);
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      }
      return names;
    };
    getModelInputOutputNames = (trainingSessionId, isEvalModel) => {
      let inputNames = [];
      let outputNames = [];
      const [inputCount, outputCount] = getModelInputOutputCount(trainingSessionId, isEvalModel);
      inputNames = getModelInputOutputNamesLoop(trainingSessionId, inputCount, true, isEvalModel);
      outputNames = getModelInputOutputNamesLoop(trainingSessionId, outputCount, false, isEvalModel);
      return [inputNames, outputNames];
    };
    createTrainingSessionHandle = (checkpointHandle, trainModelData, evalModelData, optimizerModelData, options) => {
      const wasm2 = getInstance();
      let trainingSessionHandle = 0;
      let sessionOptionsHandle = 0;
      let allocs = [];
      try {
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (wasm2._OrtTrainingCreateSession) {
          trainingSessionHandle = wasm2._OrtTrainingCreateSession(
            sessionOptionsHandle,
            checkpointHandle,
            trainModelData[0],
            trainModelData[1],
            evalModelData[0],
            evalModelData[1],
            optimizerModelData[0],
            optimizerModelData[1]
          );
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        ifErrCodeCheckLastError(trainingSessionHandle, "Error occurred when trying to create a TrainingSession", false);
        return trainingSessionHandle;
      } catch (e) {
        if (wasm2._OrtTrainingReleaseSession && trainingSessionHandle !== 0) {
          wasm2._OrtTrainingReleaseSession(trainingSessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(trainModelData[0]);
        wasm2._free(evalModelData[0]);
        wasm2._free(optimizerModelData[0]);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
      }
    };
    createAndAllocateTensors = (trainingSessionId, indices, tensors, tensorHandles, inputOutputAllocs, indexAdd) => {
      const count = indices.length;
      for (let i = 0; i < count; i++) {
        prepareInputOutputTensor(
          tensors[i],
          tensorHandles,
          inputOutputAllocs,
          trainingSessionId,
          indexAdd + indices[i]
        );
      }
      const wasm2 = getInstance();
      const valuesOffset = wasm2.stackAlloc(count * 4);
      let valuesIndex = valuesOffset / 4;
      for (let i = 0; i < count; i++) {
        wasm2.HEAPU32[valuesIndex++] = tensorHandles[i];
      }
      return valuesOffset;
    };
    moveOutputToTensorMetadataArr = (outputValuesOffset, outputCount, outputTensorHandles, outputTensors) => {
      const wasm2 = getInstance();
      const output = [];
      for (let i = 0; i < outputCount; i++) {
        const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
        if (tensor === outputTensorHandles[i]) {
          output.push(outputTensors[i]);
          continue;
        }
        const beforeGetTensorDataStack = wasm2.stackSave();
        const tensorDataOffset = wasm2.stackAlloc(4 * 4);
        let type, dataOffset = 0;
        try {
          const errorCode = wasm2._OrtGetTensorData(
            tensor,
            tensorDataOffset,
            tensorDataOffset + 4,
            tensorDataOffset + 8,
            tensorDataOffset + 12
          );
          ifErrCodeCheckLastError(errorCode, `Can't access output tensor data on index ${i}.`);
          let tensorDataIndex = tensorDataOffset / 4;
          const dataType = wasm2.HEAPU32[tensorDataIndex++];
          dataOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
          const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
          const dims = [];
          for (let i2 = 0; i2 < dimsLength; i2++) {
            dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
          }
          wasm2._OrtFree(dimsOffset);
          const size = dims.reduce((a, b) => a * b, 1);
          type = tensorDataTypeEnumToString(dataType);
          if (type === "string") {
            const stringData = [];
            let dataIndex = dataOffset / 4;
            for (let i2 = 0; i2 < size; i2++) {
              const offset = wasm2.HEAPU32[dataIndex++];
              const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
              stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
            }
            output.push([type, dims, stringData, "cpu"]);
          } else {
            const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
            const data = new typedArrayConstructor(size);
            new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
            output.push([type, dims, data, "cpu"]);
          }
        } finally {
          wasm2.stackRestore(beforeGetTensorDataStack);
          if (type === "string" && dataOffset) {
            wasm2._free(dataOffset);
          }
          wasm2._OrtReleaseTensor(tensor);
        }
      }
      return output;
    };
    lazyResetGrad = async (trainingSessionId) => {
      const wasm2 = getInstance();
      if (wasm2._OrtTrainingLazyResetGrad) {
        const errorCode = wasm2._OrtTrainingLazyResetGrad(trainingSessionId);
        ifErrCodeCheckLastError(errorCode, "Can't call lazyResetGrad.");
      } else {
        throw new Error(NO_TRAIN_FUNCS_MSG);
      }
    };
    runTrainStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingRunTrainStep) {
          const errorCode = wasm2._OrtTrainingRunTrainStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          ifErrCodeCheckLastError(errorCode, "failed to call OrtTrainingRunTrainStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    runOptimizerStep = async (trainingSessionId, options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        if (wasm2._OrtTrainingOptimizerStep) {
          const errCode = wasm2._OrtTrainingOptimizerStep(trainingSessionId, runOptionsHandle);
          ifErrCodeCheckLastError(errCode, "Failed to call OrtTrainingOptimizerStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    runEvalStep = async (trainingSessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        const inputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          inputIndices,
          inputTensors,
          inputTensorHandles,
          inputOutputAllocs,
          0
        );
        const outputValuesOffset = createAndAllocateTensors(
          trainingSessionId,
          outputIndices,
          outputTensors,
          outputTensorHandles,
          inputOutputAllocs,
          inputCount
        );
        if (wasm2._OrtTrainingEvalStep) {
          const errorCode = wasm2._OrtTrainingEvalStep(
            trainingSessionId,
            inputValuesOffset,
            inputCount,
            outputValuesOffset,
            outputCount,
            runOptionsHandle
          );
          ifErrCodeCheckLastError(errorCode, "failed to call OrtTrainingEvalStep in the WebAssembly layer");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        return moveOutputToTensorMetadataArr(outputValuesOffset, outputCount, outputTensorHandles, outputTensors);
      } finally {
        wasm2.stackRestore(beforeRunStack);
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    getParametersSize = (trainingSessionId, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const sizeOffset = wasm2.stackAlloc(4);
        if (wasm2._OrtTrainingGetParametersSize) {
          const errorCode = wasm2._OrtTrainingGetParametersSize(trainingSessionId, sizeOffset, trainableOnly);
          ifErrCodeCheckLastError(errorCode, "Can't get parameters size");
          return wasm2.HEAP32[sizeOffset / 4];
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getContiguousParameters = async (trainingSessionId, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      const tensorTypeAsString = "float32";
      const locationAsString = "cpu";
      const parametersSize = getParametersSize(trainingSessionId, trainableOnly);
      let tensor = 0;
      const paramsByteLength = 4 * parametersSize;
      const paramsOffset = wasm2._malloc(paramsByteLength);
      const dims = [parametersSize];
      const dimsOffset = wasm2.stackAlloc(4);
      const dimsIndex = dimsOffset / 4;
      wasm2.HEAP32[dimsIndex] = parametersSize;
      try {
        tensor = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(tensorTypeAsString),
          paramsOffset,
          paramsByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(locationAsString)
        );
        ifErrCodeCheckLastError(
          tensor,
          `Can't create tensor for getContiguousParameters. session=${trainingSessionId}.`,
          false
        );
        if (wasm2._OrtTrainingCopyParametersToBuffer) {
          const errCode = wasm2._OrtTrainingCopyParametersToBuffer(trainingSessionId, tensor, parametersSize, trainableOnly);
          ifErrCodeCheckLastError(errCode, "Can't get contiguous parameters.");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
        const typedArrayConstructor = tensorTypeToTypedArrayConstructor(tensorTypeAsString);
        const data = new typedArrayConstructor(parametersSize);
        const output = [];
        new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(paramsOffset, paramsOffset + paramsByteLength));
        output.push([tensorTypeAsString, dims, data, locationAsString]);
        if (output.length !== 1) {
          throw new Error(`something unexpected happened in the getContiguousParameters function. Expected output length of
     one, got ${output.length}`);
        } else {
          return output[0];
        }
      } finally {
        if (tensor !== 0) {
          wasm2._OrtReleaseTensor(tensor);
        }
        wasm2._free(paramsOffset);
        wasm2._free(dimsOffset);
        wasm2.stackRestore(stack);
      }
    };
    loadParametersBuffer = async (trainingSessionId, buffer, trainableOnly) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      const tensorTypeAsString = "float32";
      const locationAsString = "cpu";
      const bufferByteLength = buffer.length;
      const bufferCount = bufferByteLength / 4;
      const bufferOffset = wasm2._malloc(bufferByteLength);
      wasm2.HEAPU8.set(buffer, bufferOffset);
      const dimsOffset = wasm2.stackAlloc(4);
      wasm2.HEAP32[dimsOffset / 4] = bufferCount;
      const dimsLength = 1;
      let tensor = 0;
      try {
        tensor = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(tensorTypeAsString),
          bufferOffset,
          bufferByteLength,
          dimsOffset,
          dimsLength,
          dataLocationStringToEnum(locationAsString)
        );
        ifErrCodeCheckLastError(tensor, `Can't create tensor for input/output. session=${trainingSessionId}`, false);
        if (wasm2._OrtTrainingCopyParametersFromBuffer) {
          const errCode = wasm2._OrtTrainingCopyParametersFromBuffer(trainingSessionId, tensor, bufferCount, trainableOnly);
          ifErrCodeCheckLastError(errCode, "Can't copy buffer to parameters.");
        } else {
          throw new Error(NO_TRAIN_FUNCS_MSG);
        }
      } finally {
        if (tensor !== 0) {
          wasm2._OrtReleaseTensor(tensor);
        }
        wasm2.stackRestore(stack);
        wasm2._free(bufferOffset);
        wasm2._free(dimsOffset);
      }
    };
    releaseTrainingSessionAndCheckpoint = (checkpointId, sessionId) => {
      const wasm2 = getInstance();
      if (wasm2._OrtTrainingReleaseSession) {
        wasm2._OrtTrainingReleaseSession(sessionId);
      }
      if (wasm2._OrtTrainingReleaseCheckpoint) {
        wasm2._OrtTrainingReleaseCheckpoint(checkpointId);
      }
    };
  }
});

// web/lib/wasm/session-handler-training.ts
var OnnxruntimeWebAssemblyTrainingSessionHandler;
var init_session_handler_training = __esm({
  "web/lib/wasm/session-handler-training.ts"() {
    "use strict";
    init_session_handler_inference();
    init_wasm_core_impl();
    init_wasm_training_core_impl();
    OnnxruntimeWebAssemblyTrainingSessionHandler = class {
      constructor() {
        this.evalInputNames = [];
        this.evalOutputNames = [];
      }
      async uriOrBufferToHeap(uriOrBuffer) {
        let buffer;
        if (typeof uriOrBuffer === "string") {
          const response = await fetch(uriOrBuffer);
          const arrayBuffer = await response.arrayBuffer();
          buffer = new Uint8Array(arrayBuffer);
        } else {
          buffer = uriOrBuffer;
        }
        return copyFromExternalBuffer(buffer);
      }
      async createTrainingSession(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const checkpointData = await this.uriOrBufferToHeap(checkpointStateUriOrBuffer);
        const trainModelData = await this.uriOrBufferToHeap(trainModelUriOrBuffer);
        let evalModelData = [0, 0];
        let optimizerModelData = [0, 0];
        if (evalModelUriOrBuffer !== "") {
          evalModelData = await this.uriOrBufferToHeap(evalModelUriOrBuffer);
        }
        if (optimizerModelUriOrBuffer !== "") {
          optimizerModelData = await this.uriOrBufferToHeap(optimizerModelUriOrBuffer);
        }
        this.checkpointId = createCheckpointHandle(checkpointData);
        this.sessionId = createTrainingSessionHandle(this.checkpointId, trainModelData, evalModelData, optimizerModelData, options);
        [this.inputNames, this.outputNames] = getModelInputOutputNames(this.sessionId, false);
        if (evalModelUriOrBuffer !== "") {
          [this.evalInputNames, this.evalOutputNames] = getModelInputOutputNames(this.sessionId, true);
        }
      }
      /**
       * Helper method that converts a feeds or fetches datatype to two arrays, one of values and one that stores the
       * corresponding name as a number referring to the index in the list of names provided.
       *
       * @param feeds meant to match either SessionHandler.FeedsType or SessionHandler.FetchesType
       * @param names either inputNames or outputNames
       * @returns a tuple of a list of values and a list of indices.
       */
      convertMapIntoValuesArrayAndIndicesArray(feeds, names, mapFunc) {
        const values = [];
        const indices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = names.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}`);
          }
          values.push(tensor);
          indices.push(index);
        });
        const uList = values.map(mapFunc);
        return [values, indices, uList];
      }
      /**
       * Helper method that converts the TensorMetadata that the wasm-core functions return to the
       * SessionHandler.ReturnType. Any outputs in the provided outputArray that are falsy will be populated with the
       * corresponding result.
       *
       * @param results used to populate the resultMap if there is no value for that outputName already
       * @param outputArray used to populate the resultMap. If null or undefined, use the corresponding result from results
       * @param outputIndices specifies which outputName the corresponding value for outputArray refers to.
       * @returns a map of output names and OnnxValues.
       */
      convertTensorMetadataToReturnType(results, outputArray, outputIndices) {
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        return resultMap;
      }
      async lazyResetGrad() {
        await lazyResetGrad(this.sessionId);
      }
      async runTrainStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.inputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.outputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await runTrainStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async runOptimizerStep(options) {
        await runOptimizerStep(this.sessionId, options);
      }
      async runEvalStep(feeds, fetches, options) {
        const [, inputIndices, inputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          feeds,
          this.evalInputNames,
          (t, i) => encodeTensorMetadata(t, () => `input "${this.evalInputNames[inputIndices[i]]}"`)
        );
        const [outputArray, outputIndices, outputs] = this.convertMapIntoValuesArrayAndIndicesArray(
          fetches,
          this.evalOutputNames,
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.evalOutputNames[outputIndices[i]]}"`) : null
        );
        const results = await runEvalStep(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        return this.convertTensorMetadataToReturnType(results, outputArray, outputIndices);
      }
      async getParametersSize(trainableOnly) {
        return getParametersSize(this.sessionId, trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly) {
        await loadParametersBuffer(this.sessionId, array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly) {
        const tensorResult = await getContiguousParameters(this.sessionId, trainableOnly);
        return decodeTensorMetadata(tensorResult);
      }
      async dispose() {
        return releaseTrainingSessionAndCheckpoint(this.checkpointId, this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm-training.ts
var backend_wasm_training_exports = {};
__export(backend_wasm_training_exports, {
  wasmBackend: () => wasmBackend
});
var OnnxruntimeTrainingWebAssemblyBackend, wasmBackend;
var init_backend_wasm_training = __esm({
  "web/lib/backend-wasm-training.ts"() {
    "use strict";
    init_backend_wasm();
    init_session_handler_training();
    OnnxruntimeTrainingWebAssemblyBackend = class extends OnnxruntimeWebAssemblyBackend {
      async createTrainingSessionHandler(checkpointStateUriOrBuffer, trainModelUriOrBuffer, evalModelUriOrBuffer, optimizerModelUriOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblyTrainingSessionHandler();
        await handler.createTrainingSession(
          checkpointStateUriOrBuffer,
          trainModelUriOrBuffer,
          evalModelUriOrBuffer,
          optimizerModelUriOrBuffer,
          options
        );
        return Promise.resolve(handler);
      }
    };
    wasmBackend = new OnnxruntimeTrainingWebAssemblyBackend();
  }
});

// web/lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  TrainingSession: () => TrainingSession2,
  default: () => lib_default,
  env: () => env2,
  registerBackend: () => registerBackend
});
module.exports = __toCommonJS(lib_exports);
init_esm();
init_esm();
init_esm();

// web/lib/version.ts
var version2 = "1.19.0";

// web/lib/index.ts
var lib_default = esm_exports;
if (false) {
  const onnxjsBackend = null.onnxjsBackend;
  registerBackend("webgl", onnxjsBackend, -10);
}
if (true) {
  const wasmBackend2 = false ? null.wasmBackend : (init_backend_wasm_training(), __toCommonJS(backend_wasm_training_exports)).wasmBackend;
  if (false) {
    registerBackend("webgpu", wasmBackend2, 5);
    registerBackend("webnn", wasmBackend2, 5);
  }
  registerBackend("cpu", wasmBackend2, 10);
  registerBackend("wasm", wasmBackend2, 10);
}
Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });