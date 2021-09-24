import { useState, useEffect, useRef } from 'react';

import Amplify, { API, graphqlOperation } from 'aws-amplify';
import config from '../../aws-exports';
import { createGame } from '../../graphql/mutations';
import { onCreateGame } from '../../graphql/subscriptions';
import { listGames } from '../../graphql/queries';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { Observable } from 'redux';

Amplify.configure(config);

function Game() {
  // GraphQL
  const [testGameName, setTestGameName] = useState('');
  const [testGameDesc, setTestGameDesc] = useState('');
  const [games, setGames] = useState([]);

  const gamesRef = useRef(games);

  useEffect(() => {

    (API.graphql(graphqlOperation(listGames)) as Promise<GraphQLResult>).then(resp => {
      console.log(resp);
      //@ts-ignore
      gamesRef.current = [...resp.data.listGames.items];
      //@ts-ignore
      setGames([...resp.data.listGames.items]);
    })
      
    return () => {

    }
  }, [])

  useEffect(() => {

    // Every time an item is inserted into our table in DynamoDB, we call this method to update our 
    // state with what is in DynamoDB
    const createSubscription = (API.graphql(
      graphqlOperation(onCreateGame)
    ) as unknown as Observable<any>).subscribe({
        next: ({ provider, value }) => {
          console.log({ provider, value });
          console.log('games: ', games)         
          setGames(prevGames => [
              ...prevGames, value.data.onCreateGame
          ]);
        },
        //@ts-ignore
        error: error => console.warn(error)
    });

    // Implement dis
    const updateSubscription: any = null;

    // Implement dis
    const deleteSubscription: any = null;

    return () => {
      createSubscription.unsubscribe();
    }

    

  }, []);

  const createGame = async () => {
    console.log(testGameName, testGameDesc);
    if (testGameName === '' || testGameDesc === '') return;

    try {
      const game = {name: testGameName, description: testGameDesc};
      console.log(createGame)
      await API.graphql(graphqlOperation(createGame, {input: game}));
      console.log('Game successfully created', game)
    } catch (err) {
      console.log('Error creating game ', err);
    }
  }

  const updateGame = async () => {
    console.log(testGameName, testGameDesc);
  }

  const deleteGame = async () => {
    console.log(testGameName, testGameDesc);
  }

  return (
    <div className="App">
      <header className="App-header">
        Hello React
        <br></br>
        <br></br>
        <br></br>
        <input value={testGameName} placeholder="Enter name here" onChange={(e) => setTestGameName(e.target.value)} />
        <input value={testGameDesc} placeholder="Enter desc here" onChange={(e) => setTestGameDesc(e.target.value)} />
        <button onClick={createGame}>Create new item in DynamoDB</button>
        <button onClick={deleteGame}>Delete item in DynamoDB</button>
        <button onClick={updateGame}>Update item in DynamoDB</button>
        <ul>
          {games.map(temp => <li>{temp.name}</li>)}
        </ul>
      </header>
    </div>
  );
}

export default Game; 
