module.exports = function ({ Cherry, Language }) {
    const fullTime = Cherry.getTime("fullTime");
    const { readFileSync, writeFileSync } = require("fs");
    const { log } = Cherry;
    var path = __dirname + '/data/othersData.json';

    try {
        var othersData = JSON.parse(readFileSync(path, 'utf8'));
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

    async function createData(userID, callback) {
        try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            if (othersData.hasOwnProperty(userID)) throw new Error(Language.get('database', 'hasUserID', userID));
            var data = {
                [userID]: {
                    ID: userID,
                    coin: 0,
                    createTime: {
                        timestamp: Date.now(),
                        fullTime: fullTime
                    }
                }
            }
            Object.assign(othersData, data);
            await saveData(othersData)
            if (callback && typeof callback == "function") callback(null, data);
            return data[userID];
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("OTHERS - CREATE DATA", error, "error");
        }
    }

    async function getAll(keys, callback) {
        try {
            if (!keys) return othersData;
            if (!Array.isArray(keys)) throw new Error(Language.get('database', 'isArray'));
            const data = [];
            for (var ID of othersData) {
                var temp = {
                    ID: i.ID
                }
                var userData = othersData[ID];
                for (var k of keys) temp[k] = userData[k]
                data.push(temp)
            }
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("OTHERS - GET ALL DATA", error, "error");
        }
    }

    async function getData(userID, callback) {
        try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            if (!othersData.hasOwnProperty(userID)) throw new Error(Language.get('database', 'notfound_userID', userID));
            const data = othersData[userID];
            if (callback && typeof callback == "function") callback(null, data);
            return data;
        } catch(error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("OTHERS - GET DATA", error, "error");
        }
    }

    async function setData(userID, options, callback) {
        try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            if (!othersData.hasOwnProperty(userID)) await createData(userID);
            if (typeof options != 'object') throw new Error(Language.get('database', 'isObject'));
            othersData[userID] = {...othersData[userID], ...options};
            await saveData(othersData)
            if (callback && typeof callback == "function") callback(null, othersData[userID]);
            return othersData[userID];
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("OTHERS - SET DATA", error, "error");
        }
    }

    async function delData(userID, callback) {
        try {
            if (!userID) throw new Error(Language.get('database', 'undefined_userID'));
            if (isNaN(userID)) throw new Error(Language.get('database', 'NaN_userID', userID));
            if (!othersData.hasOwnProperty(userID)) throw new Error(Language.get('database', 'notfound_userID', userID));
            delete othersData[userID];
            await saveData(othersData);
            if (callback && typeof callback == "function") callback(null, true);
        } catch (error) {
            if (callback && typeof callback == "function") callback(error, null);
            return log("OTHERS - REMOVE", error, "error");
        }
    }

    return {
        createData,
        getAll,
        getData,
        setData,
        delData,
        othersData
    }
}