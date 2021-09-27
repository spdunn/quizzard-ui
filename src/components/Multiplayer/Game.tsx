import { useState, useEffect, useRef } from 'react';

import Amplify, { API, graphqlOperation } from 'aws-amplify';
import config from '../../aws-exports';
import { createGame, deleteGame, updateGame } from '../../graphql/mutations';
import { onCreateGame, onDeleteGame, onUpdateGame, onUpdateGameById } from '../../graphql/subscriptions';
import { gameByName, getGame, listGames } from '../../graphql/queries';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { Observable } from 'redux';

Amplify.configure(config);

function Game() {
  // GraphQL
  const [testGameName, setTestGameName] = useState('');
  const [testGameDesc, setTestGameDesc] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [singleGameID, setSingleGameID] = useState('ffa794e5-b31b-465f-9d81-4c72b43c5fcc');
  const [games, setGames] = useState([]);

  const [trigger, setTrigger] = useState(false);
  const gamesRef = useRef(games);

  useEffect(() => {

    (API.graphql(graphqlOperation(listGames)) as Promise<GraphQLResult>).then(resp => {
      console.log(resp);
      //@ts-ignore
      gamesRef.current = [...resp.data.listGames.items];
      //@ts-ignore
      console.log('Setting games to: ', ...resp.data.listGames.items)
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
          console.log('games: ', games);
          console.log('Setting games to: ', ...games, value.data.onCreateGame);
          setGames(prevGames => [
              ...prevGames, value.data.onCreateGame
          ]);
          gamesRef.current.push(value.data.onCreateGame);
          setTrigger(!trigger);
        },
        //@ts-ignore
        error: error => console.warn(error)
    });


    // Every time an item is updated from our table in DynamoDB, we call this method to update our 
    // state with what is in DynamoDB
    const updateSubscription = (API.graphql(
        graphqlOperation(onUpdateGame)
    ) as unknown as Observable<any>).subscribe({
        next: ({ provider, value }) => {
            console.log({ provider, value });
            console.log('games: ', games);
            let gameIndex = games.findIndex(game => game.id == value.data.onUpdateGame.id)
            console.log('gameIndex: ', gameIndex)
            let newGameArray = [...games];
            console.log('newGameArray: ', newGameArray);
            newGameArray[gameIndex] = value.data.onUpdateGame;
            // setGames(prevGames => [
            //     ...prevGames.slice(0, gameIndex),
            //     value.data.onUpdateGame,
            //     ...prevGames.slice(gameIndex + 1)
            // ])
            console.log('Setting games to: ', ...newGameArray);
            setGames(prevGames => [...newGameArray]);


            gameIndex = gamesRef.current.findIndex(game => game.id == value.data.onUpdateGame.id)
            console.log('gameIndex: ', gameIndex)
            newGameArray = [...games];
            console.log('newGameArray: ', newGameArray);
            newGameArray[gameIndex] = value.data.onUpdateGame;
            gamesRef.current = [...newGameArray];
            setTrigger(!trigger);
        },
        //@ts-ignore
        error: error => console.warn(error)
    })


    // Every time an item is deleted from our table in DynamoDB, we call this method to update our
    // state with what is in DynamoDB
    const deleteSubscription = (API.graphql(
        graphqlOperation(onDeleteGame)
    ) as unknown as Observable<any>).subscribe({
        next: ({ provider, value }) => {
            console.log({ provider, value });
            console.log('games: ', games);
            console.log(...games.filter(game => game.id != value.data.onDeleteGame.id))
            console.log('Setting games to: ', ...games.filter(game => game.id != value.data.onDeleteGame.id));
            setGames(prevGames => [
                ...prevGames.filter(game => game.id != value.data.onDeleteGame.id)
            ])
            gamesRef.current = gamesRef.current.filter(game => game.id != value.data.onDeleteGame.id);
            setTrigger(!trigger);
        },
        //@ts-ignore
        error: error => console.warn(error)
    });


    // Subscribe only to the updates of a certain game
    const updateSubscriptionById = (API.graphql(
        graphqlOperation(onUpdateGameById, {id: singleGameID})
    ) as unknown as Observable<any>).subscribe({
        next: ({ provider, value}) => {
            console.log('This is a special message because the game you are subscribed to has updated!');
            console.log({ provider, value });
        },
        //@ts-ignore
        error: error => console.warn(error)
    });

    // Unsubscribe from GraphQL subscriptions to prevent memory leaks
    return () => {
        createSubscription.unsubscribe();
        updateSubscription.unsubscribe();
        deleteSubscription.unsubscribe();
        updateSubscriptionById.unsubscribe();
    }    

  }, []);

  // This method creates a game object and inserts it into DynamoDB
  const CreateGame = async () => {
    console.log(testGameName, testGameDesc);
    if (testGameName === '' || testGameDesc === '') return;

    try {
      const game = {name: testGameName, description: testGameDesc};
      await API.graphql(graphqlOperation(createGame, {input: game}));
      console.log('Game successfully created', game)
    } catch (err) {
      console.log('Error creating game ', err);
    }
  }

  // This method finds a game object and updates its data in DynamoDB
  const UpdateGame = async () => {
    console.log(testGameName, testGameDesc);
    if (testGameName === '' || updateName === '') return;

    try {
        const resp = await (API.graphql(graphqlOperation(gameByName, {name: testGameName})) as Promise<GraphQLResult>)
        console.log(resp);
        //@ts-ignore
        let foundArr = resp.data.gameByName.items;
        if (foundArr.length == 0) return;
        
        const game = {id: foundArr[0].id, name: updateName};
        await API.graphql(graphqlOperation(updateGame, {input: game}));
        console.log('Game successfully updated', game)
      } catch (err) {
        console.log('Error updating game ', err);
      }
  }

  // This method finds a game object and deletes it from DynamoDB
  const DeleteGame = async () => {
    console.log(testGameName, testGameDesc);
    if (testGameName === '') return;

    try {
    //   const game = {name: testGameName, description: testGameDesc};
    //   let game = games.find(temp => temp.name == testGameName);
        const resp = await (API.graphql(graphqlOperation(gameByName, {name: testGameName})) as Promise<GraphQLResult>)
        console.log(resp);
        //@ts-ignore
        let foundArr = resp.data.gameByName.items;
        if (foundArr.length == 0) return;
        await API.graphql(graphqlOperation(deleteGame, {input: {id: foundArr[0].id}}));
        console.log('Game successfully deleted', foundArr[0])
    } catch (err) {
      console.log('Error deleting game ', err);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        Hello React!
        <br></br>
        <br></br>
        <br></br>
        <input value={testGameName} placeholder="Enter name here" onChange={(e) => setTestGameName(e.target.value)} />
        &nbsp;
        <input value={testGameDesc} placeholder="Enter desc here" onChange={(e) => setTestGameDesc(e.target.value)} />
        <br></br>
        Update Name Here &nbsp;
        <input id="updateNameInput" value={updateName} placeholder={testGameName} onChange={(e) => setUpdateName(e.target.value)} />
        <br></br>
        <br></br>
        <button onClick={CreateGame}>Create new item in DynamoDB</button>
        <button onClick={DeleteGame}>Delete item in DynamoDB</button>
        <button onClick={UpdateGame}>Update item in DynamoDB</button>
        <br></br>
        <ul>
            {console.log('games before render: ', games)}
            {console.log('gamesRef before render: ', gamesRef.current)}
          {gamesRef.current.map(temp => <><li>{temp.name}</li><button onClick={(e) => setSingleGameID(temp.id)}>Subscribe to changes in this game</button></>)}
        </ul>
      </header>
    </div>
  );
}

export default Game; 
