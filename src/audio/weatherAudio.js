// 날씨별 배경음을 Web Audio API로 실시간 생성한다.
// 음원 파일을 쓰지 않으므로 저작권 걱정이 없고, 페이지 용량도 늘지 않는다.

const midiToFreq = m => 440 * Math.pow(2, (m - 69) / 12);

// 분위기별 설정: 코드 진행, 멜로디 음계, 음 간격(초), 파형, 환경음
const MOODS = {
  clear: {
    chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]],
    scale: [72, 74, 76, 79, 81, 84],
    noteEvery: 0.45,
    wave: 'triangle',
    cutoff: 2600,
  },
  night: {
    chords: [[57, 60, 64, 67], [53, 57, 60, 64], [50, 53, 57, 60], [52, 55, 59, 62]],
    scale: [69, 72, 74, 76, 79],
    noteEvery: 0.95,
    wave: 'sine',
    cutoff: 1400,
  },
  cloudy: {
    chords: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]],
    scale: [69, 71, 72, 74, 76],
    noteEvery: 0.85,
    wave: 'sine',
    cutoff: 1200,
    wind: 0.05,
  },
  rain: {
    chords: [[50, 53, 57, 60], [55, 58, 62, 65], [48, 52, 55, 59], [53, 57, 60, 64]],
    scale: [62, 65, 67, 69, 72],
    noteEvery: 1.1,
    wave: 'sine',
    cutoff: 900,
    rain: 0.16,
  },
  storm: {
    chords: [[50, 53, 57], [46, 50, 53], [48, 51, 55], [45, 48, 52]],
    scale: [62, 63, 65, 67, 70],
    noteEvery: 1.4,
    wave: 'sine',
    cutoff: 700,
    rain: 0.26,
    thunder: true,
  },
  snow: {
    chords: [[64, 67, 71, 74], [60, 64, 67, 71], [57, 60, 64, 69], [62, 66, 69, 72]],
    scale: [76, 79, 81, 83, 86, 88],
    noteEvery: 1.0,
    wave: 'sine',
    cutoff: 3000,
    bell: true,
    wind: 0.035,
  },
};
MOODS.fog = MOODS.cloudy;

const CHORD_SECONDS = 8;
const LOOKAHEAD = 0.4;

export function createWeatherAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // 공간감을 주는 간단한 메아리
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.38;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.32;
  const echoTone = ctx.createBiquadFilter();
  echoTone.type = 'lowpass';
  echoTone.frequency.value = 2200;
  delay.connect(echoTone);
  echoTone.connect(feedback);
  feedback.connect(delay);
  echoTone.connect(master);

  const music = ctx.createGain();
  music.gain.value = 0.55;
  music.connect(master);
  music.connect(delay);

  // 빗소리·바람·천둥에 쓰는 백색 소음
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const channel = noiseBuffer.getChannelData(0);
  for (let i = 0; i < channel.length; i++) channel[i] = Math.random() * 2 - 1;

  let mood = null;
  let timer = null;
  let nextChord = 0;
  let nextNote = 0;
  let nextDrop = 0;
  let nextThunder = 0;
  let chordIndex = 0;
  const loops = [];

  function noiseSource(loop = true) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = loop;
    return src;
  }

  function playPad(notes, at) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = mood.cutoff;
    const env = ctx.createGain();
    const level = 0.22 / notes.length;
    const end = at + CHORD_SECONDS + 1.5;
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(level, at + 2);
    env.gain.setValueAtTime(level, at + CHORD_SECONDS - 0.5);
    env.gain.linearRampToValueAtTime(0, end);
    filter.connect(env);
    env.connect(music);

    notes.forEach(note => {
      [-6, 6].forEach(detune => {
        const osc = ctx.createOscillator();
        osc.type = mood.wave;
        osc.frequency.value = midiToFreq(note - 12);
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(at);
        osc.stop(end + 0.1);
      });
    });
  }

  function playNote(note, at) {
    const partials = mood.bell ? [[1, 1], [2.76, 0.3], [5.4, 0.12]] : [[1, 1]];
    const length = mood.bell ? 2.6 : 1.4;
    partials.forEach(([ratio, amount]) => {
      const osc = ctx.createOscillator();
      osc.type = ratio === 1 ? mood.wave : 'sine';
      osc.frequency.value = midiToFreq(note) * ratio;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, at);
      env.gain.linearRampToValueAtTime(0.07 * amount, at + 0.015);
      env.gain.exponentialRampToValueAtTime(0.0001, at + length);
      osc.connect(env);
      env.connect(music);
      osc.start(at);
      osc.stop(at + length + 0.05);
    });
  }

  function playDrop(at) {
    const src = noiseSource(false);
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 1800 + Math.random() * 3500;
    band.Q.value = 6;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, at + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
    src.connect(band);
    band.connect(env);
    env.connect(master);
    src.start(at, Math.random() * 1.5);
    src.stop(at + 0.08);
  }

  function playThunder(at) {
    const src = noiseSource(false);
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 160;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(0.9, at + 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 4.5);
    src.connect(low);
    low.connect(env);
    env.connect(master);
    src.start(at);
    src.stop(at + 4.6);
  }

  function startAmbience() {
    if (mood.rain) {
      const src = noiseSource();
      const high = ctx.createBiquadFilter();
      high.type = 'highpass';
      high.frequency.value = 500;
      const low = ctx.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.value = 3200;
      const gain = ctx.createGain();
      gain.gain.value = mood.rain;
      src.connect(high);
      high.connect(low);
      low.connect(gain);
      gain.connect(master);
      src.start();
      loops.push(src);
    }
    if (mood.wind) {
      const src = noiseSource();
      const low = ctx.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.value = 450;
      const gain = ctx.createGain();
      gain.gain.value = mood.wind;
      // 바람이 불었다 잦아드는 느낌
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoAmount = ctx.createGain();
      lfoAmount.gain.value = mood.wind * 0.8;
      lfo.connect(lfoAmount);
      lfoAmount.connect(gain.gain);
      src.connect(low);
      low.connect(gain);
      gain.connect(master);
      src.start();
      lfo.start();
      loops.push(src, lfo);
    }
  }

  function schedule() {
    const horizon = ctx.currentTime + LOOKAHEAD;

    while (nextChord < horizon) {
      playPad(mood.chords[chordIndex % mood.chords.length], nextChord);
      chordIndex += 1;
      nextChord += CHORD_SECONDS;
    }

    while (nextNote < horizon) {
      if (Math.random() > 0.35) {
        const note = mood.scale[Math.floor(Math.random() * mood.scale.length)];
        playNote(note, nextNote);
      }
      nextNote += mood.noteEvery * (Math.random() > 0.8 ? 2 : 1);
    }

    if (mood.rain) {
      while (nextDrop < horizon) {
        playDrop(nextDrop);
        nextDrop += 0.04 + Math.random() * 0.18;
      }
    }

    if (mood.thunder && nextThunder < horizon) {
      playThunder(nextThunder);
      nextThunder += 14 + Math.random() * 16;
    }
  }

  return {
    // 클릭 직후에 호출해야 브라우저가 소리를 허용한다.
    unlock() {
      return ctx.resume();
    },

    play(kind) {
      mood = MOODS[kind] || MOODS.clear;
      const now = ctx.currentTime + 0.05;
      nextChord = now;
      nextNote = now + 1.5;
      nextDrop = now;
      nextThunder = now + 4;
      startAmbience();
      schedule();
      timer = setInterval(schedule, 120);
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(0.7, now + 2.5);
    },

    stop() {
      clearInterval(timer);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.8);
      return new Promise(resolve => {
        setTimeout(() => {
          loops.forEach(node => {
            try {
              node.stop();
            } catch {
              // 이미 멈춘 소리
            }
          });
          ctx.close().finally(resolve);
        }, 900);
      });
    },
  };
}
