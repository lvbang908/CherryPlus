module.exports.info = {
	name: "antiCN",
	type: ['log:user-nickname'],
	version: "1.0.0",
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: "Chống đổi biệt danh của Bot"
};

module.exports.language = {
    vi: {
        type: 'Tự đổi biệt danh của Bot',
        warn: '%1 - Vui lòng không đổi biệt danh của Bot, cảnh cáo lần %2\nBạn sẽ bị ban nếu vẫn tiếp tục đổi biệt danh của Bot',
        banned: '%1 - Bạn bị cấm sử dụng Bot vì đổi biệt danh của Bot 3 lần.'
    },
    en: {
        type: "Change Bot's nickname by yourself",
        warn: "%1 - Please do not change the Bot's nickname, warning %2\nYou will be banned if you continue to change the Bot's nickname",
        banned: "%1 - You are banned from using the Bot for changing the Bot's nickname 3 times."
    }
}

module.exports.start = async function({ api, event, Cherry, Users, Threads, Language, Cli }) {
    var { logMessageData, threadID, author } = event;
    var botID = api.getCurrentUserID();
    var { BOTNAME, ADMIN } = Cherry.configs;
    var { bietdanh } = await Threads.getUser(threadID, botID) || BOTNAME;
    var nickname = bietdanh ? bietdanh : BOTNAME;
    if (logMessageData.participant_id == botID && author != botID && !ADMIN.includes(author) && logMessageData.nickname != nickname) {
        api.changeNickname(nickname, threadID, botID);
        var info = await Users.getData(author);
        if (!info.antiCN) info.antiCN = 1;
        else info.antiCN++;
        if (info.antiCN == 3) {
            if (info.banned && info.banned.status == true) {
                info.banned.lido.push(Language.get('antiCN', 'type'));
                await Users.setData(author, info);
                Cli.users.set(author, info.banned);
            } else if (!info.banned) {
                info.banned = { status: true, lido: [Language.get('antiCN', 'type')], author: `Cherry - Anti Change Nickname`, type: 'ban', time: Cherry.getTime('fullTime') };
                await Users.setData(author, info);
                Cli.allUsersBanned.set(author, info.banned);
            }
            return api.sendMessage({ body: Language.get('antiCN', 'banned', info.name), mentions: [{ tag: info.name, id: author }] }, threadID);
        }
        return api.sendMessage({ body: Language.get('antiCN', 'warn', info.name, info.antiCN), mentions: [{ tag: info.name, id: author }] }, threadID);
    }
}