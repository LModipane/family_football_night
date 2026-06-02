import { db } from '@/lib/db';
import nextAuth from 'next-auth';
import { redirect } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { groupProfileTable } from '@/lib/db/schema';
import { authenticateUser } from '@/lib/nextAuth/is_user_authenticated';

export async function generateMetadata(
	{ params }: { params: { id: string; inviteCode: string } },
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const group = await db.query.groupTable.findFirst({
		where: (group, { eq }) => eq(group.id, params.id),
	});
	return {
		openGraph: {
			title: `Welcome to ${group?.name} family football league`,
			images: [
				{
					url: group?.imageUrl ?? '',
					width: 256,
					height: 256,
					alt: 'group-image',
				},
			],
			type: 'website',
			url: `/group/${group?.id}/invite/${group?.inviteCode}/`,
		},
	};
}

export default async function InviteMemberPage({
	params,
}: {
	params: Promise<{ groupId: string; inviteCode: string }>;
}) {
	const { groupId, inviteCode } = await params;

	const profile = await authenticateUser();
	if (!profile)
		return redirect(`/api/auth/signin?callbackUrl=/group/${groupId}/invite/${inviteCode}`); // Redirect end-user to default sign-in page. Note: create proper login page to redirect end-user to it instead of default one.

	const isMember = await db.query.groupProfileTable.findFirst({
		where: (profileToGroup, { eq, and }) =>
			and(eq(profileToGroup.groupId, groupId), eq(profileToGroup.profileId, profile.id!)),
	});

	if (isMember) return redirect(`/group/${groupId}`);

	const isInVited = await db.query.groupTable.findFirst({
		where: (group, { eq }) => eq(group.inviteCode, inviteCode),
	});

	if (!isInVited) return redirect(`/group/${groupId}`);
	await db.insert(groupProfileTable).values({ profileId: profile.id!, groupId, role: 'player' });

	return redirect(`/group/${groupId}`);
}
