module.exports.info = {
	name: "baicao",
	permissions: 1,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Chơi bài cào với bạn bè trong nhóm',
	group: "MiniGame",
	guide: [
        '<p> create - để tạo bàn',
        '<p> join - để tham gia khi đã có bàn',
        '<p> bet [số tiền] - để đặt số tiền cược',
        '<p> leave - để rời bàn',
        '<p> info - để xem thông tin bàn',
        '<p> start - để bắt đầu',
        'Khi đã start:',
        '<np> đổi bài - để đổi bài',
        '<np> ready - để sẵn sàng lật bài',
        '<np> nonready - để xem những người chưa lật bài'
    ],
	countdown: 5
};

module.exports.handleEvents = async ({ event, api, Users, Others, Cherry }) => {
	const { senderID, threadID, body, messageID } = event;

    if (!Cherry.baicao || !Cherry.baicao.has(threadID) || Cherry.baicao.has(threadID) && Cherry.baicao.get(threadID).start == false) return;
    var data = Cherry.baicao.get(threadID);

    if (/^[Đđ]ổi bài/.test(body)) {
		var player = data.player.find(item => item.ID == senderID);
        if (player.doibai == 2) return api.sendMessage('Bạn đã sử dụng hết lượt đổi bài.', threadID, messageID);
        if (player.ready == true) return api.sendMessage('Bạn đã ready, không thể đổi bài.', threadID, messageID);
        var total = 0, card = [];
        for (var i = 0; i < 4; i++) {
            var a = Math.floor(Math.random() * (9 - 1) + 1);
            total = total + card;
            if (total > 10) total = total % 10;
            card.push(a)
        }
        player.card = card;
        player.total = total;
        player.doibai++;
        Cherry.baicao.set(threadID, data);
        return api.sendMessage(`Bài của bạn sau khi được đổi:\n${card.join(' - ')}\nTổng bài của bạn: ${player.total} điểm.`, player.ID);
    }

    if (/^[Rr]eady/.test(body) && data.chiabai == true) {
        var player = data.player.find(item => item.ID == senderID);
        if (player.ready == true) return api.sendMessage(`Bạn đã sẵn sàng.`, threadID, messageID);
        data.ready++;
        player.ready = true;
        if (data.player.length == data.ready) {
            var players = data.player;
            players.sort((a, b) => b.tong - a.tong);
            var win = players[0];
            var rank = [], num = 1;
            for (var info of players) rank.push(`${num++} • ${info.name} với ${info.card.join(' ')}, tổng: ${info.tong} điểm\n`);
            var coin_win = data.bet * players.length;
            var { coin } = await Others.getData(win.ID)
            await Others.setData(win.ID, { coin: coin + coin_win })
            rank.push(`${win.name} thắng với ${win.tong} điểm và nhận được ${coin} coin`);
            return api.sendMessage(`${rank.join(' ')}`, threadID, messageID);
        }
        return api.sendMessage(`${player.name} đã sẵn sàng lật bài, còn lại: ${data.player.length - data.ready} người chưa sẵn sàng.`, threadID);
    }

    if (/^[Nn]onready/.test(body)) {
        var msg = [];
        for (var i of data.player) if (i.ready == false) msg.push(i.name);
        if (msg.length > 0) return api.sendMessage(`Những người chưa lật bài bao gồm: ${msg.join(' ')}.`, threadID);
    }
}

module.exports.start = async function({ api, event, Others, args, Users, Cherry, prefix }) {
	var { senderID, threadID, messageID } = event;

	if (!Cherry.baicao) Cherry.baicao = new Map();

    switch (args[0]) {
        case 'create':
        case '-c':
            if (Cherry.baicao.has(threadID)) return api.sendMessage('Nhóm này đã có một phòng bài cào khác, vui lòng join hoặc chờ bàn đó chơi xong.', threadID, messageID);
            var bet = parseInt(args[1]) ? parseInt(args[1]) : 0;
            var { coin } = await Others.getData(senderID);
            if (coin < bet) return api.sendMessage(`Số tiền bạn đặt lớn hơn số dư của bạn.`, threadID, messageID);
            var { name } = await Users.getData(senderID);
            Cherry.baicao.set(threadID, { author: senderID, author_name: name, bet: cuoc, start: false, chiabai: false, ready: 0, player: [ { ID: senderID, name: name, coin: coin, total: 0, card: '', ready: false, doibai: 0 } ] });
            return api.sendMessage(`${name} đã tạo bàn bài cào, tham gia bằng cách gửi ${prefix}baicao join`, threadID, messageID);
        case 'join':
        case '-j':
            if (!Cherry.baicao.has(threadID)) return api.sendMessage(`Nhóm này chưa có bàn bài cào nào cả.`, threadID, messageID);
            if (Cherry.baicao.get(threadID).start == true) return api.sendMessage(`Bàn bài cào này đã được bắt đầu, vui lòng chờ mọi người chơi xong.`, threadID, messageID);
            if (Cherry.baicao.get(threadID).player.find(item => item.ID == senderID)) return api.sendMessage(`Bạn đã tham gia bàn bài cào này rồi.`, threadID, messageID);
            var { coin } = await Others.getData(senderID);
            var { name } = await Others.getData(senderID);
            Cherry.baicao.get(threadID).player.push({ ID: senderID, name: name, coin: coin, total: 0, ready: false, doibai: 0 });
            return api.sendMessage(`Bạn đã tham gia bàn bài cào này thành công.`);
        case 'leave':
        case '-l':
            if (!Cherry.baicao.has(threadID)) return api.sendMessage(`Nhóm này chưa có bàn bài cào nào cả.`, threadID, messageID);
            if (Cherry.baicao.get(threadID).start == true) return api.sendMessage(`Bàn bài cào này đã được bắt đầu, vui lòng chờ mọi người chơi xong.`, threadID, messageID);
            if (!Cherry.baicao.get(threadID).player.find(item => item.ID == senderID)) return api.sendMessage(`Bạn chưa tham gia bàn bài cào của nhóm này.`, threadID, messageID);
            if (Cherry.baicao.get(threadID).author == senderID) {
                Cherry.baicao.delete(threadID);
                return api.sendMessage(`Author đã rời khỏi bàn bài cào, đồng nghĩa với việc bàn sẽ bị giải tán.`, threadID, messageID);
            } else {
                Cherry.baicao.get(threadID).player.splice(Cherry.baicao.get(threadID).player.findIndex(item => item.ID == senderID), 1);
                return api.sendMessage(`Bạn đã rời khỏi bàn bài cào này thành công.`, threadID, messageID);
            }
        case 'info':
        case '-i':
            if (!Cherry.baicao.has(threadID)) return api.sendMessage(`Nhóm này chưa có bàn bài cào nào cả.`, threadID, messageID);
            var data = Cherry.baicao.get(threadID);
            var msg = `=== Bàn Bài Cào ===\n\n- Author Bàn: ${data.author_name}.\nSố người tham gia: ${data.player.length} người.\nTiền cược: ${data.bet}`;
            return api.sendMessage(msg, threadID);
        case 'bet':
        case '-b':
            if (!Cherry.baicao.has(threadID)) return api.sendMessage(`Nhóm này chưa có bàn bài cào nào cả.`, threadID, messageID);
            if (Cherry.baicao.get(threadID).start == true) return api.sendMessage(`Bàn bài cào này đã được bắt đầu, vui lòng chờ mọi người chơi xong.`, threadID, messageID);
            if (!Cherry.baicao.get(threadID).author != senderID) return api.sendMessage(`Bạn không phải chủ phòng, không thể đặt cược.`, threadID, messageID);
            var bet = parseInt(args[1]) ? parseInt(args[1]) : 0;
            var { coin } = await Others.getData(senderID);
            if (coin < bet) return api.sendMessage(`Số tiền này lớn hơn số dư của bạn.`, threadID, messageID);
            Cherry.baicao.get(threadID).bet = bet;
            return api.sendMessage(`Đã nâng tiền đặt cược thành ${bet} coin.`, threadID);
        case 'start':
            if (!Cherry.baicao.has(threadID)) return api.sendMessage(`Nhóm này chưa có bàn bài cào nào cả.`, threadID, messageID);
            if (Cherry.baicao.get(threadID).start == true) return api.sendMessage(`Bàn bài cào này đã được bắt đầu, vui lòng chờ mọi người chơi xong.`, threadID, messageID);
            if (!Cherry.baicao.get(threadID).author != senderID) return api.sendMessage(`Bạn không phải chủ phòng, không thể bắt đầu.`, threadID, messageID);
            Cherry.baicao.get(threadID).start = true;
            return api.sendMessage(`${Cherry.baicao.get(threadID).author_name} đã bắt đầu bàn bài cào. Đang tiến hành chia bài.`, threadID, async() => {
                var { bet } = Cherry.baicao.get(threadID);
                for (var user of Cherry.baicao.get(threadID).player) {
                    var { coin } = await Others.getData(user.ID);
                    await Others.setData(user.ID, coin - bet)
                    var total = 0, card = [];
                    for (var i = 0; i < 4; i++) {
                        var a = Math.floor(Math.random() * (9 - 1) + 1);
                        total = total + card;
                        if (total > 10) total = total % 10;
                        card.push(a)
                    }
                    user.card = card;
                    user.total = total;
                    api.sendMessage(`Bài của bạn sau 3 lần chia:\n${card.join(' - ')}\nTổng bài của bạn: ${total} điểm`, user.ID, (error) => {
                        if (error) api.sendMessage(`Không thể chia bài cho người dùng: ${user.name}.`, threadID);
                    })
                }
                Cherry.baicao.get(threadID).chiabai = true;
                return api.sendMessage("» Đã chia bài rồi đó «\n\n📌Kiểm tra tin nhắn chờ, spam\n🙏Mỗi người có 2 lần đổi bài\nNếu bài nhỏ, nhập 'đổi bài'\n👉Để lật bài, nhập 'ready'", threadID);
            }, messageID);
        default:
            return { type: 'use' };
    }
}
