<template>
    <view class="vehicle-detail-container" ref="vehDetail">
        <view class="content">
            <view class="list-item">
                <text>整车编号：</text>
                <input type="text" v-model="vehicleData.vehicle_id" disabled="true">
            </view>
            <uni-combox label="发动机型号：" :value="vehicleData.engine_model" :disabled="true" v-model="vehicleData.engine_model" v-if="loadSelect"
                placeholder="未选择..." codeType="tlt_engine_model_available"></uni-combox>
            <view class="list-item">
                <text>发动机编号：</text>
                <input type="text" v-model="vehicleData.engine_id" disabled="true">
            </view>
            <uni-combox label="车辆型号：" :value="vehicleData.model" :disabled="true" v-model="vehicleData.model" placeholder="未选择..."
                codeType="tlt_vehicle_model_available" v-if="loadSelect"></uni-combox>
            <view class="list-item">
                <text>车架号：</text>
                <input type="text" v-model="vehicleData.vehicle_frame_id" disabled="true">
            </view>
            <view class="list-item">
                <text>变速箱编号：</text>
                <input type="text" v-model="vehicleData.gearbox_id" disabled="true">
            </view>
            <view class="list-item">
                <text>设备序号：</text>
                <input type="text" v-model="vehicleData.dev_id" disabled="true">
            </view>
            <!-- 所属组织 -->
            <uni-combox label="所属组织：" :value="vehicleData.organization_uid" :disabled="true" v-model="vehicleData.organization_uid"
                placeholder="未选择..." codeType="tlt_organization_all" v-if="loadSelect"></uni-combox>
            <!-- gps状态 -->
            <uni-combox label="GPS状态：" :value="vehicleData.gps_status" :disabled="true" v-model="vehicleData.gps_status"
                placeholder="未选择..." codeType="tlt_gps_status" v-if="loadSelect"></uni-combox>
            <!-- 锁车状态 -->
            <uni-combox label="锁车状态：" :value="vehicleData.lock_status" :disabled="true" v-model="vehicleData.lock_status"
                placeholder="未选择..." codeType="tlt_lock_status" v-if="loadSelect"></uni-combox>
            <!-- 所在国家 -->
            <uni-combox label="所在国家：" placeholder="未选择..." :value="vehicleData.country_code" :disabled="true" v-model="vehicleData.country_code"
                codeType="tlt_have_truck_country" v-if="loadSelect"></uni-combox>
            <!-- 所在地区 -->
            <uni-combox label="所在地区：" :placeholder="positionDist? positionDist : '未选择...'" :inputHidden="true" :disabled="true" class="dist"></uni-combox>
            <!-- 锁车时间- -->
            <view class="list-item">
                <text>锁车时间：</text>
                <input type="text" v-model="vehicleData.lock_date" disabled="true">
            </view>
        </view>
        <view class="button-container">
            <view @tap="editVehicleInfo" hover-class="hoverStyle">编辑车辆信息</view>
        </view>
    </view>
</template>

<script>
    import uniCombox from "@/components/uni-combox/uni-combox"
    import mixin from '@/common/mixin.js'
    export default {
        mixins: [mixin],
        components: {
            uniCombox
        },
        data() {
            return {
                vehicleData: '',
                distCodeDatas: '',
                positionDist: '',
                loadSelect: false
            }
        },
        methods: {
            /** 根据返回的 region_code 反向查询省市 */
            getDist() {
                let sortValue = ''
                if (this.vehicleData.region_code) {
                    this.distCodeDatas.forEach((item, index) => {
                        if (item.codeValue === this.vehicleData.region_code) {
                            sortValue = item.sortValue
                            this.positionDist = item.codeName
                        }
                    })
                    
                    this.distCodeDatas.forEach((item, index) => {
                        if (item.codeValue === sortValue) {
                            sortValue = item.sortValue
                            this.positionDist = item.codeName + '-' + this.positionDist
                        }
                    })
                    
                    this.distCodeDatas.forEach((item, index) => {
                        if (item.codeValue === sortValue) {
                            this.positionDist = item.codeName + '-' + this.positionDist
                        }
                    })
                }
            },
            editVehicleInfo() {
                uni.navigateTo({
                    url: `/pages/component/vehicle/editVehicle?uid=${this.uid}`
                })
            }
        },
        mounted() {
            this.$nextTick(() => {
                let p1 = new Promise((resolve, reject) => {
                    uni.showLoading({
                        title: '加载中...'
                    })
                    
                    /** 根据获取到的 uid , 调用查询详情接口, 说明: 该接口content-type不能设置为 urlencoded形式 */
                    uni.request({
                        url: `${this.api}txnsyscv2.ajson`,
                        // #ifdef MP-WEIXIN
                        header: {
                            'Cookie': getApp().globalData.header.Cookie
                        },
                        // #endif
                        data: {
                            primary_key: {
                                uid: this.uid,
                            }
                        },
                        dataType: 'json',
                        method: 'POST',
                        success: (res) => {
                            console.log(res)
                            uni.hideLoading();
                            if (res.data.error_code === '000000') {
                                this.vehicleData = res.data.record[0];
                                // 当车辆数据加载完毕后, 渲染下拉框组件, 下拉框组件再加载每一个的下拉框数据
                                this.loadSelect = true;
                                resolve();
                            } else {
                                this.toastRequestErr(res.data);
                                reject();
                            }
                        },
                        fail: () => {
                            reject();
                            uni.hideLoading();
                            this.toastErr()
                        }
                    })
                })
                /** - 获取省市县数据: */
                let p2 = new Promise((resolve, reject) => {
                    uni.request({
                        url: `${this.api}tag.service?txn-code=option.ajson&option-name=tlt_have_truck_region`,
                        // #ifdef MP-WEIXIN
                        header: getApp().globalData.header,
                        // #endif
                        data: {},
                        method: 'GET',
                        dataType: 'json',
                        success: (res) => {
                            const {codeDatas} = res.data
                            this.codeDatas = codeDatas
                            if (res.statusCode === 200) {
                                console.log('返回的省市县数据', codeDatas)
                                this.distCodeDatas = codeDatas;
                                resolve();
                            } else {
                                reject();
                            }
                        },
                        fail: () => {
                            reject();
                        }
                    })
                })
                
                Promise.all([p1, p2]).then(res => {
                    this.getDist()
                })
            })
        },
        onLoad(option) {
            this.uid = option.uid;
        }
    }
</script>

<style lang="less">
    @import '../../../common/uni-nvue.css';
    .vehicle-detail-container {
        height: 100%;
        padding: 16rpx 48rpx 0rpx 48rpx;
        box-sizing: border-box;
        font-size: 28rpx;
        // background: #f7f7f7;
        color: #333;
        
        .content {
            height: calc(100% - 168rpx);
            box-sizing: border-box;
            padding: 12rpx 86rpx 50rpx 86rpx;
            border-radius: 18rpx;
            background: #fff;
            overflow: scroll;
            box-shadow: 0px 2rpx 8rpx -2rpx rgba(0,0,0,0.12);
            
            .list-item {
                display: flex;
                padding: 48rpx 0rpx 32rpx 0rpx;
            
                &.list-item{
                    border-bottom: 1px solid #e2e2e2;
                }
            
                text {
                    font-size: 28rpx;
                    white-space: nowrap;
                }
            
                input {
                    font-size: 28rpx;
                    text-align: left;
                    color: #333;
                }
            }
        }
   
        .button-container {
            width: 100%;
            margin-top: 44rpx;
            box-sizing: border-box;
            text-align: center;      
            display: flex;
            
            view {
                width: 274rpx;
                height: 64rpx;
                margin: auto;
                line-height: 64rpx;
                background: #bd0202;
                color: #fff;
                border-radius: 32rpx;
            }
        }
    }
</style>
