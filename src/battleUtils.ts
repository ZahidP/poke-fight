import {
	PokemonWithAddedData,
	StatsInfo
} from './pokemonRoutes';


export interface CurrentFight {
	lastMove: any;
	p1Hp: number;
	p2Hp: number;
	turn: number;
}

const getAttackResults = (pkm: PokemonWithAddedData, initial = false) => {
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

const attackGen = (pkm: PokemonWithAddedData[]) => {
	const inner = (cfs: CurrentFight, history: CurrentFight[]): any => {

		console.log('Current Fight');
		console.log(cfs);

		console.log(pkm[cfs.turn].name);
		const attackResult = getAttackResults(pkm[cfs.turn]);
		const lastMove = attackResult;

		// get damage
		const damageToP1: number = cfs.turn ? attackResult.damage : 0;
		const damageToP2: number = !cfs.turn ? attackResult.damage : 0;

		// flip the turn
		const nextTurn = !cfs.turn ? 1 : 0;

		// update current fight
		const fight: CurrentFight = {
			p1Hp: (cfs.p1Hp - damageToP1),
			p2Hp: (cfs.p2Hp - damageToP2),
			lastMove: lastMove,
			turn: nextTurn
		};

		console.log('fight status');
		console.log(fight);
		const updatedHistory = history.concat([fight]);
		console.log(updatedHistory);

		if (fight.p1Hp > 0 && fight.p2Hp > 0) {
			console.log('fight again!');
			return inner(fight, updatedHistory);
		} else {
			console.log('fight over');
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
			lastMove: updatedHistory,
			turn: 1
		}
	);
	console.log('Begin epic battle');
	return beginFight(updatedFight, updatedHistory);
};
/**
 *
 */
