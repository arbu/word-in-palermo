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

import {MapSchema} from '@colyseus/schema';

const defaultRules = new Map<string, string>([
  ['word_choice_count', '1'],
  ['random_word', 'true'],
]);

export class Rules extends MapSchema<string> {
  get(key: string): string {
    return this.$items.get(key) ?? defaultRules.get(key) ?? '';
  }

  getNumber(key: string): number {
    return Number(this.get(key));
  }

  getBoolen(key: string): boolean {
    return this.get(key) === 'true';
  }

  getStringArray(key: string): string[] {
    return this.get(key).split(';');
  }
}
