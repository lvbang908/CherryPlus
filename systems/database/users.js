module.exports = function ({ Cherry, api, Language }) {
    const { readFileSync, writeFileSync } = require("fs");
    var fullTime = Cherry.getTime("fullTime");
    const { log } = Cherry;
    var path = __dirname + "/data/usersData.json";

    try {
        var usersData = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        writeFileSync(path, "{}", { flag: 'a+' });
    }

    async function saveData(data) {
        try {
            if (!data) throw new Error(Language.get('database', 'undefined_data'))
            writeFileSync(path, JSON.stringify(data, null, 4))
        } catch (error) {
            return log("SAVE DATA", error, 'error')
        }
    }
    
	async function createData(userID, callback) {
		try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            var userInfo = await getInfo(userID);
            if (usersData.hasOwnProperty(userID)) throw new Error(Language.get('database', 'hasUserID'));
            var data = {
                [userID]: {
                    ID: userID,
                    name: userInfo.name,
                    facebookID: userInfo.vanity || userID,
                    gioitinh: userInfo.gender == 1 ? "Nữ" : "Nam",
                    isBirthday: userInfo.isBirthday,
                    createTime: {
                        timestamp: Date.now(),
                        fullTime: fullTime
                    },
                    lastUpdate: Date.now()
                }
            }
            Object.assign(usersData, data);
            await saveData(usersData);
            if (callback && typeof callback == "function") callback(null, data);
            return data[userID];
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - CREATE DATA", error, "error");
        }
	}

	async function getAll(keys, callback) {
		try {
            if (!keys) {
                if (Object.keys(usersData).length == 0) return [];
                else if (Object.keys(usersData).length > 0) {
                    var db = [];
                    for (var i of Object.keys(usersData)) db.push(usersData[i]);
                    return db;
                }
            }
            if (!Array.isArray(keys)) throw new Error(Language.get('database', 'isArray'));
            const data = [];
            for (var userID in usersData) {
                var database = { ID: userID };
                var userData = usersData[userID];
                for (var i of keys) database[i] = userData[i];
                data.push(database);
            }
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - GET ALL DATA", error, "error");
        }
	}

	async function getData(userID, callback) {
		try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            if (!usersData.hasOwnProperty(userID)) await createData(userID);
            const data = usersData[userID];
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - GET DATA", error, "error");
        }
	}

	async function setData(userID, options, callback) {
		try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            if (!usersData.hasOwnProperty(userID)) await createData(userID);
            if (typeof options != 'object') throw new Error(Language.get('database', 'isArray'));
            usersData[userID] = {...usersData[userID], ...options};
            await saveData(usersData);
            if (callback && typeof callback == "function") callback(null, dataUser[userID]);
            return usersData[userID];
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - SET DATA", error, "error");
        }
	}

	async function delData(userID, callback) {
		try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            if (!usersData.hasOwnProperty(userID)) throw new Error(Language.get('database', 'notfound_userID', userID));
            delete usersData[userID];
            await saveData(usersData);
            if (callback && typeof callback == "function") callback(null, usersData);
            return usersData;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("USERS - REMOVE DATA", error, "error");
        }
	}
    
    async function getInfo(userID) {
		try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            var userInfo = await api.getUserInfo(userID);
            return userInfo[userID];
		} catch (error) {
			return log('USERS - GET INFO', error, "error");
		}
	}

    async function refreshData(userID) {
        try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            if (!usersData.hasOwnProperty(userID)) throw new Error(Language.get('database', 'notfound_userID', userID));
            var userInfo = await getData(userID);
            var newUserData = await getInfo(userID);
            var str = { facebookID: 'vanity', gioitinh: 'gender' };
            for (var key of Object.keys(userInfo)) {
                var new_key = Object.keys(str).includes(key) ? str[key] : key;
                userInfo[key] = newUserData.hasOwnProperty(new_key) ? newUserData[new_key] : userInfo[key];
            }
            userInfo.gioitinh = newUserData.gender == 1 ? "Nữ" : "Nam";
            userInfo.lastUpdate = Date.now();
            await setData(userID, userInfo);
        } catch (error) {
            return log("USERS - REFRESH DATABASE", error, 'error')
        }
    }

	return {
		createData,
		getAll,
		getData,
		setData,
		delData,
        getInfo,
        refreshData,
        usersData
	};
};