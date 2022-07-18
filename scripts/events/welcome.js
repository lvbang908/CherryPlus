module.exports.info = {
	name: "welcome",
	type: ["log:subscribe"],
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: "Thông báo bot hoặc người vào nhóm",
	install: ['fs']
};

async function checkData(data) {
	var { readFileSync } = require('fs');
	var path = process.cwd() + "/systems/database/data/cache/";
	var oldThreadsData = JSON.parse(readFileSync(path + "oldThreadsData.json", 'utf8'));
	var oldUsersData = JSON.parse(readFileSync(path + "oldUsersData.json", 'utf8'));
	var oldOthersData = JSON.parse(readFileSync(path + "oldOthersData.json", 'utf8'));
	var { type, threadID, userID } = data;
	if (type == 'threads') if (oldThreadsData.hasOwnProperty(threadID)) return true;
	if (type == 'users') if (oldUsersData.hasOwnProperty(userID) && oldOthersData.hasOwnProperty(userID)) return true;
	return false;
}

async function restoreData(data, Threads, Users, Others) {
	var { readFileSync, writeFileSync } = require('fs');
	var path = process.cwd() + "/systems/database/data/cache/";
	var oldThreadsData = JSON.parse(readFileSync(path + "oldThreadsData.json", 'utf8'));
	var oldUsersData = JSON.parse(readFileSync(path + "oldUsersData.json", 'utf8'));
	var oldOthersData = JSON.parse(readFileSync(path + "oldOthersData.json", 'utf8'));
	var { type, threadID, userID } = data;
	if (type == 'threads') {
		var threadInfo = oldThreadsData[threadID];
		for (var i of Object.keys(threadInfo.members)) await user(i);
		await Threads.setData(threadID, threadInfo);
		delete oldThreadsData[threadID];
		writeFileSync(path + 'oldThreadsData.json', JSON.stringify(oldThreadsData, null, 4));
		return true;	
	}
	if (type == 'users') {
		var restore = await user(userID);
		return restore;
	}
	async function user(userID) {
		var userInfo = oldUsersData[userID];
		var otherInfo = oldOthersData[userID];
		delete oldUsersData[userID];
		delete oldOthersData[userID];
		await Users.setData(userID, userInfo);
		await Others.setData(userID, otherInfo);
		writeFileSync(path + 'oldUsersData.json', JSON.stringify(oldUsersData, null, 4));
		writeFileSync(path + 'oldOthersData.json', JSON.stringify(oldOthersData, null, 4));
		return true;
	}
}

module.exports.language = {
	vi: {
		bot_name: 'CherryPlus - Create By Henry',
		add_bot: 'Xin Chào!\n\nMình là Cherry, rất khi khi được gặp và giúp đỡ mọi người 🥰',
		old_data: 'Phát hiện nhóm này có dữ liệu cũ, đang tiến hành phục hồi...',
		successful_recovery: 'Đã phục hồi dữ liệu cho %1 thành công.',
		cannot_recovery: 'Không thể phục hồi dữ liệu cho %1, vui lòng kiểm tra lại.',
		group: 'nhóm này',
		information: 'Hiện tại, mọi người có thể sử dụng %1 lệnh.\nPrefix: %2\nGửi %3help để biết thêm chi tiết\n\nChúc mọi người trai nghiệm vui vẻ ^^',
		an_user: 'bạn',
		many_users: 'các bạn',
		welcome_users: '🥰 Chào mừng %1 đã đến với %2 🥰\n%3 là thành viên thứ %4 của nhóm\nChúc %3 có một %5 vui vẻ\n\nNote: Sử dụng %6help để xem hướng dẫn sử dụng Bot.'
	},
	en: {
		bot_name: 'CherryPlus - Create By Henry',
		add_bot: "Hello!\n\nI'm Cherry, it's nice to meet and help everyone 🥰",
		old_data: 'Discovered that this group has old data, is in the process of recovering...',
		successful_recovery: 'Data recovery for %1 was successful.',
		cannot_recovery: 'Unable to recover data for %1, please check again.',
		group: 'this group',
		information: 'Now everyone can use the %1 command.\nPrefix: %2\nSend %2help for more details\n\nHave a nice experience ^^',
		an_user: 'you',
		many_users: 'guys',
		welcome_users: '🥰 %2 Welcome %1 🥰\n%3 as the %4 member of the group\nWishing %3 a happy %5\n\nNote: Use %6help to view the Bot manual.'
	}
}

module.exports.start = async function({ api, event, Threads, Users, Others, Cherry, Cli, Language }) {
	const { threadID, logMessageData } = event;
	var { prefix } = await Threads.getData(threadID);
	var { configs } = Cherry, { saveData } = configs;
	if (logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID())) {
		return api.sendMessage(Language.get('welcome', 'welcome'), threadID, async() => {
			if (saveData == true) {
				var check = await checkData({ threadID, type: 'threads' });
				if (check == true) api.sendMessage(Language.get('welcome', 'old_data'), threadID, async() => {
					var restore = await restoreData({ threadID, type: 'threads' }, Threads, Users, Others)
					if (restore == true) api.sendMessage(Language.get('welcome', 'successful_recovery', Language.get('welcome', 'group')), threadID);
					else api.sendMessage(Language.get('welcome', 'cannot_recovery', Language.get('welcome', 'group')), threadID);
				})
			}
			api.changeNickname(configs.BOTNAME ? configs.BOTNAME : Language.get('welcome', 'bot_name'), threadID, api.getCurrentUserID());
			return api.sendMessage(Language.get('welcome', 'infomation', Cli.commands.size, prefix ? prefix : configs.prefix), threadID)
		})
	}
	var { createReadStream, existsSync } = require("fs");
	var session = Cherry.session().toLowerCase();
	var { threadName, participantIDs } = await api.getThreadInfo(threadID);
	var { msgWelcome } = await Threads.getData(threadID);
	var gif = __dirname + `/cache/${threadID}.gif`;
	var mentions = [], name = [], addLength = 0, restoreUsers = [];
	for (var i of logMessageData.addedParticipants) {
		var check = await checkData({ userID: i.userFbId, type: 'users' }, Threads, Users, Others);
		if (check == true) {
			var restore = await restoreData({ userID: i.userFbId, type: 'users'}, Threads, Users, Others);
			if (restore == true) restoreUsers.push(i.fullName);
		}
		name.push(i.fullName);
		mentions.push({ id: i.userFbId, tag: i.fullName });
		addLength++;
	}
	var body = msgWelcome ? msgWelcome : Language.get('welcome', 'welcome_users', name.join(' '), threadName, addLength > 1 ? Language.get('welcome', 'many_users') : Language.get('welcome', 'an_user'), participantIDs.length, session, prefix ? prefix : configs.prefix);
	body = body
	.replace(/\{threadName}/g, threadName)
	.replace(/\{name}/g, name.join(', '))
	.replace(/\{type}/g, addLength > 1 ? Language.get('welcome', 'many_users') : Language.get('welcome', 'an_user'))
	.replace(/\{totalMembers}/g, participantIDs.length)
	.replace(/\{session}/g, session)
	.replace(/\{prefix}/g, prefix ? prefix : configs.prefix);
	if (!existsSync(gif)) var msg = { body: body, mentions: mentions };
	else var msg = { body: body, mentions: mentions, attachment: createReadStream(gif) };
	return api.sendMessage(msg, threadID, async() => {
		if (restoreUsers.length > 0) return api.sendMessage(Language.get('welcome', 'successful_recovery', restoreUsers.join(', ')), threadID);
	});
}