<template>
    <view class="forget-container">
        <view style="font-size: 14px; text-align: center; height: 42px; line-height: 42px; margin-bottom: 30rpx;">
            <image src="../../static/images/info.png" style="height: 16px; width: 16px; vertical-align: middle;"></image>
            <text style="vertical-align: middle; margin-left: 6px;">请输入要找回密码的手机号</text>
        </view>
        
        <view class="form-container">
            <view>
                <text>用户名：</text>
                <input placeholder="请输入手机号" v-model="username" type="text" confirm-type="go"
                    maxlength="16" />
            </view>
            <view style="padding-top: 40rpx;">
                <text style="line-height: 64rpx;">验证码：</text>
                <view class="getAddcode">
                    <input class="uni-input" maxlength="4" confirm-type="go" type="number" placeholder="请输入验证码" v-model="addcode" />
                    <button @tap="getAddCode" :disabled="is_disabled" :type="btn_type" size="mini">{{btn_text}}</button>
                </view>
            </view>
            
            <view class="button-container">
                <view class="btn-cancel" hover-class="hoverStyle" @tap="cancelButton">重置</view>
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
                username: '',
                addcode: '',
                is_disabled: false,
                btn_text: '获取验证码',
                btn_type: 'primary',
                sumi: 59,
                timer: null
            }
        },
        methods: {
            confirmButton () {
                let rep = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/;
                if (!(this.username.trim())) {
                    this.showToast('请输入手机号')
                    return
                }
                
                if(!rep.test(this.username.trim())) {
                    this.showToast('手机号码输入不规范')
                    return
                }
                
                if (!(this.addcode.trim())) {
                    this.showToast('请输入验证码')
                    return
                }
                uni.navigateTo({
                    url: `/pages/component/personal_center/resetPassword?username=${this.username}&addcode=${this.addcode}`
                });
            },
            cancelButton() {
                uni.navigateTo({
                    url: '/pages/login/login'
                })
            },
            /* 防止恶意刷 获取验证码, 还没做 **/
            getAddCode() {
                let rep = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/;
                if (!(this.username.trim())) {
                    this.showToast('请输入手机号')
                    return
                }
                
                if(!rep.test(this.username.trim())) {
                    this.showToast('手机号码输入不规范')
                    return
                }
                
                clearInterval(this.timer)
                this.is_disabled = true;
                this.btn_type = 'default';
                this.sumi = 59;
                this.btn_text = 60;
                
                this.timer = setInterval(() => {
                    if (this.sumi === 0) {
                        this.is_disabled = false;
                        this.btn_text = '获取验证码';
                        this.btn_type = 'primary';
                    } else {
                        this.btn_text = this.sumi;
                        this.sumi-=1;
                    }
                }, 1000)

                uni.request({
                    url: `${this.api}txnsau00x.ajson`,
                    data: {
                        record: {
                            user_no: this.username,
                        }
                    },
                    dataType: 'json',
                    method: 'POST',
                    success:(res) => {
                        console.log(res.data);
                        if (res.data.error_code === '000000') {
                            this.showToast('验证码已发送, 请在手机上查看')
                        } else {
                            this.showToast('获取验证码时失败, 请重新获取')
                            clearInterval(this.timer)
                            this.sumi = 59
                            this.is_disabled = false;
                            this.btn_text = '获取验证码';
                            this.btn_type = 'primary';
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
    @import '../../common/common.css';
    .forget-container {
       padding: 20rpx 64rpx 0 64rpx;
       height: 100%;
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
                
                .getAddcode {
                    display: flex;
                
                    input {
                        flex: 2;
                        line-height: 64rpx;
                        height: 64rpx;
                    }
                
                    button {
                        min-width: 180rpx;
                        font-size: 12px;
                        height: 64rpx;
                        line-height: 64rpx;
                    }
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
