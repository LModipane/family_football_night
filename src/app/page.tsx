import { db } from '@/lib/db';
import { redirect, RedirectType } from 'next/navigation';
import { isUserAuthenticated } from '@/lib/nextAuth/is_user_authenticated';

export default async function Home() {
	const profile = await isUserAuthenticated();
	if (!profile) return redirect('/landing', RedirectType.replace);

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
	if (targetGroupId || targetGroupId !== '') redirect(`/group/${targetGroupId}`, RedirectType.replace);
	
	throw new Error("Group Not Found")
}
