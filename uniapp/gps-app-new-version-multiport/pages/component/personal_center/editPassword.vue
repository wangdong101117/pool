<template>
    <view class="edit-pw-container uni-common-mt">
        <view class="form-container">
            <view>
                <text>原密码：</text>
                <input placeholder="请输入原密码" v-model="password" password confirm-type="go"
                    maxlength="16" />
            </view>
            <view>
                <text>新密码：</text>
                <input placeholder="请输入新密码" v-model="new_password" password confirm-type="go"
                    maxlength="16" />
            </view>
            <view>
                <text>确定新密码：</text>
                <input placeholder="请再次输入新密码" v-model="new_password_again" password confirm-type="go"
                    maxlength="16" />
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
                password: '',
                new_password: '',
                new_password_again: ''
            }
        },
        methods: {
            confirmButton() {
                let password = uni.getStorageSync('password')
                if (!this.password) {
                    this.showToast('请输入原密码')
                    return
                }
                if (!this.new_password) {
                    this.showToast('请输入新密码')
                    return
                }

                if (!this.new_password_again) {
                    this.showToast('请再次输入新密码')
                    return
                }

                if (password !== this.password) {
                    this.showToast('原密码输入不对')
                    return
                }

                if (!/^[\w_-]{6,16}$/.test(this.password)) {
                    this.showToast('请输入最短6位，最长16位密码')
                    return
                }

                if (this.new_password === password) {
                    this.showToast('新密码与原密码相同')
                    return
                }

                if (this.new_password !== this.new_password_again) {
                    this.showToast('两次密码不一致')
                    return
                }

                uni.showLoading({
                    title: '请稍后'
                })
                uni.request({
                    url: `${this.api}txnsau00r.ajson`,
                    // #ifdef MP-WEIXIN
                    header: getApp().globalData.header,
                    // #endif
                    data: {
                        record: {
                            'old_passwd': this.password,
                            'new_passwd': this.new_password
                        }
                    },
                    dataType: 'json',
                    method: 'POST',
                    success: (res) => {
                        console.log(res.data)
                        if (res.data.error_code === '000000') {
                            uni.showToast({
                                title: '密码修改成功'
                            })
                            
                            uni.removeStorageSync('password');
                            
                            // 跳转到登录页
                            uni.reLaunch({
                                url: '/pages/login/login'
                            })
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
            resetButton() {
                this.password = '';
                this.new_password = '';
                this.new_password_again = '';
            }
        },
    }
</script>

<style lang="less">
    @import '../../../common/uni-nvue.css';
    .edit-pw-container {
        padding: 50rpx 64rpx 0 64rpx;
        height: 100%;
        // background: #f7f7f7;
        color: #333;
        font-size: 28rpx;
        box-sizing: border-box;
        
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
