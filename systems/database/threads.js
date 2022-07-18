module.exports = function ({ Cherry, api, Language }) {
    const { writeFileSync, readFileSync } = require("fs");
    var fullTime = Cherry.getTime("fullTime");
    const { log } = Cherry;
    var path = __dirname + "/data/threadsData.json";

    try {
        var threadsData = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        writeFileSync(path, "{}", { flag: 'a+' });
    }
    
    async function saveData(data) {
        try {
            if (!data) throw new Error(Language.get('database', 'undefined_data'));
            writeFileSync(path, JSON.stringify(data, null, 4))
        } catch (error) {
            return log("SAVE DATA", error, 'error')
        }
    }

	async function createData(threadID, callback) {
		try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            if (threadsData.hasOwnProperty(threadID)) throw new Error(Language.get('database', 'hasThreadID', threadID));
            var threadInfo = await api.getThreadInfo(threadID);
            var data = {
                [threadID]: {
                    ID: threadID,
                    name: threadInfo.threadName,
                    emoji: threadInfo.emoji,
                    prefix: "",
                    members: {},
                    color: threadInfo.color,
                    totalMsg: threadInfo.messageCount,
                    adminIDs: threadInfo.adminIDs,
                    isGroup: threadInfo.isGroup,
                    createTime: {
                        timestamp: Date.now(),
                        fullTime: fullTime
                    },
                    lastUpdate: Date.now()
                }
            }
            Object.assign(threadsData, data);
            await saveData(threadsData)
            if (callback && typeof callback == "function") callback(null, data);
            return data[threadID];
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - CREATE DATA", error, "error");
        }
	}

    async function addMember(threadID, userID, callback) {
        try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            var threadData = await getData(threadID);
            if (threadData.members.hasOwnProperty(userID)) throw new Error(Language.get('database', 'hasUserID_inThreads', userID));
            var threadInfo = await getInfo(threadID);
            var data = {
                [userID]: {
                    ID: userID,
                    totalMsg: 0,
                    bietdanh: threadInfo.nicknames[userID] || ""
                }
            }
            Object.assign(threadData.members, data)
            await setData(threadID, threadData);
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - ADD MEMBERS", error, "error");
        }
    }

    async function delMember(threadID, userID) {
        try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(Language.get('database', 'notfound_threadID', threadID));
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            var threadData = await getData(threadID);
            if (!threadData.members.hasOwnProperty(userID)) throw new Error(Language.get('database', 'notFoundUserID_inThreads', userID));
            delete threadData.members[userID];
            await setData(threadID, threadData);
        } catch (error) {
            return log("THREADS - DELETE MEMBERS", error, "error");
        }
    }

    async function editMember(threadID, userID, options, callback) {
        try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(Language.get('database', 'notfound_threadID', threadID));
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            var threadData = await getData(threadID);
            if (!threadData.members.hasOwnProperty(userID)) await addMember(threadID, userID);
            if (typeof options != 'object') throw new Error(Language.get('database', 'isObject'));
            var member = threadData.members[userID];
            member = {...member, ...options};
            threadsData[threadID].members[userID] = member;
            await saveData(threadsData);
            if (callback && typeof callback == "function") callback(null, member);
            return member;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - EDIT MEMBERS", error, "error");
        }
    }
    
    async function getUser(threadID, userID) {
        try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(Language.get('database', 'notfound_threadID', threadID));
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            var threadData = await getData(threadID);
            if (!threadData.members.hasOwnProperty(userID)) await addMember(threadID, userID);
            return threadData.members[userID];
        } catch (error) {
            return log("THREADS - GET USERS", error, "error");
        }
    }

    async function getAllUsers(threadID, keys, callback) {
        try {
            if (!keys) {
                var threadInfo = await getData(threadID);
                if (Object.keys(threadInfo.members).length == 0) return [];
                else if (Object.keys(threadInfo.members).length > 0) {
                    var db = [];
                    for (var i of Object.keys(threadInfo.members)) db.push(threadInfo.members[i]);
                    return db;
                }
            }
            if (!Array.isArray(keys)) throw new Error(Language.get('database', 'isArray'));
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            var threadData = await getData(threadID), { members } = threadData, data = [];
            for (var ID in members) {
                const database = {
                    ID: ID
                };
                const memberData = members[ID];
                for (var i of keys) database[i] = memberData[i];
                data.push(database);
            }
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - GET ALL USERS", error, "error");
        }
    }

	async function getAll(keys, callback) {
        try {
            if (!keys) {
                if (Object.keys(threadsData).length == 0) return [];
                else if (Object.keys(threadsData).length > 0) {
                    var db = [];
                    for (var i of Object.keys(threadsData)) db.push(threadsData[i]);
                    return db;
                }
            }
            if (!Array.isArray(keys)) throw new Error(Language.get('database', 'isArray'));
            const data = [];
            for (var ID in threadsData) {
                const database = {
                    ID: ID
                };
                const threadData = threadsData[ID];
                for (var i of keys) database[i] = threadData[i];
                data.push(database);
            }
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - GET ALL DATA", error, "error");
        }
    }

	async function getData(threadID, callback) {
        try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            if (!threadsData.hasOwnProperty(threadID)) await createData(threadID);
            const data = threadsData[threadID];
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - GET DATA", error, "error");
        }
    }

	async function setData(threadID, options, callback) {
        try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(Language.get('database', 'notfound_threadID', threadID));
            if (typeof options != 'object') throw new Error(Language.get('database', 'isObject'));
            threadsData[threadID] = {
                ...threadsData[threadID],
                ...options
            }
            await saveData(threadsData);
            if (callback && typeof callback == "function") callback(null, threadsData[threadID]);
            return threadsData[threadID];
        }
        catch(error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - SET DATA", error, "error");
        }
	}

	async function delData(threadID, callback) {
		try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(Language.get('database', 'notfound_threadID', threadID));
            delete threadsData[threadID];
            await saveData(threadsData);
            if (callback && typeof callback == "function") callback(null, "REMOVE THREAD "+ threadID + " SUCCES");
            return true;
        } catch(error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("THREADS - REMOVE DATA", error, "error");
        }
	}

    async function getInfo(threadID) {
		try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            var threadInfo = await api.getThreadInfo(threadID);
            return threadInfo;
		} catch (error) {
			return log('THREADS - GET INFO', error, "error");
		}
	}

    async function refreshData(threadID) {
        try {
            if (!threadID) throw new Error(Language.get('database', 'undefined_threadID'));
            if (isNaN(threadID)) throw new Error(Language.get('database', 'NaN_threadID', threadID));
            if (!threadsData.hasOwnProperty(threadID)) throw new Error(Language.get('database', 'notfound_threadID', threadID));
            var threadInfo = await getData(threadID);
            var newThreadData = await getInfo(threadID);
            console.log(newThreadData)
            var str = { name: 'threadName', totalMsg: 'messageCount' };
            for (var key of Object.keys(threadInfo)) {
                var new_key = Object.keys(str).includes(key) ? str[key] : key;
                threadInfo[key] = newThreadData.hasOwnProperty(new_key) ? newThreadData[new_key] : threadInfo[key];
            }
            for (var userID of Object.keys(threadInfo.members)) threadInfo.members[userID].bietdanh = newThreadData.nicknames[userID];
            threadInfo.lastUpdate = Date.now();
            await setData(threadID, threadInfo);
        } catch (error) {
            return log("THREADS - REFRESH DATABASE", error, 'error')
        }
    }

	return {
		createData,
        addMember,
        delMember,
        editMember,
        getUser,
        getAllUsers,
		getAll,
		getData,
		setData,
		delData,
        getInfo,
        refreshData,
        threadsData
	}
};