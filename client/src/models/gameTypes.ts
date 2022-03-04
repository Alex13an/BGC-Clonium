export interface IExpansion {
	isExpanding: boolean;
	expandableCells: number;
}

export interface ICell {
	value: number;
	ownerId: number;
	disabled: boolean;
}

export interface IPlayer {
	playerId: number;
	totalCells: number;
	totalScore: number;
	isWinning: boolean;
}