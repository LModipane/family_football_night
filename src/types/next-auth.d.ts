// eslint-disable-next-line @typescript-eslint/no-unused-vars
import nextauth from "next-auth";

declare module "next-auth" {
    interface Session {
			user: {
				/** The user's name */
				name?: string | null;
				/** The user's email */
				email?: string | null;
				/** The user's image */
				image?: string | null;
				/** The user's profile id */
				id?: string;
			};
		}
}