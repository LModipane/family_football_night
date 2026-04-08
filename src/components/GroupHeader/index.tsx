'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useModel } from '@/hooks';
import { BookUser, Plus, UserPlus } from 'lucide-react';
import { Popover, PopoverContent, PopoverHeader, PopoverTrigger } from '@/components/ui/popover';

type Prop = {
	name: string;
	groupId: string;
	inviteCode: string;
	imageUrl: string | null;
	otherGroups: { name: string; id: string; imageUrl: string | null }[];
};

const GroupHeader = ({ name, imageUrl, inviteCode, groupId, otherGroups }: Prop) => {
	const { onOpen } = useModel();
	return (
		<div className="w-full h-15 bg-green-800 p-2 flex items-center justify-between z-50">
			<div className="flex items-center">
				{imageUrl ? (
					<div className="relative w-10 h-10 rounded-full overflow-hidden mr-2">
						<Image src={imageUrl} alt="Group Icon" className="mr-2" fill />
					</div>
				) : null}
				<h2 className="text-white text-xl font-bold">{name}</h2>
			</div>
			<div className="flex">
				<GroupsNav otherGroups={otherGroups} />
				<button
					className="text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer"
					onClick={() => onOpen('Invite-Member', { inviteCode, groupId })}>
					<UserPlus className="w-7 h-7" />
				</button>
				<button
					className="text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer"
					onClick={() => onOpen('GroupForm', {})}>
					<Plus className="w-7 h-7" />
				</button>
			</div>
		</div>
	);
};

export default GroupHeader;

type GroupsNavProp = {
	otherGroups: { name: string; id: string; imageUrl: string | null }[];
};

const GroupsNav = ({ otherGroups }: GroupsNavProp) => {
	const { onOpen } = useModel();

	return (
		<Popover>
			<PopoverTrigger className="text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer">
				<BookUser className="w-7 h-7" />
			</PopoverTrigger>
			<PopoverContent align="end">
				<PopoverHeader className="text-blue-600">Other Family Groups</PopoverHeader>
				<hr />
				<ul className="mt-2 py-2">
					{otherGroups.map(group => (
						<li key={group.id} className="flex items-center gap-2">
							<Link href={`/group/${group.id}`} className="flex items-center gap-2">
								{group.imageUrl ? (
									<div className="relative w-6 h-6 rounded-full overflow-hidden">
										<Image src={group.imageUrl} alt={group.name} fill />
									</div>
								) : null}
								<span>{group.name}</span>
							</Link>
						</li>
					))}
				</ul>
				<hr />
				<button
					className="text-green-600 font-bold text-xs py-2 cursor-pointer text-center"
					onClick={() => onOpen('GroupForm', {})}>
					<Plus className="w-3 h-3 inline-block mr-1" />
					Create Group
				</button>
			</PopoverContent>
		</Popover>
	);
};
