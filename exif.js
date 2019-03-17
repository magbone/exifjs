let jpeg = require("./jpeg");

class Exif
{
      //TODO
      constructor(){

      }

      setSize(size){
            this.size = size;
      }
      setExif(entrys){
            this.exifEntrys = entrys;
      }

      setGPS(entrys){
            this.GPSEntrys = entrys;
      }
      
}

class Entry{
      
      constructor(){

      }
      
      setTagNumber(tagNumber) {
            this.tagNumber = tagNumber;
      }

      setType(type){
            this.type = type;
      }

      setComponents(components){
            this.components = components;
      }

      setValue(value){
            this.value = value;
      }


      getTagNumber(){
            return this.tagNumber;
      }

      
}


exports.load = function(buffer,success_callback, err_callback){
      var index = 0;
      let exif = new Exif();
      if(!jpeg.isJpeg(buffer)){
            err_callback("The file is not jpeg.");
            return;
      }
      index += 2;

      if(!jpeg.isApp1Maker(buffer, index)){
            err_callback("The jpeg file didn't contain exif data.");
            return;
      }
      index += 2;
      exif.setSize(jpeg.getApp1MakerSize(buffer, index));
      index += 2;
      
      
      if(!jpeg.isExifHeader(buffer, index)){
            err_callback("The jpeg file didn't contain exif data.");
            return;
      }
      index += 6;

      let tiff = jpeg.getTIFFHeader(buffer, index);
      index += tiff.offset;

      if(tiff.align){
            var IFD1Size = (buffer[index] << 8) + buffer[index + 1];
            
            index += 2;
      
            var entrys = new Array();
            for(var i = 0; i < IFD1Size; i++){
                  var entry = new Entry();
                  var tagNumber = (buffer[index] << 8) + buffer[index + 1];
                  entry.setTagNumber(tagNumber);
                  index += 2;
                  var dataFormat = (buffer[index] << 8) + buffer[index + 1];
                  entry.setType(dataFormat);
                  index += 2;
                  var components = new Array(4);
                  for(var j = 0; j < 4; j++)
                        components[j] = buffer[index++];
                  entry.setComponents(components);
                  var offsetOrValue = new Array(4);
                  for(var j = 0; j < 4; j++)
                              offsetOrValue[j] = buffer[index++];
                  if(!jpeg.valueOrOffset(components, dataFormat)){
                        entry.setValue(jpeg.dataFormat(offsetOrValue, dataFormat));
                  }else{
                        var offest = jpeg.dataFormat(offsetOrValue, 4);
                        entry.setValue(jpeg.dataFormat(jpeg.bufferCopy(buffer, 12 + offest, jpeg.getBytes(components, dataFormat)), dataFormat));
                  }
                  entrys.push(entry);
            }
            
            exif.setExif(entrys);
            var GPSOffset;
            for(var i = 0; i < entrys.length; i++){
                  //console.log(entrys[i].tagNumber.toString(16), entrys[i].value);
                  if(entrys[i].tagNumber == 0x8825) {
                        GPSOffset = entrys[i].value + 12;
                        break;
                  }
            }

            var GPSEntrysSize = (buffer[GPSOffset] << 8) + buffer[GPSOffset + 1];
            GPSOffset += 2;

            console.log(GPSEntrysSize);
            var GPSEntrys = new Array();
            for(var i = 0; i < GPSEntrysSize; i++){
                  var entry = new Entry();
                  var tagNumber = (buffer[GPSOffset] << 8) + buffer[GPSOffset + 1];
                  entry.setTagNumber(tagNumber);
                  GPSOffset += 2;
                  var dataFormat = (buffer[GPSOffset] << 8) + buffer[GPSOffset + 1];
                  entry.setType(dataFormat);
                  GPSOffset += 2;

                  var components = new Array(4);
                  for(var j = 0; j < 4; j++)
                        components[j] = buffer[GPSOffset++];
                  entry.setComponents(components);
                  var offsetOrValue = new Array(4);
                  for(var j = 0; j < 4; j++)
                              offsetOrValue[j] = buffer[GPSOffset++];
                  if(!jpeg.valueOrOffset(components, dataFormat)){
                        entry.setValue(jpeg.dataFormat(offsetOrValue, dataFormat));
                  }else{
                        var offest = jpeg.dataFormat(offsetOrValue, 4);  
                        entry.setValue(jpeg.dataFormat(jpeg.bufferCopy(buffer, 12 + offest, jpeg.getBytes(components, dataFormat)), dataFormat));
                  }
                  GPSEntrys.push(entry);
            }

            for(var i = 0; i < GPSEntrys.length; i++){
                  console.log(GPSEntrys[i].tagNumber, GPSEntrys[i].value);
            }
      }
}