module.exports.info = {
    name: "help",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Xem hướng dẫn sử dụng lệnh',
	group: "System",
	guide: [
		'<p> Để trống/tên lệnh',
        '<ex> info',
        '<np> tên lệnh',
        '<np> prefix'
	],
	countdown: 20
};

module.exports.language = {
    page_count: 20,
    vi: {
        string: '●─── Cherry Bot ───●\n',
        empty_page: 'Trang bạn nhập không có lệnh nào, vui lòng kiểm tra và thử lại.',
        message_commands_info: 'Tên Lệnh: %1.\n📜 Mô Tả: %2.\n⏳ Thời Gian Chờ: %3 giây/người.\n✊ Quyền Hạn: %4\n📄 Hướng dẫn: %5\n',
        info_one_commands: '%1. Tên Lệnh: %2\nMô Tả: %3%4',
        footer: '%1📜 Trang: %2/%3\n🍀 Có %4 lệnh có thể sử dụng.\n%1➴ Gửi %5help [số trang] để xem danh sách lệnh tại trang đó.\n➴ Gửi %5help [tên lệnh] để xem chi tiết cách sử dụng lệnh.',
        author: '© Tác Giả: ',
        not_found_tut: 'Không tìm thấy hướng dẫn',
        '<np>': '',
        perm: ['Người Dùng Trở Lên', 'Quản Trị Viên Trở Lên', 'Chỉ ADMIN Bot'],
        view_prefix: "Bạn có thể sử dụng '%1' trước tên lệnh. Ví Dụ: %1help"
    },
    en: {
        string: '●─── Cherry Bot ───●\n',
        empty_page: 'The page you entered has no commands, please check and try again.',
        message_commands_info: 'Commands Name: %1.\n📜  Description: %2.\n⏳ Count Down: %3 seconds/user.\n✊ Permission: %4\n📄 Guide: %4',
        info_one_commands: '%1. Commands Name: %2\nDescription: %3%4',
        footer: '%1📜 Page: %2/%3\n🍀 The %4 command can be used.\n%1➴ Send %5help [page number] to see the list of commands at that page.\n➴ Send %5help [command name] for details on how to use the command.',
        author: '© Author: ',
        not_found_tut: 'Not found tutorials',
        perm: ['Users and Up', 'ADMIN and Up', 'Only ADMIN Bot'],
        view_prefix: "You can use '%1' before the command name. Example: %1help"
    }
}

module.exports.handleEvents = async function ({ api, event, Threads, Cli, Cherry, Language }) {
    var { threadID, messageID, body } = event;
    if (/^[hH]elp/.test(body)) {
        var { commands } = Cli;
        var splitBody = body.split(" ");
        if (splitBody.length > 1 && commands.has(splitBody[1].toLowerCase())) {
            var command = commands.get(splitBody[1].toLowerCase()), { prefix } = await Threads.getData(threadID) || Cherry.configs, author = [];
            for (var [key, value] of Object.entries(command.info.author)) author.push(`${key.replace('name', Language.get('help', 'author')).replace(/[Ff]acebook/, 'Facebook').replace(/[Ii]nstagram/, 'Instagram').replace(/[Yy]outube/, 'Youtube').replace(/[Gg]ithub/, 'Github').replace(/[Tt]witter/, 'Twitter').replace(/[Ee]mail/, 'Email').replace(/[Tt]elegram/, 'Telegram').replace(/[Zz]alo/, 'Zalo')}: ${value}`);
            return api.sendMessage(Language.get('help', 'message_commands_info', command.info.name, command.info.description, command.info.countdown, Language.get('help', 'perm')[command.info.permissions], command.info.guide.length > 0 ? command.info.guide.join('\n').replace(/<ex>/g, `Ví Dụ: ${prefix}${command.info.name}`).replace(/<np>/g, 'Không sử dụng prefix:').replace(/<p>/g, `${prefix}${command.info.name}`) : Language.get('help', 'not_found_tut')) + '\n\n' + author.join('\n'), threadID, (error, info) => Cherry.autoUnsend(info.messageID, 180000), messageID);
        }
    }
    if (/^[pP]refix/.test(body)) {
        var { prefix } = await Threads.getData(threadID);
        return api.sendMessage(Language.get('help', 'view_prefix', prefix ? prefix : Cherry.configs.prefix), threadID);
    }
}

module.exports.start = async function({ api, event, args, Cli, Cherry, prefix, Language }) {
    var { threadID, messageID } = event;
    var { commands } = Cli;
    var command = commands.get((args[0] || "").toLowerCase());
    if (!command || !args[0]) {
        var page_number = parseInt(args[0]) ? parseInt(args[0]) - 1 : 0;
        var numberOfPage = page_number + 1, page = [], infoCommands = [], totalCommands = 0, number = 1;
        commands.forEach((value, key) => {
            if (!value.info.hide || value.info.hide == false) {
                infoCommands.push(Language.get('help', 'info_one_commands', number++, key, value.info.description, number % this.language.page_count == 0 || number - 1 == Cli.commands.size ? '\n' : '\n\n'));
                totalCommands++;
            }
            if (infoCommands.length == this.language.page_count) {
                page.push(infoCommands);
                infoCommands = [];
            }
        });
        page.push(infoCommands);
        var pageView = page[page_number], number = this.language.page_count * numberOfPage - this.language.page_count + 1;
        if (!pageView || pageView.length == 0) return api.sendMessage(Language.get('help', 'empty_page'), threadID, messageID);
        return api.sendMessage(Language.get('help', 'string') + pageView.join(' ') + Language.get('help', 'footer', Language.get('help', 'string'), page_number + 1, Math.ceil((page.length * this.language.page_count) / this.language.page_count), totalCommands, prefix), threadID, (err, info) => Cherry.autoUnsend(info.messageID, 180000), messageID);
    }
    var author = [];
    for (var [key, value] of Object.entries(command.info.author)) if (value) author.push(`${key.replace('name', Language.get('help', 'author')).replace(/[Ff]acebook/, 'Facebook').replace(/[Ii]nstagram/, 'Instagram').replace(/[Yy]outube/, 'Youtube').replace(/[Gg]ithub/, 'Github').replace(/[Tt]witter/, 'Twitter').replace(/[Ee]mail/, 'Email').replace(/[Tt]elegram/, 'Telegram').replace(/[Zz]alo/, 'Zalo')}: ${value}`);
    return api.sendMessage(Language.get('help', 'message_commands_info', command.info.name, command.info.description, command.info.countdown, Language.get('help', 'perm')[command.info.permissions], command.info.guide.length > 0 ? command.info.guide.join('\n').replace(/<ex>/g, `Ví Dụ: ${prefix}${command.info.name}`).replace(/<np>/g, 'Không sử dụng prefix:').replace(/<p>/g, `${prefix}${command.info.name}`) : Language.get('help', 'not_found_tut')) + '\n\n' + author.join('\n'), threadID, (error, info) => Cherry.autoUnsend(info.messageID, 180000), messageID);
}
