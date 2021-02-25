<template>
    <view class="content">
        <view class="loading-container">
            <img src="static/images/jiazai.gif" alt="" class="loading-gif">
            <view class="loading-text">
                正在玩命加载中。。。
                {{operator_position}}
            </view>
        </view>
        
    </view>
</template>

<script>
    // 弹框
    import mixin from '@/common/mixin'
    export default {
        mixins: [mixin],
        data() {
            return {
                /* 手机机型的标识 */
                operator_position: '',
                /* 定位信息 */
                w_version: '',
                /* 保存检测代码集版本时, 返回的代码集版本 */
            }
        },
        //  监听页面的加载, 其参数为上个页面传递的数据, 参数的类型为 obj(用于页面传参)
        mounted() {
            /* 获取手机设备的 机型: */
            this.myPlatform = uni.getSystemInfoSync().platform

            // uni.setStorageSync('S:serverUrl', 'http://app.tlsk.com.cn/')           
            /** 获取到接口的基本地址: 
             * uni.getStorageSync(key): 从本地缓存中同步获取指定 key对应的内容
             */

            if (this.myPlatform == 'ios') {
                // ios机型, 设置全屏显示
                // #ifdef APP-PLUS
                plus.navigator.setFullscreen(true)
                // #endif
            }

            /** 设置屏幕旋转: plus.screen.lockOrientation()
                * 说明: 锁定屏幕方向后, 只能按锁定的屏幕方向显示, 关闭当前页面后仍然有效, 
                        可再次调用此方法修改屏幕锁定方向, 或者调用 unlockOrientation() 恢复到应用默认值
                * 参数: 锁定屏幕的方向: 
                    portrait-primary: 竖屏正方向
                    portrait-secondary: 竖屏反方向
                    landscape-primary: 横屏正方向          
            */
            // #ifdef APP-PLUS
            plus.screen.lockOrientation("portrait-primary");
            // #endif

            uni.redirectTo({
                url: "/pages/login/login",
            }); 
        },
        methods: {
            /** 离线操作 */
            navigate_offline() {
                this.setNetwork = false;
                uni.redirectTo({
                    url: "/pages/offline/offline",
                });
            },
            
            /* 个推推送: uni-app 提供了 uni push服务, 是一个包括客户端和服务端的统一服务, 
             * uni.subscribePush(obj): 开启推送
             */
            // getClient () {
            //     
            // },

            // 检查 代码集 是否需要更新:
            // checkDMJ() {
            //     let that = this
            //     let checkDMJServer = `${this.api}tag.service`
            //     uni.request({
            //         // url: `${that.serverUrl}tag.service`,
            //         url: checkDMJServer,
            //         data: {
            //             "txn-code": "version-code-cache"
            //         },
            //         dataType: 'xml',
            //         success: (res) => {
            //             let jsonObj = that.$x2js.xml2js(res.data)
            //             console.log('检测代码集更新', jsonObj)
            //             that.w_version = jsonObj.cache.version; // 返回的代码集版本
            //             let l_version = uni.getStorageSync("ZD:version"); // 保存在storage中的版本
            //             // 对代码集版本进行检测对比
            //             if (!l_version || l_version != that.w_version) {
            //                 /* 更新代码集的方法 */
            //                 that.updateDMJ(checkDMJServer);
            //                 /* 更新保存的代码集版本号 */
            //                 uni.setStorageSync("ZD:version", that.w_version);
            //             }
            //         }
            //     })
            // },

            // 更新代码集方法: 
            // updateDMJ(url) {
            //     let that = this
            //     uni.request({
            //         url: url,
            //         data: {
            //             "txn-code": "sync-code-cache"
            //         },
            //         dataType: 'xml',
            //         success: function(res) {
            //             let jsonObj = that.$x2js.xml2js(res.data)
            //             console.log('更新代码集', jsonObj)
            //             let zd_content = jsonObj.cache.codeindex

            //             let sc_fl_content = null;
            //             let sc_zl_content = null;
            //             let sc_keyvalue = null;
            //             let jzq_content = null;
            //             let jzq_keyvalue = null;
            //             let jkq_content = null;
            //             let jkq_keyvalue = null;
            //             let sc_json = [];
            //             let jzq_json = [];
            //             let jkq_json = [];

            //             if (zd_content) {
            //                 // 待完善
            //                 for (let i = 0; i < zd_content.length; i++) {
            //                     let typename = zd_content[i]['_type']
            //                     let cdata = zd_content[i]['__cdata']
            //                     // console.log(cdata)
            //                     uni.setStorageSync("ZD:" + typename, JSON.stringify(cdata));
            //                 }
            //             }
            //         }
            //     })
            // },

            // 获取定位信息
            // getLocation() {
            //     let that = this;
            //     /* uni.getLocation(obj): 获取当前的地理位置 速度 
            //         obj: 
            //             * type: 默认为 wgs84, 返回 gps坐标, gcj02返回国测局坐标, 可用于 uni.openLocation 的坐标
            //             * altitude: 传入 true 会返回高度信息, 由于获取高度需要较高的 精确度, 会减慢接口的返回速度
            //             * geocode: 默认为false, 时候解析地址信息
            //             * success: 接口调用成功的回调
            //                 * 返回参数: res
            //                     * latitude: 纬度
            //                     * longitude: 经度
            //                     * speed: 速度
            //                     * accuracy: 位置的精确度
            //                     * altitude: 高度
            //                     * address: 地址信息   
            //                         * address 地址信息说明: 
            //                             * country: 国家
            //                             * province: 省份
            //                             * city: 城市
            //                             * district: 区县
            //                             * street: 街道信息
            //                             * streetNum: 街道门牌号信息
            //                             * postalCode: 邮政编码
            //                             * cityCode: 城市代码      
            //             * fail: 接口调用失败的回调
            //     */
            //     uni.getLocation({
            //         type: 'wgs84',
            //         success: function(res) {
            //             console.log('获取定位信息', add)
            //             let add = res.address;
            //             that.operator_position = add.country + add.province + add.city + add.district + add
            //                 .street;
            //         }
            //     })
            // }
        }
    }
</script>

<style lang="less">
    /* 提示窗口 */
    .uni-tip {
        padding: 30rpx;
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
            padding: 30rpx;
            font-size: 28rpx;
            color: #666;
            text-align: center;
        }
        
        .uni-tip-group-button {
            margin-top: 20rpx;
            display: flex;
            
            .uni-tip-button {
                width: 100%;
                text-align: center;
                font-size: 28rpx;
                color: #3b4144;
                font-weight: 600;
            }
            
            view:nth-child(2) {
                color: #dc1110;
            }
        }
    }
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .loading-container {
        margin-top: 50%;
        align-items: center;
    }

    .loading-gif {
        width: 120px;
        height: 90px;
        margin-left: 20px;
    }

    .loading-text {
        font-size: 16px;
    }
</style>
