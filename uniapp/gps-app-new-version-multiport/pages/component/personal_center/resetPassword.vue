<template>
    <view class="reset-container uni-container">
        <view style="font-size: 14px; text-align: center; height: 42px; line-height: 42px; margin-bottom: 30rpx;">
            <image src="../../../static/images/info.png" style="height: 16px; width: 16px; vertical-align: middle;"></image>
            <text style="vertical-align: middle; margin-left: 6px;">请重新设置您的密码</text>
        </view>
        <view class="form-container">
            <view>
                <text>新密码：</text>
                <input placeholder="请输入6-16位新密码" v-model="new_password" password confirm-type="go"
                    maxlength="16" />
            </view>
            <view>
                <text>确认密码：</text>
                <input class="uni-input" maxlength="16" password confirm-type="go" placeholder="请再次输入新密码" v-model="new_password_again" />
            </view>
            <view class="button-container">
                <view class="btn-cancel" hover-class="hoverStyle" @tap="resetButton" >重置</view>
                <view class="btn-confirm">
                    <view @tap="confirmButton" hover-class="hoverStyle">确定</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    import mixin from '@/common/mixin.js'
    export default {
        mixins: [mixin],
        data() {
            return {
                new_password: '',
                new_password_again: '',
                username: '',
                addcode: ''
            }
        },
        methods: {
            resetButton() {
                this.new_password = '';
                this.new_password_again = '';
            },
            confirmButton() {
                if (!this.new_password || this.new_password.trim().length > 16 || this.new_password.trim().length < 6) {
                    this.showToast('请输入6-16位新密码');
                    return
                }
                if (!this.new_password_again || this.new_password_again.trim().length > 16 || this.new_password_again.trim().length < 6) {
                    this.showToast('请再次输入6-16位新密码');
                    return
                }
                if (this.new_password !== this.new_password_again) {
                    this.showtost('两次密码设置的不同');
                    return
                }
                
                uni.request({
                    url: `${this.api}txnsau00y.ajson`,
                    // #ifdef MP-WEIXIN
                    header: getApp().globalData.header,
                    // #endif
                    data: {
                        record: {
                            new_passwd: this.new_password, // 新密码
                            passwords: this.new_password_again, // 再次输入新密码
                            user_no: this.username, // 用户
                            verfication_code: this.addcode // 验证码
                        }
                    },
                    method: 'POST',
                    dataType: 'json',
                    success: (res) => {
                        console.log(res.data)
                        if (res.data.error_code === '000000') {
                            uni.showToast({
                                title: '重置密码成功！',
                            });
                            uni.removeStorageSync('password');
                            let timer = null;
                            timer = setTimeout(() => {
                                uni.redirectTo({
                                    url: '/pages/login/login'
                                })
                            }, 1000);
                            clearInterval(timer);
                        } else {
                            this.toastRequestErr(res.data);
                        }
                    },
                    fail: () => {
                        this.toastErr();
                    }
                })
            }
        },
        onLoad(option) {
            this.username = option.username;
            this.addcode = option.addcode;
        }
    }
</script>

<style lang="less">
    .reset-container {
        padding: 50rpx 64rpx 0 64rpx;
        height: 100%;
        // background: #f7f7f7;
        color: #333;
        font-size: 28rpx;

        .form-container {
            background: #fff;
            padding: 0 59rpx;
            border-radius: 16rpx;
            box-shadow: 0px 2rpx 8rpx -2rpx rgba(0,0,0,0.12);
            
            &>view {
                display: flex;
                border-bottom: 1px solid #e2e2e2;
                padding: 72rpx 0 32rpx 0;
                
                &:first-child {
                    padding: 50rpx 0 32rpx 0;
                }
            
                text {
                    font-size: 28rpx;
                    vertical-align: middle;
                    white-space: nowrap;
                    color: #333;
                }
            
                input {
                    font-size: 28rpx;
                    vertical-align: middle;
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
