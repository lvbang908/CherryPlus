module.exports.info = {
	name: "language",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Xem, thay đổi ngôn ngữ hiện tại',
	group: "System",
	guide: [],
	countdown: 5
};

module.exports.language = {
	vi: {
		select: 'Mời bạn chọn các ngôn ngữ dưới đây:\n\n%1\nReply tin nhắn này 1 số tương ứng với ngôn ngữ bạn muốn chọn.',
		isNumber: 'Lựa chọn của bạn phải là một số và là số nguyên dương.',
		isAuthor: 'Bạn không phải author.',
		not_in_list: 'Lựa chọn của bạn không nằm trong danh sách',
		accept: "Bạn có chắc muốn đổi ngôn ngữ thành '%1'?\nVui lòng thả cảm xúc vào tin nhắn này để đồng ý.",
		success: 'Ngôn ngữ đã được đổi thành %1.'
	},
	en: {
		select: 'Please select the languages below:\n\n%1\nReply this message 1 number corresponds to the language you want to select.',
		isNumber: 'Your select must be a number and is a positive integer.',
		isAuthor: 'You are not the author',
		not_in_list: 'Your select not in the list',
		accept: "Are you sure you want to change the language to '%1'?\nPlease reaction on this message to agree.",
		success: "Language has been changed to %1."
	}
}

module.exports.handleReaction = async function({ api, event, Reaction, Cherry, Cli }) {
	var { threadID, messageID, userID } = event, { author, selection } = Reaction;
	console.log('Hihi')
	if (userID == author) {
		var change = Language.change(selection.replace(/.json$/g, ''), Cherry, Cli);
		console.log(change)
		if (change.error) return api.sendMessage(change.error, threadID, messageID);
		else return api.sendMessage(Language.get('language', 'success', selection.replace(/.json$/g, '')), threadID, messageID);
	}
}

module.exports.handleReply = async function({ api, event, Reply, Language, Cli }) {
	var { threadID, messageID, senderID, body } = event, { language, author } = Reply;
	if (senderID != author) return api.sendMessage(Language.get('language', 'isAuthor'), threadID, messageID);
	if (!parseInt(body)) return api.sendMessage(Language.get('language', 'isNumber'), threadID, messageID);
	if (body > language.length) return api.sendMessage(Language.get('language', 'not_in_list'), threadID, messageID);
	return api.sendMessage(Language.get('language', 'accept', language[body - 1].replace(/.json$/g, '')), threadID, (err, info) => {
		Cli.handleReaction.push({
			name: this.info.name,
			messageID: info.messageID,
			author: senderID,
			selection: language[body - 1]
		})
	}, messageID);
}

module.exports.start = async function({ api, event, Language, Cli }) {
	var { threadID, messageID, senderID } = event;
	var language = Language.all_language(), msg = '', number = 1;
	for (var i of language) msg += `${number++}. ${i.replace(/.json$/g, '')}\n`
	return api.sendMessage(Language.get('language', 'select', msg), threadID, (err, info) => {
		Cli.handleReply.push({
			name: this.info.name,
			messageID: info.messageID,
			language: language,
			author: senderID
		})
	},messageID)
}