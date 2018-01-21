import fetch, { Response } from 'node-fetch';
import * as Koa from 'koa';



export interface PokemonWithAddedData {
	id: string;
	name: string;
	weight: 69;
	abilities: any[];
	moves?: MoveInfo[];
	stats?: StatsInfo[];
}

export interface MoveInfo {
	move: any;
}

export interface StatsInfo {
	stat: {
		url: string;
		name: string;
	};
	effort: Number;
	base_stat: Number;
}


export interface Stats {
	id: string;
	name: string;
	affecting_moves: any;
	affecting_natures: any;
}

export interface BasePokemon {
	id: string;
	name: string;
	weight: 69;
	abilities: any[];
	moves: MoveInfo[];
	stats: StatsInfo[];
}

export interface Move {
	id: Number;
	name: string;
	accuracy: Number;
	effect_chance: Number;
	pp: Number;
	priority: Number;
	power: Number;
	contest_combos: any;
}

export const getPokemon = async (ctx: Koa.Context): Promise<any> => {
	const pokemonId: string = ctx.params.id;
	const response: Response = await fetchPokemon(pokemonId);
	ctx.body = response.json();
};

export const getAttack = async (ctx: Koa.Context): Promise<any> => {
	const attackId: string = ctx.params.id;
	const response: Response = await fetchAbility(attackId);
	ctx.body = response.json();
};

/**
 *
 */
export const getBattle = async (ctx: Koa.Context): Promise<any> => {
	console.log('BATTLE!');
	const pokemon: BasePokemon[] = await Promise.all([
		fetchPokemon(ctx.params.id_1).then(pk => pk.json()),
		fetchPokemon(ctx.params.id_2).then(pk => pk.json())
	])

	const battleReadyPokemon: PokemonWithAddedData[] = pokemon.map((data) => {
		const stats = fetchStats(data);
		const moves = fetchAbilities(data);
		return Object.assign({}, data, {stats, moves})
	});




}


const attack = (currentFight: any, battleReadyPokemon: PokemonWithAddedData): any => {

};

/**
	*
	*/
const fetchStats = async (pokemon: BasePokemon): Promise<Stats[]> => {
	console.log('pokemon');
	console.log(pokemon.name);
	const responsePromises: Promise<Stats>[] = pokemon.stats
		.map((stat: StatsInfo) => {
			console.log('stat');
			console.log(stat.stat.url);
			return fetch(stat.stat.url).then(res => res.json());
		});
	return Promise.all(responsePromises)
}

/**
	*
	*/
const fetchAbilities = async (pokemon: BasePokemon): Promise<Move[]> => {
	console.log('pokemon');
	console.log(pokemon.name);
	const responsePromises: Promise<Move>[] = pokemon.moves
		.map((move: MoveInfo) => {
			console.log('move');
			console.log(move.move.url);
			return fetchAbility('', move.move.url).then(res => res.json());
		});
	return Promise.all(responsePromises)
}

const fetchAbility = async(attackId: string, baseUrl = 'http://pokeapi.co/api/v2/ability/'): Promise<Response> => {
	const passThroughUrl: string = `${baseUrl}${attackId}`;
	return fetch(passThroughUrl);
}

const fetchPokemon = async(pokemonId: string): Promise<Response> => {
	const passThroughUrl: string = `http://pokeapi.co/api/v2/pokemon/${pokemonId}`;
	return fetch(passThroughUrl);
}
