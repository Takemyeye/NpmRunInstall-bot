import { readdir, unlink } from 'fs/promises';
import { resolve } from 'path';

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg'];

export async function cleanAudioFilesInDir(dirPath) {
  try {
    const files = await readdir(dirPath);

    const audioFiles = files.filter(file => 
      AUDIO_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext))
    );

    for (const file of audioFiles) {
      const fullPath = resolve(dirPath, file);
      await unlink(fullPath);
      console.log(`Deleted audio file: ${file}`);
    }

    if (audioFiles.length === 0) {
      console.log('No audio files to delete.');
    }
  } catch (err) {
    console.error('Error cleaning audio files:', err);
  }
}
