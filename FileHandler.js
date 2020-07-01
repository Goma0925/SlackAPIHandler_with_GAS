function FileHandler(){
  this.createATextFile = function(outputFolderID, fileName, content) {
    //指定のフォルダにテキストファイルを作成する
    var content,newFile;//Declare variable names
    outputFolder = DriveApp.getFolderById(outputFolderID);
    var outputFile;
    if (this.fileExists(fileName, outputFolderID)){
      var outputFileCollection = DriveApp.getFilesByName(fileName);
      var outputFile = outputFileCollection.next();
      outputFile.setContent(content);
    }else{
      newFile = outputFolder.createFile(fileName,content);//Create a new text file in the root folder
    }
  };

  this.appendToATextFile = function(outputFileId, content){
    //IDで指定したテキストファイルに、既存のコンテンツにAppendする形でファイルを編集する。
    var outputFile = DriveApp.getFileById(outputFileId);
    var previousContent = outputFile.getBlob().getDataAsString();
    var finalOutput = previousContent + content;
    outputFile.setContent(finalOutput);
  }

  this.fileExists = function(name, folderId) {
    //IDで指定されたフォルダ内に、指定された名前のファイルがあるかチェックする。
    var files = DriveApp.getFilesByName(name);
    while (files.hasNext()) {
      var file = files.next();
      var folders = file.getParents();
      if (folders.hasNext()) {
        var folder = folders.next();
        if (folder.getId() == folderId) {
          return true;
        }
      }
    }
    return false;
  }
}
