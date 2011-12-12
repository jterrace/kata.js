/*  KataJS
 *  MessageDispatcher.js
 *
 *  Copyright (c) 2010, Ewen Cheslack-Postava
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

define(function() {

	/** Constructs a dispatcher for messages. The caller provides a
	 *  dictionary from Types to handler functions.
	 *
	 * This is intended to tidy up classes that do a lot of message
	 * handling.  There are two benefits.  First, instead of massive
	 * switch statements in message reception methods, you set up a
	 * mapping at construction time.  This makes it clear, up front,
	 * exactly what type of messages you're handling. Second, if
	 * necessary, new handlers can be added dynamically, which isn't
	 * possible with big switch statements.
	 *
	 * @constructor
	 * @param {object} handlers map from Types (which should be ints
	 * under the hood) to handler functions
	 */
	MessageDispatcher = function(handlers) {
		this._handlers = handlers;
	};

	MessageDispatcher.prototype.add = function(type, handler) {
		this._handlers[type] = handler;
	};

	/** Try to dispatch the message.  Return true if successfully
	 *  dispatched or false if no handler was registered for it.
	 */
	MessageDispatcher.prototype.dispatch = function(channel, msg) {
		var mtype = msg.__type;
		if (!this._handlers[mtype])
			return false;
		this._handlers[mtype](channel,msg);
		return true;
	};


	return MessageDispatcher;
});
