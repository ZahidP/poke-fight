import fetch, { Response } from 'node-fetch';
import * as Koa from 'koa';
import { CurrentFight, battle } from './battleUtils';



export interface PokemonWithAddedData {
	id: string;
	name: string;
	weight: number;
	abilities: any[];
	moves?: Move[];
	stats: StatsInfo[];
}

export interface MoveInfo {
	move: any;
}

export interface StatsInfo {
	stat: {
		url: string;
		name: string;
	};
	effort: number;
	base_stat: number;
}


export interface Stats {
	id: string;
	name: string;
	affecting_moves?: any;
	affecting_natures?: any;
}

// {
// 	"stat": {
// 		"url": "https://pokeapi.co/api/v2/stat/1/",
// 		"name": "hp"
// 	},
// 	"effort": 0,
// 	"base_stat": 44
// }

export interface BasePokemon {
	id: string;
	name: string;
	weight: number;
	abilities: any[];
	moves: MoveInfo[];
	stats: StatsInfo[];
}

export interface Move {
	id: number;
	name: string;
	accuracy: number;
	effect_chance: number;
	pp: number;
	priority: number;
	power: number;
	contest_combos: any;
}


const fetchAbility = async(attackId: string, baseUrl = 'http://pokeapi.co/api/v2/ability/'): Promise<Response> => {
	const passThroughUrl: string = `${baseUrl}${attackId}`;
	return fetch(passThroughUrl);
}

const fetchPokemon = async(pokemonId: string): Promise<Response> => {
	const passThroughUrl: string = `http://pokeapi.co/api/v2/pokemon/${pokemonId}`;
	return fetch(passThroughUrl);
}

export const getPokemon = async (ctx: Koa.Context): Promise<any> => {
	const pokemonId: string = ctx.params.id;
	const response: Response = await fetchPokemon(pokemonId);
	ctx.body = await response.json();
};

export const getAttack = async (ctx: Koa.Context): Promise<any> => {
	const attackId: string = ctx.params.id;
	const response: Response = await fetchAbility(attackId);
	ctx.body = await response.json();
};

export const getBattle = async (ctx: Koa.Context): Promise<any> => {
	console.log('BATTLE!');
	const [pk1, pk2]: PokemonWithAddedData[] = await Promise.all([
		fetchPokemon('1')
			.then(pk => pk.json())
			.then(async (data: BasePokemon) => {
				try {
					const moves = await fetchMoves(data);
					return Object.assign({}, data, {moves})
				} catch(err) {
					throw(err);
				}

			}),
		fetchPokemon('2')
		.then(pk => pk.json())
		.then(async (data: BasePokemon) => {
			try {
				const moves = await fetchMoves(data);
				return Object.assign({}, data, {moves})
			} catch(err) {
				throw(err);
			}
		})
	]);

	const findHp = (stat: StatsInfo) => {
		return stat.stat.name === 'hp';
	};

	const currentFight: CurrentFight  = {
		p1Hp: pk1.stats.find(findHp).base_stat,
		p2Hp: pk2.stats.find(findHp).base_stat,
		moveHistory: [],
		turn: 0
	};

	console.log('And our taaaale of the tape');
	console.log(currentFight);

	const { winner, finalHistory } = battle([pk1, pk2], currentFight, [currentFight]);


	console.log('final history');
	console.log(finalHistory);

	ctx.body = {
		winner, finalHistory
	};
};


/**
	*
	*/
const fetchStats = async (pokemon: BasePokemon): Promise<Stats[]> => {
	console.log('pokemon');
	console.log(pokemon.name);
	const responsePromises: Promise<Stats>[] = pokemon.stats
		.map((stat: StatsInfo) => {
			return fetch(stat.stat.url).then(res => res.json());
		});
	return Promise.all(responsePromises)
}

/**
	*
	*/
const fetchMoves = async (pokemon: BasePokemon): Promise<Move[]> => {
	console.log('pokemon');
	console.log(pokemon.name);

	// going to do this to not get throttled
	const maxFive = pokemon.moves.length > 5 ? pokemon.moves.slice(0,10) : pokemon.moves;
	console.log(maxFive.length);
	let i = 0;
	const responsePromises: Promise<Move>[] = maxFive
		.map((move: MoveInfo, index: number) => {
			console.log(i);
			i++;
			// return Promise.resolve(null);
			return fetch(move.move.url).then(res => res.json());
		});
	console.log('returning promises');
	return Promise.all(responsePromises)
};
