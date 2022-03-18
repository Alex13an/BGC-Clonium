
export interface IPlayer {
	id: number;
	playerName: string;
	playerId: string;
	totalCells: number;
	totalScore: number;
	isWinning: boolean;
}

export interface ICell {
	value: number;
	ownerId: number;
	disabled: boolean;
}

export interface DeadCell {
	x: number;
	y: number;
}