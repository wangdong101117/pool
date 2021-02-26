<template>
    <view class="add-vehicle-container">
        <view class="content">
            <view>
                <text>整车编号：</text>
                <input type="text" placeholder="请输入整车编号" v-model="vehicle_id">
            </view>
            <uni-combox label="发动机型号：" :value="selectedEngineModelName" :s_id="refs[0]" @sendValue="selectedEngineMode" :required="true"
                v-model="selectedEngineModelName" placeholder="请选择发动机型号" color="#e2e2e2"
                codeType="tlt_engine_model_available" :ref="refs[0]"></uni-combox>
            <uni-combox label="车辆型号：" :value="selectedVehicleModelName" :s_id="refs[1]" @sendValue="selectedVehicleModel" :required="true"
                v-model="selectedVehicleModelName" placeholder="请选择车辆型号" color="#e2e2e2"
                codeType="tlt_vehicle_model_available" :ref="refs[1]"></uni-combox>
            <view>
                <text>变速箱编号：</text>
                <input type="text" placeholder="请输入变速箱编号" v-model="gearbox_id">
            </view>
            <view>
                <text>发动机编号：</text>
                <input type="text" placeholder="请输入发动机编号" v-model="engine_id">
            </view>
            <view>
                <text>车架号：</text>
                <input type="text" placeholder="请输入车架号" v-model="frame_id">
            </view>
          
            <uni-combox label="GPS设备：" :value="selectedGPSName" @sendValue="selectedGPS" :s_id="refs[2]" :required="true"
                v-model="selectedGPSName" placeholder="请选择GPS设备" color="#e2e2e2"
                 codeType="tlt_gps_unused" :ref="refs[2]"></uni-combox>
                 
            <view class="button-container">
                <view class="btn-cancel" @tap="cancelButton" hover-class="hoverStyle">取消</view>
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
                refs: ['combox1', 'combox2', 'combox3'],
                vehicle_id: '',
                selectedEngineModelName: '', // 选择的发动机型号name
                selectedEngineModelValue: '', // 选择的发动机型号value
                selectedVehicleModelName: '', // 选择的车辆型号name
                selectedVehicleModelValue: '', // 选择的车辆型号value
                gearbox_id: '', // 变速箱编号
                engine_id: '', // 发动机编号
                frame_id: '', // 车架号
                selectedGPSName: '', // 选择的GPSname
                selectedGPSValue: '' // 选择的GPSvalue
            }
        },
        /** 监听 下拉框组件 注册的全局自定义事件 */
        onShow() {
            this.addEventListenerComBoxToggle();
        },
        onBackPress() {
            this.removeEventListenerComBoxToggle();
        },
        methods: {
            /** 选择发动机型号 注册的自定义事件给父组件传递参数 */
            selectedEngineMode(value) {
                this.selectedEngineModelValue = value
            },
            /** 选择车辆型号 注册的自定义事件给父组件传递参数 */
            selectedVehicleModel (value) {
                this.selectedVehicleModelValue = value
            },
            /** 选择GPS设备 注册的自定义事件给父组件传递参数 */
            selectedGPS(value) {
                this.selectedGPSValue = value
            },
            /** 取消按钮 */
            cancelButton() {
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
                if (!this.selectedGPSValue) {
                    this.showToast('请选择GPS设备')
                    return
                }
                // 发送增加车辆请求
                uni.request({
                    url: `${this.api}txnsyscv3.ajson`,
                    data: {
                        record: {
                            model: this.selectedVehicleModelValue, // 车辆型号
                            vehicle_id: this.vehicle_id, // 整车编号,
                            engine_model: this.selectedEngineModelValue, // 发动机型号
                            engine_id: this.engine_id, // 发动机编号
                            vehicle_frame_id: this.frame_id, // 车架号
                            gearbox_id: this.gearbox_id, // 变速箱ID
                            dev_id: this.selectedGPSValue // GPS设备id 
                        }
                    },
                    method: 'POST',
                    dataType: 'json',
                    success: (res) => {
                        console.log(res)
                        if (res.data.error_code === '000000') {
                            uni.showToast({
                                title: '增加车辆成功',
                            })
                            // 添加完车辆后， 清除缓存中车辆的代码集数据
                            uni.removeStorageSync('tlt_vehicle_all');
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
        }
    }
</script>

<style lang="less">
    @import '../../../common/uni-nvue.css';
    .add-vehicle-container {
        height: 100%;
        box-sizing: border-box;
        padding: 54rpx 48rpx;
        font-size: 28rpx;
        color: #333;
        
        .content {
            padding: 12rpx 42rpx;
            box-sizing: border-box;
            background: #fff;
            border-radius: 16rpx;
            box-shadow: 0px 2rpx 8rpx -2rpx rgba(0,0,0,0.12);
            
            &>view {
                padding: 48rpx 0 32rpx 0;
                display: flex;
                border-bottom: 1px solid #e2e2e2;
            
                text {
                    vertical-align: middle;
                    color: #333;
                    font-size: 28rpx;
                }
            
                input {
                    vertical-align: middle;
                    text-align: left;
                    font-size: 28rpx;
                    color: #333;
                }
            }
            
            .button-container {
                border: none;
                display: flex;
                padding: 52rpx 86rpx;
                
                .btn-cancel {
                    flex: 1;
                    height: 64rpx;
                    color: #bdbdbd;
                    line-height: 64rpx;
                }
                
                .btn-confirm {
                    flex: 1;
                    
                    view {
                        float: right;
                        height: 64rpx;
                        width: 168rpx;
                        line-height: 64rpx;
                        color: #fff;
                        text-align: center;
                        background: #bd0202;
                        border-radius: 32rpx;
                        box-shadow: 0rpx 8rpx 10rpx 0rpx #d54048;
                    }
                }
            }
        } 
    }
</style>
