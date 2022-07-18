module.exports.info = {
	name: "top",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Xem top tương tác, top người giàu',
	group: "Dành Cho Thành Viên",
	guide: [
		'<p> tuongtac hoặc -tt [tag/all/để trống]',
        '<p> money hoặc -m [tag/all/để trống]',
        '<ex> -m all'
	],
	countdown: 20
};

module.exports.language = {
    vi: {
        all: '%1. %2 với %3 %4\n',
        mention: '%1 đứng thứ %2 với %3 %4\n',
        default: 'Bạn đứng hạng %1 với %2 %3',
        type: 'tin nhắn'
    },
    en: {
        all: '%1. %2 with %3 %4\n',
        mention: '%1 ranks %2 with %3 %4\n',
        default: 'You rank %1 with %2 %3',
        type: 'message'
    }
}

module.exports.start = async function ({ args, api, event, Threads, Users, Others, Cherry, Language }) {
	var { threadID, messageID, senderID, mentions } = event;
    switch (args[0]) {
        case 'money':
        case '-m':
            var { members } = await Threads.getData(threadID);
            var msg = [], number = 1, info = [];  
            for (let i of Object.keys(members)) {
                var { coin } = await Others.getData(i);
                var { name } = await Users.getData(i);
                info.push({"ID": i, "coin": coin, "name": name});
            }
            info.sort((a, b) => b.coin - a.coin);
            if (args[1] == 'all') {
                for (let data of info) {
                    msg.push(Language.get('top', 'all', number++, data.name, data.coin, 'coin'));
                }
                return api.sendMessage(msg.join(' '), threadID);
            }
            if (Object.keys(mentions).length > 0) {
                for (let data of info) {
                    number++;
                    if (Object.keys(mentions).includes(data.ID)) msg.push(Language.get('top', 'mention', data.name, number, data.coin, 'coin'))
                }
                return api.sendMessage(msg.join(' '), threadID);
            }
            for (let data of info) {
                number++;
                if (data.ID == senderID) return api.sendMessage(Language.get('top', 'mention', number, data.coin, 'coin'), threadID, messageID)
            }
        case 'tuongtac':
        case '-tt':
            var info = await Threads.getAllUsers(threadID, ['totalMsg'])
            info.sort((a, b) => b.totalMsg - a.totalMsg);;
            var number = 1, msg = [];
            if (args[1] == 'all') {
                for (let data of info) {
                    var { name } = await Users.getData(data.ID);
                    msg.push(Language.get('top', 'all', number++, name, data.totalMsg, Language.get('top', 'type')));
                }
                return api.sendMessage(msg.join(' '), threadID, (error, info) => Cherry.autoUnsend(info.messageID, 120000))
            }
            if (Object.keys(mentions).length > 0) {
                for (let data of info) {
                    number++;
                    if (Object.keys(mentions).includes(data.ID)) {
                        var { name } = await Users.getData(data.ID);
                        msg.push(Language.get('top', 'all', 'mention', name, number, data.totalMsg, Language.get('top', 'type')));
                    }
                }
                return api.sendMessage(msg.join(' '), threadID)
            }
            for (let data of info) {
                number++;
                if (data.ID == senderID) return api.sendMessage(Language.get('top', 'default', number, data.totalMsg, Language.get('top', 'type')), threadID, messageID);
            }
        default:
            return { type: 'use' };
    }
}