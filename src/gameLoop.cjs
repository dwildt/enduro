// CommonJS module for deterministic tick calculations (testable in Node)
module.exports.simulateStep = function(last, now, accumulator, TICK){
  const frameTime = now - last;
  accumulator += frameTime;
  let updates = 0;
  while(accumulator >= TICK){
    updates += 1;
    accumulator -= TICK;
  }
  return { updates, accumulator };
};
