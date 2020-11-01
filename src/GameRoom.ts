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

import * as http from 'http';

import assert from 'assert';
import {Presence, Room} from 'colyseus';
import {Client} from '@colyseus/schema/lib/annotations';
import {createMachine, interpret, Interpreter} from 'xstate';

import {GameState} from './common/GameState';
import {
  ChatClientMessage,
  ChatServerMessage,
  InitServerMessage,
  JoinClientMessage,
  TransitionServerMessage,
} from './common/Messages';
import {Player} from './common/Player';
import {RoomInfo} from './common/RoomInfo';
import {
  createStateMachineDescription,
  MachineEventType,
  MachineStateType,
} from './common/StateMachine';
import {ServerActions} from './ServerActions';

const GameStateMachine = createMachine<
  GameRoom,
  MachineEventType,
  MachineStateType<GameRoom>
>(createStateMachineDescription<GameRoom>());

export class GameRoom extends Room<GameState, RoomInfo> {
  private password?: string = undefined;

  private machine: Interpreter<
    GameRoom,
    MachineStateType<GameRoom>,
    MachineEventType,
    MachineStateType<GameRoom>
  >;

  constructor(presence?: Presence) {
    super(presence);
    this.machine = interpret<
      GameRoom,
      MachineStateType<GameRoom>,
      MachineEventType,
      MachineStateType<GameRoom>
    >(GameStateMachine, {
      actions: ServerActions,
    });
  }

  onCreate(): void {
    this.setState(new GameState(ServerActions));
    this.setMetadata(new RoomInfo('New room'));

    this.machine.onTransition((state, event) => {
      const message: TransitionServerMessage = {
        event: event.type,
      };
      this.broadcast('transition', message);
    });

    this.onMessage('chat', (client: Client, chatMessage: ChatClientMessage) => {
      const message: ChatServerMessage = {
        player: client.sessionId,
        message: chatMessage.message,
      };
      this.broadcast('chat', message);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.onMessage('start', (client: Client, _message: {}) => {
      if (this.state.detective !== client.sessionId) {
        client.error(403, 'only the room owner can start a game');
      } else if (this.machine.state.value !== 'entry') {
        client.error(404, 'game already running');
      } else {
        if (this.state.rules.getBoolean('detectiveCanChoose')) {
          this.machine.send({type: 'startWithConfirmation'});
        } else {
          this.machine.send({type: 'startWithoutConfirmation'});
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.onMessage('restart', (client: Client, _message: {}) => {
      if (this.state.detective !== client.sessionId) {
        client.error(403, 'only the room owner can restart a game');
      } else if (
        this.machine.state.value !== 'winMafia' &&
        this.machine.state.value !== 'winPlayers'
      ) {
        client.error(404, 'cannot restart running game');
      } else {
        Object.keys(this.reconnections).forEach(sessionId => {
          this.reconnections[sessionId].reject();
        });
        this.machine.start();
      }
    });

    this.machine.start();
  }

  onAuth(
    client: Client,
    options: JoinClientMessage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _request?: http.IncomingMessage
  ): boolean | Player {
    if (this.password !== undefined && options.roomPassword !== this.password) {
      return false;
    }
    return new Player({name: options.properties});
  }

  onJoin(client: Client, options: JoinClientMessage, player: Player): void {
    this.state.players.push(player);
    const message: InitServerMessage = {
      state: this.machine.state.value,
    };
    client.send('init', message);
  }

  async onLeave(client: Client, consented: boolean): Promise<void> {
    client.auth.connected = false;
    const leaveMessage: ChatServerMessage = {
      player: undefined,
      message: consented
        ? `Player ${client.auth.name} left the game.`
        : `Player ${client.auth.name} was disconnected.`,
    };
    this.broadcast('chat', leaveMessage);

    try {
      assert(this.machine.state.value !== 'entry');
      await this.allowReconnection(client);
      client.auth.connected = true;
      const reconnectMessage: ChatServerMessage = {
        player: undefined,
        message: `Player ${client.auth.name} reconnected.`,
      };
      this.broadcast('chat', reconnectMessage);
      const initMessage: InitServerMessage = {
        state: this.machine.state.value,
      };
      client.send('init', initMessage);
    } catch (error) {
      console.debug(error);
      this.state.players.forEach((player, index) => {
        if (player === client.auth) {
          this.state.players.splice(index, 1);
        }
      });
    }
  }

  onDispose(): void {
    Object.keys(this.reconnections).forEach(sessionId => {
      this.reconnections[sessionId].reject();
    });
  }
}
