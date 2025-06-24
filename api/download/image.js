import { get } from 'https';
import { createWriteStream, unlink } from 'fs';

export function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filepath);
    get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      unlink(filepath, () => reject(err));
    });
  });
}