export default function Home() {
	return (
		<main className="h-full w-full flex">
			<div className="bg-purple-900 h-full w-[45%] text-white p-10 sm:block hidden"> Prediction DashBoard</div>
			<div className="bg-blue-950 h-full w-full  text-white p-10 ">Chat</div>
			<div className="bg-green-900 h-full w-[35%] text-white p-10 hidden md:block"> Score Table </div>
		</main>
	);
}
