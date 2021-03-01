<template>
    <view class="tstati-container uni-container">
        <!-- 放置退出登录 popup -->
        <logout ref="logoutModal"></logout>
        <uni-collapse class="collapse-container" accordion="true">
            <uni-collapse-item title="工作状况查询" open="true">
                <view>
                    <view class="uni-list">
                        <radio-group @change="radioChange">
                            <view>
                                <label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in tstati_items" :key="item.value">
                                    <view>
                                        <view>
                                            <radio :value="item.value" :checked="item.value === current_value" style="transform:scale(0.7); vertical-align: middle;" />
                                        </view>
                                        <view class="text">{{item.name}}</view>
                                    </view>
                                </label>
                            </view>
                        </radio-group>
                    </view>
                    <view class="uni-tip-group-button">
                        <view class="uni-tip-button" hover-class="hoverStyle" @tap="current_value=null">
                            <view class="btn-cancel">
                                取消
                            </view>
                        </view>
                        <view class="uni-tip-button" hover-class="hoverStyle" @tap="tstatiConfirm()">
                            <view class="btn-confirm">
                                确定
                            </view>
                        </view>
                    </view>
                </view>
            </uni-collapse-item>
            <uni-collapse-item title="车辆分析">
                <view class="uni-list">
                    <radio-group @change="radioChange">
                        <view>
                            <label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in cchart_items" :key="item.value">
                                <view>
                                    <view>
                                        <radio :value="item.value" :checked="item.value === current_value" style="transform:scale(0.7); vertical-align: middle;" />
                                    </view>
                                    <view class="text">{{item.name}}</view>
                                </view>
                            </label>
                        </view>
                    </radio-group>
                </view>
                <view class="uni-tip-group-button">
                    <view class="uni-tip-button" hover-class="hoverStyle" @tap="current_value=null">
                        <view class="btn-cancel">
                            取消
                        </view>
                    </view>
                    <view class="uni-tip-button" hover-class="hoverStyle" @tap="cchartConfirm()">
                        <view class="btn-confirm">
                            确定
                        </view>
                    </view>
                </view>
            </uni-collapse-item>
            <uni-collapse-item title="车辆查询">
                <view class="uni-list">
                    <radio-group @change="radioChange">
                        <view>
                            <label class="uni-list-cell uni-list-cell-pd" v-for="(item, index) in cquery_items" :key="item.value">
                                <view>
                                    <view>
                                        <radio :value="item.value" :checked="item.value === current_value" style="transform:scale(0.7); vertical-align: middle;" />
                                    </view>
                                    <view class="text">{{item.name}}</view>
                                </view>
                            </label>
                        </view>
                    </radio-group>
                </view>
                <view class="uni-tip-group-button">
                    <view class="uni-tip-button" hover-class="hoverStyle" @tap="current_value=null">
                        <view class="btn-cancel">
                            取消
                        </view>
                    </view>
                    <view class="uni-tip-button" hover-class="hoverStyle" @tap="cqueryConfirm()">
                        <view class="btn-confirm">
                            确定
                        </view>
                    </view>
                </view>
            </uni-collapse-item>
        </uni-collapse>
    </view>
</template>

<script>
    // 退出登录模板
    import logout from '@/pages/component/logout/logout.vue'
    import uniIcons from "@/components/uni-icons/uni-icons.vue"

    export default {
        components: {
            logout,
            uniIcons
        },
        data() {
            return {
                current_value: null,
                tstati_items: [{
                    value: 0,
                    name: '查询日工作状态'
                }, {
                    value: 1,
                    name: '统计日工作状态'
                }, {
                    value: 2,
                    name: '统计月工作状态'
                }, {
                    value: 3,
                    name: '统计年工作状态'
                }],
                cchart_items: [{
                        value: 10,
                        name: '车速分析'
                    },
                    {
                        value: 11,
                        name: '机油液位'
                    },
                    {
                        value: 12,
                        name: '机油压力'
                    },
                    {
                        value: 13,
                        name: '发动机转速'
                    },
                    {
                        value: 14,
                        name: '冷却液温度'
                    }
                ],
                cquery_items: [{
                        value: 20,
                        name: '车辆状态'
                    },
                    {
                        value: 21,
                        name: '车辆位置'
                    },
                    {
                        value: 22,
                        name: '锁车通信数据'
                    }
                ]
            }
        },
        onBackPress() {
            this.$refs.logoutModal.showLogoutModal();
            return true
        },
        onHide() {
            this.$refs.logoutModal.logout = false;
        },
        methods: {
            radioChange(e) {
                this.current_value = e.target.value;
            },
            tstatiConfirm() {
                console.log(this.current_value !== null, this.current_value)
                if (this.current_value === null) {
                    uni.showToast({
                        title: '请选择要查询的功能选项',
                        icon: 'none'
                    })
                    return
                }
                uni.navigateTo({
                    url: `/pages/component/tstati/tstati?current_value=${this.current_value}`
                })
            },
            cchartConfirm() {
                if (this.current_value === null) {
                    uni.showToast({
                        title: '请选择要查询的功能选项',
                        icon: 'none'
                    })
                    return
                }
                uni.navigateTo({
                    url: `/pages/component/tstati/cchart?current_value=${this.current_value}`
                })
            },
            cqueryConfirm() {
                if (this.current_value === null) {
                    uni.showToast({
                        title: '请选择要查询的功能选项',
                        icon: 'none'
                    })
                    return
                }
                uni.navigateTo({
                    url: `/pages/component/tstati/cquery?current_value=${this.current_value}`
                })
            }
        }
    }
</script>

<style lang="less">
    @import '../../../common/uni-nvue.css';

    .tstati-container {
        height: 100%;
        padding: 0 48rpx;
        background: #f7f7f7;

        .collapse-container {
            background: none;

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
            }

            .uni-tip-group-button {
                display: flex;
                padding: 50rpx 0rpx 40rpx 0;

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

        .uni-collapse {

            &::before,
            &::after {
                display: none;
            }

            .uni-collapse-cell__title {
                background-color: #fff;
                box-shadow: 0 -2rpx 2rpx 0rpx #efefef inset;
                border-radius: 16rpx;
                height: 114rpx;
                width: calc(~"100% + 2rpx");
            }

            .uni-collapse-cell__content {
                padding: 0 35rpx;
                box-sizing: border-box;
                border: none;
                border-radius: 0 0 16rpx 16rpx;
            }

            .uni-collapse-cell {
                margin-top: 40rpx;
                box-sizing: border-box;
                border-radius: 16rpx;

                &::after {
                    display: none;
                }
            }

            .uni-collapse-cell--open {
                background: #fff;
                box-shadow: 0 0 6rpx 2rpx #efefef;
            }
        }
    }

    /* 提示窗口 */
    .uni-tip {
        padding: 30rpx;
        width: 685rpx;
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

        .content {

            &>view {
                padding: 30rpx 0;
            }
        }

        .uni-tip-group-button {
            margin-top: 20rpx;
            display: flex;

            .uni-tip-button {
                width: 100%;
                text-align: center;
                font-size: 28rpx;
                color: #2a4144;
                font-weight: 600;
            }

            view:nth-child(2) {
                color: #dc1110;
            }
        }
    }
</style>
