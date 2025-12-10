// Input mapping utilities (CommonJS) - pure functions for unit testing
function mapKey(key){
  const k = String(key).toLowerCase();
  if(k === 'arrowleft' || k === 'a') return 'moveLeft';
  if(k === 'arrowright' || k === 'd') return 'moveRight';
  if(k === ' ') return 'brake';
  if(k === 'enter' || k === 'p') return 'pause';
  return null;
}

function mapPointer(x, width){
  if(typeof x !== 'number' || typeof width !== 'number') return null;
  return x < width/2 ? 'moveLeft' : 'moveRight';
}

function detectSwipe(deltaX, threshold){
  threshold = threshold || 30;
  if(deltaX > threshold) return 'moveRight';
  if(deltaX < -threshold) return 'moveLeft';
  return null;
}

module.exports = { mapKey, mapPointer, detectSwipe };
