<template>
    <view class="uni-container personal-center-container">
        <view class="logo-container">
            <image src="../../../static/icon/logo.png"></image>
        </view>
        <view class="content">
            <view>
                <view>
                    <image src="../../../static/personal/yonghuming.png" mode="aspectFit"></image>
                    <text>用户名</text>
                </view>
                <text></text>
                <view>{{userInfo.user_no}}</view>
            </view>
            <view>
                <view>
                    <image src="../../../static/personal/xingming.png" mode="aspectFit"></image>
                    <text>姓名</text>
                </view>
                <text></text>
                <view>{{userInfo.name}}</view>
            </view>
            <view>
                <view>
                    <image src="../../../static/personal/shouji-2.png" mode="aspectFit"></image>
                    <text>电话号</text>
                </view>
                <text></text>
                <view>{{userInfo.mobile}}</view>
            </view>
            <view>
                <view>
                    <image src="../../../static/personal/jiaose1.png" mode="aspectFit"></image>
                    <text>角色</text>
                </view>
                <text></text>
                <view>
                    <MyTagTranslate codeType="tl_authority_role" :codeValue="userInfo.role_uid" style="text-align: left;" />
                </view>
            </view>
            <view>
                <view>
                    <image src="../../../static/personal/banben.png" mode="aspectFit"></image>
                    <text>当前版本</text>
                </view>
                <text></text>
                <view @tap="checkVersion">{{version}}</view>
            </view>
			<view>
			    <view>
			        <image src="../../../static/personal/about.png" mode="aspectFit"></image>
			        <text>关于</text>
			    </view>
			    <text></text>
			    <view @tap="checkPravice">隐私政策</view>
			</view>
        </view>
        <view class="button-container">
            <view class="btn-edit-pw" hover-class="hoverStyle" @tap="goEditPassWord">
                <image src="../../../static/personal/xiugai.png" mode="aspectFit"></image>
                <text>修改密码</text>
            </view>
            <view class="seat"></view>
            <view class="btn-logout" hover-class="hoverStyle" @tap="goLogout">
                <image src="../../../static/personal/tuichu5.png" mode="aspectFit"></image>
                <text>退出登录</text>
            </view>
        </view>
        <!-- 放置退出登录 popup -->
        <logout ref="logoutModal"></logout>
    </view>
</template>

<script>
    // 退出登录模板
    import logout from '@/pages/component/logout/logout.vue'
    import MyTagTranslate from '@/components/myTagtranslate/myTagtranslate.vue'
    import uniIcons from "@/components/uni-icons/uni-icons.vue"
    import mixin from '@/common/mixin.js'
    export default {
        components: {
            logout,
            uniIcons,
            MyTagTranslate
        },
        mixins: [mixin],
        data() {
            return {
                logoutShow: false,
                codeValue: '',
                userInfo: {},
                version: ''
            }
        },
        onShow() {      
            this.getUserInfo()
        },
        onHide() {
            this.$refs.logoutModal.logout = false;
        },
        methods: {
            /** 获取用户个人信息, 渲染头像, 用户名等要素 */
            getUserInfo() {
                uni.showLoading({
                    title: '加载中...'
                })
                uni.request({
                    url: `${this.api}txnsau00w.ajson`,
                    data: {},
                    dataType: 'json',
                    method: 'POST',
                    success: (res) => {
                        uni.hideLoading()
                        console.log('获取到的个人信息', res)
                        if (res.data.error_code === '000000') {
                            this.userInfo = res.data.record[0]
                            // #ifdef APP-PLUS
                            plus.runtime.getProperty(plus.runtime.appid, (inf) => {
                                this.version = inf.version
                            })
                            // #endif
                        } else {
                            uni.hideLoading()
                            this.toastRequestErr(res.data)
                        }
                    },
                    fail: () => {
                        uni.hideLoading()
                        this.toastErr()
                    }
                })
            },
            // isUpdate() {
            //     let updateAppServer = `${this.api}txnsysb06.ajson`;
            //     /** runtime模块: getProperty(): 获取指定AppId对应的应用信息
            //      * 参数1: appid: 
            //      * 参数2: 回调函数: 
            //      * 回调参数: 内部保存着 appid/version/name/author/email/features属性  
            //      */
            //     /** uni-app发送请求: uni.request(obj)
            //      * url: 接口地址
            //      * data: 请求参数
            //      * header: 设置请求的header
            //      * method: 请求方式, 默认为 GET
            //      * dataType: 期待的 响应体的 类型, 默认为json
            //      * success: 接口调用成功的回调
            //      */
            //     // #ifdef APP-PLUS
            //     plus.runtime.getProperty(plus.runtime.appid, (inf) => {
            //         uni.request({
            //             url: updateAppServer,
            //             data: {
            //                 "input:app_type": 0,
            //                 "input:version": inf.version
            //             },
            //             type: 'GET',
            //             dataType: 'json',
            //             success: (res) => {
            //                 console.log('检测更新' ,res)
            //                 let {error_code, record} = res.data
            //                 // console.log('检测更新', jsonObj)
            //                 if (error_code === '000000') {
            //                     if (record[0].update_flag == '1') {
            //                         let note = record[0].note
            //                         // 显示更新提示弹框
            //                         this.updateApp = true; 
            //                         // 保存下载地址
            //                         this.downLoadUrl = record[0].url;
            //                     }
            //                 } else {
            //                     this.toastRequestErr(res.data)
            //                 }
            //             },
            //             fail: (err) => {
            //                 this.toastErr()
            //             }
            //         })
            //     })
            //     // #endif
            // },
            checkVersion() {
                
            },    
			/* 隐私协议 */
            checkPravice() {
                uni.navigateTo({
                    url: '/pages/component/personal_center/pravice'
                })
            },
            /** 点击头像, 跳转到 个人信息详情 */ 
            // goUserInfo() {
            //     uni.navigateTo({
            //         url: `/pages/component/personal_center/userInfo?user_no=${this.userInfo.user_no}&name=${this.userInfo.name}&mobile=${this.userInfo.mobile}&role_uid=${this.userInfo.role_uid}`
            //     })
            // },
            /** 修改密码 */
            goEditPassWord() {
                uni.navigateTo({
                    url: '/pages/component/personal_center/editPassword'
                })
            },
            /** 退出登录 */
            goLogout() {
                this.$refs.logoutModal.showLogoutModal();
            }
        },
        onBackPress() {
            this.$refs.logoutModal.showLogoutModal();
            return true
        }
    }
</script>

<style lang="less">
    @import '../../../common/uni-nvue.css';
    // @import '../../../common/common.css';;
    .personal-center-container {
        width: 100%;
        padding: 0rpx 64rpx 30rpx 64rpx;
        box-sizing: border-box;
        min-height: 100%;
        // background: #f7f7f7;
        font-size: 28rpx;
        color: #333;
        
        .content {
            padding: 5rpx 68rpx 65rpx 68rpx;
            margin: 20rpx 0 50rpx 0;
            box-sizing: border-box;
            background: #fff;
            border-radius: 16rpx;
            box-shadow: 0px 2rpx 8rpx -2rpx rgba(0,0,0,0.12);
            
            &>view {
                display: flex;
                height: 40rpx;
                padding: 50rpx 0 40rpx 0;
                line-height: 40rpx;
                border-bottom: 1px solid #e2e2e2;
                
                &>view {
                    flex: 6;
                    display: flex;
                    padding-left: 30rpx;
                    
                    image {
                        width: 40rpx;
                        height: 40rpx;
                    }
                    
                    text {
                        flex: 1;
                        text-align: center;
                    }
                    
                    &:last-child {
                        flex: 7;
                        box-sizing: border-box;
                        padding-left: 42rpx;
                    }
                }
                
                &>text {
                    display: inline-block;
                    box-sizing: border-box;
                    width: 6rpx;
                    height: 24rpx;
                    margin-top: 10rpx;
                    background: #d8d8d8;
                    border-radius: 3rpx;
                }
            }
        }
        
        .button-container {
            display: flex;
            
            .btn-edit-pw, .btn-logout {
                flex: 1;
                display: flex;
                height: 32rpx;
                line-height: 32rpx;
                padding: 47rpx 62rpx;
                background: #fff;
                border-radius: 16rpx;
                box-shadow: 0px 2rpx 8rpx -2rpx rgba(0,0,0,0.12);
               
                text {
                    flex: 1;
                    text-align: center;
                }
                
                image {
                    width: 32rpx;
                    height: 32rpx;
                }
            }
            
            .seat {
                width: 28rpx;
                height: 126rpx;
            }
        }
        
        .logo-container {
            width: 100%;
            text-align: center;    
               
            image {
                height: 112rpx;
                width: 190rpx;
                padding: 36rpx 26rpx 18rpx 26rpx;
                background: #fff;
                border-radius: 18rpx;
            }
        }
    }
</style>
