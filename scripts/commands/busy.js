module.exports.info = {
	name: "busy",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Nếu bạn bận, hãy dùng cái này.',
	group: "Dành Cho Thành Viên",
	guide: [
		'[để trống hoặc thêm lí do]',
	],
	countdown: 20
};

module.exports.onLoad = function({ Cli }) {
    if (!Cli.busy) Cli.busy = new Map();
}

module.exports.handleEvents = async function({ api, event, Cli, Users }) {
    var { senderID, threadID, messageID, mentions } = event;
    var { busy } = Cli;
    if (!busy) return;
    if (busy.has(senderID)) {
        var info = await Users.getData(senderID);
        delete info.active;
        await Users.setData(senderID, info);
        return api.sendMessage(`Chào mừng bạn đã quay trở lại! 🥰`, threadID, () => {
            var info = busy.get(senderID);
            if (info.tag.length == 0) api.sendMessage("Trong lúc bạn đi vắng, không có ai nhắc đến bạn cả!", threadID);
            else {
                var msg = "";
                for (var i of info.tag) {
                    msg += `${i}\n`
                }
                api.sendMessage("Đây là danh sách những tin nhắn bạn được tag trong khi bạn đi vắng:\n\n" + msg, threadID)
            }
            busy.delete(senderID);
        }, messageID);
    }

    if (!mentions || Object.keys(mentions).length == 0 || senderID == api.getCurrentUserID()) return;
    
    for (const [ID, name] of Object.entries(mentions)) {
        if (busy.has(ID)) {
            var infoBusy = busy.get(ID), mentioner = await Users.getData(senderID), replaceName = event.body.replace(`${name}`, "");
            infoBusy.tag.push(`${mentioner.name}:${replaceName == "" ? " Đã tag bạn 1 lần" : replaceName}`)
            busy.set(ID, infoBusy)
            await Users.setData(ID, { active: infoBusy })
            api.sendMessage(`${name.replace("@", "")} hiện đang bận${infoBusy.lido ? ` với lý do: ${infoBusy.lido}.` : "."}`, threadID, messageID);
        }
    }
}

module.exports.start = async function({ api, args, event, Cli, Users, Cherry }) {
    var fullTime = await Cherry.getTime('FT');
    var { threadID, senderID, messageID, body } = event;
    var data = await Users.getData(senderID);
    var content = args.join(" "), msg = "";
    if (!data.active || data.active.status == false) {
        await Users.setData(senderID, {
            active: {
                status: true,
                lido: content,
                date: fullTime,
                tag: []
            }
        });
        Cli.busy.set(senderID, {
            status: true,
            lido: content,
            date: fullTime,
            tag: []
        })
    }
    content.length == 0 ? msg += 'Bạn đã bật chế độ busy mà không có lí do' : msg += `Bạn đã bật chế độ busy với lí do: ${content}`;
    return api.sendMessage(msg, threadID, messageID);
}