<template>
    <!-- 退出登录popup弹框 -->
    <uni-popup :show="logout" type="center" :custom="true" :mask-click="false">
    	<view class="uni-tip">
    		<view class="uni-tip-title">
                <!-- <image src="../../../static/images/logout.png" style="width: 24px; height: 24px;"></image> -->
                <view>退出登录</view>
             </view>
    		<view class="uni-tip-content">您确定要退出登录吗？</view>
    		<view class="uni-tip-group-button">
    			<view class="uni-tip-button" @click="cancelLogout()" hover-class="hoverStyle">
                    <view class="btn-cancel">
                        取消
                    </view>
                </view>
    			<view class="uni-tip-button" @click="confirmLogout()" hover-class="hoverStyle">
                    <view class="btn-confirm">
                        确定
                    </view>
                </view>
    		</view>
    	</view>
    </uni-popup>
</template>

<script>
    // 弹框
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    import mixin from '@/common/mixin.js'
     
    export default {
        components: {
            uniPopup
        },
        mixins: [mixin],
        data() {
            return {
                logout: false
            }
        },
        methods: {
            showLogoutModal() {
                this.logout = true;
            },
            cancelLogout() {
                this.logout = false;
                this.showToast('已取消退出');
            },
            confirmLogout() {
                this.logout = false;
                uni.redirectTo({
                    url: "/pages/login/login",
                });
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
