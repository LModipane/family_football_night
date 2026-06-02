'use client';

import { useRef } from 'react';

export default function FamilyFootballPolicies() {
	const pdfRef = useRef(null);

const downloadPDF = async () => {
	window.open('/Family_Football_Policies.pdf', '_blank');
};

return (
	<main className="min-h-screen bg-gray-50 text-black p-6 pt-24">
		<div className="max-w-4xl mx-auto">
			<div className="flex items-start justify-between mb-6">
				<div className="flex justify-end gap-3 w-full">
					<button
						onClick={downloadPDF}
						className="px-4 py-2 rounded-lg shadow-sm border bg-white hover:bg-slate-50 text-black text-sm">
						Download PDF
					</button>
				</div>
			</div>

			<article
				ref={pdfRef}
				className="prose max-w-none bg-white text-black p-6 md:p-10 rounded-2xl prose-slate">
				<header className="text-center mb-10">
					<h1 className="font-extrabold text-3xl">Family Football Policies</h1>
					<p className="text-sm text-slate-600">
						Owned and operated by <strong>MODIPANE LOGISTICS (PTY) LTD</strong>
						<br />
						Company Reg: <strong>2021/002291/07</strong> — Registered in South Africa
					</p>
				</header>

				{/* TERMS OF SERVICE */}
				<section id="terms" className="mb-12">
					<h2 className="font-extrabold my-4">Terms of Service</h2>

					<h3 className="font-bold my-2">Introduction</h3>
					<p>
						Family Football ("we", "our", "the Platform") is a social football prediction
						platform that allows friends, families, communities, and organizations to
						compete by predicting football match outcomes. Family Football is not a gambling,
						betting, or financial investment platform.
					</p>

					<h3 className="font-bold my-2">User Accounts</h3>
					<p>
						Users may register using supported authentication providers. You are responsible
						for maintaining the confidentiality of your account and activities conducted
						through it.
					</p>

					<h3 className="font-bold my-2">Service Description</h3>
					<p>
						The platform enables users to create groups, invite participants, make match
						predictions, compete on leaderboards, earn points, and participate in
						community-driven competitions.
					</p>

					<h3 className="font-bold my-2">Prediction Rules</h3>
					<ul className="list-disc pl-6">
						<li>Predictions must be submitted before match kickoff.</li>
						<li>Scores and points are calculated using the platform scoring system.</li>
						<li>Official match results are sourced from trusted football data providers.</li>
						<li>Late predictions are not accepted.</li>
						<li>Platform decisions regarding scoring disputes are final.</li>
					</ul>

					<h3 className="font-bold my-2">Community Conduct</h3>
					<ul className="list-disc pl-6">
						<li>No harassment, abuse, hate speech, or discrimination.</li>
						<li>No impersonation of individuals or organizations.</li>
						<li>No manipulation of competitions or fraudulent activity.</li>
						<li>No automated systems used to gain unfair advantages.</li>
					</ul>

					<h3 className="font-bold my-2">Prizes & Competitions</h3>
					<p>
						Certain groups may offer prizes or rewards. Family Football acts only as a
						platform provider unless explicitly stated otherwise. Prize eligibility,
						distribution, and taxation responsibilities remain subject to applicable laws.
					</p>

					<h3 className="font-bold my-2">Service Availability & Termination</h3>
					<p>
						Features may be modified, suspended, or discontinued at any time. Accounts
						violating platform policies may be suspended or permanently removed.
					</p>

					<h3 className="font-bold my-2">Amendments</h3>
					<p>
						We may update these Terms periodically. Continued use of Family Football
						constitutes acceptance of any revised Terms.
					</p>
				</section>

				<hr />

				{/* PRIVACY POLICY */}
				<section id="privacy" className="mb-12">
					<h2 className="font-extrabold my-4">Privacy Policy</h2>

					<h3 className="font-bold my-2">Data We Collect</h3>
					<ul className="list-disc pl-6">
						<li>Name, email address, and profile information.</li>
						<li>Authentication details from approved login providers.</li>
						<li>Prediction history and competition participation.</li>
						<li>Group memberships and leaderboard statistics.</li>
						<li>Device information and aggregated usage analytics.</li>
					</ul>

					<h3 className="font-bold my-2">How We Use Data</h3>
					<p>
						We use collected information to operate competitions, maintain leaderboards,
						improve platform performance, detect abuse, provide support, and communicate
						important updates.
					</p>

					<h3 className="font-bold my-2">Third-Party Services</h3>
					<p>
						Family Football may use authentication providers, analytics services, cloud
						infrastructure providers, and football data suppliers. Their respective privacy
						policies may apply.
					</p>

					<h3 className="font-bold my-2">Data Sharing</h3>
					<p>
						We do not sell personal information. Data may be shared with service providers,
						legal authorities when required by law, or competition administrators where
						necessary.
					</p>

					<h3 className="font-bold my-2">Data Security</h3>
					<p>
						We implement reasonable technical and organizational measures to protect user
						information from unauthorized access, disclosure, alteration, or destruction.
					</p>

					<h3 className="font-bold my-2">User Rights</h3>
					<p>
						Users may request access, correction, or deletion of personal information,
						subject to applicable legal obligations and operational requirements.
					</p>
				</section>

				<hr />

				{/* FAIR PLAY */}
				<section id="fairplay" className="mb-12">
					<h2 className="font-extrabold my-4">Fair Play & Competition Integrity</h2>

					<ul className="list-disc pl-6">
						<li>Each participant may maintain only one active account.</li>
						<li>No creation of fake accounts to influence rankings.</li>
						<li>No exploitation of bugs, vulnerabilities, or platform errors.</li>
						<li>No automated prediction submissions.</li>
						<li>Violations may result in point deductions, suspensions, or bans.</li>
					</ul>
				</section>

				<hr />

				{/* PAYMENTS */}
				<section id="payments" className="mb-12">
					<h2 className="font-extrabold my-4">Payments & Premium Services</h2>

					<p>
						Some features may require subscription fees, competition entry fees, or premium
						access. Applicable pricing, billing terms, and renewal information will be
						displayed before purchase.
					</p>

					<h3 className="font-bold my-2">Refund Policy</h3>
					<p>
						Refunds may be granted for duplicate payments, technical failures, or billing
						errors. Requests are reviewed individually and processed using the original
						payment method where approved.
					</p>
				</section>

				<hr />

				{/* DISPUTES */}
				<section id="disputes" className="mb-12">
					<h2 className="font-extrabold my-4">Dispute Resolution</h2>

					<ol className="list-decimal pl-6">
						<li>User submits dispute through support channels.</li>
						<li>We acknowledge receipt within a reasonable period.</li>
						<li>Relevant competition data is reviewed.</li>
						<li>A final determination is communicated to involved parties.</li>
						<li>Repeated abuse of the dispute process may result in restrictions.</li>
					</ol>
				</section>

				<hr />

				{/* COOKIES */}
				<section id="cookies" className="mb-12">
					<h2 className="font-extrabold my-4">Cookies & Tracking Technologies</h2>

					<p>
						Cookies are used to maintain secure sessions, remember preferences, improve
						performance, analyze usage trends, and provide a better user experience.
						Disabling cookies may limit platform functionality.
					</p>
				</section>

				<footer className="text-sm text-slate-500 text-center pt-8">
					Last Updated: {new Date().getFullYear()} — This document may be updated periodically.
				</footer>
			</article>

			<footer className="mt-6 text-sm text-slate-600">
				MODIPANE LOGISTICS (PTY) LTD — 2021/002291/07 | 📞 Contact: 084 724 0490 | ✉️
				modipanesh@gmail.com
			</footer>
		</div>
	</main>
);
}
