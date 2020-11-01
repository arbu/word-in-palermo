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

// eslint-disable-next-line node/no-unpublished-import
import {Room, Client} from 'colyseus.js';
import {GameState} from '../src/common/GameState';

export function requestJoinOptions(this: Client, i: number) {
  return {requestNumber: i};
}

export function onJoin(this: Room) {
  console.log(this.sessionId, 'joined.');

  this.onMessage('*', (type, message) => {
    console.log(this.sessionId, 'received:', type, message);
  });
}

export function onLeave(this: Room) {
  console.log(this.sessionId, 'left.');
}

interface ErrorMessagType {
  message: string;
}
export function onError(this: Room, err: ErrorMessagType) {
  console.log(this.sessionId, '!! ERROR !!', err.message);
}

export function onStateChange(this: Room, state: GameState) {
  console.log(this.sessionId, 'new state:', state);
}
