import React from "react"

const RoomsPage = React.lazy(() => import('./rooms/RoomsPage'))
const GamePage = React.lazy(() => import('./game/GamePage'))
const SingleGamePage = React.lazy(() => import('./single/SingleGamePage'))

export enum RouteNames {
	ROOMS = '/',
	ROOM = '/:roomId',
	SINGLEGAME = '/game',
	GAME = '/game/:gameId',
}

export interface IRoute {
	path: string;
	element: React.FC
}

export const publicRoutes: IRoute[] = [
	{
		path: RouteNames.ROOMS,
		element: RoomsPage,
	},
	{
		path: RouteNames.GAME,
		element: GamePage,
	},
	{
		path: RouteNames.SINGLEGAME,
		element: SingleGamePage,
	},
]
