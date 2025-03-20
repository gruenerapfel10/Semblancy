# Google and Apple Authentication Setup

## Implementation Overview
- The social authentication with Google and Apple has been implemented in the application.
- The auth flow uses AWS Cognito for identity management through Amplify.
- Both login and signup pages have been updated with Google and Apple authentication options.
- A dedicated auth-callback page has been created to handle redirects after social authentication.

## Configuration

### What's been added:
1. Updated Amplify configuration in `Providers.jsx` with:
   - Google and Apple OAuth providers
   - Proper redirect URLs for both development and production environments
   - Callback handling

2. Added social login buttons to:
   - Login page (`/src/app/login/page.js`)
   - Signup page (`/src/app/signup/page.js`)

3. Created an auth callback handler:
   - Component: `/src/components/AuthCallback.js`
   - Page: `/src/app/auth-callback/page.js`

## What You Need to Do

### 1. Google OAuth Configuration
1. Make sure you have a Google OAuth client created in [Google Cloud Console](https://console.cloud.google.com/).
2. Configure your Google OAuth client with the following settings:
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://gcsesimulator.co.uk`
   - Authorized redirect URIs:
     - `http://localhost:3000/auth-callback`
     - `https://gcsesimulator.co.uk/auth-callback`
     - `https://eu-west-2lhtoxseqh.auth.eu-west-2.amazoncognito.com/oauth2/idpresponse` (For dev environment)
     - `https://auth.gcsesimulator.co.uk/oauth2/idpresponse` (For production environment)

3. Update the Google client ID in `Providers.jsx` if different from the one already set.

### 2. Apple Sign In Configuration
1. Create an Apple Developer account if you don't have one.
2. Register your app for Sign in with Apple:
   - Go to [Apple Developer Portal](https://developer.apple.com/)
   - Navigate to Certificates, Identifiers & Profiles
   - Register a new identifier or use existing one
   - Enable "Sign In with Apple" capability

3. Configure the following settings:
   - Return URLs:
     - `https://eu-west-2lhtoxseqh.auth.eu-west-2.amazoncognito.com/oauth2/idpresponse` (For dev environment)
     - `https://auth.gcsesimulator.co.uk/oauth2/idpresponse` (For production environment)

4. Generate the necessary private key and configure it in AWS Cognito.

### 3. AWS Cognito Configuration
1. In the AWS Console, go to Amazon Cognito.
2. Configure your User Pool to include Google and Apple as identity providers:
   - Add "Google" as an Identity Provider with your Google client ID and secret
   - Add "Sign in with Apple" as an Identity Provider with your Apple Service ID, Team ID, Key ID, and private key

3. Configure the App client settings:
   - Enable Google and Sign in with Apple as Enabled Identity Providers
   - Set the callback URLs to match the ones in the code:
     - `http://localhost:3000/dashboard/overview`
     - `https://gcsesimulator.co.uk/dashboard/overview`
     - `http://localhost:3000/auth-callback`
     - `https://gcsesimulator.co.uk/auth-callback`
   - Set the sign out URLs:
     - `http://localhost:3000/login`
     - `https://gcsesimulator.co.uk/login`
   - Make sure "Authorization code grant" is selected
   - Select all the OAuth scopes needed (openid, email, profile, etc.)

### 4. Testing
1. Test the authentication flow in both development and production environments.
2. Make sure redirection works properly after successful authentication.
3. Test error handling by intentionally causing authentication errors.

## Troubleshooting
If you encounter issues with the authentication flow:

1. Check your browser console for errors
2. Verify that the Cognito configuration matches the Amplify configuration in the code
3. Ensure all redirect URLs are properly configured in Google Console, Apple Developer Portal, and AWS Cognito
4. Check that your environment variables are properly set
5. For Apple Sign In issues, ensure that your private key is valid and properly configured

## Additional Notes
- The current implementation uses temporary G and A icons for Google and Apple. You might want to replace these with proper SVG icons.
- Consider adding proper error handling and user feedback for authentication failures.
- Remember to update both the development and production configurations when making changes.
