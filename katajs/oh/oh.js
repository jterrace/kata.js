define(["oh/HostedObject",
        "oh/ObjectHost",
        "oh/SessionManager",
        "oh/impl/ScriptProtocol"],
		function(HostedObject,
				 ObjectHost,
				 SessionManager,
				 ScriptProtocol) {
	return {
		HostedObject: HostedObject,
		ObjectHost: ObjectHost,
		SessionManager: SessionManager,
		impl: {
			ScriptProtocol: ScriptProtocol
		}
	};
});
