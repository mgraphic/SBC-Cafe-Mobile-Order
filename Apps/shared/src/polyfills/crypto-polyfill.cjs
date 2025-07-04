const crypto = require('crypto-browserify');

// Add scryptSync with a fallback implementation
crypto.scryptSync = function (password, salt, keylen, options = {}) {
    console.warn(
        'scryptSync is not fully supported in browser environment. Using PBKDF2 fallback.'
    );

    // Use pbkdf2Sync as a fallback (available in crypto-browserify)
    return crypto.pbkdf2Sync(password, salt, 10000, keylen, 'sha256');
};

module.exports = crypto;
