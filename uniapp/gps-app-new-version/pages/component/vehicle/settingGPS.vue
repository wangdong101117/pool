<!-- 关闭 / 启用 GPS -->
<template>
    <uni-popup :show="gps_setting_show" type="center" :custom="true" :mask-click="false">
    	<view class="uni-tip">
    		<view class="uni-tip-title">
                 <view>{{popup_title}}</view>
            </view>
    		<view class="uni-tip-content">
                <view style="padding: 0 0 20rpx 0;">
                    <text style="color: #bbb; font-weight: bold;">{{vehicle_id}}的GPS状态：</text>
                    <text style="color: #bd0202; font-weight: bold;">{{!action? '关闭' : '启用'}}</text>
                </view>

                <view class="uni-list" v-if="action">
                    <radio-group @change="radioChange" v-if="current_value === null">
                        <view>
                            <label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in gps_open_items" :key="item.value">
                                <view>
                                    <view>
                                        <radio :value="item.value" :checked="item.value === current_value" style="transform:scale(0.7); vertical-align: middle;" />
                                    </view>
                                    <view class="text">{{item.name}}</view>
                                </view>
                            </label>
                        </view>
                    </radio-group>
                    <view class="change-gps" v-if="current_value == 1">
                        <uni-combox label="更换GPS:" placeholder="请选择GPS设备" :value="selected_gps_value" @sendValue="selectedGPS"
                                v-model="selected_gps_value" codeType="tlt_gps_unused"></uni-combox> 
                    </view>
                    
                    <view style="padding: 30rpx 0 20rpx 0;" v-if="current_value == 0">
                        您确定要关闭GPS?
                    </view>
                </view>
         
                <view v-if="!action" style="padding: 30rpx 0 20rpx 0;">
                    您确定要开启GPS?        
                </view>
            </view>
           
    		<view class="uni-tip-group-button" >
    			<view class="uni-tip-button" hover-class="hoverStyle" @click="cancelSettingGPS()">
                    <view class="btn-cancel">
                        取消
                    </view>
                </view>
    			<view class="uni-tip-button" hover-class="hoverStyle" @click="confirmSettingGPS()" v-if="!action || (action && current_value !== null)">
                    <view class="btn-confirm">
                        确定
                    </view>
                </view>
    		</view>
    	</view>
    </uni-popup>
</template>

<script>
    // popup 弹出层
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    import mixin from '@/common/mixin.js'
    export default {
        components: {
            uniPopup
        },
        mixins: [mixin],
        inject: ['getVehicleList'],
        data () {
            return {
                popup_title: '',
                uid: '',
                vehicle_id: '',
                gps_setting_show: false,
                postpone_date: '',
                action: null, // 1 代表要关闭gps 0代表要开启gps
                tip_text: '',
                selected_gps_name: '', // 更换GPS时 选择的GPS设备Name
                selected_gps_value: '', // 更换GPS时 选择的GPS设备Value
                
                gps_open_items: [{
                    value: 0,
                    name: '关闭GPS'
                }, {
                    value: 1,
                    name: '更换GPS'
                }],
                current_value: null
                
            }
        },
        methods: {
            radioChange(e) {
                this.current_value = e.target.value;
                if (this.current_value == 0) {
                    this.popup_title = '关闭GPS'
                }
                
                if (this.current_value == 1) {
                    this.popup_title = '更换GPS'
                }
            },
            /** 显示popup */
            showPopup(uid, vehicle_id, gps_status) {
                this.gps_setting_show = true;
                this.action = Number(gps_status);
                if (Number(gps_status)) {
                    this.action = 0;
                    this.postpone_date = 20991231;
                    this.tip_text = '启用GPS成功';
                    this.popup_title = '启用GPS'
                } else {
                    this.action = 1;
                    this.postpone_date = 20000000;
                    this.tip_text = '关闭GPS成功';
                    this.popup_title = '关闭/更换GPS'
                }
                this.uid = uid;
                this.vehicle_id = vehicle_id;
            },
            /** 更换GPS时, 选择的 GPS设备 */
            selectedGPS(value) {
                this.selected_gps_value = value
            },
            cancelSettingGPS() {
                this.gps_setting_show = false;
                this.selected_gps_value = '';
                this.current_value = null;
                this.tip_text = '';
                this.action = null;
                this.postpone_date = '';
                this.popup_title = '';
                // this.showToast(`已取消设置GPS`);
            },
            confirmSettingGPS() {
                let url = '';
                let record = {};
                
                // 如果是更换GPS
                if (this.current_value === 1) {
                    if (!this.selected_gps_value) {
                        uni.showToast({
                            title: '请选择GPS设备',
                            icon: 'none'
                        })
                        
                        return
                    }
                    
                    url = `${this.api}txnsvrv03.ajson`;
                    record = {
                        uid: this.uid,
                        dev_id: this.selected_gps_value
                    }
                    this.tip_text = '更换GPS成功';
                } else {
                    url = `${this.api}txnsvrv01.ajson`;
                    record = {
                        uid: this.uid,
                        postpone_date: this.postpone_date
                    }
                }
                
                uni.showLoading({
                    title: '请稍后...'
                })
                uni.request({
                    url: url,
                    data: {
                        record: {
                            ...record
                        }
                    },
                    method: 'POST',
                    dataType: 'json',
                    success: (res) => {
                        uni.hideLoading()
                        if (res.data.error_code === '000000') {
                            this.showToast(`${this.tip_text}`);
                            // 重新调用获取列表数据的方法 
                            // setTimeout(() => {
                                this.cancelSettingGPS();
                                this.getVehicleList(this.attribute_node);
                            // }, 2000)
                        } else {
                            this.toastRequestErr(res.data);
                        }
                    },
                    fail: () => {
                        uni.hideLoading();
                        this.toastErr();
                    }
                })
            }
        }
    }
</script>

<style lang="less">
    /* 提示窗口 */
    .uni-tip {
        padding: 40rpx 40rpx 60rpx 40rpx;
        width: 656rpx;
        background: #fff;
        box-sizing: border-box;
        border-radius: 16rpx;
        color: #333;
        
        .uni-tip-title {
            text-align: center;
            font-weight: bold;
            font-size: 34rpx;
            color: #333;
        }
        
        .uni-tip-content {
            padding: 30rpx;
            font-size: 28rpx;
            color: #666;
            text-align: center;
        }
    
        .uni-list {
            text-align: center;
        
            .uni-list-cell {
                width: 100%;
                font-size: 28rpx;
                text-align: center;
        
                &>view {
                    padding: 50rpx 0 30rpx 0;
                    border-bottom: 1px solid #efefef;
        
                    &>view {
                        display: inline-block;
        
                        &.text {
                            padding-top: 4rpx;
                        }
                    }
                }
            }
            
            .change-gps {
                
                &>view {
                    padding: 40rpx 0 20rpx 0;
                }
               
            }
        }
        
        .uni-tip-group-button {
            display: flex;
            padding: 0 8rpx;
            margin-top: 20rpx;
            
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
</style>
