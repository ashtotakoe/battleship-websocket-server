export const enum Events {
  SyncWinnersAndRoomsForClient = 'sync-winner-and-rooms-for-client',
  CreateRoom = 'create-room',
  AddUserToRoom = 'add-user-to-room',
}

export const enum BroadcastSources {
  GameRooms = 'game-rooms',
  Winners = 'winners',
}

export const enum ResponseTypes {
  Registration = 'reg',
  UpdateRoom = 'update_room',
  UpdateWinners = 'update_winners',
  CreateGame = 'create_game',
  StartGame = 'start_game',
  NextTurn = 'turn',
  Attack = 'attack',
  FinishGame = 'finish',
}

export const enum RequestTypes {
  Registration = 'reg',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  AddShips = 'add_ships',
  RandomAttack = 'randomAttack',
  Attack = 'attack',
}

export const enum AttackStatuses {
  Miss = 'miss',
  Shot = 'shot',
  Killed = 'killed',
}
