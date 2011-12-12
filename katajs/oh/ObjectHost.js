/*  Kata Javascript Network Layer
 *  ObjectHost.js
 *
 *  Copyright (c) 2010, Patrick Reiter Horn
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in
 *    the documentation and/or other materials provided with the
 *    distribution.
 *  * Neither the name of Sirikata nor the names of its contributors may
 *    be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define(["oh/HostedObject", "oh/SessionManager"],
		function(HostedObject, SessionManager) {

	/** ObjectHost is the main interface to access HostedObject's. It also
	 * manages the list of open space connections, and communication between
	 * other simulations (graphics and physics).
	 * @constructor
	 */
	ObjectHost = function (blessed_script, blessed_class, blessed_args) {
		this.mSimulations = [];
		this.mSimulationsByName = {};
		this.mSimulationCallbacksByName={};
		this.mObjects = {};

		this.mSessionManager = new SessionManager();

		this.createObject(blessed_script, blessed_class, blessed_args);
		if (network_debug) console.log("ObjectHosted!");
	};

	/** Notifies the ObjectHost about a new simulation.
	 * @param {Kata.Channel} channel  The corresponding simulation's channel.
	 * @param {string} name  Some human-readable name. May be useful if scripts
	 *     wish to talk to a specfic simulation?
	 */
	ObjectHost.prototype.registerSimulation = function (channel, name) {
		this.mSimulations.push(channel);
		this.mSimulationsByName[name] = channel;
		channel.registerListener(Kata.bind(this.receivedSimulationMessage, this, name));
	};

	/** Sends a message to some simulation.
	 * @param {string|object} data  A message (often an object formatted as
	 *     JavascriptGraphicsApi)
	 * @param {string=} name  Simulation name (if ommitted, broadcast).
	 */
	ObjectHost.prototype.sendToSimulation = function (data, name) {
		if (!name) {
			for (name in this.mSimulationsByName) {
				this.mSimulationsByName[name].sendMessage(data);
			}
		} else {
			this.mSimulationsByName[name].sendMessage(data);
		}
	};

	ObjectHost.prototype.registerSimulationCallback = function(simName, object){
		if (simName in this.mSimulationCallbacksByName) {
			this.mSimulationCallbacksByName[simName].push(object);
		}else {
			this.mSimulationCallbacksByName[simName]=[object];
		}
	};
	ObjectHost.prototype.unregisterSimulationCallback = function(simName, object){
		var callbacks = this.mSimulationCallbacksByName[simName];
		if (callbacks.length==1) {
			delete this.mSimulationCallbacksByName[simName];
		}else {
			for (var i=0;i<callbacks.length;++i) {
				if (callbacks[i]==object) {
					callbacks[i]=callbacks[callbacks.length-1];
					callbacks.pop();
					break;
				}
			}
		}
	};
	ObjectHost.prototype.receivedSimulationMessage = function(simName, channel, data) {
		var cbArray=this.mSimulationCallbacksByName[simName];
		if (cbArray) {
			for (var i=0;i<cbArray.length;++i) {
				cbArray[i].handleMessageFromSimulation(simName,channel,data);
			}
		}
	};

	ObjectHost.prototype.privateIdGenerator=function(){
		var retval=0;
		return function() {
			retval+=1;
			return ""+retval;
		};
	}();

	ObjectHost.prototype.createObject = function(script, cons, args) {
		var privid = this.privateIdGenerator();
		var createdObject = this.generateObject(privid);
		if (script && cons && args)
			createdObject.createScript(script, cons, args);
	};

	/** Creates a new instance of a HostedObject for a specific protocol.
	 * @param {string} id  A unique name for this object. You can use this to
	 *     lookup the object within the object host, and it gets passed to the
	 *     object's constructor.
	 * @return {HostedObject} A pointer to the new object.
	 */
	ObjectHost.prototype.generateObject = function(id) {
		if (network_debug) console.log("Creating Object "+id);
		this.mObjects[id] = new HostedObject(this, id);
		return this.mObjects[id];
	};

	/** Attempts to connect the object to the specified space.
	 *
	 * @param {HostedObject} ho the HostedObject to connect
	 * @param {string} space URL of space to connect to
	 * @param {string} auth authentication information for the space
	 */
	ObjectHost.prototype.connect = function(ho, req, auth) {
		if (req.scale.length==3) {
			Kata.warn("outdated bounds: "+req.scale);
			req.scale=[0,0,0,req.scale[0]];
		}
		this.mSessionManager.connect(ho, req, auth);
	};

	ObjectHost.prototype.disconnect = function(ho, req) {
		this.mSessionManager.disconnect(ho, req);
	};

	ObjectHost.prototype.sendODPMessage = function(space, src_obj, src_port, dst_obj, dst_port, payload) {
		this.mSessionManager.sendODPMessage(space, src_obj, src_port, dst_obj, dst_port, payload);
	};

	ObjectHost.prototype.registerProxQuery = function(space, id, sa) {
		this.mSessionManager.registerProxQuery(space, id, sa);
	};

	ObjectHost.prototype.locUpdateRequest = function(space, id, loc, visual) {
		this.mSessionManager.locUpdateRequest(space, id, loc, visual);
	};

	ObjectHost.prototype.requestQueryRemoval = function(space, id) {
		this.mSessionManager.requestQueryRemoval(space, id);
	};

	ObjectHost.prototype.requestQueryUpdate = function(space, id, newSolidAngle) {
		this.mSessionManager.requestQueryRemoval(space, id, newSolidAngle);
	};

	ObjectHost.prototype.setPhysics = function(space, id, data) {
		this.mSessionManager.setPhysics(space, id, data);
	};

	ObjectHost.prototype.subscribe = function(space, id, observe) {
		this.mSessionManager.subscribe(space, id, observe);
	};

	ObjectHost.prototype.unsubscribe = function(space, id, observe) {
		this.mSessionManager.unsubscribe(space, id, observe);
	};
	
	
	return ObjectHost;

});
