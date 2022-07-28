module.exports.info = {
	name: "load",
    permissions: 2,
    author: {
        name: "Henry",
        facebook: "https://facebook.com/s2.henry"
    },
	description: 'Dùng để load các lệnh, events hoặc configs được chỉnh sửa khi bot chạy.',
	group: "System",
	guide: [
        '<p> configs - load lại file configs',
        '<p> all - load lại tất cả',
        '<p> cmd, event [để trống/tên mdl] - load lại command hoặc event'
    ],
	countdown: 5,
    install:  ['fs']
};

module.exports.language = {
    vi: {
        type_error: 'Bạn phải nhập cmd, event, configs hoặc all.',
        configs_error: 'Đã xảy ra lỗi khi load lại file configs. Lỗi:\n%1',
        configs_success: 'Đã load file configs thành công.\n\nThời gian: %1ms',
        loader_error: 'Đã xảy ra lỗi khi load lại %1. Lỗi:\n%2',
        loader_succes: 'Đã load thành công %1.\n%2\nThời Gian: %3ms',
        error_count: 'Đã xảy ra lỗi khi load %1 %2'
    },
    en: {
        type_error: 'You have to enter cmd, event, configs or all.',
        configs_error: 'Đã xảy ra lỗi khi load lại file configs. Lỗi:',
        configs_success: 'Loaded the configs file successfully.\nTime: %1ms',
        loader_error: 'An error occurred while reloading commands or events. Error:\n%1',
        loader_succes: 'Successfully loaded %1.\n%2\n\nTime: %3ms',
        error_count: 'An error occurred while loading %1 %2'
    }
}

module.exports.start = function({ api, event, args, Cherry, Cli, Language, start_handle }) {
    var { threadID, messageID } = event;
    var { cwd: main } = Cli;
    var { readdirSync } = require("fs");
    if (!args[0]) return api.sendMessage(Language.get('load', 'type_error'), threadID, messageID);
    switch (args[0]) {
        case "configs":
            var { error } = Cherry.load_configs({ Cherry, Cli, Language });
            if (error) return api.sendMessage(Language.get('load', 'configs_error', error), threadID);
            else return api.sendMessage(Language.get('load', 'configs_success', Date.now() - start_handle), threadID);
        case "all":
            var { error: cfg } = Cherry.load_configs({ Cherry, Cli, Language });
            if (cfg) return api.sendMessage(Language.get('load', 'configs_error'), threadID);
            var commands = readdirSync(main + '/scripts/commands').filter(file => /.js$/.test(file) && !/example/.test(file) && !Cherry.configs.disabled.includes(file));
            var events = readdirSync(main + '/scripts/events').filter(file => /.js$/.test(file) && !/example/.test(file) && !Cherry.configs.disabled.includes(file));
            var data = { commands: commands, events: events };
            var { error, error_count, success_count } = Cherry.load({ Cherry, Cli, data, Language });
            if (error) return api.sendMessage(Language.get('load', 'loader_error', 'commands & events', error), threadID);
            return api.sendMessage(Language.get('load', 'loader_succes', success_count + ' commands & event', error_count > 0 ? Language.get('load', 'error_count', error_count, 'commands & event') : '', Date.now() - start_handle), threadID);
        case "cmd":
            if (args[1]) {
                args.shift();
                var data = { commands: args };
                var { error, error_count, success_count } = Cherry.load({ Cherry, Cli, data, Language });
                if (error) return api.sendMessage(Language.get('load', 'loader_error', 'commands', error), threadID);
                else return api.sendMessage(Language.get('load', 'loader_succes', success_count + ' commands', error_count > 0 ? Language.get('load', 'error_count', error_count, 'commands') : '', Date.now() - start_handle), threadID);
            } else {
                var commands = readdirSync(main + '/scripts/commands').filter(file => /.js$/.test(file) && !/example/.test(file) && !Cherry.configs.disabled.includes(file));
                var data = { commands: commands };
                var { error, error_count, success_count } = Cherry.load({ Cherry, Cli, data, Language });
                if (error) return api.sendMessage(Language.get('load', 'loader_error', 'commands', error), threadID);
                else return api.sendMessage(Language.get('load', 'loader_succes', success_count + ' commands', error_count > 0 ? Language.get('load', 'error_count', error_count, 'commands') : '', Date.now() - start_handle), threadID);
            }
        case "event":
            if (args[1]) {
                args.shift();
                var data = { events: args };
                var { error, error_count, success_count } = Cherry.load({ Cherry, Cli, data, Language });
                if (error) return api.sendMessage(Language.get('load', 'loader_error', 'events', error), threadID);
                else return api.sendMessage(Language.get('load', 'loader_succes', success_count + ' events', error_count > 0 ? Language.get('load', 'error_count', error_count, 'events') : '', Date.now() - start_handle), threadID);
            } else {
                var events = readdirSync(main + '/scripts/events').filter(file => /.js$/.test(file) && !/example/.test(file) && !Cherry.configs.disabled.includes(file));
                var data = { events: events };
                var { error, error_count, success_count } = Cherry.load({ Cherry, Cli, data, Language });
                if (error) return api.sendMessage(Language.get('load', 'loader_error', 'events', error), threadID);
                else return api.sendMessage(Language.get('load', 'loader_succes', success_count + ' events', error_count > 0 ? Language.get('load', 'error_count', error_count, 'events') : '', Date.now() - start_handle), threadID);
            }
        default:
            return { type: 'use' }
    }
}
