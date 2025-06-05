export default function Chat() {
	return (
		<main className="flex flex-col h-screen bg-gray-500">
			{/* Chat Container */}
			<div className="flex flex-col justify-end flex-grow overflow-y-auto">
				<div className="">Today, 1:06PM</div>
				<div className="bg-red-200">Hey did you go someplace today ?</div>
				<div className="">Yes I went to Oxford, how about you ?</div>
				<div className="">Was at home mostly</div>
			</div>
			{/* Chat toolbar */}
			<div className="bg-gray-800 h-15 flex items-center justify-center">
				<div className="bg-white border border-gray-300 rounded-full h-10 w-[90%] p-[10px]">
					<form className="flex items-center h-full">
						<input
							// biome-ignore lint/a11y/noAutofocus: we like to autofocus as this is a chat app
							autoFocus
							className="w-full h-full border-none outline-none ring-0 shadow-none text-gray-900 placeholder-gray-500 px-3"
							placeholder="Type a message..."
						/>
					</form>
				</div>
			</div>
		</main>
	);
}
