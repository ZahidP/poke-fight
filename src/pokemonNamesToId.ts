import fetch, { Response } from 'node-fetch';
import { fetchPokemon, BasePokemon } from './pokemonRoutes';
import originalCache from './pokemonCache';


interface NamesToId {
	[key: string]: string
}

const namesToId: NamesToId = {};
const requests: Promise<any>[] = [];


const getNames = async (begin = '10', end = '30'): Promise<any> => {
	// Creating function because these requests are async and
	// I am unsure if the value of `i` will be correct without closure
	const assignToDict = (i: number) => {
		const response = fetchPokemon(`${i}`)
			.then((response: Response) => {
				return response.json();
			})
			.then((data: BasePokemon) => {
				console.log(data.name);
				return namesToId[data.name] = `${i}`;
			})
			.catch((err: Error) => {
				console.log(err);
			})
		requests.push(response);
	}

	for (let i = parseInt(begin, 10); i < parseInt(end, 10); i++) {
		assignToDict(i);
	}
	console.log(requests[1]);
	await Promise.all(requests);
	const updatedCache = Object.assign({}, originalCache, namesToId);
	return updatedCache;
}

export default getNames;
