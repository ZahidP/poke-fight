

## Pokemon Fight

Uses: http://pokeapi.co/api/v2/

This API exposes 3 endpoints:

1. GET `/pokemon/:id`
   - Returns a straight passthrough to `pokeapi.com/api/v2/pokemon/:id`


2. GET `/attack/:id`
   - Returns a straight passthrough to `pokeapi.com/api/v2/moves/:id`

3. GET `/battle/p1/:id_1/p2/:id_2`
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
