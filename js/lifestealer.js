function Aria2Client() {
    var rpcPath = "ws://localhost:6800/jsonrpc";//@todo
    var ws = null;
    var wsCallback = {};
    var uniqueId = 1;
    var isConnected = false;
    return {
        connect: function (openCallback, errorCallback) {
            //@todo auth and http
            ws = new WebSocket(rpcPath);
            ws.onmessage = function (event) {
                var data = JSON.parse(event.data);
                if ($.isArray(data) && data.length) {
                    var id = data[0].id;
                    if (wsCallback[id]) {
                        if (data.error) {
                            //console.debug(wsCallback[id].method + " error:" + JSON.stringify(data.error));
                            if (wsCallback[id].error) {
                                wsCallback[id].error(data);
                            }
                        } else {
                            //console.debug(wsCallback[id].method + " success:" + JSON.stringify(data.result));
                            if (wsCallback[id].success) {
                                wsCallback[id].success(data);
                            }
                        }
                        delete wsCallback[id];
                    }
                } else {
                    if (wsCallback[data.id]) {
                        if (data.error) {
                            //console.debug(wsCallback[data.id].method + " error:" + JSON.stringify(data.error));
                            if (wsCallback[data.id].error) {
                                wsCallback[data.id].error(data);
                            }
                        } else {
                            //console.debug(wsCallback[data.id].method + " success:" + JSON.stringify(data.result));
                            if (wsCallback[data.id].success) {
                                wsCallback[data.id].success(data);
                            }
                        }
                        delete wsCallback[data.id];
                    }
                }
            };
            ws.onerror = function (event) {
                console.warn("ws error", event);
                errorCallback();
            };
            ws.onopen = function () {
                console.debug("ws onopen");
                isConnected = true;
                openCallback();
                //@todo wait connect
            };
        },
        isConnected: function () {
            return isConnected;
        },
        getUniqueId: function () {
            return uniqueId++;
        },
        getCurrentId: function () {
            return uniqueId;
        },
        request: function (method, params, success, error) {
            var id = this.getUniqueId();
            wsCallback[id] = {
                'method': method,
                'success': success,
                'error': error
            };
            var data = {
                jsonrpc: '2.0',
                method: 'aria2.' + method,
                id: id
            };
            if (params != undefined) {
                data.params = params;
            }
            var message = JSON.stringify(data);
            console.debug('request message : ' + message);
            ws.send(message);
        },
        //
        batchRequest: function () {
            //@todo
        },
        /** aria2 interface implements **/
        addUri: function (uris, options, success, error) {
            //@todo 批量添加地址 RPC 接口貌似不支持批量string数组
            if (!uris) {
                return false;
            }
            if (!Array.isArray(uris)) {
                uris = [uris];
            }
            if (!options) {
                options = {};
            }
            this.request('addUri', [uris, options], success, error);
            return true;
        },
        addTorrent: function (torrent, options, success, error) {
            //torrent 貌似要base64编码 @todo test
            if (!torrent) {
                return false;
            }
            if (!options) {
                options = {};
            }
            this.request('addTorrent', [torrent, options], success, error);
            return true;
        },
        addMetallink: function (metalLink, options, success, error) {
            if (!metalLink) {
                return false;
            }
            if (!options) {
                options = {};
            }
            this.request('addMetalLink', options, success, error);
            return true;
        },
        remove: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('remove', gid, success, error);
            return true;
        },
        forceRemove: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('forceRemove', gid, success, error);
            return true;
        },
        removeDownloadResult: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('removeDownloadResult', gid, success, error);
            return true;
        },
        pause: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('pause', gid, success, error);
            return true;
        },
        pauseAll: function (success, error) {
            this.request('pauseAll', {}, success, error);
            return true;
        },
        forcePause: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('forcePause', gid, success, error);
            return true;
        },
        forcePauseAll: function (success, error) {
            this.request('forcePauseAll', {}, success, error);
            return true;
        },
        unpause: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('unpause', gid, success, error);
            return true;
        },
        unpauseAll: function (success, error) {
            this.request('unpauseAll', {}, success, error);
            return true;
        },
        tellStatus: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('tellStatus', [gid], success, error);
            return true;
        },
        getUris: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('getUris', gid, success, error);
            return true;
        },
        getFiles: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('getFiles', gid, success, error);
            return true;
        },
        getPeers: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('getPeers', gid, success, error);
            return true;
        },
        getServers: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('getServers', gid, success, error);
            return true;
        },
        tellActive: function (success, error) {
            this.request('tellActive', null, success, error);
            return true;
        },
        tellWaiting: function (offset, num, success, error) {
            this.request('tellWaiting', [offset, num], success, error);
            return true;
        },
        tellStopped: function (offset, num, success, error) {
            this.request('tellStopped', [offset, num], success, error);
            return true;
        },
        changePosition: function (gid, pos, how, success, error) {
            if (!gid || !pos || !how) {
                return false;
            }
            this.request('changePosition', [gid, pos, how], success, error);
            return true;
        },
        changeUri: function (gid, fileIndex, delIndex, addUris, option, success, error) {
            //@todo
        },
        getOption: function (gid, success, error) {
            if (!gid) {
                return false;
            }
            this.request('getOption', gid, success, error);
            return true;
        },
        changeOption: function (gid, option, success, error) {
            if (!gid || !option) {
                return false;
            }
            this.request('changeOption', [gid, option], success, error);
            return true;
        },
        getGlobalOption: function (success, error) {
            this.request('getGlobalOption', null, success, error);
            return true;
        },
        changeGlobalOption: function (option, success, error) {
            this.request('changeGlobalOption', option, success, error);
            return true;
        },
        getGlobalStat: function (success, error) {
            this.request('getGlobalStat', null, success, error);
            return true;
        },
        getSessionInfo: function (success, error) {
            this.request('getSessionInfo', null, success, error);
            return true;
        },
        shutdown: function (success, error) {
            this.request('shutdown', null, success, error);
            return true;
        },
        forceShutdown: function (success, error) {
            this.request('forceShutdown', {}, success, error);
            return true;
        },
        saveSession: function (success, error) {
            this.request('saveSession', {}, success, error);
            return true;
        },
        multicall: function () {

        },
        getVersion: function (success, error) {
            this.request('getVersion', [], success, error);
            return true;
        }
    }
}


//var client = Aria2Client();
//
//
//client.connect();
//
//
//setTimeout(function foo() {
//    if (client.isConnected()) {
//        //console.debug(client.addUri('http://lx.cdn.baidupcs.com/file/af0fd5575e5f80314c400ba07411d9c3?bkt=p2-qd-761&xcode=adb512ca5974bd9631e1b8142c73b7389359eef145a90c942524c5a568f5b0a0&fid=1293884628-250528-244594215090198&time=1420609763&sign=FDTAXERLBH-DCb740ccc5511e5e8fedcff06b081203-%2FoFtP%2FxKyy%2FDJvcs60W6IB%2Bt%2F6c%3D&to=cb&fm=Nin,B,U,nc&sta_dx=806&sta_cs=158&sta_ft=zip&sta_ct=5&newver=1&newfm=1&flow_ver=3&sl=81723466&expires=8h&rt=sh&r=882862333&mlogid=1255379042&vuk=2651271691&vbdid=4113971944&fin=iPhoneSimulator7.1.sdk.zip&fn=iPhoneSimulator7.1.sdk.zip', {}));
//        //client.getVersion(function (data) {
//        //    console.debug(data.result.version);
//        //});
//        client.tellStatus('d6a6612764280eea');
//    } else {
//        console.debug('wait connect');
//        foo();
//    }
//}, 1000);

