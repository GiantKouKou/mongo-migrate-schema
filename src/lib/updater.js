var fs = require('fs')
    , MongoClient = require('mongodb').MongoClient
    ;

var versionNumber = 0;

module.exports.update = function (options) {
    console.info('Upgrade started ...........');
    if (typeof options === 'undefined' || options == null) {
        throw new Error("Empty update options");
    }

    if (typeof options['dbUri'] === 'undefined') {
        throw new Error('Missing db uri for update')
    }

    MongoClient.connect(options['dbUri'], function (err, db) {
        var versionCollection = db.collection("config_version");
        versionCollection.findOne(function (err, version) {
            if (version) {
                versionNumber = version.num;
            }

            var upgradeFiles = [];
            var upgradeFolder = './db';
            if (typeof options['folder'] !== 'undefined') {
                upgradeFolder = options['folder'];
            }

            fs.readdirSync(upgradeFolder).forEach(function (file) {
                if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
                    var parts = file.match(/(\d+).+/);
                    var num = parseInt(parts[1]);
                    upgradeFiles[num] = require(upgradeFolder + '/' + file).execute;
                }
            });

            var upgrades = [];
            for (var num in upgradeFiles) {
                if (num > versionNumber) {
                    upgrades.push({num: num, func: upgradeFiles[num]});
                }
            }
            if (upgrades.length > 0) {
                executeUpgrades(db, upgrades);
            } else {
                db.close();
                console.info('Upgrade finished ...........');
            }
        });
    });
};

executeUpgrades = function (db, upgrades) {
    if (typeof upgrades == 'undefined' || upgrades == null || upgrades.length == 0) {
        return db.collection("config_version").update({}, {$set: {num: versionNumber}}, {upsert: true}, function (err) {
            if (err) {
                throw err;
            }

            db.close();
            console.info('Upgrade finished ...........');
        });
    }

    var upgrade = upgrades.shift(upgrades);
    versionNumber = upgrade.num;
    console.info('Execute upgrade ' + upgrade.num);
    upgrade.func(db, function (err) {
        if (err) {
            throw err;
        }

        executeUpgrades(db, upgrades);
    });
};