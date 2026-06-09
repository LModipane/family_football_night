import { db } from '@/lib/db';
import { redirect, RedirectType } from 'next/navigation';
import { authenticateUser } from '@/lib/nextAuth/is_user_authenticated';
import posthogClient from '@/lib/posthog';

export default async function Home() {
	const profile = await authenticateUser();
	if (!profile) return redirect('/landing', RedirectType.replace);

	const posthog = posthogClient();
	posthog.identify({
		distinctId: profile.id!,
		properties: {
			email: profile.email,
			name: profile.name,
		},
	});

	const userGroups = await db.query.groupProfileTable.findMany({
		where: (table, { eq }) => eq(table.profileId, profile.id!),
		with: {
			group: true,
		},
		columns: {
			id: false,
			groupId: false,
			createAt: false,
			updateAt: false,
			profileId: false,
		},
	});

	const targetGroupId = userGroups[0].group.id;
	if (targetGroupId || targetGroupId !== '')
		redirect(`/group/${targetGroupId}`, RedirectType.replace);

	throw new Error('Group Not Found');
}
