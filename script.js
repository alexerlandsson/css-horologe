(function initClockSync() {
  let started = false;
  let maintenanceIntervalId = null;
  let wholeSecondTimeoutId = null;

  function syncClock() {
    const now = new Date();

    const ms = now.getMilliseconds();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const rawSeconds = now.getSeconds();
    const seconds = rawSeconds + ms / 1000; // fractional
    const totalSecondsSinceMidnight =
      hours * 3600 + minutes * 60 + seconds;

    // DOM refs
    const periodTape        = document.querySelector('.clock__tape--period');
    const hoursTape         = document.querySelector('.clock__tape--hours');
    const minutesTenthTape  = document.querySelector('.clock__tape--minutes-tenth');
    const minutesSingleTape = document.querySelector('.clock__tape--minutes-single');
    const secondsTenthTape  = document.querySelector('.clock__tape--seconds-tenth');
    const secondsSingleTape = document.querySelector('.clock__tape--seconds-single');

    if (!periodTape) return;

    // Cycles
    const CYCLE_DAY         = 86400;
    const CYCLE_HALFDAY     = 43200;
    const CYCLE_HOUR        = 3600;
    const CYCLE_TEN_MIN     = 600;
    const CYCLE_MINUTE      = 60;
    const CYCLE_TEN_SECONDS = 10;
    const FIXED_HOURS_OFFSET = -39600;

    const periodPos        = totalSecondsSinceMidnight % CYCLE_DAY;
    const hoursPos         = totalSecondsSinceMidnight % CYCLE_HALFDAY;
    const minutesTenthPos  = totalSecondsSinceMidnight % CYCLE_HOUR;      // 0..3599.999
    const minutesSinglePos = totalSecondsSinceMidnight % CYCLE_TEN_MIN;   // 0..599.999
    const secondsTenthPos  = seconds % CYCLE_MINUTE;                      // 0..59.999
    const secondsSinglePos = seconds % CYCLE_TEN_SECONDS;                 // 0..9.999

    periodTape       .style.setProperty('--offset', `${-periodPos}s`);
    hoursTape        .style.setProperty('--offset', `${-hoursPos + FIXED_HOURS_OFFSET}s`);
    minutesTenthTape .style.setProperty('--offset', `${-minutesTenthPos}s`);
    minutesSingleTape.style.setProperty('--offset', `${-minutesSinglePos}s`);
    secondsTenthTape .style.setProperty('--offset', `${-secondsTenthPos}s`);
    secondsSingleTape.style.setProperty('--offset', `${-secondsSinglePos}s`);
  }

  function startSyncProcess() {
    if (started) return;
    started = true;

    if (btn) {
      btn.disabled = true;
    }

    // Immediate sync (fractional alignment)
    syncClock();

    // Align to next whole second, then start maintenance interval
    const nowPerf = performance.now();
    const msToNextSecond = 1000 - (nowPerf % 1000);

    wholeSecondTimeoutId = setTimeout(() => {
      syncClock();
      maintenanceIntervalId = setInterval(syncClock, 5 * 60 * 1000); // every 5 minutes
    }, msToNextSecond);
  }

  // Attach click listener to button
  const btn = document.getElementById('sync-time');
  if (btn) {
    btn.addEventListener('click', startSyncProcess, { once: false });
  }
})();