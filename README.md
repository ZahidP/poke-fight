

## Pokemon Fight



### Setup

Requirements: Node version 7+

Install typings and node modules with: `npm install`

Run server in dev mode by issuing command: `npm run watch-server`


Uses: http://pokeapi.co/api/v2/

This API exposes 3 endpoints:

1. GET `/pokemon/:id`
   - Returns a straight passthrough to `pokeapi.com/api/v2/pokemon/:id`


2. GET `/attack/:id`
   - Returns a straight passthrough to `pokeapi.com/api/v2/moves/:id`

3. GET `/battle/p1/:id_1/p2/:id_2`
   - Note: Any searches by pokemon name are dependent on cached Pokemon name to id values.
	 - Searching by name is the same as searching by ID but using a name instead of an ID. The program determines which to use by looking at length. Anything under 4 characters is an ID
	    - Note: Under this scenario pokemon Mu would not work.
			- This will be updated to use query params: `/battle?id1=1&id2=3` and `/battle?name1=mu&name2=zapdos`
   - Executes a battle between 2 Pokemon and returns results in the format
	  ```
	   {"winner":"wartortle",
		 "finalHistory":[
		 	{"p1Hp":80,"p2Hp":59,"lastMove":[],"turn":0},
		 	{"pokemon":"venusaur","moveName":"body-slam","damage":8.5,"note":"SUCCESS"},
		 	{"p1Hp":-5,"p2Hp":50.5,"lastMove":{"pokemon":"wartortle","moveName":"body-slam","damage":85,"note":"SUCCESS"},"turn":0}
		 ]
	 }

	```

Battle Mechanics and Limitations

- We only use basic stats of HP, Power, and Accuracy
- We fetch a limited number of moves to avoid throttling by the API
   - In order to get these moves we just run through all moves listed on the `/pokemon/id` json response
- The battle mechanics are simple:
   - Player One begins with a limited strength attack, guaranteed to land
   - After this each player takes turns. A move is selected at random from each Pokemon's arsenal of moves.
   - That move is executed against the opponent, taking into account its accuracy and power.
   - If the recently attacked player still has HP above 0, it is then their turn to attack.


 ### Updating Name to ID List

 Since even these requests tend to get throttled we can do them in chunks and update the previous cache.


Note: There is an issue with how the JSON is formed so we manually copy some of this data for now.
 `curl -sb -H "Accept: application/json" localhost:3000/pokemonIds/begin/55/end/85 > nameToID.json`
