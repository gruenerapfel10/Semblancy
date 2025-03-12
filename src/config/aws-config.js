export const config = {
  Auth: {
    identityPoolId: "us-east-1:a9ba4338-ff32-4448-994e-2400829554ea", //REQUIRED - Amazon Cognito Identity Pool ID
    region: "us-east-1", // REQUIRED - Amazon Cognito Region
    userPoolId: "us-east-1_EwVZtEME6", //OPTIONAL - Amazon Cognito User Pool ID
    userPoolWebClientId: "55fdqv26pdfuqcr46cokdlqgm7", //OPTIONAL - Amazon Cognito Web Client ID
  },
  Storage: {
    AWSS3: {
      bucket: "prosemble", //REQUIRED -  Amazon S3 bucket name
      region: "us-east-1", //OPTIONAL -  Amazon service region
      isObjectLockEnabled: true, //OPTIONAl - Object Lock parameter
    },
  },
};
