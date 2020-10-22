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

import {Words} from './Words';

import {GameRoom} from './GameRoom';
import {createMachine} from 'xstate';

export type MachineEventType = {
  type: 'start' | 'startWithRandom';
};

export type MachineStateType = {
  value: 'entry' | 'chooseWord' | 'guess';
  context: GameRoom;
};

export const GameStateMachine = createMachine<
  GameRoom,
  MachineEventType,
  MachineStateType
>(
  {
    id: 'game',
    initial: 'entry',
    states: {
      entry: {
        on: {
          start: {
            target: 'chooseWord',
            actions: ['sendWordList'],
          },
          startWithRandom: {
            target: 'guess',
            actions: ['setSecret'],
          },
        },
      },

      chooseWord: {
        on: {
          start: {
            target: 'guess',
          },
        },
      },

      guess: {
        entry: ['startGame'],
        on: {},
      },
    },
  },
  {
    actions: {
      setSecret: function (room: GameRoom) {
        room.state.secret = new Words(
          room.state.rules.getStringArray('word_lists')
        ).random();
      },

      sendWordList: function (room: GameRoom) {
        room.clients
          .find((client: Client) => client.sessionId === room.state.detective)
          ?.send('word_list');
      },
    },
  }
);
