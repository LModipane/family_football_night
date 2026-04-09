import { Metadata } from 'next';
import { Toaster } from 'sonner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuth/options';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/components/Providers';

import {
	SignUpModel,
	InviteMember,
	GroupFormModel,
	AddLeagueModel,
	PredictionFormModel,
} from '@/components/models';

import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Family Football',
	description: 'Track scores for your Family Football nights!',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getServerSession(authOptions);
	return (
		<AuthProvider session={session}>
			<html lang="en">
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased w-screen h-screen bg-gray-100`}>
					<ModelProvider />
					{children}
					<Toaster position="bottom-left" />
				</body>
			</html>
		</AuthProvider>
	);
}

function ModelProvider() {
	return (
		<>
			<SignUpModel />
			<InviteMember />
			<GroupFormModel />
			<AddLeagueModel />
			<PredictionFormModel />
		</>
	);
}
