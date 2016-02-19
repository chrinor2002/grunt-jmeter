var fs = require('fs');
var path = require('path');
var url = require('url');
var http = require('http');
var unzip = require('unzip');
var fstream = require('fstream');
var admzip = require('adm-zip');

// change

var JMETER_DIR = path.resolve(__dirname, '../jmeter');
var versions = require('../package.json').jmeterVersions;
var filename = "apache-jmeter-"+versions.jmeter+".tgz";
var download_url = "https://archive.apache.org/dist/jmeter/binaries/"+filename;

var filePath = path.join(JMETER_DIR, filename)
var jmeter_extracted = path.join(path.dirname(filePath), path.basename(filePath, '.tgz'))
var extFilename = "JMeterPlugins-ExtrasLibs-"+versions.extraslibs+".zip";
var pluginNames = {
	'extraslibs': "http://jmeter-plugins.org/downloads/file/"+extFilename
};

module.exports.extractIfDoesNotExist = function(tgzPath, callback) {
	var extractedFolder = path.join(path.dirname(tgzPath), path.basename(tgzPath, '.tgz'))
	if(!fs.existsSync(extractedFolder)){
		module.exports.extract(tgzPath, function(err){
			callback(err, tgzPath)
		})
	} else {
		callback(null, tgzPath)
	}
}

/**
 * If a new version of the file with the given url exists, download and
 * delete the old version.
 */
module.exports.downloadPlugin = function(name, callback) {
	var fileUrl = pluginNames[name];
	var fileName = path.basename(fileUrl);
	var tempDir = path.join(JMETER_DIR, 'temp');

	var filePath = path.join(tempDir, fileName);
	if(!fs.existsSync(tempDir)){
		fs.mkdirSync(tempDir)
	}
	if(!fs.existsSync(filePath)){
		getRemoteFile(fileUrl, path.join(tempDir, fileName), function () {
			console.log('UUUUUUUU');
			console.log('UUUUUUUU');
			console.log('UUUUUUUU');
			console.log('UUUUUUUU');
		})
		//module.exports.httpGetFile(fileUrl, fileName, tempDir, function(err){
		//	console.log('UUUUUUUU');
		//	console.log('UUUUUUUU');
		//	console.log('UUUUUUUU');
		//	console.log('UUUUUUUU');
		//	if (err) console.dir(err);
		//	module.exports.extractPlugin(filePath, callback);
		//})
	} else {
		module.exports.extractPlugin(filePath, callback);
	}
};

module.exports.extractPlugin = function(filePath, callback) {
	var fileName = path.basename(filePath, '.zip');
	var tempDir = path.join(JMETER_DIR, 'temp');

	var extractedFolder = path.join(tempDir, fileName);
	console.log('_____', filePath)
	var zip = new admzip(filePath);

	//zip.extractAllTo(extractedFolder, true);
    //
	//fs.createReadStream(filePath).pipe(unzip.Extract({ path: extractedFolder })).on('end', function () {
	//		console.log('_____', filePath)
	//		callback();
	//	})
}

/**
 * If a new version of the file with the given url exists, download and
 * delete the old version.
 */
module.exports.downloadIfDoesNotExist = function(callback) {
	var fileUrl = download_url;
	var outputDir = JMETER_DIR;

	var filePath = path.join(outputDir, filename)
	if(!fs.existsSync(filePath)){
		if(!fs.exists(outputDir)){
			fs.mkdirSync(outputDir)
		}
		module.exports.httpGetFile(fileUrl, filename, outputDir, function(err, tgzPath){module.exports.extractIfDoesNotExist(tgzPath, callback)})
	} else {
		module.exports.extractIfDoesNotExist(path.join(outputDir, filename), callback)
	}
};

/**
 * Function to download file using HTTP.get.
 * Thanks to http://www.hacksparrow.com/using-node-js-to-download-files.html
 * for the outline of this code.
 */
module.exports.httpGetFile = function(fileUrl, fileName, outputDir, callback) {
	console.log('downloading ' + fileUrl + '...');
	var options = {
		host: url.parse(fileUrl).host,
		port: 80,
		path: url.parse(fileUrl).pathname
	};
	console.log('aaaaa')
	console.dir(options)
	http.get(options, function(res) {
		//if (res.statusCode !== 200) {
		//	throw new Error('Got code ' + res.statusCode + ' from ' + fileUrl);
		//}
		var filePath = path.join(outputDir, fileName);
		console.log('filePath', filePath)
		var file = fs.createWriteStream(filePath);
		var dataCount = 0;
		res.on('data', function(data) {
			file.write(data);
			dataCount++
			if(dataCount % 100 == 0){
				dataCount = 0;
				process.stdout.write(".");
			}
		}).on('end', function() {
			file.end(function() {
				console.log(fileName + ' downloaded to ' + filePath);
				if (callback) {
					callback(null, filePath);
				}
			});
		});
	});
};

module.exports.extract = function(tgzPath, callback) {
	var tarball = require('tarball-extract')
	tarball.extractTarball(tgzPath, path.dirname(tgzPath), function(err){
		if(err) console.log(err)
		callback(err)
	});
}


function getRemoteFile (remotePath, localPath, done) {
	http.get(remotePath).on('response', function (response) {
		var file = fs.createWriteStream(localPath);
		var body = '';
		response.on('data', function (chunk) {
			file.write(chunk);
			//body += chunk;
		});
		response.on('end', function () {
			file.end(done);
			//done(null, body);
		});
	});
}