'use client';
import Image from 'next/image';
import { Plus, UserPlus } from 'lucide-react';
import { useModel } from '@/hooks';

type Prop = {
	name: string;
	groupId: string;
	inviteCode: string;
	imageUrl: string | null;
};

const GroupHeader = ({ name, imageUrl, inviteCode, groupId }: Prop) => {
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
