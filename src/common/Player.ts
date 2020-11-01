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

import {Schema, type, filter} from '@colyseus/schema';

import {StateFilters} from '../StateFilters';

export class Player extends Schema {
  @filter(StateFilters.hidden)
  @type('string')
  clientId = '';

  @type('boolean')
  isConnected = true;

  @type('string')
  name = '';

  @type('string')
  color = '';

  @type('string')
  accessory = '';

  @filter(StateFilters.clientCanViewPlayerRole)
  @type('string')
  role = '';
}
