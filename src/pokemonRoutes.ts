import fetch, { Response } from 'node-fetch';
import * as Koa from 'koa';
import { CurrentFight, battle } from './battleUtils';
import getNames from './pokemonNamesToId';
import cache from './pokemonCache';


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


const fetchAbility = async (attackId: string, baseUrl = 'http://pokeapi.co/api/v2/ability/'): Promise<Response> => {
	const passThroughUrl: string = `${baseUrl}${attackId}`;
	return fetch(passThroughUrl);
}

export const fetchPokemon = async (pokemonId: string): Promise<Response> => {
	const passThroughUrl: string = `http://pokeapi.co/api/v2/pokemon/${pokemonId}`;
	return fetch(passThroughUrl);
}

export const getPokemonRoute = async (ctx: Koa.Context): Promise<any> => {
	const pokemonId: string = ctx.params.id;
	const response: Response = await fetchPokemon(pokemonId);
	ctx.body = await response.json();
};

export const getAttackRoute = async (ctx: Koa.Context): Promise<any> => {
	const attackId: string = ctx.params.id;
	const response: Response = await fetchAbility(attackId);
	ctx.body = await response.json();
};

export const fetchPokemonWithMoves = (id: string): Promise<PokemonWithAddedData> => {
	console.log('fetching pokemon id: ' + id)
	return fetchPokemon(id)
		.then(pk => pk.json())
		.then(async (data: BasePokemon) => {
			try {
				const moves = await fetchMoves(data);
				return Object.assign({}, data, {moves})
			} catch(err) {
				throw(err);
			}
		})
}

export const getBattleRoute = async (ctx: Koa.Context): Promise<any> => {

	const id1 = ctx.params.id_1.length > 3 ? cache[ctx.params.id_1] : ctx.params.id_1;
	const id2 = ctx.params.id_2.length > 3 ? cache[ctx.params.id_2] : ctx.params.id_2;

	const [pk1, pk2]: PokemonWithAddedData[] = await Promise.all([
		fetchPokemonWithMoves(id1),
		fetchPokemonWithMoves(id2)
	]);

	const findHp = (stat: StatsInfo) => {
		return stat.stat.name === 'hp';
	};

	console.log('Setting up fight');

	const currentFight: CurrentFight  = {
		p1Hp: pk1.stats.find(findHp).base_stat,
		p2Hp: pk2.stats.find(findHp).base_stat,
		lastMove: null,
		turn: 0
	};

	const { winner, finalHistory } = battle([pk1, pk2], currentFight, [currentFight]);

	ctx.body = {
		winner, finalHistory
	};
};


/**
	*
	*/
const fetchStats = async (pokemon: BasePokemon): Promise<Stats[]> => {
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
	// going to do this to not get throttled
	const maxFive = pokemon.moves.length > 5 ? pokemon.moves.slice(0,5) : pokemon.moves;
	const responsePromises: Promise<Move>[] = maxFive
		.map((move: MoveInfo, index: number) => {
			// return Promise.resolve(null);
			return fetch(move.move.url).then(res => res.json());
		});
	return Promise.all(responsePromises)
};


export const getNamesCache = async (ctx: Koa.Context): Promise<any> => {
	const {begin, end} = ctx.params;
	const result = await getNames(begin, end);
	ctx.body = result;
}
