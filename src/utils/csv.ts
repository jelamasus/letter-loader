import { stringify } from 'csv';
import { writeFile } from 'fs/promises';

export async function saveObjectsToCsv(objects: object[], path: string) {
  const keys = Object.keys(objects[0]);
  const preparedData: any[][] = [keys];
  objects.forEach((obj) => preparedData.push(Object.values(obj)));

  const payload = await stringifyAsync(preparedData);
  await writeFile(path, payload);
}

function stringifyAsync(objects: any[][]): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = stringify(objects, (error) =>
      error ? reject(error) : null,
    );

    worker.on('error', (err) => reject(err));

    let result: string = '';
    worker.on('data', (chunk) => (result += chunk));
    worker.on('end', () => resolve(result));
  });
}
