// app/posthog.js
import { PostHog } from 'posthog-node';

export default function posthogClient() {
	if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !process.env.NEXT_PUBLIC_POSTHOG_HOST)
		throw new Error('Missing Posthog Variables');

	const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
		host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		flushAt: 1,
		flushInterval: 0,
    });
    
    posthogClient.debug(process.env.NODE_ENV === 'development');
    
	return posthogClient;
}
