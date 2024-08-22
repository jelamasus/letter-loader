import { QueryBuilder } from './db.js';

export type Letter = {
  id: number;
  emailFrom: string;
  emailTo: string;
  createdAt: Date;
  text: string;
};

export async function getLetters(from: string, to: string) {
  const letters = (await QueryBuilder<Letter>('messages')
    .select({
      id: 'id',
      emailFrom: 'email_from',
      emailTo: 'email_to',
      createdAt: 'created_at',
      text: 'data',
    })
    .whereBetween('created_at', [from, to])) as unknown as Letter[];

  return letters.map((letter) => ({
    ...letter,
    // @ts-ignore
    text: letter.text['html'] as string,
  }));
}
