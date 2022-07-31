function listDir(path){
    window.resolveLocalFileSystemURL(path,
      function (fileSystem) {
        fileSystem.file(function (file) {
            var reader = new FileReader();
    
            reader.onloadend = function() {
                console.log(this.result);
            };
    
            reader.readAsText(file);
    
        }, (err) => {
            reject(err);

        });
      }, function (err) {
        console.log(err);
      }
    );
  }
  


function listDir(path){
window.resolveLocalFileSystemURL(path,
    function (fileSystem) {
    var reader = fileSystem.createReader();
    reader.readEntries(
        function (entries) {
        console.log(entries);
        },
        function (err) {
        console.log(err);
        }
    );
    }, function (err) {
    console.log(err);
    }
);
}