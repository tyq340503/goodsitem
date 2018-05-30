var https = require('https');
var fs = require('fs');
var util = require('util');
var path = require('path');

var BOUNDARYPREFIX = 'nbglme';

var mkpic = function (pic, fn) {
  var mimes = {
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
  };
  var ext = path.extname(pic);
  var mime = mimes[ext];
  if (!mime) return;

  fs.readFile('/home/bnlt/'+pic, function (err, data) {
    content = util.format('Content-Disposition: form-data; name="pic"; filename="%s"\r\n', pic);
    content += util.format('Content-Type: %s\r\n\r\n', mime);
    content += data;
    fn(content);
  });
}

var mkfield = function (field, value) {
  return util.format('Content-Disposition: form-data; name="%s"\r\n\r\n%s', field, value);
}

function uploadRequest( request,response )
{
  var form = new formidable.IncomingForm();
  form.parse( request, function ( err, fields, files ) {
    response.writeHead(200, {'Content-type' : 'text/plain'});
    response.write('reviced upload file');
    response.end( sys.inspect(
      {
        fields : fields,
        files : files
      }) );
  });
}

exports.post = uploadRequest;

// exports.post = function (param, onsuccess, onfailer) {
//   if (param.pic) {
//     mkpic(param.pic, function (pic) {
//       var data = [pic];
//       delete param.pic;
//       for (var i in param) {
//         data.push(mkfield(i, param[i]));
//       }

//       var max = 9007199254740992;
//       var dec = Math.random() * max;
//       var hex = dec.toString(36);
//       var boundary = BOUNDARYPREFIX + hex;

//       var body = util.format('Content-Type: multipart/form-data; boundary=%s\r\n\r\n', boundary)
//                  + util.format('--%s\r\n', boundary)
//                  + data.join(util.format('\r\n--%s\r\n', boundary))
//                  + util.format('\r\n--%s', boundary);

//       console.log(body);
//     });
//   }
// }