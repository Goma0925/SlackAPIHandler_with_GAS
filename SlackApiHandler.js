function SlackApiHandler(aouthAccessToken){
  this.defaultErrorResponseMessage = "Slack API responded with an error:\n";
  this.aouthAccessToken = aouthAccessToken;
  if (this.aouthAccessToken == "undefined"){throw "SlackApiHandler() takes a string parameter for a Slack Access token."}
    
  this.isErrorResponse = function(slackApiResponse){
    if (JSON.parse(slackApiResponse)["ok"] == true){
      return false;
    }else{
      Logger.log(JSON.parse(slackApiResponse));
      return true;
    };
  }
  
  this.fetchUserObj = function(userId){
    //This function fetches a single Slack user object based on a user ID from Slack API: https://api.slack.com/types/user
    // Reference: https://api.slack.com/types/user
    var userInfoUrl = "https://slack.com/api/users.info";
    var headers = {
      Authorization: 'Bearer '+ aouthAccessToken
    }
    var options = {
      method : "GET",
      headers: headers,
    }
    var userInfoUrlWithArgs = userInfoUrl + "?user=" + userId;
    var response = UrlFetchApp.fetch(userInfoUrlWithArgs, options);
    if (this.isErrorResponse(response)){
      Logger.log("A user object '"+userId+"' could not have been fetched from Slack API");
    }
    var user = JSON.parse(response)["user"];
    return user;
  }
  
   this.fetchWorkspaceUsers = function(){
    //This function fetches the Slack user objects for all workspace members from Slack API: https://api.slack.com/types/user
    //Reference: https://api.slack.com/methods/users.list
      var userListUrl = "https://slack.com/api/users.list";
    var headers = {
      Authorization: 'Bearer '+ this.aouthAccessToken
    }
    var options = {
      method : "GET",
      headers: headers,
    }
    var response = UrlFetchApp.fetch(userListUrl, options);
     if (this.isErrorResponse(response)){
       throw this.defaultErrorResponseMessage;
     }
    var users = JSON.parse(response)["members"];
    return users;
  }
   
   this.fetchGroupUsers = function(targetGroupHandle){
     //This function returns a list of user objects that belong to a certain user group
    //targetGroupHandle: A string of a user group handle. e.g) 20board_jp
     var userIds = this.fetchGroupMemberIds(targetGroupHandle);
     var users = [];
     for (var i=0; i<userIds.length; i++){
       users.push(this.fetchUserObj(userIds[i]));
     }
     return users;
   }
  
  this.fetchGroupMemberIds = function(targetGroupHandle){
    //This function gets the ID list of all users in a particular user group from Slack API
    //targetGroupHandle: A string of a user group handle. e.g) 20board_jp
    //Reference https://api.slack.com/types/usergroup
    var usergroupListUrl = "https://slack.com/api/usergroups.list";
    var headers = {
      'Authorization': 'Bearer '+ this.aouthAccessToken
    };
    var options =
        {
          method : "GET",
          headers : headers,
          contentType : "application/json",
        };
    
    var usergroupListUrlWithArgs = usergroupListUrl + "?include_users=true";
    var response = UrlFetchApp.fetch(usergroupListUrlWithArgs, options);
    var targetUserRetrievalStatusMessage = "";
    if (this.isErrorResponse(response)){
      throw this.defaultErrorResponseMessage;
    }
    
    var usergroups = [];
    usergroups = JSON.parse(response)["usergroups"];
    
    var userIdList = [];
    for (var i=0; i < usergroups.length; i++){
      if (targetGroupHandle === usergroups[i]["handle"].toString()){
        userIdList = usergroups[i]["users"];
      }
    }
    if (userIdList.length === 0){
      throw "The usergroup '" + targetGroupHandle + "' either doesn't exist or has no members.\nユーザーグループ'" + targetGroupHandle + "'は存在しないか、メンバーがいません。"
    }
    return userIdList
  }
  
  this.subtractUserArrays = function(targetUsers, usersToRemove){
    //Subtract users from one array from the other based on Slack User objects' IDs.
    //Slack User objectsの配列targertUsersから、配列usersToRemoveに入っているUserを取り除いたものを取得する。fetchGroupUsers()やfetchWorksapceUsers()と併用すると便利。
    var targetUserDict = {};
    var resultArr = [];
    for (var i=0; i<targetUsers.length; i++){
      targetUserDict[targetUsers[i]["id"]] = targetUsers[i];
    };
//    var before = "\n";
//    for (var id in targetUserDict){
//      before += targetUserDict[id]["profile"]["real_name"] + "\n";
//    }

    for (var i=0; i<usersToRemove.length; i++){
      if (usersToRemove[i]["id"] in targetUserDict){
        delete targetUserDict[usersToRemove[i]["id"]];      
      }
    }
    for (var id in targetUserDict){
      resultArr.push(targetUserDict[id]);
    }
    return resultArr;
  }
  
  this.fetchPublicConversations = function() {
    //This function fetches all public channels
    var methodUrl = "https://slack.com/api/channels.list";
    var headers = {
      'Authorization': 'Bearer '+ this.aouthAccessToken
    };
    var method = "GET";
    var options = {
      'method': method,    // GETやPUTなどを指定します。
      'headers': headers,  // 上で作成されたアクセストークンを含むヘッダ情報が入ります
    };
    
    var response = UrlFetchApp.fetch(methodUrl, options);
    if (this.isErrorResponse(response)){
      throw this.defaultErrorResponseMessage;
    }
    
    var conversationObjs = JSON.parse(response).channels;
    var channelStr = "\n HLAB - All public channels\n";
    for (var i=0; i < conversationObjs.length; i++) {
      channelStr += conversationObjs[i]["name_normalized"] + "," + conversationObjs[i]["num_members"] + "\n";
    }
    return conversationObjs;
  }
  
  this.fetchActivePublicConversations = function(){
    //Fetch all the non-archived channel by conversation objects.
    var conversationObjs = this.fetchPublicConversations();
    var publicConversations = [];
    for (var i=0; i < conversationObjs.length; i++) {
      if (conversationObjs[i]["is_archived"] == false){
        publicConversations.push(conversationObjs[i]);
      }
    }
    return publicConversations;
  }

}