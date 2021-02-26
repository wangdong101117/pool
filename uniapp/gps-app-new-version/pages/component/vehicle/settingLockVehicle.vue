<template>
    <!-- 锁车 / 解锁 -->
    <view>
        <uni-popup :show="setting_lock_vehicle_show" type="center" :custom="true" :mask-click="false">
        	<view class="uni-tip">
        		<view class="uni-tip-title">
                    <view>{{popup_title}}</view>
                </view>
                <view class="uni-tip-content">
                    <view class="uni-list">
                        <radio-group @change="radioChange" v-if="current_value === null">
                            <view>
                                <label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in vehicle_setting_items" :key="item.value">
                                    <view>
                                        <view>
                                            <radio :value="item.value" :checked="item.value === current_value" style="transform:scale(0.7); vertical-align: middle;" />
                                        </view>
                                        <view class="text">{{item.name}}</view>
                                    </view>
                                </label>
                            </view>
                        </radio-group>
                        <view class="lock-vehicle-date" v-if="current_value === 1">
                            <view class="label-text">延期日期：</view>
                            <view class="select-date" @tap="onShowTimePicker">
                                <view>{{select_lock_date? select_lock_date : '请选择延期时间'}}</view>
                            </view>
                        </view>
                        <view style="padding: 30rpx 0 20rpx 0;" v-if="current_value === 0">
                            <text v-if="action">
                                您确定要对该车辆进行锁车操作吗?
                            </text>
                            <text v-else>
                                您确定要对该车辆进行解锁操作吗
                            </text>
                        </view>
                    </view>
                    <mx-date-picker :show="show_time_picker" type="date" :value="select_lock_date" :show-tips="true" :showSeconds="false"
                        :timeTittle="time_tittle" @confirm="onTimeSelected" @cancel="onTimeSelected" />
                </view>
                <view class="uni-tip-group-button">
                	<view class="uni-tip-button" hover-class="hoverStyle" @click="cancelSetting()">
                        <view class="btn-cancel">
                            取消
                        </view>
                    </view>
                	<view class="uni-tip-button" hover-class="hoverStyle" @click="confirmSetting()"  v-if="!action || (action && current_value !== null)">
                        <view class="btn-confirm">
                            确定
                        </view>
                    </view>
                </view>
        	</view>
        </uni-popup>
    </view>
</template>

<script>
    // popup 弹出层
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    // 日期
    import MxDatePicker from "@/components/mx-datepicker/mx-datepicker.vue";
    // 图标
    import uniIcons from '@/components/uni-icons/uni-icons.vue'
    import mixin from '@/common/mixin.js'
    export default {
        components: {
            uniPopup,
            uniIcons,
            MxDatePicker
        },
        mixins: [mixin],
        inject: ['getVehicleList'],
        data () {
            return {
                popup_title: '',
                vehicle_id: '',
                uid: '',
                show_time_picker: false,
                time_tittle: '请选择锁车时间',
                setting_lock_vehicle_show: false,
                select_lock_date: '',
                action: null,
                tip_text: '锁车成功',
                vehicle_setting_items: [],
                current_value: null
            }
        },
        methods: {
            radioChange(e) {
                this.current_value = e.target.value;
                if (this.current_value == 0) {
                    if (this.action) {
                        this.popup_title = '锁车'
                    } else {
                        this.popup_title = '解锁'
                    }
                }
                
                if (this.current_value == 1) {
                    this.popup_title = '延期'
                }
            },
            /**
                延期 跟 锁车状态无关
             */
            showPopup(uid, vehicle_id, lock_status) {
                this.setting_lock_vehicle_show = true;
                this.vehicle_id = vehicle_id;
                Number(lock_status)? this.action = 0 : this.action = 1; // 已锁车 => action: 0, 执行解锁操作; 否则未锁车 action: 1, 执行锁车操作
                this.action? this.tip_text = '锁车成功' : this.tip_text = '解锁成功',
                this.action? this.popup_title = '锁车/延期' : this.popup_title = '解锁/延期'
                this.action? this.vehicle_setting_items = [{
                    value: 0,
                    name: '锁车'
                }, {
                    value: 1,
                    name: '延期'
                }] : this.vehicle_setting_items = [{
                    value: 0,
                    name: '解锁'
                }, {
                    value: 1,
                    name: '延期'
                }]

                this.uid = uid;
            },
            onShowTimePicker(e) {
                this.show_time_picker = true;
            },
            onTimeSelected(e) { //选择
                this.show_time_picker = false;
                if (e) {
                    console.log(e)
                    this.select_lock_date = e.value
                }
            },
            /* 锁车/解锁时 验证码 popup弹框上的取消按钮 */
            cancelSetting() {
                this.setting_lock_vehicle_show = false;
                this.select_lock_date = '';
                this.show_time_picker = false;
                this.current_value = null;
                this.vehicle_setting_items = [];
                this.action = null;
                this.popup_title = '';
                // this.showToast(`已取消锁车设置操作`);
            },
            // 验证码 确定按钮
            confirmSetting() {
                let url = '';
                let record = {};
                // 选择了日期, 说明是延期锁车
                if (this.current_value === 1) {
                    if (!this.select_lock_date) {
                        uni.showToast({
                            title: '请选择延迟日期',
                            icon: 'none'
                        })
                        return
                    }
                    if (+new Date(this.select_lock_date) < +new Date()) {
                        uni.showToast({
                            title: '提示：延期日期不能小于当前日期！',
                            icon: 'none'
                        })
                        return
                    }
                    let myDate = this.select_lock_date.split('/');
                    this.tip_text = '延期成功';
                    url = `${this.api}txnsvrv01.ajson`;
                    record = {
                        uid: this.uid,
                        postpone_date: myDate[0] + myDate[1] + myDate[2]
                    }
                } else {
                    url = `${this.api}txnsvrv02.ajson`
                    record = {
                        uid: this.uid,
                        action: this.action,
                    }
                }
                
                uni.showLoading({
                    title: '请稍后...'
                })
                /* 调用 锁车/解锁 接口 */
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
                        console.log('锁车/解锁', res);
                        uni.hideLoading()
                        if (res.data.error_code === '000000') {
                            this.showToast(this.tip_text)
                            // 重新获取车辆列表数据
                            let timer = setTimeout(() => {
                                this.cancelSetting();
                                this.getVehicleList(this.$parent.attribute_node);
                                clearTimeout(timer);
                            }, 1500)
                        } else {
                            uni.hideLoading();
                            this.toastRequestErr(res.data);
                        }
                    },
                    fail: () => {
                        uni.hideLoading()
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
        padding: 40rpx 30rpx 60rpx 30rpx;
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
            
            .lock-vehicle-date {
                display: flex;
                padding: 30rpx 0 20rpx 0;
                border-bottom: 1px solid #ccc;
                box-sizing: border-box;
                font-size: 28rpx;
                
                .label-text {
                    text-align: left;
                    height: 48rpx;
                    line-height: 48rpx;
                }
                
                .select-date {
                    flex: 1;
                    height: 48rpx;
                    line-height: 48rpx;
                    
                    view {
                        width: 100%;
                        font-size: 28rpx;
                        height: 48rpx;
                        line-height: 48rpx;
                        text-align: center;
                    }
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
