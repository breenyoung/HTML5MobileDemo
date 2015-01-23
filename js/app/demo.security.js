/**
 * Created by byoung on 7/3/2014.
 */

define(["app/demo.globals", "sjcl"], function(globals, sjcl)
{
    "use strict";

    var deriveKeyAndSalt = function (username, password)
    {
        var salt = sjcl.codec.utf8String.toBits(username);

        //var iv = sjcl.random.randomWords(4, 0);
        var p = sjcl.misc.pbkdf2(password, salt);
        //console.log(p.key.slice(0, 256/32));
        return { key: p, salt: salt };
    }

    var encryptString = function(key, plaintext, isJson)
    {
        var p = plaintext;
        if(isJson) { p = JSON.stringify(p); }

        var returnObj = {};
        var ct = sjcl.encrypt(key, p, { ks: 256, salt: globals.getSalt()});

        return ct;
    };

    var decryptString = function(key, encryptedText, isJson)
    {
        var e = encryptedText;
        if(isJson) { e = JSON.stringify(e);}

        //var pt = sjcl.decrypt(key, encryptedText);
        var pt = sjcl.decrypt(globals.getAesKey(), e);

        if(isJson)
        {
            return JSON.parse(pt);
        }

        return pt;
    };

    var pub =
    {
        encryptString: encryptString,
        decryptString: decryptString,
        deriveKeyAndSalt: deriveKeyAndSalt
    };

    return pub;

});
