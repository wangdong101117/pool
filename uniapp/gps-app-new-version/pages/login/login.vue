<template>
    <view class="uni-container login-box">
        <view class="login-content">
            <view style="width: 100%;">
                <image src="../../static/login/loginbg.png" style="width: 100%; height: 724rpx;"></image>
            </view>
            
            <view class="login-content-form">
                <!-- input组件:
                       @blur="userIptBlur": 输入框失去焦点时 触发的事件, 具体查看官网 
                -->
                <view class="form-username form-list-item">
					<image src="../../static/login/yonghu.png"></image>
					<text></text>
                    <input type="text" v-model="formData.username" @blur="userIptBlur" placeholder-style="color:#ccc;font-size:38rpx;" placeholder="请输入用户名">
                </view>
                <view class="form-password form-list-item">
					<image src="../../static/login/mima.png"></image>
					<text></text>
                    <input type="text" password v-model="formData.password" @blur="wordIptBlur" placeholder-style="color:#ccc;font-size:38rpx;" placeholder="请输入密码">
                </view>
                <view class="form-addcode form-list-item">
                    <image src="../../static/login/yanzhengma.png" style="width: 56rpx;"></image>
					<text></text>
                    <input type="number" v-model="formData.addcode" @blur="codeIptBlur" placeholder-style="color:#ccc;font-size:38rpx;" placeholder="请输入验证码">
                    <image @tap="prepareRamdonImage()" :src="addcodeSrc" style="width: 70px; height: 30px;">
                </view>
            </view>
            <view class="login-btn">
                <button type="warn" @click="submitLogin">登&nbsp;&nbsp;&nbsp;录</button>
                <view class="btn-navigator">
                    <navigator :url="offlinerUrl" v-if="show_btn_offline" open-type="navigate" class="btn-offline">离线操作</navigator>
                    <navigator :url="forgetUrl" open-type="navigate" class="btn-forget">忘记密码?</navigator>
                </view>
            </view>
        </view>
        <uni-popup :show="logout" type="center" :custom="true" :mask-click="false">
        	<view class="uni-tip">
        		<view class="uni-tip-title">
                    <view>退出应用</view>
                 </view>
        		<view class="uni-tip-content">您确定要退出应用吗？</view>
        		<view class="uni-tip-group-button">
        			<view class="uni-tip-button" @click="cancelLogout()">
                        <view class="btn-cancel">
                            取消
                        </view>    
                        
                     </view>
        			<view class="uni-tip-button" @click="confirmLogout()">
                        <view class="btn-confirm">
                            确定
                        </view>
                    </view>
        		</view>
        	</view>
        </uni-popup>
        
        <!-- 设置网络连接弹框 -->
        <uni-popup :show="setNetwork" type="center" :custom="true" :mask-click="false">
        	<view class="uni-tip">
        		<view class="uni-tip-title">
                    <view>温馨提示</view>
                 </view>
        		<view class="uni-tip-content">网络出错, 请检查网络配置</view>
        		<view class="uni-tip-group-button">
                    <view class="uni-tip-button" @click="cancelSet()">
                        <view class="btn-cancel">
                            关闭
                        </view>    
                      </view>
        			<view class="uni-tip-button" @click="confirmSet()">
                        <view class="btn-confirm">
                            设置网络
                        </view>
                    </view>
        		</view>
        	</view>
        </uni-popup>
        <!-- 更新app版本弹框 -->
        <uni-popup :show="updateApp" type="center" :custom="true" :mask-click="false">
        	<view class="uni-tip">
        		<view class="uni-tip-title">
                    <view>版本更新</view>
                 </view>
        		<view class="uni-tip-content">有新版本发布，是否进行新版本下载？</view>
        		<view class="uni-tip-group-button">
                    <view class="uni-tip-button" @click="confirmLogout()">
                        <view class="btn-cancel">
                            退出应用
                        </view>
                     </view>
        			<view class="uni-tip-button" @click="confirmUpdate()">
                        <view class="btn-confirm">
                            立即更新
                        </view>
                    </view>
        		</view>
        	</view>
        </uni-popup>
        <!-- app下载 进度 弹框 -->
        <uni-popup :show="updateAppProgress" type="center" :custom="true" :mask-click="false">
        	<view class="uni-tip">
        		<view class="uni-tip-title">
                    <view>升级APP</view>
                 </view>
        		<view class="uni-tip-content">
                    <view>正在进行下载更新，请耐心等待。。。</view> 
                    <view style="margin-top: 5px;">
                        <view style="padding: 8px; color: #dc1110;">已下载：{{downloadProgress}}%</view>
                        <progress :percent="downloadProgress" activeColor="#dc1110" border-radius="5" active active-mode="forwards" stroke-width="10" />
                    </view>
                </view>
        	</view>
        </uni-popup>
    </view>
</template>

<script>
    // 弹框
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    import mixin from '@/common/mixin'
    import md5 from '@/common/md5.min.js'
    export default {
        components:{
            uniPopup
        },
        mixins: [mixin],
        data() {
            return {
                show_btn_offline: false,
                logoSrc: '../../static/icon/logo.png',
                offlinerUrl: '/pages/offline/offline', // 离线操作页面路径
                forgetUrl: '/pages/forgetPassWord/forgetPassWord', // 忘记密码页面路径
                // 用户名 密码 验证码 数据
                formData: {
                    username: '',
                    password: '',
                    addcode: ''
                },
                array: [],
                provData: [],
                cityData: [],
                areaData: [],
                addcodeSrc: '',
                logout: false,
                
                
                updateApp: false, // 显示 / 隐藏 更新app 弹框
                downLoadUrl: '', // 新版本app下载地址
                setNetwork: false, // 显示 / 隐藏 设置网络 弹框
                myPlatform: '',
                updateAppProgress: false, // 显示 / 隐藏 下载进度弹框
                downloadProgress: 0, // 已下载的百分比
            }
        },
        methods: {
            /** 设置网络modal框: 关闭按钮 */
            cancelSet() {
                this.setNetwork = false
            },
            /** 设置网络modal框: 设置网络方法*/
            confirmSet() {
                // 隐藏之前显示的弹框
                this.setNetwork = false
                // 如果是ios机型, 操作 ios 机型的 wifi信息
                if (this.myPlatform == 'ios') {
                    let UIApplication = plus.ios.import("UIApplication");
                    let NSURL = plus.ios.import("NSURL");
                    let setting = NSURL.URLWithString("app-settings:");
                    let application = UIApplication.sharedApplication();
                    application.openURL(setting);
                    // #ifdef APP-PLUS
                    plus.ios.deleteObject(setting);
                    plus.ios.deleteObject(application);
                    // #endif    
                } else {
                    // 说明是安卓机型, 操作安卓机型的 wifi信息
                    // 获取应用 注 Activity 实例对象
                    // #ifdef APP-PLUS
                    let main = plus.android.runtimeMainActivity()
                    // importClass() 导入 java类对象, 这里导入的是 android.content.Intenet类对象
                    let Intent = plus.android.importClass('android.content.Intent')
                    // 当上面的对象 导入后 可以使用 new() 创建类的 实例对象
                    let myIntent = new Intent('android.settings.WIFI_SETTINGS')
                    // 打开 创建的实例对象: 设置 wifi页面
                    main.startActivity(myIntent)
                    // #endif    
                }
            },
            /** 验证app应用 是否需要更新 */
            isUpdate() {
                let updateAppServer = `${this.api}txnsysb06.ajson`;
                /** runtime模块: getProperty(): 获取指定AppId对应的应用信息
                 * 参数1: appid: 
                 * 参数2: 回调函数: 
                 * 回调参数: 内部保存着 appid/version/name/author/email/features属性  
                 */
                /** uni-app发送请求: uni.request(obj)
                 * url: 接口地址
                 * data: 请求参数
                 * header: 设置请求的header
                 * method: 请求方式, 默认为 GET
                 * dataType: 期待的 响应体的 类型, 默认为json
                 * success: 接口调用成功的回调
                 */
                // #ifdef APP-PLUS
                plus.runtime.getProperty(plus.runtime.appid, (inf) => {
                    uni.request({
                        url: updateAppServer,
                        data: {
                            "input:app_type": 0,
                            "input:version": inf.version
                        },
                        type: 'GET',
                        dataType: 'json',
                        success: (res) => {
                            console.log('检测更新' ,res)
                            let {error_code, record} = res.data
                            // console.log('检测更新', jsonObj)
                            if (error_code === '000000') {
                                if (record[0].update_flag == '1') {
                                    let note = record[0].note
                                    // 显示更新提示弹框
                                    this.updateApp = true; 
                                    // 保存下载地址
                                    this.downLoadUrl = record[0].url;
                                }
                            } else {
                                this.toastRequestErr(res.data)
                            }
                        },
                        fail: (err) => {
                            this.toastErr()
                        }
                    })
                })
                // #endif
            },
            onStateChanged(download, status) {
                // #ifdef APP-PLUS
                // console.log(download)
				if(download.totalSize == 0){
					this.downloadProgress = 0
				}else{
					 this.downloadProgress = parseInt((download.downloadedSize / download.totalSize) * 100)
				}
                // this.downloadProgress = Number(download.downloadedSize) / Number(download.totalSize) * 100
                // #endif
            },
            /** 更新app应用: 创建下载任务  */
            confirmUpdate() {
				if(this.downLoadUrl.length == 0 || this.downLoadUrl.indexOf("http") == -1 || this.downLoadUrl.indexOf(".apk") == -1){
					uni.showToast({
					    title: '软件下载地址有误:'+this.downLoadUrl,
					    icon: 'none'
					})
					return
				}
                // 隐藏之前显示的更新提示弹框
                this.updateApp = false;
                let filename = '_doc/download/';
            
                // 显示下载进度弹框
                this.updateAppProgress = true
                
                // #ifdef APP-PLUS
                let dtask = plus.downloader.createDownload(this.downLoadUrl, {
                    filename: filename
                },(d, status) => {
                    // 回调函数参数:
                        // d:download对象
                        // status: 状态
                    // 下载完成 
                    if (status == 200) {
                        // runtime模块: 管理运行环境
                            // install() : 安装应用
                                /** install(filePath, options, successCb, errorCb) 安装应用
                                * 参数
                                    * filePath: 必须参数, 要安装的文件路径
                                    * options: 可选参数, 应用安装时设置的参数
                                    * successCb: 可选 安装成功的回调
                                    * errorCb: 可选 安装失败的回调
                                */
                        this.showToast('下载完成, 即将进行安装')
                        this.updateAppProgress = false
                        plus.runtime.install(d.filename, {}, () => {
                        }, (DOMException) => {
                            console.log(JSON.stringify(DOMException));
                        });
                    } else {
                        this.updateAppProgress = false
                        this.toastRequestErr("下载失败: " + status);
                        }
                    }
                );
                // 开始下载的方法
                dtask.addEventListener("statechanged", this.onStateChanged, false);
                dtask.start();
                // #endif
            },
            /** 退出登录 */
            confirmLogout() {
                // 隐藏之前显示的弹框
                this.setNetwork = false;
                this.updateApp = false;
                // #ifdef APP-PLUS
                plus.runtime.quit()
                // #endif
            },
            /** 登录后, 获取该用户下的所有 设备 蓝牙信息, 保存在客户端本地, 以便在没网时 蓝牙解锁/锁车/延期时 使用 */
            getBleInfo() {
                uni.request({
                    url: `${this.api}txndab101.ajson`,
                    data: {},
                    dataType: 'json',
                    success: (res) => {
                        if (res.data.error_code === '000000') {
                            console.log('获取蓝牙信息', res.data)
                        }else {
                            this.toastRequestErr(res.data)
                        }
                    },
                    fail:() => {
                        uni.showToast({
                            title: '网络连接失败请重新尝试',
                            icon: 'none'
                        })
                    }
                })
            },
            /** 取消退出 */
            cancelLogout() {
                this.logout = false;
                this.showToast('已取消退出')
            },
            /** 生成验证码 */
            prepareRamdonImage() {
                var dd = new Date();
                
                let url = this.api + "/eteral.main?txn-code=random&code-name=add-code=" + dd.getTime() + "&image-type=jpg";
                // 直接设置给src属性, src属性会进行发送请求, 原理跟jsonp跨域相似
                this.addcodeSrc = url;
            },
            /*  用户名输入框 @blur绑定的失去焦点事件
                    参数event: 事件对象, event.target: 触发事件的对象, 
                    event.target.value: 获取到输入框的 值
            */
            userIptBlur(event) {
                /* 验证用户名 输入的 合法性 */
                this.formData.username = event.target.value
            },
            wordIptBlur(event) {
                /* 验证密码输入的合法性 */
                this.formData.password = event.target.value
            },
            codeIptBlur(event) {
                /* */
                this.formData.addcode = event.target.value
                console.log
            },
            /* 登录成功, 跳转到 车辆管理 列表页面 */
            toMain() {
                uni.switchTab({
                    url: '/pages/tabBar/gps/globe'
                })

                setTimeout(() => {
                    /* navigator模块: 管理浏览器运行环境信息 
                        closeSplashscreen(): 关闭应用启动界面 */
                    // #ifdef APP-PLUS
                    plus.navigator.closeSplashscreen()
                    // #endif
                }, 800)
            },

            /* 登录按钮绑定的点击事件 处理程序 */
            submitLogin() {
                let username = this.formData.username.trim();
                let password = this.formData.password.trim();
                let addcode = this.formData.addcode.trim();
                console.log('输入的验证码'+addcode);
                if (!username) {
                    this.showToast('请输入用户名');
                    return
                }
                if (!password) {
                    this.showToast('请输入密码');
                    return
                }
                if (!addcode) {
                    this.showToast('请输入验证码');
                    return
                }
                uni.showLoading({
                    title: '登录中, 请稍后'
                })
                /*  发送请求  */
                uni.request({
                    url: `${this.api}txn999999.ajson`,
                    data: {
                        user_no: username,
                        // password: md5(password).toUpperCase(),
                        password: password,
                        add_code: addcode,
                        // type: 1,
                        /* device模块, 可以获取手机设备的相关信息 */
                        /* os模块: 用来管理操作系统信息 */
                        // #ifdef APP-PLUS
                        "mobile:vendor": plus.device.vendor, // 生产厂商
                        "mobile:model": plus.device.model, // 型号
                        "mobile:imei": plus.device.imei, // 国际移动设备身份码
                        "mobile:imsi": plus.device.imsi, // 国际移动用户识别码
                        "mobile:mobile_uid": plus.device.uuid, // 设备唯一标识
                        "mobile:phone_vendor": plus.device.vendor, // 还是生产厂商
                        "mobile:os_type": plus.os.name, // 系统的名称
                        "mobile:version": plus.os.version, // 系统的版本信息
                        "mobile:language": plus.os.language, // 系统的语言信息
                        // #endif
                    },
                    dataType: 'json',
                    success: (res) => {
                        console.log('登录', res.data ,res.data['error_code']);
                        let data = res.data;
                        uni.hideLoading();
                        if (res.data['error_code'] == "000000") {
                            /** navigator模块: 用来管理浏览器运行环境的信息
                                    getCookie(): 获取cookie  
                             */
                            uni.setStorageSync('password', password);
                            uni.showToast({
                                title: '登录成功',
                                icon: 'none'
                            })
                            /* 将用户名 密码 登录状态 存储起来, 以便以后打开app 自动登录使用 */
                            uni.setStorageSync("username", username);
                            // uni.setStorageSync("U:password", md5(password).toUpperCase());
                            // uni.setStorageSync("U:loginFlag", "true");
                            setTimeout(() => {
                                /* 配置客户端标识 */
                                // this.updateClient();

                                /* 跳转到大棚列表页面 */
                                this.toMain(); // 登录成功时, 跳转到大棚列表页面
                            }, 500);

                        } else {
                            console.log('登录失败');
                            this.prepareRamdonImage();
                            this.toastRequestErr(res.data);
                        }
                    },
                    fail: () => {
                        uni.hideLoading();
                        uni.showToast({
                            title: '网络连接失败请重新尝试一下',
                            icon: 'none'
                        })
                    }
                })
            },

            /* 配置客户端标识 */
            // updateClient () {
            //     let clientType = 0
            //     // #ifdef APP-PLUS
            //     /* 返回的客户端推送标识信息对象 */
            //     console.log(plus.push.getClientInfo())
            //     let myInfo = plus.push.getClientInfo()
            //     if (myInfo.clientid) {
            //         let clientId = myInfo.clientid
            //         uni.setStorageSync('S:clientId', clientId)
            //         uni.request({
            //             // url: `${this.serverUrl}txnPYC206.ajax`,
            //             url: `${this.api}txnPYC206.ajax`,
            //             data: {
            //                 "input:client_id": clientId,
            //                 "input:client_type": clientType
            //             },
            //             success: function (data) {

            //             },
            //             error: function () {
            //                 uni.showToast({
            //                     title: '网络连接失败请重新尝试一下',
            //                     icon: 'none'
            //                 })
            //             }
            //         })
            //     }
            //     // #endif
            // },


            /* 获取 省市县区 json 数据, 保存在数据存储区中, 用于地区picker 选择器的 渲染 */
            // getDistricts () {
            //     let dqServer = `${this.api}/txnPYA240.ajax`           
            //     uni.request({
            //         url: dqServer,
            //         data: {},
            //         success: function (res) {
            //             console.log(res)
            //             let jsonObj = this.$x2js.xml2js(res.data).context
            //             console.log('省市县地区json', jsonObj)
            //             if (jsonObj['error-code'] === '000000') {
            //                 let dq_json = jsonObj.districts
            //                 // uni.setStorageSync("ZD:DQ:content", dq_json)    
            //                 console.log(JSON.parse(dq_json))

            //                 this.array = JSON.parse(dq_json)
            //                 this.array.forEach((item, index) => {
            //                     /** 省 */
            //                     this.provData.push({
            //                         label: item.text,
            //                         value: item.value
            //                     })
            //                     this.areaData.push([])
            //                     item.children.forEach((item1, index1) => {
            //                         /** 市 */
            //                         item1.label = item1.text
            //                         delete item1.text
            //                         item1.children.forEach((item2, index2) => {
            //                             /** 县 */
            //                             item2.label = item2.text
            //                             delete item2.text
            //                         })
            //                         this.areaData[index].push(item1.children)
            //                         delete item1.children
            //                     })
            //                     this.cityData.push(item.children)
            //                 })
            //                 console.log(this.provData, this.cityData, this.areaData)
            //                 uni.setStorageSync("ZD:DQ:provData", JSON.stringify(this.provData))
            //                 uni.setStorageSync("ZD:DQ:cityData", JSON.stringify(this.cityData))
            //                 uni.setStorageSync("ZD:DQ:areaData", JSON.stringify(this.areaData))
            //             }
            //         }
            //     })
            // },
        },
        onShow() {
            this.formData.username = uni.getStorageSync('username')
            this.formData.password = uni.getStorageSync('password')
        },
        mounted() {
            this.prepareRamdonImage()
            this.formData.username = uni.getStorageSync('username')
            this.formData.password = uni.getStorageSync('password')
            uni.getNetworkType({
                success:(res) => {
                    /** 如果当前网络状态为 无网络: 
                     * 1. 进行确认消息框提示(文档中描述为: 显示模态弹框): uni.showModal(obj)
                     * obj: 
                        * title: 必选, 提示的标题
                        * content: 必选, 提示的内容
                        * success: 接口调用成功的回调函数
                        * showCancel: 是否显示取消按钮, 默认为true
                        * cancelText: 取消按钮上 的文字, 默认为 取消, 最多可设置4个字符
                        * cancelColor: 取消按钮的文字颜色, 默认为 #000000     
                     * ......      
                     * 2. 当用户点击确定按钮后: 显示手机设置网络界面
                     * 3. 当用户点击退出按钮后: 退出应用
                     */
                    if (res.networkType == 'none') {
                        uni.showToast({
                            title: '无网络连接',
                            icon: 'none'
                        })
                        // 显示网络设置提示弹框
                        this.setNetwork = true;
                        this.show_btn_offline = true
                        console.log('无网络连接')
                        // return
                    } else {
                        this.show_btn_offline = false
                        // 检测应用是否需要更新
                        // this.isUpdate()
                        
                        // this.prepareRamdonImage()
                    }
                }
            })
            
            /* 监听网络状态发生改变: uni.onNetworkStatusChange(callback)
             * 回调函数的参数:
                * isConneected: 布尔值, 表示当前是否有网络连接(头条小程序不支持)
                * networkTyoe: string: 当前网络类型 
             */
            uni.onNetworkStatusChange((res) => {
                if (res.networkType == 'none') {
                    uni.showToast({
                        title: '无网络连接',
                        icon: 'none'
                    })
                    // 显示网络设置提示弹框
                    this.setNetwork = true;
                    this.show_btn_offline = true
                    return
                } else {
                    this.show_btn_offline = false
                    // 检测应用是否需要更新
                    // this.isUpdate()
                    this.prepareRamdonImage()
                }
            })
        },
        onLoad() {
            // this.prepareRamdonImage()
            /* 5+ api 扩展:
                1. device模块: 用来管理设备信息, 可以获取手机设备的相关信息
                2. os模块: 用来管理操作系统信息
                3. nativeUI模块: 用来管理系统原声界面
                4. navigator模块: 用来管理浏览器运行环境的信息
                5. storage模块: 管理应用本地数据存储区
                6. runtime模块: 管理手机设备运行环境
                7. downloader模块: 管理网络文件的下载任务
            */
            // this.getDistricts()
            // if (this.myPlatform == 'ios') {
            //     // #ifdef APP-PLUS
            //     plus.navigator.setFullscreen(true)
            //     plus.screen.lockOrientation('portrait-primary')
            //     // #endif
            //     
            //     /* 登录成功, 调用 toMain(), 跳转到大棚列表页面 */
            //     this.toMain()
            // }
        },
        /* 监听页面返回: onbackPress
            当用户进行以下操作时, 会触发该函数:
                1. android 实体返回键(from = backbutton)
                2. 顶部导航栏左边的返回按钮(from = backbutton)
                3. 返回API: 即: uni.navigateBack() (from = navigateBack)
            注意事项: 
                1. 只有在该函数中的返回值为true 时, 才表示不执行默认的返回, 自行处理此时 的业务逻辑
                2. 不返回或返回其他值, 均会执行默认的返回行为
                3. H5平台, 顶部导航栏返回按钮支持 onbackPress(), 浏览器默认返回按键 以及 Android实体返回键不支持 onBackPress()
                4. 暂不支持直接在自定义组件中配置该函数, 目前只能是在页面中进行处理        
         */
        onBackPress() {
            this.logout = true;
            return true
        }
    }
</script>

<style lang="less">
    @import '../../common/uni-nvue.css';
    @import '../../common/common.css';
    
    .login-box {
	   padding: 0;
       box-sizing: border-box;
       height: 100%;
       
        .login-content {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
         
            /* 表单部分 */
            .login-content-form {
                width: 80%;
                margin-left: 10%;
                display: flex;
                flex-direction: column;
                font-size: 16px;
				
				.form-list-item{
					display: flex;
					flex-direction: row;
					margin-bottom: 50rpx;
					padding-bottom: 18rpx;
					border-bottom: 1px solid #ccc;
					
					&>image{
						width: 50rpx;
						height: 50rpx;
					}
					
					text{
						height: 26rpx;
						border: 2rpx solid #ccc;
						border-radius: 4rpx;
						margin: 16rpx 20rpx 0 16rpx;
					}
				}
				
                input {
                    width: 70%;
					font-size: 38rpx;
                }
                
                .form-addcode {
					padding-bottom: 0;
                }
            }
        
            /* 按钮部分 */
            .login-btn {
                width: 80%;
                margin-left: 10%;
                margin-top: 30rpx;
                
                button {
                    font-size: 36rpx;
                }
                
                /* 注册 忘记密码按钮 */
                .btn-navigator {
                    margin-top: 42rpx;
                    font-size: 14px;
                    color: #666;
                    
                    .btn-offline {
                        float: left;
                        font-size: 16px;
                    }
                    
                    .btn-forget {
                        float: right;
                        font-size: 16px;
						color: #a1a1a1;
                    }
                }
            }
        }
        
        /* 提示窗口 */
        .uni-tip {
            padding: 40rpx 40rpx 60rpx 40rpx;
            width: 600rpx;
            background: #fff;
            box-sizing: border-box;
            border-radius: 20rpx;
            
            .uni-tip-title {
                text-align: center;
                font-weight: bold;
                font-size: 32rpx;
                color: #333;
            }
            
            .uni-tip-content {
                padding: 34rpx 0 80rpx 0;
                font-size: 28rpx;
                font-weight: bold;
                text-align: center;
            }
            
            .uni-tip-group-button {
                display: flex;
                padding: 0 8rpx;
                
                .uni-tip-button {
                    flex: 1;
                    display: flex;
                    font-size: 26rpx;
                    color: #3b4144;
                    font-weight: 600;
                    
                    view {
                        height: 64rpx;
                        line-height: 64rpx;
                        width: 168rpx;
                        margin: auto;
                        text-align: center;
                        letter-spacing: 0;
                    }
                    
                    .btn-confirm {
                        color: #fff;
                        background: #bd0202;
                        border-radius: 32rpx;
                        box-shadow: 0rpx 10rpx 10rpx 0rpx #d54048;
                    }
                    
                    .btn-cancel {
                        color: #bdbdbd;
                    }
                }
            }
        }
        
    }
</style>
