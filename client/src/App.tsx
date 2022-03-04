import React, { FC, Suspense } from 'react'
import './app.scss'
import { Navigate, Route, Routes } from 'react-router-dom';
import { publicRoutes } from './pages/routes';

const App: FC = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Routes>
					{publicRoutes.map(route => 
						<Route key={route.path} path={route.path} element={<route.element />} />	
					)}
				<Route path='*' element={<Navigate to='/' />} />
			</Routes>
		</Suspense>
	)
}

export default App