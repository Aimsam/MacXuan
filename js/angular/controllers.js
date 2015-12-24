var downloadApp = angular.module('downloadApp', []);

downloadApp.directive('ngRightClick', function ($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, {$event: event});
            });
        });
    };
});

downloadApp.filter('reverse', function () {
    return function (items) {
        return items.slice().reverse();
    };
});

downloadApp.controller('HomeCtrl', ['$scope', function (scope) {
    var client = Aria2Client();

    scope.listType = 1; //1正在下载 2已完成 3全部

    scope.tasks = [];

    var utils = (function () {
        return {
            getRemainTime: function (data) {
                if ((data.totalLength - data.completedLength) == 0) {
                    return '00:00:00';
                }
                var totalSecond = Math.round((data.totalLength - data.completedLength) / data.downloadSpeed);
                var second = totalSecond % 60;
                var minute = Math.floor(totalSecond / 60 % 60);
                var hour = Math.floor(totalSecond / 60 / 60);

                return ((hour < 10) ? '0' + hour : hour) + ':' + ((minute < 10) ? '0' + minute : minute) + ':' + ((second < 10) ? '0' + second : second);
            },
            getCompletePercent: function (result) {
                if (result == 0 || result == null || result == '' || result.completedLength == 0 || result.totalLength == 0) {
                    return 0..toFixed(2);
                }
                return (result.completedLength / result.totalLength * 100).toFixed(2)
            },
            formatSize: function (size) {
                console.log('size' + size);
                if (!size || size == 0 || size == '') {
                    return '0B';
                }
                var text = ["B", "KB", "MB", "GB", "TB"];
                var i = 0;
                while (size >= 1024) {
                    size /= 1024;
                    i++;
                }
                return parseFloat(size).toFixed(2) + text[i];
            },
            getTitle: function (result) {
                var dir = result.dir;
                var title = "Unknown";
                if (result.bittorrent && result.bittorrent.info && result.bittorrent.info.name)
                    title = result.bittorrent.info.name;
                else if (result.files[0].path.replace(
                        new RegExp("^" + dir.replace(/\\/g, "[\\/]") + "/?"), "").split("/").length) {
                    title = result.files[0].path.replace(new RegExp("^" + dir.replace(/\\/g, "[\\/]") + "/?"), "").split("/");
                    if (result.bittorrent)
                        title = title[0];
                    else
                        title = title[title.length - 1];
                } else if (result.files.length && result.files[0].uris.length && result.files[0].uris[0].uri)
                    title = result.files[0].uris[0].uri;

                if (result.files.length > 1) {
                    var cnt = 0;
                    for (var i = 0; i < result.files.length; i++) {
                        if (result.files[i].selected == "true")
                            cnt += 1;
                    }
                    if (cnt > 1)
                        title += " (" + cnt + " files..)"
                }
                return title;
            }
        }

    })();

    scope.test = function () {
        alert('test');
    };

    scope.refresh = function () {
        if (scope.listType == 1 || scope.listType == 3) {
            client.tellWaiting(
                0, 99999,
                function (data) {
                    scope.freshList(data.result);
                }, function (data) {
                    console.debug('error!!!' + data);
                }
            );
            client.tellActive(
                function (data) {
                    scope.freshList(data.result);
                },
                function (data) {
                    console.debug('error!!!' + data);
                }
            );
            client.tellStopped(
                0, 99999,
                function (data) {
                    scope.freshList(data.result);
                },
                function (data) {
                    console.debug('error!!!' + data);
                }
            );
        } else if (scope.listType == 2) {
            client.tellStopped(
                0, 99999,
                function (data) {
                    scope.freshList(data.result);
                },
                function (data) {
                    console.debug('error!!!' + data);
                }
            );
        }

    };

    scope.activeList = function () {
        scope.listType = 1;
        scope.tasks = [];
        scope.refresh();
    };

    scope.completeList = function () {
        scope.listType = 2;
        scope.tasks = [];
        scope.refresh();
    };

    scope.allList = function () {
        scope.listType = 3;
        scope.tasks = [];
        scope.refresh();
    };

    scope.freshList = function (data) {
        ////差集判断
        //for (var m = 0; m < scope.tasks.length; ++i) {
        //    var gg = false;
        //    for (var j = 0; j < data.length; ++j) {
        //        if (scope.tasks[i].gid == data[j].gid) {
        //            console.log(scope.tasks[i].gid + '  ' +data[j].gid);
        //            flag = true;
        //            break;
        //        }
        //    }
        //    if (gg === false) {
        //        alert(1);
        //        scope.tasks[i].hide = 'hide';
        //    }
        //}

        for (var i = 0; i < data.length; ++i) {
            var flag = true;
            for (var j = 0; j < scope.tasks.length; ++j) {
                if (scope.tasks[j].gid == data[i].gid) {
                    if (scope.tasks[j].title != utils.getTitle(data[i])) {
                        scope.tasks[j].title = utils.getTitle(data[i]);
                    }
                    if (scope.tasks[j].status != data[i].status) {
                        scope.tasks[j].status = data[i].status;
                    }
                    if (scope.tasks[j].downloadSpeed != (utils.formatSize(data[i].downloadSpeed) + '/s')) {
                        scope.tasks[j].downloadSpeed = utils.formatSize(data[i].downloadSpeed) + '/s';
                    }
                    if (scope.tasks[j].completeLength != utils.formatSize(data[i].completedLength)) {
                        scope.tasks[j].completeLength = utils.formatSize(data[i].completedLength);
                    }
                    if (scope.tasks[j].remainTime != utils.getRemainTime(data[i])) {
                        scope.tasks[j].remainTime = utils.getRemainTime(data[i]);
                    }
                    if (scope.tasks[j].completePercent != utils.getCompletePercent(data[i]) + '%') {
                        scope.tasks[j].completePercent = utils.getCompletePercent(data[i]) + '%';
                    }
                    flag = false;
                }
            }

            if (flag) {
                scope.tasks.push({
                    id: i,
                    gid: data[i].gid,
                    title: utils.getTitle(data[i]),
                    status: data[i].status,
                    length: utils.formatSize(data[i].totalLength),
                    completeLength: utils.formatSize(data[i].completedLength),
                    remainTime: utils.getRemainTime(data[i]),
                    downloadSpeed: utils.formatSize(data[i].downloadSpeed) + '/s',
                    completePercent: utils.getCompletePercent(data[i]) + '%',
                    path: data[i].path,
                    dir: data[i].dir,
                    files: data[i].files,
                    selected: false
                });
            }
        }
    };

    scope.add = function () {
        var urls = [];
        urls = $('#urls').val().split("\n");
        if (urls != '') {
            for (var i in urls) {
                //@todo 验证 is URI & Metallink

                //@todo 自定义
                client.addUri(urls[i], {'-s': '10', '-k': '1M', '-x': '10'},
                    function (data) {
                        console.log(data.result + "success");
                        $('#urls').val('');
                    },
                    function (data) {
                        console.log(data.error.message);
                    }
                );
            }
        } else {
            console.log('empty');
        }
        scope.refresh();
    };

    scope.highLight = function (id) {
        for (var i = 0; i < scope.tasks.length; ++i) {
            scope.tasks[i].selected = false;
        }
        scope.tasks[id].selected = true;
    };

    scope.showMenu = function (e, id) {
        if (scope.tasks[id].selected) {
            scope.tasks[id].selected = false;
        } else {
            scope.tasks[id].selected = true;
        }
        var nw = require('nw.gui');
        // Create an empty menu
        var menu = new nw.Menu();

        menu.append(new nw.MenuItem({
            label: '打开所在文件夹',
            click: function (e) {
                nw.Shell.openItem(scope.tasks[id].dir);
            }
        }));

        menu.append(new nw.MenuItem({
            type: 'separator'
        }));

        menu.append(new nw.MenuItem({
            label: '开始任务',
            click: function (e) {
                if (scope.tasks[id].status == 'paused') {
                    client.unpause([scope.tasks[id].gid], function (data) {
                        console.log(JSON.stringify(data));
                    }, function (data) {
                        console.log(JSON.stringify(data));
                    })
                }
            }
        }));

        menu.append(new nw.MenuItem({
            label: '暂停任务',
            click: function (e) {
                if (scope.tasks[id].status == 'active') {
                    client.pause([scope.tasks[id].gid], function (data) {
                        console.log(JSON.stringify(data));
                        scope.refresh();
                    }, function (data) {
                        console.log(JSON.stringify(data));
                    })
                }
            }
        }));

        menu.append(new nw.MenuItem({
            label: '移除任务',//@todo
            click: function (e) {
                if (scope.tasks[id].status == 'paused' || scope.tasks[id].status == 'active') {
                    client.remove([scope.tasks[id].gid], function (data) {
                        scope.tasks = [];
                        scope.refresh();
                    }, function (data) {
                        console.log(JSON.stringify(data));
                    })
                } else {
                    client.removeDownloadResult([scope.tasks[id].gid], function (data) {
                        scope.tasks = [];
                        scope.refresh();
                    }, function (data) {
                        console.log(JSON.stringify(data));
                    })
                }
            }
        }));

        menu.append(new nw.MenuItem({
            label: '彻底删除任务',
            click: function (e) {
                if (!confirm('真的要删除我么 ╥﹏╥(此操作将删除本地文件)')) {
                    return;
                }
                if (scope.tasks[id].status == 'paused') {
                    client.remove([scope.tasks[id].gid], function (data) {
                        var fs = require('fs');
                        var files = scope.tasks[id].files;
                        for (var i = 0; i < files.length; ++i) {
                            var file = files[i].path;
                            fs.exists(file, function (exists) {
                                if (exists) {
                                    fs.unlink(file);
                                }
                            });
                            fs.exists(file + '.aria2', function (exists) {
                                if (exists) {
                                    fs.unlink(file + '.aria2');
                                }
                            });
                        }
                        scope.tasks = [];
                        scope.refresh();
                    }, function (data) {
                        console.log(JSON.stringify(data));
                    })
                } else if (scope.tasks[id].status == 'active') {
                    client.remove([scope.tasks[id].gid], function (data) {
                        client.removeDownloadResult([scope.tasks[id].gid], function (data) {
                            var fs = require('fs');
                            var files = scope.tasks[id].files;
                            for (var i = 0; i < files.length; ++i) {
                                var file = files[i].path;
                                fs.exists(file, function (exists) {
                                    if (exists) {
                                        fs.unlink(file);
                                    }
                                });
                                fs.exists(file + '.aria2', function (exists) {
                                    if (exists) {
                                        fs.unlink(file + '.aria2');
                                    }
                                });
                            }
                            scope.tasks = [];
                            scope.refresh();
                        }, function (data) {
                            console.log(JSON.stringify(data));
                        })
                    }, function (data) {
                        console.log(JSON.stringify(data));
                    })
                } else {
                    client.removeDownloadResult([scope.tasks[id].gid], function (data) {
                        var fs = require('fs');
                        var files = scope.tasks[id].files;
                        for (var i = 0; i < files.length; ++i) {
                            var file = files[i].path;
                            fs.exists(file, function (exists) {
                                if (exists) {
                                    fs.unlink(file);
                                }
                            });
                            fs.exists(file + '.aria2', function (exists) {
                                if (exists) {
                                    fs.unlink(file + '.aria2');
                                }
                            });
                        }
                        scope.tasks = [];
                        scope.refresh();
                    }, function (data) {
                        console.log(JSON.stringify(data));
                    })
                }
            }
        }));
        menu.popup(e.x, e.y + 50);
    };

    scope.batchRemove = function () {
        //if (!confirm('确定要删除以下多个文件么？')) {
        //    return;
        //}
        //for (var i = 0; i < scope.tasks.length; ++i) {
        //    if (scope.tasks[i].selected && (scope.tasks[i].status == 'paused' || scope.tasks[i].status == 'active')) {
        //        client.remove([scope.tasks[i].gid], function (data) {
        //        }, function (data) {
        //
        //        });
        //    } else {
        //        alert(scope.tasks[i].status);
        //    }
        //
        //    if (scope.tasks[i].selected && !(scope.tasks[i].status == 'paused' || scope.tasks[i].status == 'active')) {
        //        client.removeDownloadResult([scope.tasks[i].gid], function (data) {
        //        }, function (data) {
        //            alert(JSON.stringify(data));
        //        });
        //    }
        //}
        //scope.tasks = [];
        //scope.refresh();
        //if (scope.tasks[id].status == 'paused' || scope.tasks[id].status == 'active') {
        //    client.remove([scope.tasks[id].gid], function (data) {
        //        scope.tasks = [];
        //        scope.refresh();
        //    }, function (data) {
        //        console.log(JSON.stringify(data));
        //    })
        //} else {
        //    client.removeDownloadResult([scope.tasks[id].gid], function (data) {
        //        scope.tasks = [];
        //        scope.refresh();
        //    }, function (data) {
        //        console.log(JSON.stringify(data));
        //    })
        //}
        for (var i = 0; i < scope.tasks.length; ++i) {
            if (scope.tasks[i].selected && (scope.tasks[i].status == 'active' || scope.tasks[i].status == 'paused')) {
                client.remove([scope.tasks[i].gid], function (data) {
                    scope.tasks = [];
                    scope.refresh();
                }, function (data) {
                    console.log(JSON.stringify(data));
                })
            }
            if (scope.tasks[i].selected && (scope.tasks[i].status == 'complete' || scope.tasks[i].status == 'error')) {
                client.removeDownloadResult([scope.tasks[i].gid], function (data) {
                    scope.tasks = [];
                    scope.refresh();
                }, function (data) {
                    console.log(JSON.stringify(data));
                })
            }
        }

    };

    scope.batchPause = function () {
        for (var i = 0; i < scope.tasks.length; ++i) {
            if (scope.tasks[i].selected && scope.tasks[i].status == 'active') {
                client.pause([scope.tasks[i].gid], function (data) {
                    console.log(JSON.stringify(data));
                    scope.refresh();
                }, function (data) {
                    console.log(JSON.stringify(data));
                })
            }
        }
    };

    scope.batchStart = function () {
        for (var i = 0; i < scope.tasks.length; ++i) {
            if (scope.tasks[i].selected && scope.tasks[i].status == 'paused') {
                client.unpause([scope.tasks[i].gid], function (data) {
                    console.log(JSON.stringify(data));
                }, function (data) {
                    console.log(JSON.stringify(data));
                });
            }
        }
    };

    //放在最下面
    (function init() {
        function connect() {
            client.connect(function () {
                scope.refresh();
                setInterval(function () {
                    scope.refresh();
                    scope.$apply()
                }, 1000);

            }, function () {
                alert('connect error, retry~');
                setTimeout(function () {
                    connect();
                }, 2000);
            });
        }

        connect();

        //定时刷新
        //init event 我实在不太搞得定angular。。决定混写了
        $(document).ready(function () {
            $('#addTask').click(function () {
                scope.add();
                $('#downloadModal').modal('hide');
            });
        });
    })();

}]);