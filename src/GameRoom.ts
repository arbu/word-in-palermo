import {Client} from '@colyseus/schema/lib/annotations';
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

import {Room} from 'colyseus';
import {GameState} from './GameState';
import {JoinMessage} from './Messages';
import {Player} from './Player';

class RoomInfo {
  name = 'New Room';
  password: string | undefined;
  public = false;
}

export class GameRoom extends Room<GameState, RoomInfo> {
  onCreate() {
    this.setState(new GameState());

    this.onMessage('message', (_client: Client, _message: string) => {
      // TODO
    });

    this.onMessage('guess', (_client: Client, _message: string) => {
      // TODO
    });

    this.onMessage('start', (_client: Client, _messag: {}) => {
      if (this.state.detective === _client.sessionId) {
        this.state.machine.send('start');
      }
    });
  }

  onJoin(client: Client, options: JoinMessage) {
    const player = new Player(options);
    this.state.players.push(player);
  }

  startGame() {
    this.lock();
    this.state.secret = 'Geheimnis'; // TODO
  }

  onLeave(_client: Client, _consented: boolean) {}

  onDispose() {}
}
