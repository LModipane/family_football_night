'use client';

import axios from 'axios';
import { toast } from 'sonner';
import React, { useState } from 'react';
import { useModel, useOrigin } from '@/hooks';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCcw, Check } from 'lucide-react';

import {
	RedditIcon,
	TwitterIcon,
	WhatsappIcon,
	FacebookIcon,
	RedditShareButton,
	XShareButton,
	FacebookShareButton,
	WhatsappShareButton,
} from 'react-share';

import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from '@/components/ui/dialog';
import { group } from 'node:console';

const InviteMember = () => {
	const {
		type,
		isOpen,
		onOpen,
		onClose,
		data: { inviteCode, groupId },
	} = useModel();
	const origin = useOrigin();
	const [copyed, setCopyed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const shareLinkUrl = `${origin}/group/${groupId}/invite/${inviteCode}`;
	const inviteUrl = `${origin}/group/${groupId}/invite/${inviteCode}`;

	const onCopy = () => {
		navigator.clipboard.writeText(inviteUrl);
		setCopyed(true);

		setTimeout(() => {
			setCopyed(false);
		}, 5 * 1000);
	};

	const onRefreshLink = async () => {
		try {
			setIsLoading(true);
			const res = await axios.patch(`/api/refresh-link/${groupId}`);
			const inviteCode = res.data.inviteCode;
			onOpen('Invite-Member', { groupId, inviteCode });
		} catch (error: any) {
			console.error('failed to refresh link: ', error.message);
			toast.error('failed to refresh link!!!');
		} finally {
			setIsLoading(false);
		}
	};

	const isModelOpen = type === 'Invite-Member' && isOpen;
	return (
		<Dialog open={isModelOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite Member</DialogTitle>
					<DialogDescription>Invite members to your group!!!</DialogDescription>
				</DialogHeader>
				<div className="flex justify-between items-center gap-x-5 border-b-2 border-slate-400 p-3">
					<WhatsappShareButton url={shareLinkUrl} className='flex flex-col text-center'>
						<WhatsappIcon round />
						<h3 className="text-center">WhatsApp</h3>
					</WhatsappShareButton>
					<FacebookShareButton url={shareLinkUrl} className='flex flex-col text-center'>
						<FacebookIcon round />
						<h3 className="text-center">Facebook</h3>
					</FacebookShareButton>
					<XShareButton url={shareLinkUrl} className='flex flex-col text-center'>
						<TwitterIcon round />
						<h3 className="text-center">Twitter</h3>
					</XShareButton>
					<RedditShareButton url={shareLinkUrl} className='flex flex-col text-center'>
						<RedditIcon round />
						<h3 className="text-center">Reddit</h3>
					</RedditShareButton>
				</div>
				<div className="p-6">
					<Label className="uppercase text-xs font-bold">Group Invite Link</Label>
					<div className="mt-2 flex items-center gap-x-2">
						<Input
							className="bg-zinc-500/30 dark:bg-slate-900 text-gray-900 dark:text-white"
							value={inviteUrl}
							disabled={isLoading}
						/>
						<Button size="icon" onClick={onCopy} disabled={isLoading}>
							{copyed ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
						</Button>
					</div>
					<Button
						size="sm"
						variant="link"
						disabled={isLoading}
						// onClick={onRefreshLink}
						className="text-md mt-4 text-blue-900 dark:text-purple-600 dark:focus-visible:ring-purple-600">
						Generate new invite link
						<RefreshCcw className="ml-3 h-4 w-4" />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default InviteMember;
