'use strict';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { walkThroughTree } from './walkthroughtree';

const getOwnPropertyHashes = typeof Reflect === 'object' && Reflect.ownKeys ||
(Object.getOwnPropertySymbols ? function getOwnPropertyHashes(obj) {
  return Array.prototype.concat(
    Object.getOwnPropertyNames(obj),
    Object.getOwnPropertySymbols(obj)
  );
} : Object.getOwnPropertyNames);

const privateProps = typeof Symbol === 'function' ? Symbol('internals') : '__internals';

function isObject(o) {
  if(!o) return false;
  var type = typeof o;
  return type === 'object' || type === 'function';
}

function getAllProperties(obj, output = []) {
  if(!obj) return output;
  Array.prototype.push.apply(output, getOwnPropertyHashes(obj));
  return getAllProperties(Object.getPrototypeOf(obj), output);
}

function fileChanged(a, b, deferred) {
  const internals = this[privateProps], { options } = internals;
  if(options.delay) {
    if(internals.fileChangeTimeout) {
      clearTimeout(internals.fileChangeTimeout);
      delete internals.fileChangeTimeout;
    }
    if(!deferred && !internals.updateFileLock) {
      internals.fileChangeTimeout = setTimeout(internals.fileChanged, options.delay, a, b, true);
      return;
    }
  }
  if(internals.updateFileLock) return;
  try {
    if((a instanceof fs.Stats) ? a.mtime === b.mtime : b !== internals.fileName)
      return;
    this.forceUpdate();
  } catch(err) {
    console.log(err.stack || err);
  }
}

function deepPatchLayer(srcObject, srcDescriptor, patchDescriptor, key, depth, options) {
  // Pass the patched value if source / patch is not patchable, or already patched.
  if(!depth || !srcDescriptor)
    return Object.defineProperty(srcObject, key, patchDescriptor);

  const srcValue = srcDescriptor.value;
  const patchValue = patchDescriptor.value;
  if(srcValue === patchValue || !isObject(srcValue) || !isObject(patchValue))
    return Object.defineProperty(srcObject, key, patchDescriptor);
  
  const { ignoreProperties, keepNonExists } = options;

  // Fetch all keys from patcher object.
  const patchKeys = getOwnPropertyHashes(patchValue);
  for(const key of patchKeys) {
    if(ignoreProperties && ignoreProperties.includes(key))
      continue;

    const srcDescriptor = Object.getOwnPropertyDescriptor(srcValue, key);
    if(srcDescriptor && !srcDescriptor.configurable)
      continue;

    const patchDescriptor = Object.getOwnPropertyDescriptor(patchValue, key);
    if(!srcDescriptor || (!srcDescriptor.get && !patchDescriptor.get))
      this.next(srcValue, srcDescriptor, patchDescriptor, key, depth - 1, options);
  }

  // Take away properties that does not available in patcher (Pending to be deleted)
  if(!keepNonExists)
    for(const key of getOwnPropertyHashes(srcValue)) {
      if(patchKeys.includes(key) || (ignoreProperties && ignoreProperties.includes(key)))
        continue;

      const srcDescriptor = Object.getOwnPropertyDescriptor(srcValue, key);
      if(!srcDescriptor.configurable)
        continue;

      delete srcValue[key];
    }
    
  return srcObject;
}

export default class SelfReloadJSON extends EventEmitter {
  constructor(options) {
    super();

    switch(typeof options) {
      case 'string': options = { fileName: options }; break;
      case 'object': case 'undefined': break;
      default: throw new Error('Invalid options type.');
    }

    // Prevent removal of internal handlers
    this[privateProps] = null;

    this[privateProps] = {
      keys: [],
      fileName: '',
      watcher: null,
      content: null,
      fileChanged: (a, b, deferred) => fileChanged.call(this, a, b, deferred),
      forceUpdate: () => this.forceUpdate(),
      omitKeys: getAllProperties(this),
      options: Object.assign({
        fileName: '',
        encoding: 'utf8',
        additive: false,
        method: 'native',
        interval: 5000,
        reviver: null,
        replacer: null,
        delay: 0,
        depth: -1
      }, options)
    };

    // Convert all internal values to non-enumerable,
    // prevents those values exposed by save function.
    for(let key in this) {
      const value = this[key];
      delete this[key];
      Object.defineProperty(this, key, {
        value,
        enumerable: false,
        configurable: true,
        writable: true
      });
    }

    this.resume();
  }

  stop() {
    const internals = this[privateProps];
    if(!internals.watcher) return;
    if(typeof internals.watcher === 'string')
      fs.unwatchFile(internals.watcher, internals.fileChanged);
    else
      internals.watcher.close();
    internals.watcher = null;
  }

  resume() {
    this.stop();
    const internals = this[privateProps], { options } = internals;

    options.fileName = path.resolve(options.fileName);
    internals.fileName = path.basename(options.fileName);

    switch(options.method) {
      case 'native':
        internals.watcher = fs.watch(
          options.fileName,
          { encoding: options.encoding },
          internals.fileChanged
        );
        break;

      case 'polling':
        internals.watcher = options.fileName;
        fs.watchFile(
          options.fileName,
          { interval: options.interval },
          internals.fileChanged
        );
        break;
    }
    this.forceUpdate();
  }

  save(options) {
    const internals = this[privateProps];
    options = Object.assign(
      { space: null },
      internals.options,
      options
    );
    internals.updateFileLock = true;
    try {
      const json = JSON.stringify(this, options.replacer, options.space);
      fs.writeFileSync(internals.options.fileName, json, options);
      internals.raw = json;
    } finally {
      internals.updateFileLock = false;
    }
  }

  forceUpdate() {
    const internals = this[privateProps], { options } = internals;
    if(internals.updateFileLock) return;
    internals.updateFileLock = true;

    if(internals.retryTimer) {
      clearTimeout(internals.retryTimer);
      delete internals.retryTimer;
    }

    if(internals.fileChangeTimeout) {
      clearTimeout(internals.fileChangeTimeout);
      delete internals.fileChangeTimeout;
    }

    try {
      const rawContent = fs.readFileSync(options.fileName, { encoding: options.encoding });
      if(internals.raw === rawContent) return;
      internals.raw = rawContent;

      let newContent = JSON.parse(rawContent, options.reviver);
      if(typeof newContent !== 'object')
        newContent = { value: newContent };

      SelfReloadJSON.deepPatch(this, newContent, {
        keepNonExists: options.additive,
        ignoreProperties: internals.omitKeys,
        depth: options.depth
      });

      internals.newContent = SelfReloadJSON.deepPatch(internals.newContent || {}, newContent, {
        keepNonExists: options.additive,
        depth: options.depth
      });
    } catch(err) {
      switch(err && err.code) {
        case 'EBUSY':
        case 'EAGAIN':
          internals.retryTimer = setTimeout(internals.forceUpdate, options.delay);
          return;
      }

      this.emit('error', err);
      return;
    } finally {
      internals.updateFileLock = false;
    }

    this.emit('updated', internals.newContent);
  }

  static deepPatch(source, patch, options = {}) {
    if(!isObject(source) || !isObject(patch))
      return patch;
    const dummy = { value: source };
    return walkThroughTree(deepPatchLayer, {
      firstResult: true
    }, dummy, dummy, {
      value: patch,
      configurable: true,
      enumerable: true,
      writable: true
    }, 'value', ('depth' in options) ? options.depth : -1, options).value;
  }
}

export * from './walkthroughtree';
