module.exports.info = {
	name: "info",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Xem thông tin về Bot, thành viên, nhóm',
	group: "System",
	guide: [
		'<p> Để trống',
        '<p> users [tag/để trống]',
        '<p> threads [all/để trống]',
        '<ex> threads'
	],
	countdown: 5,
	install: ['os']
};

module.exports.language = {
    vi: {
        default: `======= Cherry Infomations =======\nBắt Đầu Hoạt Động: %1.\nĐã Hoạt Động: %2\n\nTổng Nhóm Trong Database: %3 nhóm.\nTổng Người Dùng Trong Database: %4 người.\nTổng Số Lệnh: %5\n\nPrefix Mặc Định: %6\nPrefix Của Nhóm: %7\n\n%8\n%9\nPing: %10ms`,
        os: '======= Thông Tin Máy Chủ =======\nTên Máy Chủ: %1\nChip: %2\nTốc Độ Xử Lí: %3MHz\n\nTổng Bộ Nhớ: %4\nĐã Sử Dụng: %5\n',
        no_prefix: 'Chưa Đặt',
        no_emoji: 'Chưa Đặt',
        users_informations: `<3 %1 <3\n\nTên: %1\nBiệt Danh: %2\nGiới Tính: %3\nMối Quan Hệ: %4\nProfile: https://www.facebook.com/%5\n\n`,
        threads_informations: '\n<3 %1 <3\nTên Nhóm: %1\nBiểu Tượng Cảm Xúc: %2\nThành Viên: %3/%4 người\nTổng Số Tin Nhắn: %5\nQuản Trị Viên: %6 người\nNgày Tạo Dữ Liệu: %7\n\n',
        no_name: 'Chưa Đặt Tên'
    },
    en: {
        default: `======= Cherry Infomations =======\nStart Time: %1.\nStarted: %2\n\nTotal Group In Database: %3 groups.\nTotal Users In Database: %4 users.\nTotal Commands: %5\n\nDefault Prefix: %6\nGroup Prefix: %7\n\n%8\n%9\nPing: %10ms`,
        os: `======= Server Infomations =======\nHost Name: %1\nChip: %2\nProcessing Speed: %3MHz\n\nTotal Storage: %4\nUsage: %5\n`,
        no_prefix: 'No Prefix',
        no_emoji: 'No Emoji',
        users_informations: `<3 %1 <3\n\nUsers Name: %1\nNickname: %2\nGender: %3\nDating: %4\nProfile: https://www.facebook.com/%5\n\n`,
        threads_informations: '<3 %1 <3\nGroup Name: %1\nEmoji: %2\nMembers: %3/%4 users\nTotal Message: %5\nADMIN: %6 users\nDatabase Created Time: %7\n\n',
        no_name: 'No Name'
    }
}

module.exports.start = async function({ api, args, event, Cli, Cherry, Threads, Users, Language, start_handle }) {
    var { threadID, senderID, messageID, mentions } = event;
    switch (args[0]) {
        case 'users':
        case '-u':
            var { members } = await Threads.getData(threadID);
            if (Object.keys(mentions).length == 0) {
                var info = await Users.getData(senderID);
                return api.sendMessage(Language.get('info', 'users_informations', info.name, members[senderID].bietdanh, info.gioitinh, info.hasOwnProperty('dating') && info.dating.status == true ? "Đang Hẹn Hò" : "Độc Thân", info.facebookID), threadID, messageID);
            }
            for (var i of Object.keys(mentions)) {
                var info = await Users.getData(i), msg = '';
                msg += Language.get('info', 'users_informations', info.name, members[senderID].bietdanh, info.gioitinh, info.hasOwnProperty('dating') && info.dating.status == true ? "Đang Hẹn Hò" : "Độc Thân", info.facebookID);
            }
            return api.sendMessage(msg, threadID);
        case "threads":
        case '-t':
            if (args[1] == 'all') {
                var allThreads = await Threads.getAll(['name', 'emoji', 'members', 'totalMsg', 'adminIDs', 'createTime', 'isGroup']), msg = '';
                allThreads = allThreads.filter(item => item.isGroup == true);
                for (var i of allThreads) {
                    var { participantIDs } = await Threads.getInfo(i.ID);
                    msg += Language.get('info', 'threads_informations', i.name ? i.name : i.ID, i.emoji ? i.emoji : Language.get('info', 'no_emoji'), Object.keys(i.members).length, participantIDs.length, i.totalMsg, i.adminIDs.length, i.createTime.fullTime);
                }
                return api.sendMessage(msg, threadID);
            } else {
                var info = await Threads.getData(threadID), { participantIDs } = await Threads.getInfo(threadID), msg = '';
                return api.sendMessage(Language.get('info', 'threads_informations', info.name ? info.name : threadID, info.emoji ? info.emoji : Language.get('info', 'no_emoji'), Object.keys(info.members).length, participantIDs.length, info.totalMsg, info.adminIDs.length, info.createTime.fullTime), threadID, messageID);
            }
        default:
            function handleByte(byte) {
                const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                let i = 0, usage = parseInt(byte, 10) || 0;
                while(usage >= 1024 && ++i) usage = usage/1024;
                return(usage.toFixed(usage < 10 && i > 0 ? 1 : 0) + ' ' + units[i]);
            }
            function handleOS() {
                var os = require("os");
                var cpus = os.cpus().shift();
                var speed = cpus.speed, chips = cpus.model;
                if (cpus != undefined) return Language.get('info', 'os', os.hostname, chips, speed, handleByte(os.totalmem()), `${handleByte(os.freemem())} (${(os.freemem() * 100 / os.totalmem()).toFixed()}%)`);
            }
            var threadInfo = await Threads.getData(event.threadID);
            var threads_prefix = threadInfo.prefix ? threadInfo.prefix : Language.get('info', 'no_prefix');
            var { time_start } = Cli;
            var { data } = Cherry.calc_timestamp(Date.now() - time_start.timestamp);
            var info = handleOS();
            return api.sendMessage(Language.get('info', 'default', time_start.full_time, data.full_time, Cli.threads.size, Cli.users.size, Cli.commands.size, Cherry.configs.prefix, threads_prefix, info ? info : '', Language.view_informations(), Date.now() - start_handle), threadID, (err, info) => Cherry.autoUnsend(info.messageID, 120000), messageID);
    }
}