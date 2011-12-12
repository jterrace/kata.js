define(["core/Channel",
        "core/Location",
        "core/MessageDispatcher",
        "core/Time",
        "core/URL",
        "core/UUID"],
        function(Channel,
        		 Location,
        		 MessageDispatcher,
        		 Time,
        		 URL,
        		 UUID) {
	return {
		Channel: Channel,
		Location: Location,
		MessageDispatcher: MessageDispatcher,
		Time: Time,
		URL: URL,
		UUID: UUID
	};
});
