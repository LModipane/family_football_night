'use client';

import { useEffect } from 'react';

interface ErrorProps {
	error: Error;
	reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error('Error caught in error boundary:', error);
	}, [error]);

	return (
		<main className="min-h-screen min-w-screen flex flex-col items-center justify-center bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
			<div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
				<h1 className="text-3xl font-bold mb-4 text-red-600 dark:text-red-400">
					Something went wrong
				</h1>
				<p className="text-gray-700 dark:text-gray-300 mb-4">{error.message}</p>
				<button
					onClick={reset}
					className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
					Try Again
				</button>
			</div>
		</main>
	);
}
