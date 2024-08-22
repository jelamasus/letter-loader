import { resolve } from 'path';
import { saveObjectsToCsv } from './utils/csv.js';
import { getLetters, Letter } from './utils/letters.js';
import { logger } from './utils/logger.js';
import { writeFile } from 'fs/promises';
import { GptClientWrapper } from './utils/gpt.js';
import settings from './utils/settings.js';

async function main() {
  const letters = await getLetters('2024-08-12', '2024-08-18');

  await writeFile(
    resolve('letters.json'),
    JSON.stringify(letters, undefined, 2),
  );

  logger.info({
    msg: 'Letters loaded',
    count: letters.length,
  });

  const gpt = new GptClientWrapper(settings.OPENAI_API_KEY, settings.PROXY);

  const result: (Letter & { isInvitation: 'yes' | 'no' })[] = [];
  for (const letter of letters) {
    const start = new Date();
    const isInvitation = await gpt.detectInvitationLetter(letter.text);

    result.push({
      ...letter,
      isInvitation: isInvitation ? 'yes' : 'no',
    });

    logger.info({
      msg: 'Parsed letter',
      took: `${Date.now() - start.getTime()}ms`,
      id: letter.id,
      isInvitation,
    });
  }

  await writeFile(resolve('result.json'), JSON.stringify(result, undefined, 2));
  await saveObjectsToCsv(result, resolve('result.csv'));

  logger.info({
    msg: 'Parse ended',
  });
}

main()
  .catch((err) =>
    logger.error({
      error: err,
    }),
  )
  .finally(() => process.exit());
