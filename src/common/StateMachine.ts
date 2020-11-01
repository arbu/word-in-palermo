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

import {MachineConfig, StateSchema} from 'xstate';

export type MachineEventType = {
  type:
    | 'startWithConfirmation'
    | 'startWithoutConfirmation'
    | 'chooseWord'
    | 'makeGuessRight'
    | 'makeGuessWrong'
    | 'askQuestion'
    | 'rateQuestion'
    | 'timoutQuestioning'
    | 'outOfTokens'
    | 'castVoteMafioso'
    | 'voteFinishRight'
    | 'voteFinishWrong'
    | 'accuseVisionaryRight'
    | 'accuseVisionaryWrong';
};

export type MachineStateType<ContextType> = {
  value:
    | 'entry'
    | 'chooseWord'
    | 'guessing'
    | 'voteMafioso'
    | 'accuseVisionary'
    | 'winMafia'
    | 'winPlayers';
  context: ContextType;
  states: {
    [key: string]: StateSchema<ContextType>;
  };
};

export function createStateMachineDescription<ContextType>(): MachineConfig<
  ContextType,
  MachineStateType<ContextType>,
  MachineEventType
> {
  return {
    id: 'game',
    initial: 'entry',
    states: {
      entry: {
        on: {
          startWithConfirmation: {
            target: 'chooseWord',
            actions: ['generateRoles', 'sendWordList'],
          },
          startWithoutConfirmation: {
            target: 'guessing',
            actions: ['generateRoles', 'setSecret'],
          },
        },
      },

      chooseWord: {
        on: {
          chooseWord: {
            target: 'guessing',
          },
        },
      },

      guessing: {
        on: {
          makeGuessWrong: {
            target: 'guessing',
          },
          makeGuessRight: {
            target: 'accuseVisionary',
          },
          askQuestion: {
            target: 'guessing',
          },
          rateQuestion: {
            target: 'guessing',
          },
          timoutQuestioning: {
            target: 'voteMafioso',
          },
          outOfTokens: {
            target: 'voteMafioso',
          },
        },
      },

      voteMafioso: {
        on: {
          castVoteMafioso: {
            target: 'voteMafioso',
          },
          voteFinishRight: {
            target: 'winPlayers',
          },
          voteFinishWrong: {
            target: 'winMafia',
          },
        },
      },

      accuseVisionary: {
        on: {
          accuseVisionaryRight: {
            target: 'winMafia',
          },
          accuseVisionaryWrong: {
            target: 'winPlayers',
          },
        },
      },

      winMafia: {},

      winPlayers: {},
    },
  };
}
