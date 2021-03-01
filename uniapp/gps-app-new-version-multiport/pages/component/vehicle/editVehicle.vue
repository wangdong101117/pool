<template>
    <view class="edit-vehicle-container">
        <view class="content">
            <view>
                <text>整车编号：</text>
                <input type="text" placeholder="请输入整车编号" v-model="vehicle_id">
            </view>
            <uni-combox label="发动机型号：" :value="selectedEngineModelName" @sendValue="selectedEngineMode" :s_id="refs[0]" :required="true"
                v-model="selectedEngineModelName" placeholder="请选择发动机型号" color="#e2e2e2"
                codeType="tlt_engine_model_available" :ref="refs[0]"></uni-combox>
            <uni-combox label="车辆型号：" :value="selectedVehicleModelName" @sendValue="selectedVehicleModel" :s_id="refs[1]" :required="true"
                v-model="selectedVehicleModelName" placeholder="请选择车辆型号" color="#e2e2e2"
                codeType="tlt_vehicle_model_available" :ref="refs[1]"></uni-combox>
            <view>
                <text>发动机编号：</text>
                <input type="text" placeholder="请输入发动机编号" v-model="engine_id">
            </view>
            <view>
                <text>车架号：</text>
                <input type="text" placeholder="请输入车架号" v-model="frame_id">
            </view>
            <view>
                <text>变速箱编号：</text>
                <input type="text" placeholder="请输入变速箱编号" v-model="gearbox_id">
            </view>
            
            <view class="button-container">
                <view class="btn-cancel" @tap="cancelButton" hover-class="hoverStyle">
                    取消
                </view>
                <view class="btn-confirm">
                    <view @tap="confirmButton" hover-class="hoverStyle">确定</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    import uniCombox from "@/components/uni-combox/uni-combox"
    import mixin from '@/common/mixin.js'
    export default {
        components: {
            uniCombox
        },
        mixins: [mixin],
        data() {
            return {
                refs: ['combox1', 'combox2'],
                uid: '', // 接收传过来的uid
                vehicle_id: '',
                selectedEngineModelName: '', // 选择的发动机型号name
                selectedEngineModelValue: '', // 选择的发动机型号value
                selectedVehicleModelName: '', // 选择的车辆型号name
                selectedVehicleModelValue: '', // 选择的车辆型号value
                gearbox_id: '', // 变速箱编号
                engine_id: '', // 发动机编号
                frame_id: '', // 车架号
            }
        },
        methods: {
            /** 根据传过来的uid查看要修改的车辆信息; 说明: 该接口content-type不能设置为 urlencoded形式 */
            getEditVehicleInfo() {
                uni.request({
                    url: `${this.api}txnsyscv2.ajson`,
                    // #ifdef MP-WEIXIN
                    // header: getApp().globalData.header,
                    header: {
                        Cookie: getApp().globalData.header.Cookie
                    },
                    // #endif
                    data: {
                        primary_key: {
                            uid: this.uid,
                        }
                    },
                    method: 'POST',
                    dataType: 'json',
                    success: (res) => {
                        console.log('要修改的车辆信息', res.data)
                        if (res.data.error_code === '000000') {
                            let record = res.data.record[0]
                            this.vehicle_id = record.vehicle_id
                            this.selectedEngineModelName = record.engine_model
                            this.selectedVehicleModelName = record.model
                            this.gearbox_id = record.gearbox_id
                            this.engine_id = record.engine_id
                            this.frame_id = record.vehicle_frame_id
                        } else {
                            this.toastRequestErr(res.data)
                        }
                    },
                    fail: () => {
                        this.toastErr()
                    }
                })
            },
            /** 选择发动机型号 注册的自定义事件给父组件传递参数 */
            selectedEngineMode(value) {
                console.log('默认的发动机型号', value)
                this.selectedEngineModelValue = value
            },
            /** 选择车辆型号 注册的自定义事件给父组件传递参数 */
            selectedVehicleModel(value) {
                this.selectedVehicleModelValue = value
            },
            /** 取消按钮 */
            cancelButton() {
                this.removeEventListenerComBoxToggle();
                // 返回到车辆列表页面
                uni.switchTab({
                    url: '/pages/tabBar/vehicle/vehicle'
                });
            },
            /** 确定按钮 */
            confirmButton() {
                // 判断是否都进行了选择/输入
                if (!this.vehicle_id) {
                    this.showToast('请输入整车编号')
                    return
                }
                if (!this.selectedEngineModelValue) {
                    this.showToast('请选择发动机型号')
                    return
                }
                if (!this.selectedVehicleModelValue) {
                    this.showToast('请输入车辆型号')
                    return
                }
                if (!this.gearbox_id) {
                    this.showToast('请输入变速箱编号')
                    return
                }
                if (!this.engine_id) {
                    this.showToast('请输入发动机编号')
                    return
                }
                if (!this.frame_id) {
                    this.showToast('请输入车架号')
                    return
                }
                
                // 发送修改车辆请求
                uni.request({
                    url: `${this.api}txnsyscv4.ajson`,
                    // #ifdef MP-WEIXIN
                    header: getApp().globalData.header,
                    // #endif
                    data: {
                        record: {
                            uid: this.uid, // uid
                            model: this.selectedVehicleModelValue, // 车辆型号
                            vehicle_id: this.vehicle_id, // 整车编号,
                            engine_model: this.selectedEngineModelValue, // 发动机型号
                            engine_id: this.engine_id, // 发动机编号
                            vehicle_frame_id: this.frame_id, // 车架号
                            gearbox_id: this.gearbox_id, // 变速箱ID
                        }
                    },
                    method: 'POST',
                    dataType: 'json',
                    success: (res) => {
                        console.log(res)
                        if (res.data.error_code === '000000') {
                            uni.showToast({
                                title: '修改车辆成功',
                            })
                            this.removeEventListenerComBoxToggle();
                            // 返回到车辆列表页面
                            setTimeout(() => {
                                // 返回到车辆列表页面
                                uni.switchTab({
                                    url: '/pages/tabBar/vehicle/vehicle'
                                });
                            }, 1500)
                        } else {
                            this.toastRequestErr(res.data)
                        }
                    },
                    fail: () => {
                        this.toastErr()
                    }
                })
            }
        },
        /** 监听 下拉框组件 注册的全局自定义事件 */
        onShow() {
            this.addEventListenerComBoxToggle();
        },
        onBackPress() {
            this.removeEventListenerComBoxToggle();
        },
        onLoad(option) {
            this.uid = option.uid;
            this.getEditVehicleInfo();
        }
    }
</script>

<style lang="less">
    @import '../../../common/uni-nvue.css';
    .edit-vehicle-container {
        padding: 64rpx 50rpx;
        min-height: 100%;
        box-sizing: border-box;
        font-size: 28rpx;
        color: #333;
        
        .content {
            padding: 12rpx 86rpx;
            box-sizing: border-box;
            background: #fff;
            border-radius: 16rpx;
            box-shadow: 0px 2rpx 8rpx -2rpx rgba(0,0,0,0.12);
            
            &>view {
                display: flex;
                border-bottom: 1px solid #e2e2e2;
                padding: 48rpx 0rpx 32rpx 0rpx;
                // padding: 48rpx 20rpx 32rpx 54rpx;
            
                text {
                    white-space: nowrap;
                    font-size: 28rpx;
                }
            
                input {
                    text-align: left;
                    font-size: 28rpx;
                }
            }
       
            .button-container {
                border: none;
                padding: 64rpx 38rpx 48rpx 38rpx;
                display: flex;
                
                .btn-cancel {
                    flex: 1;
                    color: #bdbdbd;
                    padding: 18rpx 0;
                }
                
                .btn-confirm {
                    flex: 1;
                    
                    view {
                        float: right;
                        width: 168rpx;
                        padding: 18rpx 0rpx;
                        text-align: center;
                        background: #bd0202;
                        color: #fff;
                        border-radius: 32rpx;
                        box-shadow: 0rpx 10rpx 10rpx 0rpx #d54048;
                    }
                }
            }
        }
    }
</style>
