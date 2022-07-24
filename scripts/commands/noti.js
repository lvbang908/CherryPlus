module.exports.info = {
	name: "noti",
    permissions: 2,
    author: {
        name: "Henry",
        facebook: "https://facebook.com/s2.henry"
    },
	description: 'Gửi thông báo',
	group: "Dành Cho Quản Lí",
	guide: ['<p> all + thông báo', '<p> + thông báo', '<ex> all Xin chào mọi người'],
	countdown: 5
};

module.exports.start = async({ api, event, args, Threads, Users, Cherry }) => {
    var { threadID, messageID, senderID, type, messageReply } = event;
    if (args[0] == 'all') {
        var allThread = await Threads.getAll(['ID', 'isGroup']);
        allThread = allThread.filter(item => item.isGroup == true);
        var count = 0, err = 0, { name } = await Users.getData(senderID), attachment = [];
        var { createReadStream, unlinkSync } = require('fs');
        if (args.length < 2) return api.sendMessage("Bạn cần nhập thông báo.", threadID, messageID);
        if (type == 'message_reply' && messageReply.attachments.length > 0) {
            var data = await Cherry.save_attachments(messageReply.attachments, __dirname + '/cache/');
            if (data.error) return api.sendMessage(`Đã xảy ra lỗi khi lấy attachments. Lỗi: \n${data.error}`, threadID);
            else for (var i of data.path) attachment.push(createReadStream(i));
        }
        for (var thread of allThread) {
            var { participantIDs } = await Threads.getInfo(thread.ID), mention = [];
            for (var i of participantIDs) mention.push({ id: i, tag: '» Thông Báo «' });
            var msg = { body: `» Thông Báo «\n\n${args.slice(1).join(' ')}\n\n${name == "Chử Xuân Hòa" ? "" : "Gửi Từ: " + name}`, mentions: mention, attachment: attachment };
            api.sendMessage(msg, thread.ID, (error) => {
                if (error) err++;
                else count++;
                if (count + err == allThread.length) {
                    if (type == 'message_reply' && messageReply.attachments.length > 0 && data.path.length > 0) for (var i of data.path) unlinkSync(i);
                    return api.sendMessage(`Đã gửi thông báo đến ${count} nhóm thành công.\n\nKhông thể gửi đến ${err} nhóm.`, threadID);
                }
            });
        }
    } else {
        var { participantIDs } = await Threads.getInfo(threadID);
        var msg = `» Thông Báo «\n\n${args.length > 0 ? args.join(' ') : 'Cầu các con giời hiện hồn'}`, mention = [];
        for (var i of participantIDs) mention.push({ id: i, tag: '» Thông Báo «' });
        return api.sendMessage({ body: msg, mentions: mention }, threadID);
    }
}
