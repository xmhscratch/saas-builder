module.exports = {
    "development": true,
    "rootDirPath": "/export/",
    "storageDirPath": "/export/data/",
    "mailTemplateDirPath": '/export/system/email/',
    "crypto": {
        "algorithm": "aes-192-cbc",
        "salt": "2PNE9J852gCmqGDDhQMecZ7G",
        "password": "dcF2Eseq",
    },
    "mailer": {
        "defaultSender": "support@localdomain.local",
    },
    "homeURL": `//localdomain.${process.env.TLD || 'com'}`,
    "supportLanguages": ["en"],
}
