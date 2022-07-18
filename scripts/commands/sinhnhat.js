module.exports.info = {
	name: "sinhnhat",
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

module.exports.handleEvents = async function({ event, api, Users, Cli }) {
    var { threadID, senderID } = event;
    var info = await Users.getData(senderID);
    if (info.isBirthday == true && !info.happyBirthday) {
        var msg = `🎂🎉🎊Chúc mừng sinh nhật ${info.name} 🎊🎉🎂\n\nChúc em hạnh phúc đậm đà tình yêu 💏\nChúc em sức khỏe thật nhiều 💪\nChúc em may mắn vạn điều bình an 🍀\n\n`;
        if (info.gioitinh == 'Nam') msg += `Chúc em ngày một giàu sang\nTrăm ngàn hạnh phúc, kho tàng tình yêu\nCuối thơ chúc nốt một điều\nChúc em may mắn, sớm chiều thành công🥰\n`;
        else msg += `Chúc em ngày một giàu sang\nNiềm vui hạnh phúc càng ngày càng xinh\nChúc em êm ấm gia đình\nNăm nay kiếm được phúc tinh cuộc đời 😘\n`;
        msg += `\nMọi người nhanh đến chúc mừng sinh nhật cho bạn ấy đi nào 🥰`;
        await Users.setData(senderID, { happyBirthday: { status: true, timestamp: Date.now() }});
        return api.sendMessage({ body: msg, mentions: { tag: info.name, id: senderID }});
    }
}

module.exports.start = async function({ api, event, Threads, Users }) {
    var { threadID } = event;
    var { members } = await Threads.getData(threadID), tag = [], msg = 'Hôm nay là ngày sinh của những thiên thần dưới đây:\n\n', birthday = [], number = 1;
    for (var ID of Object.keys(members)) {
        var { name, isBirthday} = await Users.getData(ID);
        if (isBirthday == true) {
            birthday.push(`${number++}. ${name}\n`);
            tag.push({ tag: name, id: ID });
        }
    }
    if (birthday.length > 0) msg += birthday.join(' ') + `\nMọi người tới chúc mừng sinh nhật cho ${tag.length < 2 ? 'bạn ấy' : 'các bạn ấy'} nào.`;
    else msg = 'Hôm nay không là ngày sinh của thành viên nào cả.';
    return api.sendMessage({ body: msg, mentions: tag }, threadID);
}