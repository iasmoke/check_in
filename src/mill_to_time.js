module.exports = {
    dhm(t){
        var cd = 24 * 60 * 60 * 1000,
            ch = 60 * 60 * 1000,
            d = Math.floor(t / cd),
            h = Math.floor( (t - d * cd) / ch),
            m = Math.round( (t - d * cd - h * ch) / 60000),
            pad = function(n){ return n < 10 ? '0' + n : n; };
      if( m === 60 ){
        h++;
        m = 0;
      }
    //   if( h === 24 ){
    //     d++;
    //     h = 0;
    //   }
      return `${d + ' дней '}` + [pad(h), pad(m)].join(':') + '';
    //   return [pad(h), pad(m)].join(':');
    },
     hm(ms){
        // days = Math.floor(ms / (24*60*60*1000));
        // daysms=ms % (24*60*60*1000);
        hours = Math.floor(ms/(60*60*1000));
        hoursms=ms % (60*60*1000);
        minutes = Math.floor((hoursms)/(60*1000));
        minutesms=ms % (60*1000);
        sec = Math.floor((minutesms)/(1000));
        pad = function(n){ return n < 10 ? '0' + n : n; };
        return pad(hours) + ":" + pad(minutes) + ":" + pad(sec);
        // return days+":"+hours+":"+minutes+":"+sec;
    }
}