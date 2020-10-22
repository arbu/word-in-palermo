/*
Copyright (C) 2020 Aaron Bulmahn

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import fs from 'fs';
import readline from 'readline';
import path from 'path';

class WordList {
  name: string;
  language: string;
  words: string[] = [];

  constructor(name: string, language: string) {
    this.name = name;
    this.language = language;
  }

  async load(file: string): Promise<void> {
    const reader = readline.createInterface(fs.createReadStream(file));

    for await (const rawLine of reader) {
      const line = rawLine.trim();
      if (line !== '' && !line.startsWith('#')) {
        this.words.push(line);
      }
    }
  }
}

const allWordLists = new Map<string, WordList>();

export async function initWordLists() {
  const listsDirectory = process.env.WORDLISTS || './wordlists';

  const configPath = path.join(listsDirectory, 'config.json');
  const config = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));

  for (const list of config.lists) {
    const wordList = new WordList(list.name, list.language);

    const wordListPath = path.join(listsDirectory, list.file);
    await wordList.load(wordListPath);

    allWordLists.set(`${list.language}/${list.name}`, wordList);
  }
}

export class Words {
  words: string[] = [];

  constructor(wordLists: string[]) {
    for (const list in wordLists) {
      const words = allWordLists.get(list)?.words ?? [];
      this.words.push(...words);
    }
  }

  random(): string {
    return this.words[Math.floor(Math.random() * this.words.length)];
  }

  randomList(count: number): Array<string> {
    return new Array(count).map(() => this.random());
  }
}
