// チャンネル整理用スクリプト
// https://api.slack.com/apps/AT9PSLU15/
//　このスクリプトは、Google Apps Script用です。Claspなどのツールを利用して、Google Apps ScriptとしてGoogle Driveにソースをアップロードすることで使うことができます。
// 使いたい関数を選んで、GAS上で起動しましょう。

var apiUrl = "https://slack.com/api/channels.list";
var aouthAccessToken = 'xoxp-4612139726-640857759300-1161270006516-5ff5b0646e4f5181362a7d5220b84530'; // Slack app token

var folderId = "1Wrru1rfY12a_XBhSo-aS9fkfN090xIeE";//CSVファイルを出力するGoogle DriveフォルダID

function getActiveChannels(){
  //全てのPublicチャンネルをCSVに出力する関数  
  var slackApiHandler = new SlackApiHandler(aouthAccessToken);
  var fileHandler = new FileHandler();
  var channelList = slackApiHandler.fetchActivePublicConversations();
  var csv = "ID,Channel name,Purpose,Should Archive(Yes=1,No=0)\n";
  for (var i=0; i<channelList.length; i++){
    csv += channelList[i]["id"] + "," + channelList[i]["name"] + "," + '"' + channelList[i]["purpose"]["value"].replace(/(\r\n|\n|\r)/gm,"") + '"' + "\n";
    //Logger.log(channelList[i]["purpose"]["value"].replace(/(\r\n|\n|\r)/gm,"").replace(",", "\\,\\"))
  }
  fileHandler.createATextFile(folderId, "activeChannel.csv", csv);
}

function getAllMembersForGroup(){
  //グループ名をもとに、そのグループのメンバーを全てCSVに出力するスクリプト
  var groupHandle = "19all_uni";//メンバーを出力したいグループのメンション名
  //-------------------------------------------------------------
  var slackApiHandler = new SlackApiHandler(aouthAccessToken);
  var fileHandler = new FileHandler();
  var members = slackApiHandler.fetchGroupUsers(groupHandle);
  var csv = "Deleted,Need to deactivate,Extended term of office,Treatment Unknown,Name,Handle,Email,is_primary_owner,is_owner,is_admin,is_bot,Guest User,Single Channel User\n";
  for (var i=0; i<members.length; i++){
    //アクティブメンバーのみ抽出
    if (!members[i]["deleted"]){
      Logger.log(members[i]);
      csv += members[i]["deleted"] + ",";
      csv += ",";
      csv += ",";
      csv += ",";
      csv += members[i]["profile"]["real_name"] + ",";
      csv += members[i]["profile"]["display_name"] + ",";
      csv += members[i]["profile"]["email"] + ",";
      csv += members[i]["is_primary_owner"] + ",";
      csv += members[i]["is_owner"] + ",";
      csv += members[i]["is_admin"] + ",";
      csv += members[i]["is_bot"] + ",";
      csv += members[i]["is_restricted"] + ","; //If this is a guest user.
      csv += members[i]["is_ultra_restricted"] + ",";//If this is a sigle channel guest
      csv += "\n";
    }
  }
  fileHandler.createATextFile(folderId, groupHandle+"_members.csv", csv);
}

function getAllMembersForWorkspace(){
  //グループ名をもとに、そのグループのメンバーを全てCSVに出力するスクリプト
  //-------------------------------------------------------------
  var slackApiHandler = new SlackApiHandler(aouthAccessToken);
  var members = slackApiHandler.fetchWorkspaceUsers();
  Logger.log(members);
  var fileHandler = new FileHandler();
  var csv = "Deleted,Need to deactivate,Extended term of office,Treatment Unknown,Name,Handle,Email,is_primary_owner,is_owner,is_admin,is_bot,Guest User,Single Channel User\n";
  for (var i=0; i<members.length; i++){
    //アクティブメンバーのみ抽出
    if (!members[i]["deleted"]){
      Logger.log(members[i]);
      csv += members[i]["deleted"] + ",";
      csv += ",";
      csv += ",";
      csv += ",";
      csv += members[i]["profile"]["real_name"] + ",";
      csv += members[i]["profile"]["display_name"] + ",";
      csv += members[i]["profile"]["email"] + ",";
      csv += members[i]["is_primary_owner"] + ",";
      csv += members[i]["is_owner"] + ",";
      csv += members[i]["is_admin"] + ",";
      csv += members[i]["is_bot"] + ",";
      csv += members[i]["is_restricted"] + ","; //If this is a guest user.
      csv += members[i]["is_ultra_restricted"] + ",";//If this is a sigle channel guest
      csv += "\n";
    }
  }
  Logger.log(csv);
  fileHandler.createATextFile(folderId, "AllWorkspaceMember.csv", csv);
}

function getUsersSubjectToDeactivate(){
  //全ワールスペースユーザーから、Active Groupのユーザーを取り除いたusersSubjectToDeactivate(=ActiveであるべきでないUsers)を取得する
  // usersSubjectToDeactivate = AllUsers - activeUserGroupMembers
  var activeUserGroups = ["20all_jps", "20all_gbs"];
  //-------------------------------------------------------------
  var slackApiHandler = new SlackApiHandler(aouthAccessToken);
  var fileHandler = new FileHandler();
  var allMembers = slackApiHandler.fetchWorkspaceUsers();
  var usersSubjectToDeactivate = allMembers;
  var groupMembers;
  for (var i=0; i<activeUserGroups.length;i++){
    groupMembers = slackApiHandler.fetchGroupUsers(activeUserGroups[i]);
    Logger.log(activeUserGroups[i] + ":" + groupMembers.length);
    usersSubjectToDeactivate = slackApiHandler.subtractUserArrays(usersSubjectToDeactivate, groupMembers);
  }
  
  //usersSubjectToDeactivateをCSV化する
  var csv = "Deleted,Need to deactivate,Extended term of office,Treatment Unknown,Name,Handle,Email,is_primary_owner,is_owner,is_admin,is_bot,Guest User,Single Channel User\n";
  for (var i=0; i<usersSubjectToDeactivate.length; i++){
    //アクティブメンバーのみ抽出
    if (!usersSubjectToDeactivate[i]["deleted"]){
      csv += usersSubjectToDeactivate[i]["deleted"] + ",";
      csv += ",";
      csv += ",";
      csv += ",";
      csv += usersSubjectToDeactivate[i]["profile"]["real_name"] + ",";
      csv += usersSubjectToDeactivate[i]["profile"]["display_name"] + ",";
      csv += usersSubjectToDeactivate[i]["profile"]["email"] + ",";
      csv += usersSubjectToDeactivate[i]["is_primary_owner"] + ",";
      csv += usersSubjectToDeactivate[i]["is_owner"] + ",";
      csv += usersSubjectToDeactivate[i]["is_admin"] + ",";
      csv += usersSubjectToDeactivate[i]["is_bot"] + ",";
      csv += usersSubjectToDeactivate[i]["is_restricted"] + ","; //If this is a guest user.
      csv += usersSubjectToDeactivate[i]["is_ultra_restricted"] + ",";//If this is a sigle channel guest
      csv += "\n";
    }
  }
  
  //ファイルに保存
  fileHandler.createATextFile(folderId, "Users_subject_to_deactivate.csv", csv);
}





