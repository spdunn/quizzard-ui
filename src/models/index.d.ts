import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type GameMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Game {
  readonly id: string;
  readonly name: string;
  readonly match_state: number;
  readonly card_index: number;
  readonly capacity?: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Game, GameMetaData>);
  static copyOf(source: Game, mutator: (draft: MutableModel<Game, GameMetaData>) => MutableModel<Game, GameMetaData> | void): Game;
}