module.exports.info = {
	name: "buy",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Xem các lệnh được đăng bán trên Cherry Store',
	group: "System",
	guide: [''],
	countdown: 20
};

module.exports.language = {
	vi: {
		header: 'Dưới đây là các lệnh được đăng bán trên Cherry Store:\n\n',
		body: '%1. %2: %3\n',
		type: 'Tên \'%1\'',
		footer: 'Nếu bạn muốn mua lệnh, vui lòng liên hệ hotro.cherry@gmail.com hoặc https://facebook.com/s2.henry.'
	},
	en: {
		header: 'Below are the orders posted for sale on Cherry Store:\n\n',
		body: '%1. %2: %3\n',
		type: 'Name \'%1\'',
		footer: 'If you want to order commands, please contact hotro.cherry@gmail.com or https://facebook.com/s2.henry.'
	}
}

module.exports.start = function({ api, event, Cli, Language }) {
    var { threadID } = event;
    var { sell_list } = Cli, number = 1, msg = Language.get('buy', 'header');
    sell_list.forEach((element, key) => msg += Language.get('buy', 'body', number++, Language.get('buy', 'type', key), element));
    msg += Language.get('buy', 'footer');
    return api.sendMessage(msg, threadID)
}