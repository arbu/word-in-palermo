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

import cors from 'cors';
import express from 'express';
import http from 'http';
import {Server, LobbyRoom} from 'colyseus';
import {monitor} from '@colyseus/monitor';

import {GameRoom} from './GameRoom';
import {initWordLists} from './Words';

const port = Number(process.env.PALERMO_PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const gameServer = new Server({
  server: http.createServer(app),
});

gameServer.define('bagheria', LobbyRoom);
gameServer.define('palermo', GameRoom).enableRealtimeListing();

app.use('/monitor', monitor());

(async function () {
  await initWordLists();

  gameServer.listen(port);

  console.log(`Listening on ws://localhost:${port}`);
})();
