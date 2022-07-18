module.exports.info = {
	name: "rule",
	permissions: 2,
	author: {
		name: "Henry",
		facebook: "https://facebook.com/s2.henry"
	},
	description: 'Xem, tạo, xóa luật riêng của từng nhóm',
	group: "Khác",
	guide: [
        '<p>',
        '<p> add/delete',
        '<ex> add Đây là luật số 1.'
    ],
	countdown: 5
};

module.exports.language = {
    vi: {
        new_rule: 'Đã thêm 1 rule mới cho nhóm này. Dưới đây là danh sách các rule hiện tại của nhóm:',
        no_rule: 'Hiện tại, nhóm này chưa có rule nào cả.',
        isNumber: 'Lựa chọn của bạn phải là một số và là số nguyên dương.',
		not_in_list: 'Lựa chọn của bạn không nằm trong danh sách',
        delete: 'Đã xóa thành công 1 rule của nhóm này.\n%1',
        remaining: 'Dưới đây là các rule còn lại sau khi xóa:',
        view: 'Dưới đây là nội quy của nhóm %1:\n\n'
    },
    en: {
        new_rule: 'Added a new rule for this group. Here is a list of the current group rules:',
        no_rule: 'Currently, this group has no rules.',
        isNumber: 'Your select must be a number and is a positive integer.',
		not_in_list: 'Your select not in the list',
        delete: 'Successfully deleted 1 rule of this group.\n%1',
        remaining: 'Here are the remaining rules after deletion:',
        view: 'Here are the group rules %1:\n\n'
    }
}

module.exports.onLoad = function() {
    var { existsSync, mkdirSync, writeFileSync } = require('fs');
    var path = __dirname + '/cache';
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    if (!existsSync(path + '/rule.json')) writeFileSync(path + '/rule.json', '{}', { flag: 'a+' });
}

module.exports.start = async function({ api, event, args, Threads, Language }) {
    var { threadID, messsageID } = event;
    var { readFileSync, writeFileSync } = require('fs');
    var rule = JSON.parse(readFileSync(__dirname + '/cache/rule.json', 'utf8'));
    switch (args[0]) {
        case 'add':
            var newRule = args.slice(1).join(' ');
            if (rule.hasOwnProperty(threadID)) rule[threadID].push(newRule);
            else rule = Object.assign(rule, { [threadID]: [`${newRule}`] });
            writeFileSync(__dirname + '/cache/rule.json', JSON.stringify(rule, null, 4));
            return api.sendMessage(Language.get('rule', 'new_rule'), threadID, () => {
                var msg = ``, number = 1;
                for (var i of rule[threadID]) msg += `${number++}. ${i}\n`;
                return api.sendMessage(msg, threadID);
            }, messsageID);
        case 'delete':
            if (!rule.hasOwnProperty(threadID) || rule[threadID].length == 0) return api.sendMessage(Language.get('rule', 'no_rule'), threadID, messsageID);
            if (!args[1] || !parseInt(args[1])) return api.sendMessage(Language.get('rule', 'isNumber'), threadID, messsageID);
            if (!rule[threadID].length < args[1] - 1) return api.sendMessage(Language.get('rule', 'not_in_list'), threadID, messsageID);
            var DRL = rule[threadID][args[1] - 1];
            rule[threadID] = rule[threadID].filter(i => i != DRL);
            writeFileSync(__dirname + '/cache/rule.json', JSON.stringify(rule, null, 4));
            return api.sendMessage(Language.get('rule', 'delete', rule[threadID].length > 0 ? Language.get('rule', 'remaining') : Language.get('rule', 'no_rule')), threadID, () => {
                if (rule[threadID].length > 0) {
                    var msg = ``, number = 1;
                    for (var i of rule[threadID]) msg += `${number++}. ${i}\n`;
                    return api.sendMessage(msg, threadID);
                }
            }, messsageID);
        default:
            if (!rule.hasOwnProperty(threadID) || rule[threadID].length == 0) return api.sendMessage(Language.get('rule', 'no_rule'), threadID, messsageID);
            var ROT = rule[threadID], { name } = await Threads.getData(threadID);
            var msg = Language.get('rule', 'view', name || ''), number = 1;
            for (var i of ROT) msg += `${number++}. ${i}\n`;
            return api.sendMessage(msg, threadID, messsageID);
    }
}