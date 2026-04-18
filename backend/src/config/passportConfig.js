import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './serverConfig.js';
import { handleGoogleAuth } from '../service/authService.js';

const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/v1/auth/google/callback',
                scope: ['profile', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Use authService to find or create the user
                    const result = await handleGoogleAuth(profile);

                    // Pass user and token info to the next handler
                    // user goes to req.user, info goes to req.authInfo
                    return done(null, result.user, {
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                    });
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    // Since we're using JWT (stateless), we don't need full serialize/deserialize
    // but Passport requires them to be defined
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        done(null, { _id: id });
    });
};

export default configurePassport;
