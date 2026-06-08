import { db } from '@/lib/db';
import { redirect, RedirectType } from 'next/navigation';
import { authenticateUser } from '@/lib/nextAuth/is_user_authenticated';
import posthog from 'posthog-js';
import { email } from 'zod';

export default async function Home() {
	const profile = await authenticateUser();
	if (!profile) return redirect('/landing', RedirectType.replace);

	posthog.identify(profile.id, { email: profile.email, name: profile.name });

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
