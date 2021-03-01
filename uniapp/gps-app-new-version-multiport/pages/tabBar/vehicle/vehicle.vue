<template>
    <view class="vehicle-list">
        <MyTagTranslate codeType="tlt_engine_model" v-if="is_reload_tag" codeValue="''"></MyTagTranslate>
        <MyTagTranslate codeType="tlt_vehicle_all" v-if="is_reload_tag" codeValue="''"></MyTagTranslate>
        <div class="list-content" ref="listContent">
            <div class="container-of-slide" v-for="(item, index) in list_data" :key="index">
                <div class="item-list">
                    <!-- 每个列表 信息部分 -->
                    <view class="vehicleID">
                        <p class="name">
                            <text>整车编号：</text>
                            <text>{{item.vehicle_id}}</text>
                            <text class="shape"></text>
                        </p>
                        <view class="seat"></view>
                        <!-- 
                            已锁车 且 关闭  => 启用GPS
                            已锁车 且 激活 => 解锁 / 延期
                            
                            未锁车 / 关闭 => 启用GPS/更换GPS
                            未锁车 且 激活 => 锁车 / 延期 / 关闭 / 更换
                            
                                - 启用GPS 是独立的
                                = 锁车后 不能进行除开启GPS之外的 gps其他操作
                                - GPS关闭后, 不能进行 锁车/解锁/延期操作
                         -->
                        <view class="vehicle-status">
                            <text>
                                <text style="display: block; line-height: 25rpx;">{{item.gps_status == '0'? 'GPS激活' : 'GPS关闭'}}</text>
                                <text style="display: block; line-height: 25rpx;">{{item.lock_status == '0'? '未锁车' : '已锁车'}}</text>
                            </text>
                            <text class="shape"></text>
                        </view>
                    </view>
                    <view class="list-item-content" @tap="goVehicleDetail(index, item.uid)">
                        <view class="list-item-content-left">
                            <view>
                                <text>发动机型号：</text>
                                <MyTagTranslate codeType="tlt_engine_model" :codeValue="item.engine_model"></MyTagTranslate>
                            </view>
                            <view>
                                <text>车辆型号：</text>
                                <MyTagTranslate codeType="tlt_vehicle_model" :codeValue="item.model"></MyTagTranslate>
                            </view>
                            <view>
                                <text>所属组织：</text>
                                <MyTagTranslate codeType="tlt_organization_all" :codeValue="item.organization_uid"></MyTagTranslate>
                            </view>
                        </view>
                        <view class="list-item-content-right">
                            <view>
                                <text>车架号：</text>
                                <text>{{item.vehicle_frame_id}}</text>
                            </view>
                            <view>
                                <text>变速箱ID：</text>
                                <text>{{item.gearbox_id}}</text>
                            </view>
                            <view>
                                <text>锁车时间：</text>
                                <text>{{item.lock_date}}</text>
                            </view>
                        </view>
                    </view>
                    <view style="height: 2rpx; background-color: #ccc; width: 100%; margin: 0 28rpx;"></view>
                    <view class="list-item-action">
                        <view @tap="settingLockVehicle(index, item)" v-if="item.gps_status == '0'">
                            <image src="@/static/vehicle/suoche.png" alt="" mode="aspectFit" />
                            <text v-if="item.lock_status == '0'">锁车/延期</text>
                            <text v-if="item.lock_status == '1'">解锁/延期</text>
                        </view>
                        <view @tap="settingGPS(index, item)" v-if="!(item.lock_status == '1' && item.gps_status == '0')">
                                <image src="@/static/vehicle/GPS.png" alt="" mode="aspectFit" />
                                <!-- 锁车后 不显示除了 启用GPS的 其他 gps操作 -->
                                <text v-if="item.lock_status == '0' && item.gps_status == '0'">关闭/更换GPS</text>
                                <text v-if="item.lock_status == '0' && item.gps_status == '1'">启用/更换GPS</text>
                                <text v-if="item.lock_status == '1' && item.gps_status == '1'">启用GPS</text>
                            <!-- 还有个启用 -->
                        </view>
                        <view @tap="goVehicleDetail(index, item.uid)">
                            <image src="@/static/vehicle/xiangqing-3.png" alt="" mode="aspectFit" />
                            <text>详情编辑</text>
                        </view>
                    </view>
                    <div style="clear:both"></div>
                </div>
            </div>
            <div v-if="list_data.length == 0">
                暂无数据
            </div>
        </div>
        <!-- 分页 -->
        <view class="my-pagination">
            <uni-pagination title="标题文字" show-icon="true" :total="attribute_node.record_record_number" :current="current_page"
                @change="changePage">
            </uni-pagination>
            <!-- 增加车辆按钮 -->
            <view class="add" hover-class="hoverStyle" @tap="addVehicle">
                添加车辆
            </view>
        </view>
        <!-- 关闭/启用GPS popup弹框 -->
        <settingGPS ref="settingGPS"></settingGPS>
        <!-- 锁车 / 解锁 输入验证码弹框 -->
        <settingLockVehicle ref="settingLockVehicle"></settingLockVehicle>
        <perparateVehicle ref="preparateVehicle"></perparateVehicle>
        <!-- 放置退出登录 popup -->
        <logout ref="logoutModal"></logout>
    </view>
</template>

<script>
    // 退出登录模板
    import logout from '@/pages/component/logout/logout.vue'
    // 分页
    import uniPagination from '@/components/uni-pagination/uni-pagination.vue'
    // 转化字典表
    import MyTagTranslate from '@/components/myTagtranslate/myTagtranslate.vue'
    // 更换GPS 关闭/启动GPS 锁车/解锁 弹框 筛选过滤车辆弹框
    import settingGPS from '@/pages/component/vehicle/settingGPS.vue'
    import settingLockVehicle from '@/pages/component/vehicle/settingLockVehicle.vue'
    import perparateVehicle from '@/pages/component/vehicle/preparateVehicle.vue'
    // 混入
    import mixin from '@/common/mixin.js'

    export default {
        components: {
            logout,
            uniPagination,
            MyTagTranslate,
            settingGPS,
            settingLockVehicle,
            perparateVehicle
        },
        mixins: [mixin],
        provide() {
            return {
                getVehicleList: this.getVehicleList
            }
        },
        data() {
            return {
                is_reload_tag: true, // 用于在页面开始时, 先获取一遍代码集翻译数据, 然后将翻译组件隐藏
                is_hide_flag: false, // 用于标识当前页面是否隐藏
                select_uid: '', // 通过该属性, 判断那一辆车的 右侧弹出层弹出
                timer: null, // 定时器标识
                list_data: [], // 车辆列表数据源
                /** 获取车辆列表数据 参数 */
                query_param: {
                    select_key: {
                        organization_uid: '',
                        region_code: '',
                        uid: ''
                    }
                },
                // 分页初始化参数
                attribute_nodeR: {
                    record_start_row: 1, // 从第几条开始
                    record_page_row: 10, // 每页条数
                    record_record_number: 0, // 数据总数
                    sortColumn: ''
                },
                // 分页组件绑定的数据
                current_page: 1
            }
        },
        methods: {
            /** 登录后, 获取该用户下的所有 设备 蓝牙信息, 保存在客户端本地, 以便在没网时 蓝牙解锁/锁车/延期时 使用 */
            getBleInfo() {
                uni.request({
                    url: `${this.api}txnabt101.ajson`,
                    // #ifdef MP-WEIXIN
                    header: getApp().globalData.header,
                    // #endif
                    data: {},
                    dataType: 'json',
                    success: (res) => {
                        console.log('获取车辆蓝牙操作指令信息', res.data)
                        if (res.data.error_code === '000000') {
                            let {
                                lock_vehicles,
                                postpone_vehicles
                            } = res.data
                            let userName = uni.getStorageSync('username')
                            uni.setStorageSync(userName + 'lock_vehicles', JSON.stringify(lock_vehicles))
                            uni.setStorageSync(userName + 'postpone_vehicles', JSON.stringify(
                                postpone_vehicles))
                        } else {
                            this.toastRequestErr(res.data)
                        }
                    },
                    fail: () => {
                        this.toastErr()
                    }
                })
            },
            goVehicleDetail(index, uid) {
                uni.navigateTo({
                    url: `/pages/component/vehicle/vehicleDetail?uid=${uid}`
                })
            },
            /** 获取车辆列表 */
            getVehicleList(attribut) {
                uni.showLoading({
                    title: '请稍后'
                });
                uni.request({
                    url: `${this.api}txnsyscv1.ajson?attribute_node:record_start_row=${attribut.record_start_row}&attribute_node:record_record_number=${attribut.record_record_number}&attribute_node:record_page_row=${attribut.record_page_row}&attribute_node:record_sort-column=${attribut.sortColumn}`,
                    // #ifdef MP-WEIXIN
                    header: getApp().globalData.header,
                    // #endif
                    data: {
                        ...this.query_param,
                    },
                    method: 'POST',
                    dataType: 'json',
                    success: (res) => {
                        this.list_data = []
                        let data = res.data;
                        console.log('获取车辆列表数据', data);
                        // let timeoutTimer = setTimeout(() => {
                            if (data.error_code === '000000') {
                                let list_data = data.record;
                                if (list_data) {
                                    this.list_data = list_data;
                                } else {
                                    this.list_data = []
                                }

                                this.attribute_node.record_record_number = data.attribute_node.record_record_number
                                let __tData = res.data.attribute_node['record_start_row']
                                if (__tData) {
                                    this.attribute_node.record_start_row = parseInt(__tData)
                                }
                                __tData = res.data.attribute_node['record_record_number']
                                if (__tData) {
                                    this.attribute_node.record_record_number = parseInt(__tData)
                                }
                                __tData = res.data.attribute_node['record_page_row']
                                if (__tData) {
                                    this.attribute_node.record_page_row = parseInt(__tData)
                                }
                                
                            } else {
                                // 重置分页组件
                                this.attribute_node.record_record_number = 0
                                this.attribute_node.record_start_row = 1
                                
                                this.toastRequestErr(res.data)
                            }
                            
                            uni.hideLoading();
                            uni.stopPullDownRefresh();
                        // }, 10)
                    },
                    fail: () => {
                        uni.hideLoading();
                        this.toastErr();
                        uni.stopPullDownRefresh();
                    }
                })
            },
            /** 分页组件绑定的 改变页号事件 */
            changePage(e) {
                console.log(e);
                this.attribute_node.record_start_row = (e.current - 1) * 10 + 1;
                // 调用获取车辆列表方法
                this.getVehicleList(this.attribute_node)
            },
            /** 增加车辆按钮 */
            addVehicle() {
                uni.navigateTo({
                    url: '/pages/component/vehicle/addVehicle'
                })
            },
            /** 编辑按钮 */
            editVehicle(index, item, uid) {
                uni.navigateTo({
                    url: `/pages/component/vehicle/editVehicle?uid=${uid}`
                })
            },
            /** 锁车设置 按钮 */
            settingLockVehicle(index, item) {
                this.$refs.settingLockVehicle.showPopup(item.uid, item.vehicle_id, item.lock_status);
            },
            /** gps设置按钮 */
            settingGPS(index, item) {
                this.$refs.settingGPS.showPopup(item.uid, item.vehicle_id, item.gps_status, item.lock_status);
            }
        },
        /** 初次加载 */
        onReady() {
            // this.getVehicleList(this.attribute_nodeR);
            // this.getBleInfo()
        },
        /** 监听页面加载，其参数为上个页面传递的数据 */
        onLoad(option) {
            console.log(option)
            this.query_param.select_key.uid = option.uid;
            this.query_param.select_key.organization_uid = option.organization_uid;
            this.query_param.select_key.region_code = option.region_code;
            this.getVehicleList(this.attribute_node);
        },
        /** 监听页面显示 */
        onShow() {
            if (this.is_hide_flag) {
                let timer = setTimeout(() => {
                    this.is_reload_tag = false;
                    this.getVehicleList(this.attribute_node);
                    this.is_hide_flag = true;
                    clearTimeout(timer)
                }, 100)
            }
        },
        /** 监听页面隐藏 */
        onHide() {
            this.is_hide_flag = true;
            this.$refs.logoutModal.logout = false;
            // 页面隐藏时, 隐藏右侧 弹出层, 清除定时器
            this.select_uid = '';
            if (this.timer) {
                clearTimeout(this.timer)
            }
        },
        /** 导航栏上的自定义按钮的点击事件需要在页面监听onNavigationBarButtonTap事件 */
        onNavigationBarButtonTap() {
            // 筛选弹框
            this.$refs.preparateVehicle.showPreparatePopup();
        },
        onBackPress() {
            this.$refs.logoutModal.showLogoutModal();
            return true
        },
        /** 下拉刷新 */
        onPullDownRefresh() {
            console.log('下拉刷新触发');
            this.getVehicleList(this.attribute_node)
        },
        onTabItemTap() {
            
        }
    }
</script>

<style lang="less">
    @import '../../../common/uni-nvue.css';

    .vehicle-list {
        padding: 20rpx 30rpx !important;
        background: #f7f7f7;
        position: relative;
        box-sizing: border-box;
        min-height: 100%;
    }

    /* 列表 部分 */
    .list-content {
        margin-bottom: 120rpx;
        border-radius: 32rpx;

        .container-of-slide {
            width: 100%;
            margin-top: 24rpx;
            box-sizing: border-box;
            overflow: hidden;

            .item-list {
                width: 100%;
                position: relative;
                box-sizing: border-box;

                .vehicleID {
                    position: relative;
                    display: flex;
                    overflow: hidden;
                    /* #ifdef MP-WEIXIN */
                    font-size: 22rpx;
                    /* #endif */
                    /* #ifdef APP-PLUS */
                    font-size: 24rpx;
                    /* #endif */
                    
                    .name {
                        flex: 5;
                        position: relative;
                        line-height: 60rpx;
                        color: #fff;
                        font-weight: 600;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        padding: 0 0 0 20rpx;
                        background: #0c316e;
                        border-radius: 16rpx 8rpx 0 0;
                        
                        .shape {
                            position: absolute;
                            z-index: 1;
                            right: -30rpx;
                            top: -54rpx;
                            height: 0;
                            width: 0;
                            border-bottom: 54rpx solid #0c316e;
                            border-top: 60rpx solid transparent;
                            border-left: 30rpx solid transparent;
                            border-right: 30rpx solid transparent;
                        }
                    }
                    
                    .seat {
                        flex: 2;
                    }
                    
                    .vehicle-status {
                        flex: 2;
                        position: relative;
                        height: 50rpx;
                        margin-top: 10rpx;
                        background: #ccc;
                        color: #fff;
                        text-align: center;
                        border-radius: 8rpx 12rpx 0 0;
                        font-size: 20rpx;
                        
                        .shape {
                            position: absolute;
                            z-index: 1;
                            left: -20rpx;
                            top: -46rpx;
                            height: 0;
                            width: 0;
                            border-bottom: 46rpx solid #ccc;
                            border-top: 50rpx solid transparent;
                            border-left: 20rpx solid transparent;
                            border-right: 20rpx solid transparent;
                        }
                    }
                    
                    .vehicle-status-error {
                        background: #bd0202;
                    }
                }

                .list-item-content {
                    display: flex;
                    /* #ifdef MP-WEIXIN */
                    font-size: 22rpx;
                    /* #endif */
                    /* #ifdef APP-PLUS */
                    font-size: 24rpx;
                    /* #endif */
                    padding: 34rpx 30rpx;
                    color: #999;
                    background-color: #fff;

                    .list-item-content-left {
                        flex: 3;

                        &>view {
                            margin-top: 20rpx;
                            
                            &:first-child {
                                margin-top: 0;
                            }
                        }
                    }

                    .list-item-content-right {
                        flex: 4;
                        
                        &>view {
                            margin-top: 20rpx;
                            
                            &:first-child {
                                margin-top: 0;
                            }
                        }
                    }
                }
                
                .list-item-action {
                    display: flex;
                    padding: 32rpx 0;
                    font-size: 24rpx;
                    background: #fff;
                    
                    &>view {
                        flex: 1;
                        text-align: center;
                        line-height: 36rpx;
                        
                        image {
                            height: 32rpx;
                            width: 32rpx;
                            vertical-align: middle;
                        }
                        
                        text {
                            display: inline-block;
                            vertical-align: middle;
                            margin-left: 15rpx;
                        }
                    }
                }    
            }
        }
    }

    // 分页
    .my-pagination {
        position: fixed;
        box-sizing: border-box;
        width: calc(100% - 60rpx) !important;
        // height: 80rpx;
        text-align: center;
        bottom: 20rpx;
        padding: 0 20rpx;
        border-radius: 70rpx;
        z-index: 2;

        .uni-pagination {
            padding: 4rpx 10rpx;
            border: 1px dashed #aaa;
            border-radius: 64rpx;
            background: #fff;
            box-shadow: #ddd 0rpx 0rpx 6rpx 6rpx;
            width: calc(100% - 240rpx) !important;
        }

        .add {
            position: absolute;
            top: 6rpx;
            right: 20rpx;
            margin-right: 10rpx;
            margin-bottom: 18rpx;
            width: 176rpx;
            height: 64rpx;
            background-color: #bd0202;
            line-height: 64rpx;
            font-size: 28rpx;
            color: #fff;
            box-shadow: 0 0rpx 6rpx 2rpx #d54048;
            border-radius: 32rpx;
            z-index: 99;
        }
    }
</style>
