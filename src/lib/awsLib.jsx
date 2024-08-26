import { Auth, API, Storage } from "aws-amplify";
// import AWS, { CognitoIdentityServiceProvider } from "aws-sdk";
// import { DEFAULT_CONFIG } from "../config";
import { debugLogger } from "./commonLib";

export async function s3Upload(file) {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const stored = await Storage.vault.put(filename, file, {
      contentType: file.type,
    });
    return stored.key;
  } catch (error) {
    console.error(error.message);
    return null;
  }

}
// export async function s3Upload(file, email) {
//   console.log("file", file);
//   const filename = `${Date.now()}-${file.name}`;
//   const fileKey = await API.post("fieldsurvey", `/transfer/upload`, {
//     body: {
//       email: email,
//       contentType: file.type,
//       filename: filename,
//     },
//   })
//     .then(async (result) => {
//       console.log("re", result);
//       const linkUpload = result.url;
//       const response = await fetch(linkUpload, { method: "PUT", body: file });

//       // const response = await fetch(linkUpload, { method: 'PUT', body: file });
//       // console.log('res',response);
//       return filename;
//     })
//     .catch((error) => {
//       console.error(error.message);
//       return null;
//     });
//   return fileKey;
// }
export async function s3FileCopy(
  fCRCreatedEmail,
  userEmail,
  currentFileKey,
  fileName
) {
  const newfilename = `${Date.now()}-${fileName}`;
  const fileKey = await API.post("UASDashboard", `/transfer/copyFile`, {
    body: {
      fCRCreatedEmail: fCRCreatedEmail,
      userEmail: userEmail,
      fileKey: currentFileKey,
      fileName: newfilename,
    },
    headers: {
      Authorization: `${(await Auth.currentSession())
        .getAccessToken()
        .getJwtToken()}`,
    },
  })
    .then(async (result) => {
      return JSON.parse(result.body);
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
  return fileKey;
}
export async function getCognitoUserList(callBackFn) {
  const session = await Auth.currentSession();
  const credentialsObj = await Auth.currentCredentials();

  const aWSconfig = new AWS.Config({
    cognitoidentityserviceprovider: "2016-04-18",
    sessionToken: session.getAccessToken(),
    credentials: credentialsObj,
    region: DEFAULT_CONFIG.cognito.REGION,
  });

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(
    aWSconfig
  );

  const params = {
    UserPoolId: DEFAULT_CONFIG.cognito.USER_POOL_ID,
  };

  cognitoidentityserviceprovider.listUsers(params, function (err, userData) {
    if (err) {
      debugLogger("Error in getCognitoUsers: ", err);
      alert(err);
    } else if (callBackFn) {
      callBackFn(userData);
    }
  });
}

export async function revokeCognitoUser(revokeCheckList) {
  const session = await Auth.currentSession();
  const credentialsObj = await Auth.currentCredentials();

  const aWSconfig = new AWS.Config({
    cognitoidentityserviceprovider: "2016-04-18",
    sessionToken: session.getAccessToken(),
    credentials: credentialsObj,
    region: DEFAULT_CONFIG.cognito.REGION,
  });

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(
    aWSconfig
  );
  let eachRevokeUserName = null;
  for (let i = 0; i < revokeCheckList.length; i += 1) {
    eachRevokeUserName = revokeCheckList[i].userName;
    const params1 = {
      UserPoolId: DEFAULT_CONFIG.cognito.USER_POOL_ID,
      Username: eachRevokeUserName,
    };
    cognitoidentityserviceprovider.adminDisableUser(
      params1,
      function (err, userData) {
        if (err) {
          debugLogger("Error in revokeCognitoUsers: ", err);
          alert(err);
        } else {
          debugLogger("disabled user", userData);
        }
      }
    );
  }
}

export async function enableCognitoUser(revokeUnchecklist) {
  const session = await Auth.currentSession();
  const credentialsObj = await Auth.currentCredentials();

  const aWSconfig = new AWS.Config({
    cognitoidentityserviceprovider: "2016-04-18",
    sessionToken: session.getAccessToken(),
    credentials: credentialsObj,
    region: DEFAULT_CONFIG.cognito.REGION,
  });

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(
    aWSconfig
  );
  let eachRevokeUserName = null;
  for (let i = 0; i < revokeUnchecklist.length; i += 1) {
    eachRevokeUserName = revokeUnchecklist[i].userName;

    const params1 = {
      UserPoolId: DEFAULT_CONFIG.cognito.USER_POOL_ID,
      Username: eachRevokeUserName,
    };
    debugLogger("unchecklist", revokeUnchecklist[i]);

    cognitoidentityserviceprovider.adminEnableUser(
      params1,
      function (err, userData) {
        if (err) {
          debugLogger("Error in enableCognitoUsers: ", err);
          alert(err);
        } else {
          debugLogger("admin user enabled", userData);
        }
      }
    );
  }
}

export async function updateCognitoUser(updatelist) {
  const session = await Auth.currentSession();
  const credentialsObj = await Auth.currentCredentials();

  const aWSconfig = new AWS.Config({
    cognitoidentityserviceprovider: "2016-04-18",
    sessionToken: session.getAccessToken(),
    credentials: credentialsObj,
    region: DEFAULT_CONFIG.cognito.REGION,
  });

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(
    aWSconfig
  );
  let eachUpdateUserName = null;
  for (let i = 0; i < updatelist.length; i += 1) {
    eachUpdateUserName = updatelist[i].userName;

    const params1 = {
      UserPoolId: DEFAULT_CONFIG.cognito.USER_POOL_ID,
      Username: eachUpdateUserName,
    };

    cognitoidentityserviceprovider.adminUpdateUserAttributes(
      params1,
      function (err, userData) {
        if (err) {
          debugLogger("Error in updateCognitoUsers: ", err);
          alert(err);
        } else {
          debugLogger("updated userData", userData);
        }
      }
    );
  }
}

export function getStorage() {
  // return Storage;
  return Storage.vault;
}
