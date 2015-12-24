var gui = require('nw.gui');
var fs = require('fs');
// for the main window it works fine:
var nwWindow = gui.Window.get();
//@todo 这个不能用。不然弹不出窗口。可能还是得修改插件
//nwWindow.on('new-win-policy', function (frame, url, policy) {
//    policy.forceCurrent();
//});

//@todo 复制粘贴问题。貌似linux下会有不同的处理方式
var nativeMenuBar = new gui.Menu({type: "menubar"});
nativeMenuBar.createMacBuiltin("麦旋风");
nwWindow.menu = nativeMenuBar;
nativeMenuBar.createMacBuiltin("麦旋风", {
    hideEdit: true,
    hideWindow: true
});

///////////////////TEST///////////////////////


///////////////////TEST///////////////////////
var defaultDownloadPath = "" + localStorage.defaultDownloadPath;
if (!fs.existsSync(defaultDownloadPath)) {
    $('#settingModal').modal('show');
} else {
    startAria2();
    checkUpate();
}

function startAria2() {
    var main_path = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.macxuan';
    var dirname = process.cwd();
    var path = require('path');
    var ariaPath = path.resolve(dirname, 'aria2c');
    var aria2_session = path.resolve(main_path, 'aria2_session');
    var aria2_cookies = path.resolve(main_path, 'aria2_cookies');
    var aria2_pid = path.resolve(main_path, 'aria2_pid');
    var aria2_log = path.resolve(main_path, 'aria2_log');
    if (!fs.existsSync(main_path)) {
        fs.mkdirSync(main_path, 0755);
    }
    fs.chmodSync(ariaPath, 0755);
    //function
    var kill_process = function (pid) {
        var isWindows = /^win/.test(process.platform);
        if (!isWindows) {
            try {
                process.kill(pid, 'SIGKILL')
            } catch (ex) {
                console.log(ex);
            }
        } else {
            var cp = require('child_process');
            cp.exec('taskkill /PID ' + pid + ' /T /F', function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        }
    };

    //kill exists aria2
    if (fs.existsSync(aria2_pid)) {
        var pid = fs.readFileSync(aria2_pid);
        console.log('kill exists aria2' + pid);
        try {
            kill_process(pid)
        } catch (ex) {
            console.log(ex);
        }
    }

    if (!fs.existsSync(aria2_session)) {
        fs.open(aria2_session, 'w+');
        console.log('create session');
    }

    if (!fs.existsSync(aria2_cookies)) {
        fs.open(aria2_cookies, 'w+');
        console.log('create cookies');
    }

    var defaultDownloadPath = "" + localStorage.defaultDownloadPath;
    var maxDownloadNumer = parseInt(localStorage.maxDownloadNumber);
    maxDownloadNumer = isNaN(maxDownloadNumer) ? 5 : maxDownloadNumer;
    var aria2Command = ariaPath + ' --enable-rpc --rpc-listen-all=true --auto-save-interval=1 --rpc-save-upload-metadata=true ' +
        '--save-session-interval=1 --save-cookies=' + aria2_cookies + ' --save-session=' + aria2_session + ' --input-file=' +
        aria2_session + '  --rpc-allow-origin-all -D ' + '-j' + maxDownloadNumer + ' -c -d ' + defaultDownloadPath;

    console.log("exec : " + aria2Command);

    var exec = require('child_process').exec, child;

    child = exec(aria2Command, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });

    //record process pid
    fs.writeFile(aria2_pid, child.pid + 1);

    gui.Window.get().on('close', function () {
        //@todo 发命令退出
        //rm pid file
        kill_process(fs.readFileSync(aria2_pid));
        fs.unlinkSync(aria2_pid);

        this.close(true);
    });

    window.frames['main-frame'].location.reload();
}

//加载ad
//if (localStorage.lastOpenTime !==  new Date().toDateString()) {
//    var win = gui.Window.open('pages/ad.html', {
//        width: 500,
//        height: 400,
//        "max_width": 500,
//        "max_height": 400,
//        "min_width": 500,
//        "min_height": 400,
//        "toolbar": false
//    });
//}

function checkUpate() {
    //检测更新
    var dirname = process.cwd();
    var path = require('path');
    var packageFile = require(path.resolve(dirname, 'package.json'));

    if (localStorage.checkUpdateDate != new Date().toDateString()) {
        $.ajax({url: "http://ideawebcn.github.io/version.json?t=" + new Date().getTime()})
            .done(function (data) {
                if (data.version != packageFile.version) {
                    $('#updateModal').modal('show');
                    $('#updateMessage').html(data.message);
                    $('#btn-update').attr('onclick', data.onclick);
                    localStorage.checkUpdateDate = new Date().toDateString();
                }
            })
            .fail(function (data) {
            });
    }
}


$('#main-nav li').click(function () {
    $(this).addClass('active');
    $(this).siblings('li').removeClass('active');
});
//
var iframe = window.frames['main-frame'];
nwWindow.on('loaded', function (iframe) {
    var frame = window.frames['main-frame'];

    if (frame.location.href.indexOf('pan.baidu.com/disk/home') != -1) {
        $('#main-frame').hide();
        $.ajax({url: "http://pan.baidu.com/api/list?channel=chunlei&clienttype=0&web=1&num=100&page=1&dir=/&order=time&desc=1&showempty=0&channel=chunlei&clienttype=0&web=1&app_id=250528&_=" + new Date().getTime()})
            .done(function (data) {
                alert(JSON.stringify(data));
            })
            .fail(function (data) {
            });
    }
});


//nwWindow.on('loaded', function (iframe) {
//    var frame = window.frames['main-frame'];
//    if (frame.location.href.indexOf('lixian.qq.com') != -1) {
//        var script = document.createElement("script");
//        fs.readFile('plugins/xuanfeng.js', 'utf8', function (err, data) {
//            script.innerHTML = data;
//        });
//        frame.window.document.body.appendChild(script);
//    }
//
//    if (frame.location.href.indexOf('pan.baidu.com') != -1) {
//        //获取浏览器cookie postMessage@todo
//        var gui = require('nw.gui');
//        var nwWindow = gui.Window.get();
//        var combine_cookies = '';
//        nwWindow.cookies.getAll({}, function (cookies) {
//            for (var i = 0; i < cookies.length; ++i) {
//                if (cookies[i].name == 'BDUSS' && cookies[i].domain == '.baidu.com') {
//                    combine_cookies += 'BDUSS=' + cookies[i].value + ';';
//                }
//                if (cookies[i].name == 'pcsett' && cookies[i].domain == '.pcs.baidu.com') {
//                    combine_cookies += 'pcsett=' + cookies[i].value + ';';
//                }
//            }
//            combine_cookies = combine_cookies.substring(0, combine_cookies.length - 1);
//            var script = document.createElement("script");
//            var cookies = "var combine_cookies = '" + combine_cookies + "';";
//            fs.readFile('plugins/baidu.js', 'utf8', function (err, data) {
//                script.innerHTML = cookies + data;
//            });
//            frame.window.document.body.appendChild(script);
//        });
//    }
//
//    if (frame.location.href.indexOf('vip.xunlei.com') != -1) {
//        var script = document.createElement("script");
//        fs.readFile('plugins/xunlei.js', 'utf8', function (err, data) {
//            script.innerHTML = data;
//        });
//        frame.window.document.body.appendChild(script);
//    }
//});

$('#back-button').click(function () {
    window.frames['main-frame'].history.go(-1);
});

$('#settingModal').on('hidden.bs.modal', function () {
    var defaultDownloadPath = "" + localStorage.defaultDownloadPath;
    if (!fs.existsSync(defaultDownloadPath)) {
        alert('必须设置下载目录');
        $('#settingModal').modal('show');
    }
});

$('#btn-save').click(function () {
    $('#settingModal').modal('hide');
    var defaultDownloadPath = $('#defaultDownloadPath').val();
    if (localStorage.defaultDownloadPath != defaultDownloadPath && fs.existsSync(defaultDownloadPath)) {
        localStorage.defaultDownloadPath = defaultDownloadPath;
        startAria2();
    }
});

$('#dev-button').click(function () {
    if (nwWindow.isDevToolsOpen()) {
        nwWindow.closeDevTools();
    } else {
        nwWindow.showDevTools();
    }
});

$('#taskNumberRange').change(function () {
    localStorage.maxDownloadNumber = $('#taskNumberRange').val();
    $('#taskNumberText').text('同时运行最大任务数 重启生效');
});

$('#settingModal').on('shown.bs.modal', function (e) {
    var number = isNaN(localStorage.maxDownloadNumber) ? 10 : localStorage.maxDownloadNumber;
    $('#taskNumberRange').val(number);
    $('#taskNumber').text(number);
});