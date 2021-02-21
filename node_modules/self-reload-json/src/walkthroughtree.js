'use strict';
export function walkThroughTree(fn, options, ...args) {
  options = options || {};
  let first = true, result;
  for(const current of walkThroughTreeGen(fn, options, ...args))
    if(first || !options.firstResult) {
      result = current;
      first = false;
    }
  return result;
}

export function* walkThroughTreeGen(fn, options, ...args) {
  options = options || {};
  const dequeue = Array.prototype[options.horizontal ? 'shift': 'pop'];
  const tokens = [args], nextTokens = [];
  const scope = {
    next(...args) { nextTokens.push(args); }
  };
  while(tokens.length) {
    yield fn.apply(scope, dequeue.call(tokens));
    if(nextTokens.length) {
      Array.prototype.push.apply(tokens, nextTokens);
      nextTokens.length = 0;
    }
  }
}