/// <reference types="node" />

declare namespace SelfReloadJSON {
  export default class SelfReloadJSON<T> extends NodeJS.EventEmitter, T {
    /**
     * Construct the instance.
     * @param fileName Defines the path to the JSON file.
     */
    constructor(fileName: string);
  
    /**
     * Construct the instance.
     * @param options
     */
    constructor(options: SelfReloadJSONOptions);
  
    [key: string | number]: any;
  
    /**
     * Stop watching the changes of the JSON file.
     * You can use `resume` to continue watching the changes.
     */
    stop();
  
    /**
     * Start to watch the changes of the JSON file.
     * In default, this is automatically called after instance construction.
     */
    resume();
  
    /**
     * Write the changes back to the JSON file.
     * @param options
     */
    save(options?: SelfReloadJSONSaveOptions);
  
    /**
     * Force update the JSON file.
     */
    forceUpdate();
  
    /**
     * This event will be emitted after the JSON content refreshed.
     * The `json` parameter is the raw parsed JSON object (not the SelfReloadJSON instance itself).
     */
    on(event: 'updated', callback: (json: any) => void): this;
  
    /**
     * This event will be emitted while error occured when loading the updated JSON file.
     * The `err` parameter will be the error thrown by the updater.
     */
    on(event: 'save', callback: (err: any) => void): this;
    
    /**
     * This event will be emitted if any errors thrown during reload.
     */
    on(event: 'error', callback: (err: any) => void): this;
  
    /**
     * Deep patch an object in order to keep it's reference.
     * @param source Object to be patched.
     * @param patch Object for patching.
     * @param options
     */
    static deepPatch(source: any, patch: any, options?: DeepPatchOptions);
  }
  
  export interface SelfReloadJSONOptions extends SelfReloadJSONSaveOptions {
    /**
     * Defines the path to the JSON file.
     */
    fileName?: string;
  
    /**
     * defines the behavior when the JSON file changed externally,
     * set to `true` if you want to keep the removed properties in the instance.
     * Default is `false`.
     */
    additive?: boolean;
  
    /**
     * Defines what method to determine the changes of JSON file.
     * `'native'` mode will use system API to detect,
     * and `'polling'` mode will poll the modified time of the JSON file.
     * In the most case 'native' is more efficient,
     * but some of the operating system does not support this,
     * in this case `'polling'` should be used as fallback.
     */
    method?: 'native' | 'polling';
  
    /**
     * The checking interval if 'polling' mode is used.
     * Default is `5000` milliseconds.
     */
    interval?: number;
  
    /**
     * The [reviver](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter)
     * function when parsing JSON. Default is `null`.
     */
    reviver?: (key: string, value: any) => any;
  
    /**
     * Set the delay time to trigger update the object in order to
     * prevent event triggered several times or
     * sometimes throws error because of trying to
     * read the source JSON file but it is not yet completely updated.
     * Default is 0 (immediately).
     */
    delay?: number;
  
    /**
     * Depth of deep patching which try to keeps child object
     * with same references, `0` to disable,
     * negative values to apply all. Default is `-1`.
     */
    depth?: number;
  }
  
  export interface SelfReloadJSONSaveOptions {
    /**
     * Defines the encoding of the JSON file. Default is `'utf8'`.
     */
    encoding?: string;
  
    /**
     * The [replacer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter)
     * function when converting JSON object back to string.
     * You can override this option while calling `save()`. Default is `null`.
     */
    replacer?: ((this: any, key: string, value: any) => any) | string[];
  
    /**
     * [space](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_space_argument)
     * parameter passed to `JSON.stringify()`. Default is `null`.
     */
    space?: number | string;
  }
  
  export interface DeepPatchOptions {
    /**
     * List of property keys to ignore.
     */
    ignoreProperties?: string[];
  
    /**
     * `true` to keep objects that not exists in patch object,
     * otherwise `false`.
     */
    keepNonExists?: boolean;
  
    /**
     * How many levels to scan and patch,
     * levels excesses this number will be patched directly by
     * replacing with the patch object (which will not keep the reference).
     * Passing negative values in here to disable this limitation.
     */
    depth?: number;
  }
  
  // Walk through tree exposed
  
  /**
   * This function will wrap the callback for calling it recursively
   * with the `next()` binded in `this` scope.
   * Optionally you can choose the direction to go through the
   * virtual tree-like structure processed within the callback.
   */
  export function walkThroughTree<U>(fn: (this: WalkThroughTreeScope0) => U, options?: WalkThroughTreeOptions): U | undefined;
  export function walkThroughTree<T, U>(fn: (this: WalkThroughTreeScope1<T>, arg: T) => U, options: WalkThroughTreeOptions, arg: T): U | undefined;
  export function walkThroughTree<T1, T2, U>(fn: (this: WalkThroughTreeScope2<T1, T2>, arg1: T1, arg2: T2) => U, options: WalkThroughTreeOptions, arg1: T1, arg2: T2): U | undefined;
  export function walkThroughTree<T1, T2, T3, U>(fn: (this: WalkThroughTreeScope3<T1, T2, T3>, arg1: T1, arg2: T2, arg3: T3) => U, options: WalkThroughTreeOptions, arg1: T1, arg2: T2, arg3: T3): U | undefined;
  export function walkThroughTree<T1, T2, T3, T4, U>(fn: (this: WalkThroughTreeScope4<T1, T2, T3, T4>, arg1: T1, arg2: T2, arg3: T3, arg4: T4) => U, options: WalkThroughTreeOptions, arg1: T1, arg2: T2, arg3: T3, arg4: T4): U | undefined;
  export function walkThroughTree<T1, T2, T3, T4, T5, U>(fn: (this: WalkThroughTreeScope5<T1, T2, T3, T4, T5>, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => U, options: WalkThroughTreeOptions, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): U | undefined;
  export function walkThroughTree<U>(fn: (this: WalkThroughTreeScope, ...args: any[]) => U, options: WalkThroughTreeOptions, ...args: any[]): U | undefined;
  
  /**
   * Undely generator function for `walkThroughTree()`.
   */
  export function walkThroughTreeGen<U>(fn: (this: WalkThroughTreeScope0) => U, options?: WalkThroughTreeOptions): IterableIterator<U>;
  export function walkThroughTreeGen<T, U>(fn: (this: WalkThroughTreeScope1<T>, arg: T) => U, options: WalkThroughTreeOptions, arg: T): IterableIterator<U>;
  export function walkThroughTreeGen<T1, T2, U>(fn: (this: WalkThroughTreeScope2<T1, T2>, arg1: T1, arg2: T2) => U, options: WalkThroughTreeOptions, arg1: T1, arg2: T2): IterableIterator<U>;
  export function walkThroughTreeGen<T1, T2, T3, U>(fn: (this: WalkThroughTreeScope3<T1, T2, T3>, arg1: T1, arg2: T2, arg3: T3) => U, options: WalkThroughTreeOptions, arg1: T1, arg2: T2, arg3: T3): IterableIterator<U>;
  export function walkThroughTreeGen<T1, T2, T3, T4, U>(fn: (this: WalkThroughTreeScope4<T1, T2, T3, T4>, arg1: T1, arg2: T2, arg3: T3, arg4: T4) => U, options: WalkThroughTreeOptions, arg1: T1, arg2: T2, arg3: T3, arg4: T4): IterableIterator<U>;
  export function walkThroughTreeGen<T1, T2, T3, T4, T5, U>(fn: (this: WalkThroughTreeScope5<T1, T2, T3, T4, T5>, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => U, options: WalkThroughTreeOptions, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): IterableIterator<U>;
  export function walkThroughTreeGen<U>(fn: (this: WalkThroughTreeScope, ...args: any[]) => U, options: WalkThroughTreeOptions, ...args: any[]): IterableIterator<U>;
  
  export interface WalkThroughTreeOptions {
    /**
     * Should walk through the tree structure horizontally?
     */
    horizontal?: boolean;
  
    /**
     * First result or last result to return?
     */
    firstResult?: boolean;
  }
  
  export interface WalkThroughTreeScope {
    next(...args: any[]): void;
  }
  
  export interface WalkThroughTreeScope0 {
    next(): void;
  }
  
  export interface WalkThroughTreeScope1<T> {
    next(arg: T): void;
  }
  
  export interface WalkThroughTreeScope2<T1, T2> {
    next(arg1: T1, arg2: T2): void;
  }
  
  export interface WalkThroughTreeScope3<T1, T2, T3> {
    next(arg1: T1, arg2: T2, arg3: T3): void;
  }
  
  export interface WalkThroughTreeScope4<T1, T2, T3, T4> {
    next(arg1: T1, arg2: T2, arg3: T3, arg4: T4): void;
  }
  
  export interface WalkThroughTreeScope5<T1, T2, T3, T4, T5> {
    next(arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): void;
  }
}

export as namespace SelfReloadJSON;
