export const MAX_AUDIO_SIZE = 15 * 1024 * 1024;
const AUDIO_BITRATE = 192000;

export function isAudioSizeAcceptable(durationTimestamp) {
  const parts = durationTimestamp.split(':').map(Number);
  let seconds = 0;

  if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    seconds = parts[0];
  }

  const sizeBytes = seconds * (AUDIO_BITRATE / 8);
  return sizeBytes <= MAX_AUDIO_SIZE;
}
