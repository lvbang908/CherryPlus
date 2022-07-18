module.exports.info = {
	name: "leave",
	type: ["log:unsubscribe"],
	version: "1.0.0",
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: "Thông báo bot hoặc người dùng rời nhóm"
};

module.exports.onLoad = function({ Cherry }) {
	const { existsSync, mkdirSync, writeFileSync } = require("fs");
	var { saveData } = Cherry.configs;
	if (!existsSync(__dirname + '/cache/')) mkdirSync(__dirname + '/cache/', { recursive: true });
	if (saveData == true) {
		const pathOldData = process.cwd() + '/systems/database/data/cache/';
		if (!existsSync(pathOldData)) mkdirSync(pathOldData, { recursive: true });
		var dataName = ['oldThreadsData.json', 'oldUsersData.json', 'oldOthersData.json'];
		for (var i of dataName) if (!existsSync(pathOldData + i)) writeFileSync(pathOldData + i, "{}", { flag: "a+" });
	}
}

async function delData({ Threads, Users, Others, data }) {
	var { threadID, type, userID } = data;
	var { readFileSync, writeFileSync } = require('fs');
	var path = process.cwd() + "/systems/database/data/cache/";
	var oldThreadsData = JSON.parse(readFileSync(path + "oldThreadsData.json", 'utf8'));
	var oldUsersData = JSON.parse(readFileSync(path + "oldUsersData.json", 'utf8'));
	var oldOthersData = JSON.parse(readFileSync(path + "oldOthersData.json", 'utf8'));
	if (type == 'botOut') {
		var threadInfo = await Threads.getData(threadID);
		if (oldThreadsData.hasOwnProperty(threadID)) oldThreadsData[threadID] = threadInfo;
		else oldThreadsData = Object.assign(oldThreadsData, { [threadID]: threadInfo });
		writeFileSync(path + 'oldThreadsData.json', JSON.stringify(oldThreadsData, null, 4));
		for (var i of Object.keys(threadInfo.members)) {
			var memberInfo = await Users.getData(i);
			var otherInfo = await Others.getData(i);
			await Users.delData(i);
			await Others.delData(i);
			if (oldOthersData.hasOwnProperty(i)) oldOthersData[i] = otherInfo;
			else oldOthersData = Object.assign(oldOthersData, { [i]: otherInfo });
			if (oldUsersData.hasOwnProperty(i)) oldUsersData[i] = memberInfo;
			else oldUsersData = Object.assign(oldUsersData, { [i]: memberInfo });
		}
		writeFileSync(path + 'oldUsersData.json', JSON.stringify(oldUsersData, null, 4));
		writeFileSync(path + 'oldOthersData.json', JSON.stringify(oldOthersData, null, 4));
		return true;
	}
	if (type == 'userOut') {
		var infoThread = await Threads.getData(threadID);
		var infoUser = await Users.getData(userID);
		var infoOther = await Others.getData(userID);
		if (oldThreadsData.hasOwnProperty(threadID)) oldThreadsData[threadID].members = Object.assign(oldThreadsData[threadID].members, infoThread.members[userID]);
		else oldThreadsData = Object.assign(oldThreadsData, { [threadID]: { members: { [userID]: infoThread.members[userID] } } } );
		await Threads.delMember(threadID, userID);
		if (oldOthersData.hasOwnProperty(userID)) oldOthersData[userID] = infoOther;
		else oldOthersData = Object.assign(oldOthersData, { [userID]: infoOther });
		if (oldUsersData.hasOwnProperty(userID)) oldUsersData[userID] = infoUser;
		else oldUsersData = Object.assign(oldUsersData, { [userID]: infoUser });
		writeFileSync(path + 'oldThreadsData.json', JSON.stringify(oldThreadsData, null, 4));
		writeFileSync(path + 'oldUsersData.json', JSON.stringify(oldUsersData, null, 4));
		writeFileSync(path + 'oldOthersData.json', JSON.stringify(oldOthersData, null, 4));
		return true;
	}
}

module.exports.language = {
	vi: {
		bot_out: 'Bot đã tự rời khỏi nhóm %1 vào lúc %2',
		bot_kicked: '%1 đã kick Bot ra khỏi nhóm %2 vào lúc %3',
		leave_by_yourself: 'tự rời',
		by_admin: 'Quản Trị Viên đá bay màu',
		body: '%1 đã %2 khỏi nhóm lúc %3',
		backup: 'Đã sao lưu dữ liệu người dùng thành công.',
		cannot_backup: 'Không thể sao lưu dữ liệu cho người dùng này.'
	},
	en: {
		bot_out: 'The bot left the pool %1 on its own at: %2',
		bot_kicked: '%1 kicked Bot out of group %2 at %3',
		leave_by_yourself: 'leave by yourself',
		by_admin: 'kicked by admin',
		body: '%1 was %2 out of the group at %3',
		backup: 'Backup of user data was successful.',
		cannot_backup: 'Unable to back up data for this user.'
	}
}

module.exports.start = async function({ api, event, Threads, Users, Others, Cherry, Language }) {
	var { threadID, author, logMessageData } = event, { disabled, botSytem, ADMIN, saveData } = Cherry.configs;
	var sendTo = botSytem ? botSytem : ADMIN[0];
	if (logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
		if (saveData == true) {
			var data = { threadID: threadID, type: 'botOut', userID: api.getCurrentUserID() };
			var deleteData = await delData({ Threads, Users, Others, data });
			var { name } = await Users.getData(author);
			var { name: threadName } = await Threads.getData(threadID);
			await Threads.delData(threadID);
			if (deleteData == true && disabled.includes('log.js') && author == api.getCurrentUserID()) return api.sendMessage(Language.get('leave', 'bot_out', threadName, Cherry.getTime('FT')), sendTo);
			else if (deleteData == true && disabled.includes('log.js') && author != api.getCurrentUserID()) return api.sendMessage(Language.get('leave', 'bot_kicked', threadName, Cherry.getTime('FT')), sendTo);
		} else {
			var { name } = await Users.getData(author);
			var { name: threadName } = await Threads.getData(threadID);
			if (disabled.includes('log.js') && author == api.getCurrentUserID()) return api.sendMessage(Language.get('leave', 'bot_out', threadName, Cherry.getTime('FT')), sendTo);
			else if (disabled.includes('log.js') && author != api.getCurrentUserID()) return api.sendMessage(Language.get('leave', 'bot_kicked', threadName, Cherry.getTime('FT')), sendTo);
		}
	} else {
		var { createReadStream, existsSync } = require('fs');
		var path = `${__dirname}/cache/${threadID}.gif`;
		var { name } = await Users.getData(logMessageData.leftParticipantFbId);
		var type = author == logMessageData.leftParticipantFbId ? Language.get('leave', 'leave_by_yourself') : Language.get('leave', 'by_admin');
		var info = await Threads.getData(threadID);
		var msg = { body: '', attachment: [] };
		info.msgLeave ? msg.body = info.msgLeave : msg.body = Language.get('leave', 'body', name, type, Cherry.getTime('FT'));
		if (existsSync(path)) msg.attachment = createReadStream(path);
		api.sendMessage(msg, threadID, async() => {
			var data = { threadID: threadID, type: 'userOut', userID: logMessageData.leftParticipantFbId };
			var deleteData = await delData({ Threads, Users, Others, data });
			if (deleteData == true) return api.sendMessage(Language.get('leave', 'backup'), threadID);
			else return api.sendMessage(Language.get('leave', 'cannot_backup'), threadID);
		});
	}
}