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

import {Schema, type, filter} from '@colyseus/schema';

import {GameState} from './GameState';

export class Player extends Schema {
  @type('string')
  clientId = '';

  @type('string')
  name = '';

  @type('string')
  color = '';

  @type('string')
  accesoir = '';

  @filter(function (
    this: Player,
    client: Client,
    value: Player['role'],
    root: GameState
  ) {
    // every player can view their own role
    if (this.clientId === client.sessionId) {
      return true;
    }

    const client_player = root.players.find(
      (player: Player) => player.clientId === client.sessionId
    );
    // mafiosos know each other
    if (client_player?.role === 'mafioso' && this.role === 'mafioso') {
      return true;
    }

    // freemasons know each other
    if (client_player?.role === 'freemason' && this.role === 'freemason') {
      return true;
    }

    return false;
  })
  @type('string')
  role = '';
}
