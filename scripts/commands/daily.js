module.exports.info = {
	name: "daily",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Báo danh hàng ngày.',
	group: "Jobs",
	guide: [''],
	countdown: 5
};

module.exports.start = async ({ event, api, Others, Cherry }) => {
    var { threadID, messageID, senderID } = event;
    var countdown = 86400000, reward = 5000;
    let { daily, coin } = await Others.getData(senderID);
    if (daily - (Date.now() - countdown) > 0) {
        var { data } = Cherry.calc_timestamp(countdown - (Date.now() - daily));
        return api.sendMessage('Bạn đang trong thời gian chờ, vui lòng chờ thêm: ' + data.full_time, threadID, messageID);
    }
    return api.sendMessage(`Bạn đã nhận ${reward} coin, bạn có thể báo danh tiếp sau 24 giờ.`, threadID, async() => {
        await Others.setData(senderID, { coin: coin + reward, daily: Date.now() });
    })
}