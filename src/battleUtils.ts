import {
	PokemonWithAddedData,
	StatsInfo
} from './pokemonRoutes';


export interface CurrentFight {
	lastMove: MoveResult;
	p1Hp: number;
	p2Hp: number;
	turn: number;
}

export interface MoveResult {
	pokemon: string;
	moveName: string;
	damage: number;
	note: string;
}

const getAttackResults = (pkm: PokemonWithAddedData, initial = false): MoveResult => {
	const ml = pkm.moves.length;
	const selection = Math.floor(Math.random() * ml)
	const move = pkm.moves[selection];
	const damage = initial ? move.power * 0.1 : move.power;

	if (Math.random() > move.accuracy && !initial) {
		return {
			pokemon: pkm.name,
			moveName: move.name,
			damage: 0,
			note: 'MISS'
		}
	} else {
		return {
			pokemon: pkm.name,
			moveName: move.name,
			damage: !!damage ? damage : 0,
			note: 'SUCCESS'
		}
	}
};

const attackGen = (pkm: PokemonWithAddedData[]): Function => {
	const inner = (cfs: CurrentFight, history: CurrentFight[]): Function | Object => {


		const attackResult = getAttackResults(pkm[cfs.turn]);

		// get damage
		const damageToP1: number = cfs.turn ? attackResult.damage : 0;
		const damageToP2: number = !cfs.turn ? attackResult.damage : 0;

		// flip the turn
		const nextTurn = !cfs.turn ? 1 : 0;

		// update current fight
		const fight: CurrentFight = {
			p1Hp: (cfs.p1Hp - damageToP1),
			p2Hp: (cfs.p2Hp - damageToP2),
			lastMove: attackResult,
			turn: nextTurn
		};

		const updatedHistory = history.concat([fight]);

		if (fight.p1Hp > 0 && fight.p2Hp > 0) {
			return inner(fight, updatedHistory);
		} else {
			const winner = fight.p1Hp > 0 ? pkm[0].name : pkm[1].name;
			return {
				winner,
				finalHistory: updatedHistory
			};
		}
	}
	return inner;
}

export const battle = (
	pkm: PokemonWithAddedData[],
	currentState: CurrentFight,
	history: any
) => {
	const nextState: CurrentFight = currentState;
	const beginFight: Function = attackGen(pkm);
	// guaranteed initial attack
	const attackResult = getAttackResults(pkm[0], true);

	const updatedP2Hp = (currentState.p2Hp - attackResult.damage);
	const updatedHistory = history.concat([attackResult]);

	const updatedFight: CurrentFight  = Object.assign(
		{},
		currentState,
		{ p2Hp: updatedP2Hp,
			lastMove: attackResult,
			turn: 1
		}
	);
	return beginFight(updatedFight, updatedHistory);
};
/**
 *
 */
