export const DEFAULT_LEAGUE_TAG_ID = '882fc52f-14b7-4e7c-a259-5ff5d18bde67';

export const TOURNOMINATE_SELECTIONS: {
	category: string;
	options: { name: string; iconUrl: string; tagId: string }[];
}[] = [
	// Local Events
	{
		category: 'Local Leagues',
		options: [
			{
				name: 'betway PSL',
				iconUrl: 'https://images.supersport.com/media/hb0dsutp/betway-premiership.png',
				tagId: '882fc52f-14b7-4e7c-a259-5ff5d18bde67',
			},
			{
				name: 'Nedbank Cup',
				tagId: '1b7ad3e6-6d5c-492e-9582-ece016d09b93',
				iconUrl: 'https://images.supersport.com/media/sx0iecka/nedbank-cup.png',
			},
			{
				name: 'DStv Diski Challenge',
				iconUrl:
					'https://images.supersport.com/media/b0kbrwva/7b0b7317db768d280528b8a41a36fb77572a61de.png',
				tagId: '4a33c8a5-a494-4a15-8bd6-8ec52cc9e148',
			},
			{
				name: 'MTN8 Wafa Wafa Cup',
				iconUrl: 'https://images.supersport.com/media/ywkeneav/mtn8-wafa-wafa-cup.png',
				tagId: '9416aa90-2026-4bcc-9dd4-c6aedd18f9b3',
			},
			{
				name: 'Carling Knockout',
				iconUrl: 'https://images.supersport.com/media/tv5d2flh/carling-knockout.png',
				tagId: '37c87e44-4f1a-4010-82e2-3c035168e634',
			},
		],
	},
	// Europenan events
	{
		category: 'European Leagues',

		options: [
			{
				name: 'Premier League',
				iconUrl: 'https://images.supersport.com/media/icxfej42/premier-league.png',
				tagId: 'c0ca5665-d9d9-42dc-ad86-a7f48a4da2c6',
			},
			{
				name: 'UEFA Champions League',
				iconUrl: 'https://images.supersport.com/media/oyxpcfex/uefa-champions-league.png',
				tagId: '02667f94-b477-47f8-b89b-e30db19b7866',
			},
			{
				name: 'UEFA Nations League',
				iconUrl: 'https://images.supersport.com/media/wneguwb2/uefa-nations-league.png',
				tagId: 'c6f5ed03-14cb-497e-adf9-2a22867a4c69',
			},
			{
				name: 'UEFA Europa League',
				iconUrl: 'https://images.supersport.com/media/4nqetacw/uefa-europa-league.png',
				tagId: '234a9427-1b66-418e-9405-630ba3007369',
			},
			{
				name: 'LaLiga',
				iconUrl: 'https://images.supersport.com/media/nqckjmdw/la-liga.png',
				tagId: '0c6660d5-6206-4594-bf89-ca46ca53884a',
			},
			{
				name: 'Italy Serie A',
				iconUrl: 'https://images.supersport.com/media/cr2ljng0/italy-serie-a.jpg',
				tagId: 'd6dc3e42-a0a5-4240-8706-77b4e7913c40',
			},
			{
				name: 'French Ligue 1',
				iconUrl: 'https://images.supersport.com/media/3uacitfx/french-ligue-2.png',
				tagId: '2ba2f713-d515-40f6-b44b-8dfb6c962a73',
			},
			{
				name: 'FA Cup',
				iconUrl: 'https://images.supersport.com/media/uuwd4z2n/fa_cup_logo.png',
				tagId: '43ef3fb9-f2cc-416d-a04b-7d647d549f6c',
			},
			{
				name: 'Carabao Cup',
				iconUrl: 'https://images.supersport.com/media/yydjylk4/carabao-cup.png',
				tagId: 'ce72c784-71e8-44bc-8bfc-71ee62161f6b',
			},
		],
	},
	// African Events
	{
		category: 'African Leagues',
		options: [
			{
				name: 'CAF Champions League',
				iconUrl: 'https://images.supersport.com/media/ctyhorls/caf-champions-league.png',
				tagId: '117dffb0-f4de-4703-bb88-7cbeece0de93',
			},
			{
				name: 'CAF Confederations Cup',
				iconUrl: 'https://images.supersport.com/media/ggveemeq/caf-confederations-cup.png',
				tagId: '83bf4649-d88e-49d3-97ed-1d94177de28b',
			},
			{
				name: 'Africa Cup of Nations',
				iconUrl: 'https://images.supersport.com/media/fkgnhrui/afcon2025_logo_port_color-v2.png',
				tagId: '7cd3e304-f089-436f-85e0-135114525b9e',
			},
			{
				name: "CAF Women's Africa Cup of Nations",
				iconUrl:
					'https://images.supersport.com/media/n0lgtyzw/caf-women-s-africa-cup-of-nations.png',
				tagId: 'f3f6907a-9bde-494c-a23d-f1ffe2a488fb',
			},
			{
				tagId: 'c3775001-d5da-402f-bb46-461bea2de105',
				iconUrl: 'https://images.supersport.com/media/rzhkz3mn/cosafa_cup.png',
				name: 'COSAFA Cup',
			},
		],
	},
	// International events
	{
		category: 'international Leagues',
		options: [
			{
				name: 'FIFA World Cup',
				iconUrl: 'https://images.supersport.com/media/cpznnltn/world-cup-2026-logo-ss.png',
				tagId: 'f03a6349-0c03-4246-8646-396dbda82f47',
			},
			{
				name: 'Fifa Club World Cup',
				iconUrl: 'https://images.supersport.com/media/lkykkbvi/fifa-club-world-cup.png',
				tagId: 'b00fd53a-d7ae-4012-a672-15e0d54edb5b',
			},
			{
				tagId: '15eba23d-15ba-48fc-8239-0bb03f4a0aac',
				name: "FIFA Women's World Cup",
				iconUrl: 'https://images.supersport.com/media/02chmca4/2027-fifa-womensworldcup-brazil.png',
			},
			{
				name: 'FIFA World Cup Qualifiers - Africa',
				iconUrl: 'https://images.supersport.com/media/nukl5opo/african-world-cup-qualifiers.png',
				tagId: '4cf57b64-d99f-4f1f-bd98-552358c7babb',
			},
			{
				name: 'FIFA World Cup Qualifiers - Europe',
				iconUrl:
					'https://images.supersport.com/media/4okngicg/european-championships-qualifying.png',
				tagId: 'f0562c83-6765-4fcb-a25c-613e0c622bb0',
			},
		],
	},
];

/**
 
 */
