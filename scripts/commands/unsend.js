module.exports.info = {
	name: "unsend",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Gỡ tin nhắn của Bot',
	group: "Tools",
	guide: [''],
	countdown: 5
};

module.exports.language = {
	vi: {
		reply: 'Hãy reply tin nhắn cần gỡ.',
		author: 'Không thể gỡ tin nhắn của người khác.'
	},
	en: {
		reply: 'Please reply to the message to be removed.',
		author: 'Cannot remove other people\'s messages.'
	}
}

module.exports.handleEvents = function({ api, event }) {
	var { body, type } = event;
	if (type == "message_reply" && body == "." && event.messageReply.senderID == api.getCurrentUserID()) return api.unsendMessage(event.messageReply.messageID);
}

module.exports.start = function({ api, event, Language }) {
	if (event.type != "message_reply") return api.sendMessage(Language.get('unsend', 'reply'), event.threadID, event.messageID);
	if (event.messageReply.senderID != api.getCurrentUserID()) return api.sendMessage(Language.get('unsend', 'author'), event.threadID, event.messageID);
	return api.unsendMessage(event.messageReply.messageID);
}
