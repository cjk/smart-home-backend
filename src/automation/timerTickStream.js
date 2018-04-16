// TODO: Dead code or still useful?!

// // Timer-Ticks are perhaps needed later when certain conditions or states should become invalid over time!

// const updateTimes = emitter => {
//   const ts = Date.now();
//   log.debug(ts);
//   emitter.emit(ts);
// };

// // Every five seconds update timestamps in state
// const timerTick$ = K.withInterval(5000, updateTimes);

// timerTick$.observe({
//   value(value) {
//     log.debug('value:', value);
//   },
//   error(error) {
//     log.debug('error:', error);
//   },
//   end() {
//     log.debug('end');
//   },
// });
