module.exports.info = {
	name: "Tên Lệnh",
	permissions: 1,
	author: {
		name: "Tên Bạn",
		facebook: "Link FB hoặc để trống",
        telegram: '',
        instagram: '',
        github: '',
        youtube: '',
        twitter: '',
        email: '',
        zalo: ''
	},
	description: '',
	group: "Nhóm lệnh",
	guide: ['<p> để thêm prefix ở trước hướng dẫn', '<np> sẽ không sử dung prefix', '<ex> là ví dụ'],
	countdown: 5, //Thời gian mà một người có thể sử dụng lại lệnh.
    require: ['lib1', 'lib2']
};

module.exports.languague = {
    //Bắt buộc phải là 1 Object
    'Language_name': {
        variable_name: 'text'
    },
    'Language_name': {
        variable_name: 'text'
    }
}

module.exports.start = async function({ api, Cherry, event, Cli, args, Users, Threads, Others, permission, prefix, start_handle }) {
    //Function này được gọi khi người dùng sử dụng đúng tên lệnh
    //Return Object
    //Ex: return { type: 'use' }
}

module.exports.handleEvents = async function({ event, api, Cherry, Cli, Users, Threads, Others }) {
    //Function này được gọi khi có một event mới
}

module.exports.handleReply = async function({ api, Cherry, Cli, event, Users, Threads, Others, Reply }) {
    //Function này được gọi khi người dùng reply tin nhắn
    //Với điều kiện trong Cli.handleReply có thuộc tính chứa ID của tin nhắn và tên lệnh này.
    //Biến Reply chứa các dữ liệu mà tin nhắn đó cần để thực thi(console.log(Reply) để biết thêm)
}

module.exports.handleReaction = async function({ api, Cherry, Cli, event, Users, Threads, Others, Reaction }) {
    //Function này được gọi khi người dùng thả cảm xúc vào tin nhắn
    //Với điều kiện trong Cli.handleReaction có thuộc tính chứa ID của tin nhắn và tên lệnh này.
    //Biến Reaction chứa các dữ liệu mà tin nhắn đó cần để thực thi (console.log(Reaction) để biết thêm)
}

module.exports.onLoad = async function({ Cherry, Cli }) {
    //Mọi thứ trong function này sẽ được thực thi trước khi Bot được đăng nhập
}