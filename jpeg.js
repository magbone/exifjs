

function TIFFHeader(){
      align: 0// 0: itel type 1: motorola
      offset: 0
}



exports.isJpeg = function(buffer){
      return buffer[0] == 0xFF && buffer[1] == 0xD8; 
};

exports.isApp1Maker = function(buffer, index){
      return buffer[index] == 0xFF && buffer[index + 1] == 0xE1; 
};

exports.isExifHeader = function(buffer, index){
      return buffer[index] == 0x45 && buffer[index + 1] == 0x78 && buffer[index + 2] == 0x69 && 
      buffer[index + 3] == 0x66 && buffer[index + 4] == 0x00 && buffer[index + 5] == 0x00;
}

exports.getApp1MakerSize = function(buffer, index){
      return (buffer[index] << 8) + buffer[index + 1];
}

exports.getTIFFHeader = function(buffer, index){
      let tiffHeader = new TIFFHeader();
      if (buffer[index] == 0x4d && buffer[index + 1] == 0x4d){
            if(buffer[index + 2] == 0x00 && buffer[index + 3] == 0x2A){
                  tiffHeader.align = 1;
            }
      }
      else if(buffer[index] == 0x49 && buffer[index + 1] == 0x49){
            if(buffer[index + 2] == 0x2A && buffer[index + 3] == 0x00){
                  tiffHeader.align = 0;
            }
      }

      tiffHeader.offset = (buffer[index + 4] << 24) + (buffer[index + 5] << 16 ) + (buffer[index + 6]  << 8 ) + buffer[index + 7];      
      return tiffHeader;
}
exports.getBytes = (components, dataFormat) =>{
      var size = 1;
      var count = (components[0] << 24) + (components[1] << 16) + (components[2] << 8) + components[3];
      switch(dataFormat){
            case 1:
            case 2:
            case 7:
             size = 1;
             break;
            case 4:
            case 9:
             size = 4;
             break;
            case 5:
            case 10:
             size = 8;
             break;
            case 3:
             size = 2;
             break;
      }
      return size * count;
}
exports.valueOrOffset = function(components, dataFormat){
      var typeMap = new Map();
      typeMap.set(1, 1); //Byte
      typeMap.set(2, 1); //ASCII
      typeMap.set(3, 2); //Short
      typeMap.set(4, 4); //Long
      typeMap.set(5, 8); //Rational
      typeMap.set(7, 1); //Undefined
      typeMap.set(9, 4); //Slong
      typeMap.set(10, 8); //Srational

      var size = 1;
      var count = (components[0] << 24) + (components[1] << 16) + (components[2] << 8) + components[3];
      switch(dataFormat){
            case 1:
            case 2:
            case 7:
             size = 1;
             break;
            case 4:
            case 9:
             size = 4;
             break;
            case 5:
            case 10:
             size = 8;
             break;
            case 3:
             size = 2;
             break;
      }
      return (size * count) > 4
}

exports.dataFormat = function(buffer, formatType, components){
      const componentsByte = (components[0] << 24) + (components[1] << 16) + (components[2] << 8) + components[3];
      switch(formatType){
            case 1:
                  return  buffer;
            case 2: 
                  return new Buffer.from(buffer).toString("ascii");
            case 3:
                  return (buffer[0] << 8) + buffer[1];
            case 4: 
                  return (buffer[0] << 24) + (buffer[1] << 16) + (buffer[2] << 8) + buffer[3];
            case 5:
                  var rationalByte = new Array()
                  for(var i = 0; i < componentsByte; i++) {
                        rationalByte.push(((buffer[0 + 8 * i] << 24) + (buffer[1 + 8 * i] << 16) + (buffer[2 + 8 * i] << 8) + buffer[3 + 8 * i]) / 
                              ((buffer[4 + 8 * i] << 24) + (buffer[5 + 8 * i] << 16) + (buffer[6 + 8 * i] << 8) + buffer[7 + 8 * i]));
                  }
                  return rationalByte;
      }
      return null;
};

exports.bufferCopy = function(buffer, start, len){
      let arr = new Array(len);
      for(var i = 0; i < len; i++){
            arr[i] = buffer[start + i];
      }
      return arr;
}