module.exports.info = {
	name: "birthday",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Xem hôm nay sẽ là sinh nhật của ai?',
	group: "Tools",
	guide: ['<p>'],
	countdown: 5
};

module.exports.language = {
    vi: {
        template: 'Hôm nay là ngày sinh của những thiên thần dưới đây:\n\n',
		an_user: 'bạn ấy',
		many_users: 'các bạn ấy',
        footer: '\nMọi người tới chúc mừng sinh nhật cho %1 nào.',
        body: 'Hôm nay không là ngày sinh của thành viên nào cả.',
        happyBirthday: '🎂🎉🎊Chúc mừng sinh nhật %1 🎊🎉🎂\n\nChúc em hạnh phúc đậm đà tình yêu 💏\nChúc em sức khỏe thật nhiều 💪\nChúc em may mắn vạn điều bình an 🍀\n\n',
        male: 'Chúc em ngày một giàu sang\nTrăm ngàn hạnh phúc, kho tàng tình yêu\nCuối thơ chúc nốt một điều\nChúc em may mắn, sớm chiều thành công🥰\n',
        female: 'Chúc em ngày một giàu sang\nNiềm vui hạnh phúc càng ngày càng xinh\nChúc em êm ấm gia đình\nNăm nay kiếm được phúc tinh cuộc đời 😘\n'
    },
    en: {
        template: 'Today is the birthday of the following angels:\n\n',
		an_user: 'you',
		many_users: 'guys',
        footer: '\nEveryone come celebrate %1\'s birthday.',
        body: 'Today is not a member\'s birthday.',
        happyBirthday: '🎂🎉🎊Happy birthday %1🎊🎉🎂',
        male: '',
        female: ''
    }
}

module.exports.handleEvents = async function({ event, api, Users, Language }) {
    var { threadID, senderID } = event;
    var info = await Users.getData(senderID);
    if (info.isBirthday == true && !info.happyBirthday) {
        var msg = Language.get('birthday', 'happyBirthday', info.name);
        if (info.gioitinh == 'Nam') msg += Language.get('birthday', 'male');
        else msg += Language.get('birthday', 'female');
        msg += Language.get('birthday', 'footer');
        await Users.setData(senderID, { happyBirthday: { status: true, timestamp: Date.now() }});
        return api.sendMessage({ body: msg, mentions: { tag: info.name, id: senderID }}, threadID);
    }
}

module.exports.start = async function({ api, event, Threads, Users, Language }) {
    var { threadID } = event;
    var { members } = await Threads.getData(threadID), tag = [], msg = Language.get('birthday', 'template'), birthday = [], number = 1;
    for (var ID of Object.keys(members)) {
        var { name, isBirthday} = await Users.getData(ID);
        if (isBirthday == true) {
            birthday.push(`${number++}. ${name}\n`);
            tag.push({ tag: name, id: ID });
        }
    }
    if (birthday.length > 0) msg += birthday.join(' ') + Language.get('birthday', 'footer', tag.length > 1 ? Language.get('birthday', 'many_users') : Language.get('birthday', 'an_user'));
    else msg = Language.get('birthday', 'body');
    return api.sendMessage({ body: msg, mentions: tag }, threadID);
}
