function createLCG(seed){
  let state = seed >>> 0;
  return {
    next(){
      // 32-bit LCG
      state = (state * 1664525 + 1013904223) >>> 0;
      return state;
    },
    nextFloat(){
      return (this.next() >>> 0) / 4294967296;
    }
  }
}
module.exports = { createLCG };
