import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuth/options';
import { Geist, Geist_Mono } from 'next/font/google';
import { SignUpModel } from '@/components/models';
import { AuthProvider } from '@/components/Providers';

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
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<ModelProvider />
					{children}
				</body>
			</html>
		</AuthProvider>
	);
}

function ModelProvider() {
	return (
		<>
			<SignUpModel />
		</>
	);
}
