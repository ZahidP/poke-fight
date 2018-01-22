import * as Koa from 'koa';
import * as Router from 'koa-router';
import {getPokemonRoute, getAttackRoute, getBattleRoute} from './pokemonRoutes'
import * as json from 'koa-json';

const app = new Koa();


// A Koa Context encapsulates node's request and response
// objects into a single object
app.use(async (ctx: Koa.Context, next: Function) => {
    // Log the request to the console
    console.log('Url:', ctx.url);
    // Pass the request to the next middleware function
    await next();
});

const router = new Router();

app.use(router.routes());
app.use(json());

app.listen(3000);

console.log('Server running on port 3000');

router
	.get('/pokemon/:id', getPokemonRoute)
  // .all('/users/:id', (ctx, next) => {
  //   // ...
  // });

router
	.get('/attack/:id', getAttackRoute);
  // .all('/users/:id', (ctx, next) => {
  //   // ...
  // });

router
	.get('/battle/p1/:id_1/p2/:id_2', getBattleRoute);
  // .all('/battle/:id', (ctx, next) => {
  //   // ...
  // });
