module.exports.info = {
	name: "log",
	type: ["log:unsubscribe", 'log:thread-name', 'log:subscribe'],
	version: "1.0.0",
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: "Thông báo bot hoặc người vào nhóm"
};

module.exports.language = {
    vi: {
        change_name: '===== Thay Đổi Tên Nhóm =====\n\nID Nhóm: %1\nTên Cũ: %2\nTên Mới: %3\nNgười Đổi: %4\nID Người Đổi: %5\nThời Gian: %6',
        no_name: 'Không có tên',
        kick_bot: '===== Bot Bị Kick =====\n\nNgười Kick: %1\nID Người Kick: %2\nKick Khỏi Nhóm: %3\nThời Gian: %4',
        add_new_group: '===== Thêm Nhóm Mới =====\n\nNgười Thêm: %1\nID Người Thêm: %2\nThêm Vào Nhóm: %3\nThời Gian: %4'
    },
    en: {
        change_name: '===== Change Group Name ==\n\nID Group: %1\nOldName: %2\nNewName: %3\nChanger: %4\nID Changer: %5 \nTime: %6',
        no_name: 'No name',
        kick_bot: '===== Bot Kicked =\n\nKicker: %1\nID Kicker: %2\nKick Out of Group: %3\nTime: %4',
        add_new_group: '===== Add New Group ==\n\nAdder: %1\nID Adder: %2\nAdd to Group: %3\nTime: %4'
    }
}

module.exports.start = async function({ api, event, Cherry, Users, Threads, Language }) {
    var { threadID, author, logMessageData, logMessageType } = event;
    var { ADMIN, botSystem } = Cherry.configs;
    var sendTo = botSystem ? botSystem : ADMIN[0];
    var info = await Threads.getData(threadID);
    var { name } = await Users.getData(author);
    if (logMessageType == 'log:thread-name') {
        var msg = Language.get('log', 'change_name', threadID, name, author, info.name ? info.name : Language.get('log', 'no_name'), logMessageData.name ? logMessageData.name : Language.get('log', 'no_name'), Cherry.getTime('FT'));
        return api.sendMessage(msg, sendTo, async function() {
            await Threads.setData(threadID, { name: logMessageData.name });
        });
    }
    if (logMessageType == 'log:unsubscribe' && logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
        var msg = Language.get('log', 'kick_bot', name, author, info.name, Cherry.getTime('FT'))
        return api.sendMessage(msg, sendTo);
    }
    if (logMessageType == 'log:subscribe' && logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID())) {
        var msg = Language.get('log', 'add_new_group', name, author, info.name ? info.name : Language.get('log', 'no_name'), Cherry.getTime('FT'));
        return api.sendMessage(msg, sendTo);
    }
}