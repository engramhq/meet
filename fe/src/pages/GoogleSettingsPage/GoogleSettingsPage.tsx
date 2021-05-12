import './GoogleSettingsPage.scss';

import React, { useEffect, useState } from 'react';

import * as GoogleUtils from '../../utils/GoogleUtils';

type GoogleSettingsPageProps = {};

const CLIENT_ID =
  "538993823748-pv564gq2au8696d9qqnrslqm31upa5tc.apps.googleusercontent.com";
const API_KEY = "AIzaSyAqbWayBxE3cfwFeWM-4aUlUxcKVtYKwZ0";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const GoogleSettingsPage: React.FC<GoogleSettingsPageProps> = (
  props
) => {
  const [folderId, setFolderId] = useState(
    localStorage.getItem("google-folder-id") || ""
  );
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    async function initClient() {
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
      });

      (gapi as any).auth2
        .getAuthInstance()
        .isSignedIn.listen(handleSignInStatusChanged);

      setIsSignedIn((gapi as any).auth2.getAuthInstance().isSignedIn.get());
    }

    gapi.load("client:auth2", initClient);
  }, []);

  function handleSignOutClicked() {
    (gapi as any).auth2.getAuthInstance().signOut();
  }

  function handleSignInStatusChanged(isSignedIn: boolean) {
    setIsSignedIn(isSignedIn);
  }

  function handleAuthorizeClicked() {
    (gapi as any).auth2.getAuthInstance().signIn();
  }

  async function handleCreateFolderClicked() {
    const res = await GoogleUtils.createFolder("engram");
    setFolderId(res.result.id);
  }

  function handleFolderIdChanged(e: React.ChangeEvent<HTMLInputElement>) {
    setFolderId(e.target.value);
  }

  function handleSaveFolderId() {
    localStorage.setItem("google-folder-id", folderId);
  }

  return (
    <div className="google-settings-page">
      <div className="container">
        <h1>Google Settings</h1>
        {isSignedIn ? (
          <>
            <button onClick={handleSignOutClicked}>Sign Out</button>
            {folderId ? (
              <div>
                <label>Folder ID</label>
                <input
                  onChange={handleFolderIdChanged}
                  value={folderId}
                  style={{ width: "100%" }}
                />
                <button onClick={handleSaveFolderId}>Save</button>
              </div>
            ) : (
              <div>
                <button onClick={handleCreateFolderClicked}>
                  Create engram Folder
                </button>
              </div>
            )}
          </>
        ) : (
          <button onClick={handleAuthorizeClicked}>Authorize</button>
        )}
      </div>
    </div>
  );
};
