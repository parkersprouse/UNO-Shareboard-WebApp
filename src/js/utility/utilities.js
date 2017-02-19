const cookie = require('react-cookie');
const encryption = require('./encryption');
const axios = require('axios');
const constants = require('./constants');
const validator = require('validator');

module.exports = {


  //======================//
  //      GENERATORS      //
  //======================//

  generateRandomNumber: function(len) {
    let code = "";
    for (let i = 0; i < len; i++) {
      let n = Math.floor(Math.random() * 9) + 1;
      code += n + "";
    }
    return parseInt(code, 10);
  },


  //======================//
  //      VALIDATION      //
  //======================//

  validateEmail: function(email) {
    // eslint-disable-next-line
    const re = /^[A-z0-9_%+-]+.*[A-z0-9_%+-]+@(my.)?uno.edu$/;
    return re.test(email);
  },

  // Escapes any entered HTML characters
  sanitizeInput: function(input) {
    let output = validator.escape(input);
    return output;
  },

  // Escapes any entered HTML characters
  //   and removes all whitespace from the string
  sanitizeInputSpacing: function(input) {
    let output = validator.escape(input);
    output = validator.trim(output);
    output = validator.blacklist(output, " ");
    return output;
  },


  //=======================//
  //   REQUEST UTILITIES   //
  //=======================//

  // Attempt to login a user by searching through the existing accounts
  checkAccount: function(user, pass, callback) {
    const type = this.validateEmail(user) ? "email" : "accountName";

    axios.post(constants.HOST + '/service/v1/login/', {
      [type]: user
    })
    .then(function (response) {
      const data = response.data;
      const output = encryption.createHash(pass, data.passwordSalt);
      const passwordCorrect = data.passwordHash === output.hash;

      callback(true, passwordCorrect);
    })
    .catch(function (error) {

      // If the user tried logging in with an email and it wasn't found in
      //   the verified users table, check the unverified users table
      if (type === "email") {
        axios.get(constants.HOST + '/service/v1/unverified_users/email/' + user + '/')
        .then(function (response) {
          if (response.data) {
            const data = response.data;
            const output = encryption.createHash(pass, data.passwordSalt);
            const passwordCorrect = data.passwordHash === output.hash;

            callback(true, passwordCorrect, true);
          }
          else {
            callback(false, false);
          }
        })
        .catch(function (error) {
          callback(false, false);
        });
      }

      // If they didn't log in with an email, then we know they aren't
      //   an unverified user
      else {
        callback(false, false);
      }

    });
  },

  // Check if the provided email is already associated
  //   with an existing account
  checkForExistingEmail: function(email, callback) {
    // First we check the active users.
    axios.post(constants.HOST + '/service/v1/login/', {
      email: email
    })
    .then(function (response) {
      callback(true);
    })
    .catch(function (error) {

      // If the email wasn't found in the active users table, we check
      //   the unverified users to see if an email was used to sign up
      //   but hasn't been verified yet.
      axios.get(constants.HOST + '/service/v1/unverified_users/email/' + email + '/')
      .then(function (response) {
        if (response.data) {
          callback(true);
        }
        else {
          callback(false);
        }
      })
      .catch(function (error) {
        callback(false);
      });

    });
  },

  // Perform the registration operation by adding the user to the
  //   unverified users table
  performRegistration: function(email, pass, callback) {

    const code = this.generateRandomNumber(9);
    const hashingResult = encryption.createHash(pass);

    axios.post(constants.HOST + '/service/v1/unverified_users/add/', {
        passwordHash: hashingResult.hash,
        passwordSalt: hashingResult.salt,
        email: email,
        verificationCode: code
      })
      .then(function (response) {
        callback(true);
      })
      .catch(function (error) {
        callback(false);
      });
  },


  //======================//
  //   COOKIE UTILITIES   //
  //======================//

  // When the user successfully logs in, we create cookies that will
  //   keep the user logged in.
  // a: raw username
  // b: hash created from username + salt
  // c: hash created from salt + salt
  // "user" is the username of the user being logged in
  bakeCookies: function(user, callback) {
    cookie.save(constants.COOKIE_A, user, { path: '/', maxAge: 60 * 60 * 24 * 7 });

    const type = this.validateEmail(user) ? "email" : "accountName";

    axios.post(constants.HOST + '/service/v1/login/', {
      [type]: user
    })
    .then(function (response) {
      const data = response.data;

      let valueToStore = encryption.createHash(user, data.passwordSalt);
      cookie.save(constants.COOKIE_B, valueToStore.hash, { path: '/', maxAge: 60 * 60 * 24 * 7 });

      valueToStore = encryption.createHash(data.passwordSalt, data.passwordSalt);
      cookie.save(constants.COOKIE_C, valueToStore.hash, { path: '/', maxAge: 60 * 60 * 24 * 7 });

      callback();
    })
    .catch(function (error) {
      console.log(error);
    });
  },

  verifyCookies: function(targetPath, replace, callback) {
    const user = cookie.load(constants.COOKIE_A);
    const type = this.validateEmail(user) ? "email" : "accountName";

    // If we're trying to access the login page or verify account page
    // Requires: to be logged out
    if (targetPath === "/" || targetPath === "verify") {
      if (!user) {
        callback();
        return;
      }

      axios.post(constants.HOST + '/service/v1/login/', {
        [type]: user
      })
      .then(function (response) {
        const data = response.data;

        const userHash = encryption.createHash(user, data.passwordSalt);
        const saltHash = encryption.createHash(data.passwordSalt, data.passwordSalt);

        if (cookie.load(constants.COOKIE_B) === userHash.hash && cookie.load(constants.COOKIE_C) === saltHash.hash) {
          replace("/home");
          callback();
        }
        else {
          this.clearCookies();
          callback();
        }
      })
      .catch(function (error) {
        console.log(error);
        this.clearCookies();
        replace("/");
        callback();
      }.bind(this));

    }

    // If we're trying to access any other page on the site
    // Requires: to be logged in
    else {
      if (!this.allCookiesExist()) {
        this.clearCookies();
        replace("/");
        callback();
        return;
      }

      axios.post(constants.HOST + '/service/v1/login/', {
        [type]: user
      })
      .then(function (response) {
        const data = response.data;

        const userHash = encryption.createHash(user, data.passwordSalt);
        const saltHash = encryption.createHash(data.passwordSalt, data.passwordSalt);

        if (cookie.load(constants.COOKIE_B) !== userHash.hash || cookie.load(constants.COOKIE_C) !== saltHash.hash) {
          this.clearCookies();
          replace("/");
        }
        callback();
      }.bind(this))
      .catch(function (error) {
        console.log(error);
        this.clearCookies();
        replace("/");
        callback();
      }.bind(this));
    }
  },

  clearCookies: function() {
    if (cookie.load(constants.COOKIE_A))
      cookie.remove(constants.COOKIE_A);
    if (cookie.load(constants.COOKIE_B))
      cookie.remove(constants.COOKIE_B);
    if (cookie.load(constants.COOKIE_C))
      cookie.remove(constants.COOKIE_C);
  },

  allCookiesExist: function() {
    // These return values and how you use them are pretty fragile,
    //   so I'm gonna be verbose for the sake of accuracy.
    if (!cookie.load(constants.COOKIE_A) || !cookie.load(constants.COOKIE_B) || !cookie.load(constants.COOKIE_C))
      return false;
    return true;
  },

  getCookie: function(c) {
    return cookie.load(c);
  }

}
