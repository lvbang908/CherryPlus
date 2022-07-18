module.exports.info = {
	name: "nickname",
    permissions: 1,
    author: {
        name: "Henry",
        facebook: "https://facebook.com/s2.henry"
    },
	description: 'Đổi biệt danh của một ai đó',
	group: "Tools",
	guide: ['<p> [tag ai đó] [tên]', '<p> [tên]'],
	countdown: 5
};

module.exports.start = async function({ api, event, args }) {
	const { threadID, senderID, mentions } = event, ID = [];
	if (Object.keys(mentions).length == 0) {
        var name = args.join(" ")
        return api.changeNickname(name, threadID, senderID);
    }
    var nickname = args.join(" ");
    for (var [id, name] of Object.entries(mentions)) {
        ID.push(id)
        nickname = nickname.replace(name, "");
    }
    for (var i of ID) setTimeout(() => api.changeNickname(nickname, threadID, i), 2000);
}