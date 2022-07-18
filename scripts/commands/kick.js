module.exports.info = {
	name: "kick",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Kick người dùng khỏi nhóm',
	group: "Dành Cho Quản Lí",
	guide: [],
	countdown: 5
};

module.exports.language = {
    vi: {
        adminIDs: 'Bot cần quyền quản trị viên nhóm\nVui lòng thêm và thử lại!',
        tag: 'Bạn phải tag người cần kick',
        perm_denied: 'Không thể kick quản trị viên của nhóm (%1).',
        bot_manager: 'Không thể kick người quản lí Bot khỏi nhóm (%1).',
        error: 'Xảy ra lỗi khi kick người dùng có ID: %1\n\n%2'
    },
    en: {
        adminIDs: 'Bot needs group admin rights\nPlease add and try again!',
        tag: 'You must tag the person to kick',
        perm_denied: "Can't kick group admins (%1).",
        bot_manager: 'The Bot manager cannot be removed from the group (%1).',
        error: 'An error occurred when kicking a user with ID: %1\n\n%2'
    }
}

module.exports.start = async function({ api, event, Threads, Cherry, Language }) {
	var { threadID, messageID, senderID, mentions } = event;
    var { adminIDs } = await Threads.getData(threadID);
    var { ADMIN } = Cherry.configs, botID = api.getCurrentUserID();
    if (!adminIDs.some(item => item.id == botID)) return api.sendMessage(Language.get('kick', 'adminIDs'), threadID, messageID);
    if (Object.keys(mentions).length < 1) return api.sendMessage(Language.get('kick', 'tag'), threadID, messageID);
    for (let ID of Object.keys(mentions)) {
        let time = 1;
        try {
            if (adminIDs.some(item => item.id == ID) && !ADMIN.includes(senderID)) throw new Error(Language.get('kick', 'perm_denied', ID))
            if (ADMIN.includes(ID)) throw new Error(Language.get('kick', 'bot_manager', ID))
            setTimeout(() => api.removeUserFromGroup(ID, threadID), time * 1000);
            time += 2;
        } catch (error) {
            api.sendMessage(Language.get('kick', 'error', ID));
            continue;
        }
    }
}