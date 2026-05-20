'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useModel } from '@/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookUser, EllipsisVertical, PenLine, Plus, UserPlus, Volleyball } from 'lucide-react';
import { Popover, PopoverContent, PopoverHeader, PopoverTrigger } from '@/components/ui/popover';
import {
	DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuGroup,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
} from '../ui/dropdown-menu';

type Prop = {
	name: string;
	groupId: string;
	inviteCode: string;
	imageUrl: string | null;
	otherGroups: { name: string; id: string; imageUrl: string | null }[];
	leagues: {
		id: string;
		name: string;
		iconUrl: string | null;
	}[];
};

const GroupHeader = ({ name, imageUrl, inviteCode, groupId, otherGroups, leagues }: Prop) => {
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
				<LeagueNav leagues={leagues} groupId={groupId} />

				{/* Group Header menu */}
				<DropdownMenu>
					<DropdownMenuTrigger>
						<EllipsisVertical size={20} />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="bg-white rounded-md shadow-lg p-2">
						<DropdownMenuGroup>
							<DropdownMenuLabel>Group Options</DropdownMenuLabel>
							<hr className="border-gray-400" />
							<div
								className="hover:bg-purple-600 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize"
								// Note: Add Edit Prediction model in root layout page
								onClick={() => onOpen('GroupForm', {})}>
								<Plus size={17} />
								Create Group
								<DropdownMenuShortcut className="text-gray-400">Ctrl+G</DropdownMenuShortcut>
							</div>
							<div
								className="hover:bg-purple-600 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize"
								// Note: Add Edit Prediction model in root layout page
								onClick={() => onOpen('GroupForm', {})}>
								<Plus size={17} />
								Delete Group
								<DropdownMenuShortcut className="text-gray-400">Ctrl+G</DropdownMenuShortcut>
							</div>
						</DropdownMenuGroup>
						<DropdownMenuGroup>
							<DropdownMenuLabel>Member Options</DropdownMenuLabel>
							<hr className="border-gray-400" />
							<div
								className="hover:bg-purple-600 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize"
								// Note: Add Edit Prediction model in root layout page
								onClick={() => onOpen('Invite-Member', {})}>
								<UserPlus size={17} />
								Invite Member
								<DropdownMenuShortcut className="text-gray-400">Ctrl+I</DropdownMenuShortcut>
							</div>
							<div
								className="hover:bg-purple-600 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize"
								// Note: Add Edit Prediction model in root layout page
								onClick={() => onOpen('Invite-Member', {})}>
								<UserPlus size={17} />
								Remove Member
								<DropdownMenuShortcut className="text-gray-400">Ctrl+I</DropdownMenuShortcut>
							</div>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
};

export default GroupHeader;

type LeagueNavProp = {
	groupId: string;
	leagues: {
		id: string;
		name: string;
		iconUrl: string | null;
	}[];
};

const LeagueNav = ({ leagues, groupId }: LeagueNavProp) => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { onOpen } = useModel();

	const selectLeague = (leagueId: string) => {
		// update search query to include leagueId
		const params = new URLSearchParams(searchParams);
		if (params.get('leagueId') === leagueId) {
			params.delete('leagueId');
		} else {
			params.set('leagueId', leagueId);
		}

		router.replace(`?${params.toString()}`);
	};

	return (
		<Popover>
			<PopoverTrigger className="text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer">
				<Volleyball className="w-7 h-7" />
			</PopoverTrigger>
			<PopoverContent align="end">
				<PopoverHeader className="text-blue-600">Group Leagues</PopoverHeader>
				<hr />
				<ul className="mt-2 py-2 flex flex-col gap-y-2">
					{leagues.map(league => (
						<li
							key={league.id}
							className="flex p-2 rounded-2xl items-center gap-2 cursor-pointer text-md capitalize font-bold text-gray-600 hover:text-gray-700 hover:bg-gray-300 transition-colors"
							onClick={() => selectLeague(league.id)}>
							{league.iconUrl ? (
								<div className="relative w-6 h-6 rounded-full overflow-hidden">
									<Image src={league.iconUrl} alt={league.name} fill />
								</div>
							) : null}
							<span>{league.name}</span>
						</li>
					))}
				</ul>
				<hr />
				<button
					className="text-green-600 font-bold text-xs py-2 cursor-pointer text-center"
					onClick={() => onOpen('AddLeagueForm', { groupId })}>
					<Plus className="w-3 h-3 inline-block mr-1" />
					Add League
				</button>
			</PopoverContent>
		</Popover>
	);
};

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
