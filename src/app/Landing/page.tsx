// import { JSX, SVGProps } from 'react';
import { getServerSession } from 'next-auth';
import { Button } from '@/components/ui/button';
import { authOptions } from '@/lib/nextAuth/options';
import { redirect, RedirectType } from 'next/navigation';
import { SignInButton } from '@/components';

export default async function LandingPage() {
	const session = await getServerSession(authOptions);
	if (session) redirect('/', RedirectType.replace);

	console.log('No active session, rendering landing page.', session);

	return (
		<div className="flex flex-col min-h-dvh">
			<main className="flex-1">
				<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center space-y-4 text-center">
							<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
								Family Football Night
							</h1>
							<p className="mx-auto max-w-175 text-gray-500 md:text-xl dark:text-gray-400">
								The ultimate football prediction game for the whole family. Compete, brag, and see
								who knows football best.
							</p>
							<SignInButton />
						</div>
					</div>
				</section>
				<section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
								<p className="max-w-225 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
									It&apos;s simple. Predict the outcome of upcoming matches, earn points for correct
									predictions, and climb the family leaderboard.
								</p>
							</div>
						</div>
						<div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
							<div className="flex flex-col justify-center space-y-4">
								<div className="grid gap-1">
									<h3 className="text-xl font-bold">1. Predict</h3>
									<p className="text-gray-500 dark:text-gray-400">
										Browse upcoming matches and make your predictions.
									</p>
								</div>
							</div>
							<div className="flex flex-col justify-center space-y-4">
								<div className="grid gap-1">
									<h3 className="text-xl font-bold">2. Compete</h3>
									<p className="text-gray-500 dark:text-gray-400">
										Track your progress on the family leaderboard.
									</p>
								</div>
							</div>
							<div className="flex flex-col justify-center space-y-4">
								<div className="grid gap-1">
									<h3 className="text-xl font-bold">3. Win</h3>
									<p className="text-gray-500 dark:text-gray-400">
										Earn bragging rights as the family&apos;s top football expert.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>
				<section className="w-full py-12 md:py-24 lg:py-32">
					<div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
								More Than Just a Game
							</h2>
							<p className="max-w-150 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
								Family Football Night is about bringing your family together through the beautiful
								game. It&apos;s about friendly rivalries, shared moments, and creating lasting
								memories.
							</p>
						</div>
						<div className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-end">
							<Button>About Us</Button>
							<Button variant="secondary">Contact Us</Button>
						</div>
					</div>
				</section>
			</main>
			<footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
				<p className="text-xs text-gray-500 dark:text-gray-400">
					© 2024 Family Football Night. All rights reserved.
				</p>
				<nav className="sm:ml-auto flex gap-4 sm:gap-6">
					<a className="text-xs hover:underline underline-offset-4" href="#">
						Terms of Service
					</a>
					<a className="text-xs hover:underline underline-offset-4" href="#">
						Privacy
					</a>
				</nav>
			</footer>
		</div>
	);
}

// function MountainIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
// 	return (
// 		<svg
// 			{...props}
// 			xmlns="http://www.w3.org/2000/svg"
// 			width="24"
// 			height="24"
// 			viewBox="0 0 24 24"
// 			fill="none"
// 			stroke="currentColor"
// 			strokeWidth="2"
// 			strokeLinecap="round"
// 			strokeLinejoin="round">
// 			<path d="m8 3 4 8 5-5 5 15H2L8 3z" />
// 		</svg>
// 	);
// }
