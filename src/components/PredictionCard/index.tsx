"use client"

import { PredictionWithProfile } from '@/types'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Image from 'next/image' // Assuming next/image is available and used for images

const PredictionCard = ({ profile, homeTeamScore, awayTeamScore, homeTeamName, awayTeamName, homeTeamBadgeUrl, awayTeamBadgeUrl }: PredictionWithProfile) => {
  return (
    <div className="flex items-center justify-between p-4 text-white">
      {/* Profile Section */}
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarImage src={profile.imageUrl || undefined} alt={profile.name || "User Avatar"} />
          <AvatarFallback>{profile.name ? profile.name[0] : 'U'}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-xs truncate w-30">{profile.name}</span>
      </div>

      {/* Match Details Section */}
      <div className="flex items-center gap-1">
        {/* Home Team Badge */}
        <Image src={homeTeamBadgeUrl} alt={`${homeTeamName} badge`} width={32} height={32} className="rounded-full" />

        {/* Prediction Section */}
        <div className="flex items-center gap-2 font-semibold text-xl">
          <span className="text-right">{homeTeamScore}</span>
          <span>-</span>
          <span className="text-left">{awayTeamScore}</span>
        </div>

        {/* Away Team Badge */}
        <Image src={awayTeamBadgeUrl} alt={`${awayTeamName} badge`} width={32} height={32} className="rounded-full" />
      </div>
    </div>
  )
}

export default PredictionCard