module.exports = {
     toms(obj) {
        if(typeof obj !== 'string') {
          if(obj.toString) obj = obj.toString();
          else throw("Invalid input");
        }
      
        var parts = obj.split(':')
          ,n = parts.length
          ,ms = 0
          ,i
        ;
      
        for(i = 0; i < parts.length; i++) {
          part = parseInt( parts[n - 1 - i]);
          if(i === 0) {
            ms += part * 1000;
          } else if(i === 1) {
            ms += part * 6e4;
          } else if(i === 2) {
            ms += part * 36e5;
          }
        }
      
        return ms;
      }
}