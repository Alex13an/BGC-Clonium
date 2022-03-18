import { combineReducers, configureStore } from "@reduxjs/toolkit";
import gameSlice from './slices/gameSlice';
import socketSlice from './slices/socketSlice';

const rootReducer = combineReducers({
	gameSlice,
	socketSlice,
})

export const store = configureStore({
	reducer: {rootReducer},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch