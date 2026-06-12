'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useModel } from '@/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BookUser, EllipsisVertical, PenLine, Plus, UserPlus, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverHeader, PopoverTrigger } from '@/components/ui/popover';

import {
	DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuGroup,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuShortcut,
} from '../ui/dropdown-menu';

type Props = {
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
	currentLegaueId: string
};

const GroupHeader = ({ name, imageUrl, inviteCode, groupId, otherGroups, leagues, currentLegaueId }: Props) => {
	const { onOpen } = useModel();

	const router = useRouter();
	const searchParams = useSearchParams();

	const onSelectLeague = (leagueId: string) => {
		// update search query to include leagueId
		const params = new URLSearchParams(searchParams);
		if (params.get('leagueId') === leagueId) {
			params.delete('leagueId');
		} else {
			params.set('leagueId', leagueId);
		}

		router.replace(`?${params.toString()}`);
	};

	const currentLeague = leagues.find(league => league.id === currentLegaueId);

	return (
		<div className="w-full min-h-15 bg-green-800 p-2 flex items-center justify-between z-50 overflow-hidden">
			<div className="flex items-center">
				<GroupsNav otherGroups={otherGroups} />

				{imageUrl ? (
					<div className="relative w-10 h-10 rounded-full overflow-hidden mr-2">
						<Image src={imageUrl} alt="Group Icon" className="mr-2" fill />
					</div>
				) : null}

				<h2 className="text-white md:text-xl text-sm font-bold truncate ">{name}</h2>
			</div>
			<Select onValueChange={onSelectLeague} value={currentLegaueId}>
				<SelectTrigger className=" text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer border-none text-xl">
					{currentLeague?.iconUrl ? (
						<div className="relative w-10 h-10 rounded-full overflow-hidden">
							<Image src={currentLeague.iconUrl} alt={currentLeague.name} fill />
						</div>
					) : null}
					<span className="hidden md:block">{currentLeague?.name}</span>
				</SelectTrigger>
				<SelectContent
					position="popper"
					className="w-68.75 h-fit max-h-50 p-2 m-1 rounded-lg shadow-lg bg-white">
					{leagues.map(league => (
						<SelectItem
							value={league.id}
							key={league.id}
							className="flex p-2 rounded-2xl items-center gap-2 cursor-pointer text-md capitalize font-bold text-gray-600 hover:text-gray-700 hover:bg-gray-300 transition-colors">
							{league.iconUrl ? (
								<div className="relative w-10 h-10 rounded-full overflow-hidden">
									<Image src={league.iconUrl} alt={league.name} fill />
								</div>
							) : null}
							<span>{league.name}</span>
						</SelectItem>
					))}
					<hr />
					<button
						className="text-green-600 font-bold text-xs py-2 cursor-pointer text-center"
						onClick={() => onOpen('AddLeagueForm', { groupId })}>
						<Plus className="w-3 h-3 inline-block mr-1" />
						Add League
					</button>
				</SelectContent>
			</Select>
			<div className="flex">
				{/* Group Header menu */}
				<DropdownMenu>
					<DropdownMenuTrigger>
						<EllipsisVertical size={30} />
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
								onClick={() => {}}>
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
								onClick={() => onOpen('Invite-Member', { inviteCode, groupId })}>
								<UserPlus size={17} />
								Invite Member
								<DropdownMenuShortcut className="text-gray-400">Ctrl+I</DropdownMenuShortcut>
							</div>
							<div
								className="hover:bg-purple-600 ml-2 p-2 flex items-center gap-x-4 rounded cursor-pointer capitalize"
								// Note: Add Edit Prediction model in root layout page
								onClick={() => {}}>
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

type GroupsNavProp = {
	otherGroups: { name: string; id: string; imageUrl: string | null }[];
};

const GroupsNav = ({ otherGroups }: GroupsNavProp) => {
	const { onOpen } = useModel();

	return (
		<Popover>
			<PopoverTrigger className="text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer">
				<BookUser size={30} />
			</PopoverTrigger>
			<PopoverContent align="start" side="bottom" className="w-68.75 h-fit max-h-50 p-2 m-1 rounded-lg shadow-lg bg-white">
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
