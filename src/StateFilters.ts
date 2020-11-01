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

import {Client} from 'colyseus';

import {GameState} from './common/GameState';
import {Player} from './common/Player';

export class StateFilters {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static hidden<T>(_client: Client, _value: T): boolean {
    return false;
  }

  static clientCanViewSecret(
    client: Client,
    _value: GameState['secret'],
    state: GameState
  ): boolean {
    if (
      client.auth.role === 'mafioso' ||
      client.auth.role === '31er' ||
      state.detective === client.sessionId
    ) {
      return true;
    }

    return false;
  }

  static clientCanViewPlayerRole(
    this: Player,
    client: Client,
    role: Player['role']
  ): boolean {
    // every player can view their own role
    if (this === client.auth) {
      return true;
    }

    // mafiosos know each other
    if (client.auth.role === 'mafioso' && role === 'mafioso') {
      return true;
    }

    // freemasons know each other
    if (client.auth.role === 'freemason' && role === 'freemason') {
      return true;
    }

    return false;
  }
}
