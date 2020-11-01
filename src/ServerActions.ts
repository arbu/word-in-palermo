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

import {GameRoom} from './GameRoom';
import {Words} from './Words';

export class ServerActions {
  static setSecret(room: GameRoom): void {
    room.state.secret = new Words(
      room.state.rules.getStringArray('word_lists')
    ).random();
  }

  static sendWordList(room: GameRoom): void {
    room.clients
      .find((client: Client) => client.sessionId === room.state.detective)
      ?.send('word_list');
  }
}
