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

import {Schema, ArraySchema, type, filter} from '@colyseus/schema';

import {Player} from './Player';
import {interpret, Interpreter} from 'xstate';
import {
  GameStateMachine,
  MachineEventType,
  MachineStateType,
} from './StateMachine';
import {GameRoom} from './GameRoom';
import {Rules} from './Rules';

export class GameState extends Schema {
  @type('string')
  state = 'open';

  @filter((client: Client, _value: Player['role'], root: GameState) => {
    const client_player = root.clientPlayer(client);
    if (
      client_player?.role === 'mafioso' ||
      client_player?.role === '31er' ||
      root.detective === client.sessionId
    ) {
      return true;
    }

    return false;
  })
  @type('string')
  secret = '';

  @type('string')
  detective = '';

  @type(['string'])
  rules = new Rules();

  @type(['string'])
  wordLists = new ArraySchema<string>();

  @type([Player])
  players = new ArraySchema<Player>();

  machine: Interpreter<GameRoom, MachineStateType, MachineEventType>;

  constructor() {
    super();
    this.machine = interpret(GameStateMachine).start();
    this.machine.start;
  }

  clientPlayer(client: Client): Player | undefined {
    return this.players.find(
      (player: Player) => player.clientId === client.sessionId
    );
  }
}
