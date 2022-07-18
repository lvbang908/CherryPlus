module.exports.info = {
	name: "work",
    permissions: 1,
    author: {
        name: "Henry",
        facebook: "https://facebook.com/s2.henry"
    },
	description: 'Làm việc kiếm tiền.',
	group: "Jobs",
	guide: [''],
	countdown: 5
};

module.exports.language = {
    vi: {
        cooldown: 'Bạn đang trong thời gian chờ, vui lòng chờ thêm: %1',
        jobs: ["đi bán vé số", "đi sửa xe", "làm nhân viên lập trình", "đi hack facebook", "làm thợ sửa ống nước ( ͡° ͜ʖ ͡°)", "làm đầu bếp", "làm thợ hồ", "làm fake taxi", "đi gangbang người khác", "làm streamer", "đi bán hàng online", "làm nội trợ", "đi vả mấy thằng sao đỏ, giun vàng", "đi bán hoa", "tìm jav/hentai code cho Boss", "đi chơi rank gánh team", "gánh Boss lên HT + 1 sao", "cho Boss in4 gái xinh", "giới thiệu gái cho Boss", "làm culi cho Boss", "chơi game cùng Boss", "tìm người yêu cho Boss", "nạp game cho Boss", "dẹp loạn cho Quân Đoàn", "đấm kì cựu", "đấm mấy đứa phát cơm tró", "đấm mấy thằng hay chửi bậy trong box", "vả kì cựu", "nạp kim cương", "tập làm proplayer", "đi solo win", "gánh team tử chiến rank", "tán gái hộ Boss", "làm ca sĩ", "làm nhà thơ", "làm quảng cáo", "đi tuyển thành viên cho Quân Đoàn", "đi chơi", "đi tán mấy bé bò sữa trong game", "đi gạ người khác chơi gay thành công"],
        body: 'Bạn %1 và nhận được số tiền là: %2 coins.'
    },
    en: {
        cooldown: 'You are in the waiting period, please wait for more: %1',
        jobs: ['hacker', 'developer'],
        body: 'You %1 and get the amount: %2 coins.'
    }
}

module.exports.start = async ({ event, api, Others, Cherry, Language }) => {
    const { threadID, messageID, senderID } = event;
    const cooldown = 1200000;
    var { work_time, coin } = await Others.getData(senderID);
    if (cooldown - (Date.now() - work_time) > 0) {
        var { data } = Cherry.calc_timestamp(cooldown - (Date.now() - work_time));
        return api.sendMessage(Language.get('work', 'cooldown', data.full_time), threadID)
    }
    var job = Language.get('work', 'jobs')[Math.floor(Math.random() * Language.get('work', 'jobs').length)];
    var amount = Cherry.getRandomNumber(100, 10000);
    return api.sendMessage(Language.get('work', 'body', job, amount), threadID, async() => {
        await Others.setData(senderID, { coin: coin + amount, work_time: Date.now() })
    }, messageID);
}