
export interface OPlayer {
	id: number;
	playerName: string;
	playerId: string;
	totalCells: number;
	totalScore: number;
	isWinning: boolean;
}

export interface OCell {
	value: number;
	ownerId: number;
	disabled: boolean;
}