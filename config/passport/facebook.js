const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('../setting');

module.exports = (app, passport) => {
    return new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    }, (accessToken, refreshToken, profile, done) => {
        console.log('passport-facebook call...');
        console.dir(profile);
        
        const options = {
            criteria: { 'facebook.id': profile.id }
        };
        
        const database = app.get('database');
        database.userModel.findOne(options, function(err, user) {
            if (err) {
                return done(err);
            }
            
            if (!user) {
                const user = new database.userModel({
                    name: profile.displayName,
                    provider: profile.provider,
                    facebook: profile._json
                });
    
                user.save((err) => {
                    if (err) {
                        console.log(err);
                    }
        
                    return done(err, user);
                });
            } else {
                return done(err, user);
            }
        });
    });
};