module.exports.info = {
	name: "welcome",
    permissions: 1,
    author: {
        name: "Henry",
        facebook: "https://facebook.com/s2.henry"
    },
	description: 'Đổi, xem tin nhắn chào mừng thành viên mới',
	group: "Box Settings",
	guide: [
		'[gif/text] [Lời chào/link]',
	],
	countdown: 5
};

module.exports.language = {
    vi: {
        save: 'Đã lưu tùy chỉnh tin nhắn chào mừng thành công, dưới đây là phần preview:',
        members_name: '[Tên Thành Viên]',
        type: '[Bạn/Các Bạn]',
        totalMembers: '[Số Thành Viên]',
        thread_name: '[Tên Nhóm]',
        prefix: '[Prefix]',
        session: '[Buổi]',
        not_found_gif: 'Nhóm của bạn chưa đặt gif chào mừng.',
        delete_gif: 'Đã xóa gif chào mừng của nhóm thành công.',
        not_found_customized: 'Nhóm này chưa đặt tin nhắn chào mừng.',
        view: 'Dưới đây là tin nhắn chào mừng của nhóm:',
        gif_ext: 'Bạn cần nhập link của file gif, có phần mở rộng là: gif, GIF',
        error_download: 'Đã có lỗi xảy ra khi tải file gif này. Lỗi:\n\n',
        success: 'Đã tải file gif thành công, dưới đây là file gif đã được tải:'
    },
    en: {
        save: 'Customized welcome message has been saved successfully, here is the preview:',
        members_name: '[Members Name]',
        type: '[One or Many Members]',
        totalMembers: '[Total Members]',
        thread_name: '[Group Name]',
        prefix: '[Prefix]',
        session: '[Session]',
        not_found_gif: "Your group hasn't set a welcome gif yet.",
        delete_gif: 'The group welcome gif was successfully deleted.',
        not_found_customized: 'This group has not set a welcome message.',
        gif_ext: 'You need to enter the link of the gif file, with the extension: gif, GIF',
        error_download: 'An error occurred while downloading this gif file. Error:\n\n',
        success: 'Gif file downloaded successfully, here is the downloaded gif file:'
    }
}

module.exports.onLoad = function () {
    var { existsSync, mkdirSync } = require("fs");

    var path = `${process.cwd()}/scripts/events/cache/`;
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

module.exports.start = async function ({ args, event, api, Threads, Cherry }) {
    var { existsSync, createReadStream } = require("fs");
    var { threadID, messageID } = event;
    var msg = args.slice(1).join(" ");

    switch (args[0]) {
        case "text":
            await Threads.setData(threadID, { msgWelcome: msg });
            return api.sendMessage(Language.get('welcome', 'save'), threadID, function () {
                msg = msg
                .replace(/\{name}/g, Language.get('welcome', 'members_name'))
                .replace(/\{type}/g, Language.get('welcome', 'type'))
                .replace(/\{totalMembers}/g, Language.get('welcome', 'totalMembers'))
                .replace(/\{threadName}/g, Language.get('welcome', 'thread_name'))
                .replace(/\{prefix}/g, Language.get('welcome', 'prefix'))
                .replace(/\{session}/g, Language.get('welcome', 'session'));
                return api.sendMessage(msg, threadID);
            });
        case "gif":
            var path = `${process.cwd()}/scripts/events/cache/${threadID}.gif`;
            if (msg == "remove") {
                if (!existsSync(path)) return api.sendMessage(Language.get('welcome', 'not_found_gif'), threadID, messageID);
                else unlinkSync(path);
                return api.sendMessage(Language.get('welcome', 'delete_gif'), threadID, messageID);
            } else {
                if (!msg.test(/(http(s?):)([/|.|\w|\s|-])*\.(?:gif|GIF)/g)) return api.sendMessage(Language.get('welcome', 'gif_ext'), threadID, messageID);
                try {
                    await Cherry.download(msg, path);
                } catch (e) {
                    return api.sendMessage(Language.get('welcome', 'error_download'), threadID, messageID);
                }
                return api.sendMessage({ body: Language.get('welcome', 'success'), attachment: createReadStream(path) }, threadID, messageID);
            }
        case "view":
            var { msgWelcome } = await Threads.getData(threadID);
            var msg = { body: msgWelcome ? msgWelcome : Language.get('welcome', 'welcome_users', '[Tên Thành Viên]', '[Tên Nhóm]', '[Bạn/Các Bạn]', '[Số Thành Viên]', '[Thời Gian]', '[Prefix]'), attachment: existsSync(path) ? createReadStream(path) : '' };
            msg.body = msg.body
            .replace(/\{name}/g, Language.get('welcome', 'members_name'))
            .replace(/\{type}/g, Language.get('welcome', 'type'))
            .replace(/\{totalMembers}/g, Language.get('welcome', 'totalMembers'))
            .replace(/\{threadName}/g, Language.get('welcome', 'thread_name'))
            .replace(/\{prefix}/g, Language.get('welcome', 'prefix'))
            .replace(/\{session}/g, Language.get('welcome', 'session'));
            return api.sendMessage(msg, threadID)
        default: 
            return { type: 'use' }
    }
}
