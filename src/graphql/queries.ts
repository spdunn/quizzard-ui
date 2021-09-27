/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getGame = /* GraphQL */ `
  query GetGame($id: ID!) {
    getGame(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;
export const listGames = /* GraphQL */ `
  query ListGames(
    $filter: ModelGameFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGames(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const gameByName = /* GraphQL */ `
  query GameByName(
    $name: String
    $description: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelGameFilterInput
    $limit: Int
    $nextToken: String
  ) {
    gameByName(
      name: $name
      description: $description
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        description
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
