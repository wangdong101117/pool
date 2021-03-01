<template>
    <view calss="uni-container tstati-container">
        <view class="thead">
            <view style="width: 80rpx; text-align: center;"></view>
            <!-- 月/年 不显示日期 -->
            <view style="flex: 2; text-align: center;" v-if="current_value === 0 || current_value === 1">日期</view>
            <view style="flex: 3; text-align: center;">整车编号</view>
            <view style="flex: 2; text-align: center;">打火时长/h</view>
            <view style="flex: 2; text-align: center;">总里程/km</view>
            <view style="width: 80rpx; text-align: center;">#</view>
        </view>
        <view class="tbody">
            <view v-for="(item, index) in list" :key="index" @tap="table_item_tap(item, index)" :class="selected_index === index? 'selectItem' : ''">
                <view>
                    <view style="width: 80rpx; text-align: center;">
                        <uni-icons :size="14" class="uni-icon-wrapper" hover-class="hoverStyle" color="#333" v-if="selected_index !== index"
                            type="arrowright" />
                        <uni-icons :size="14" class="uni-icon-wrapper" hover-class="hoverStyle" color="#333" v-else type="arrowdown" />
                    </view>
                    <view style="flex: 2; text-align: center;" v-if="current_value === 0 || current_value === 1">{{item.m_date}}</view>
                    <view style="flex: 3; text-align: center;">
                        {{item.vehicle_id}}
                    </view>
                    <view style="flex: 2; text-align: center;">{{item.engine_hours}}</view>
                    <view style="flex: 2; text-align: center;">{{item.run_km}}</view>
                    <view style="width: 80rpx; text-align: center;">{{index + 1}}</view>
                </view>
                <view style="background: #fceee8; color: #333" v-if="selected_index === index">
                    <view style="flex: 2; text-align: center;">行车时长 {{item.run_hours}} h</view>
                    <view style="flex: 2; text-align: center;">平均时速 {{item.average_speed}} km/h</view>
                    <view style="flex: 2; text-align: center;">超速时长 {{item.over_speed}} 分钟</view>
                    <view style="flex: 2; text-align: center;">最高时速 {{item.max_speed}} km/h</view>
                </view>
            </view>
        </view>

        <uni-load-more :status="load_more_status"></uni-load-more>

        <uni-popup class="fullscreen-popup" :show="show_condition" type="center" :custom="true" :mask-click="false">
            <view class="uni-tip uni-tip-fullscreen" v-if="show_condition">
                <view class="uni-tip-title">
                    <view>查询选项</view>
                </view>
                <view style="padding: 20rpx; text-align: center;" class="content">
                    <uni-combox label="选择国家:" :placeholder="select_country_name? select_country_name : '请选择国家'" :value="select_country_name"
                        @sendValue="selectedCountry" v-model="select_country_name" codeType="tlt_have_truck_country"
                        :s_id="refs[0]" :ref="refs[0]"></uni-combox>
                    <view style="position: static; overflow: hidden; padding: 0;" @click.prevent="isClick" v-show="isCanUse">
                        <uni-combox label="选择地区:" :placeholder="selected_dist" style="float: left; z-index: 0; width: 100%;"
                            v-model="selected_dist">
                        </uni-combox>
                    </view>

                    <uni-combox label="所属组织:" :placeholder="select_oganization_name? select_oganization_name : '请选择所属组织'"
                        :s_id="refs[1]" :value="select_oganization_name" v-show="current_value !== 0" @sendValue="selectedOganization"
                        v-model="select_oganization_name" codeType="tlt_organization" :ref="refs[1]"></uni-combox>

                    <uni-combox label="整车编号:" :placeholder="select_vehicle_id_name? select_vehicle_id_name : '请选择整车编号'"
                        :s_id="refs[2]" :value="select_vehicle_id_name" v-show="current_value === 0" :region_code="region_code"
                        @sendValue="selectedVehicleID" v-model="select_vehicle_id_name" codeType="tlt_vehicle_in_region"
                        :uid="select_oganization_value" :ref="refs[2]"></uni-combox>
                        
                    <!-- 这里, v-show, 在小程序端仍会渲染 content-item的样式, content-item仍会显示占位, 但v-if则不会 -->    
                    <view v-if="current_value === 2 || current_value === 3" class="content-item">
                        <text v-show="current_value === 2">选择月份：</text>
                        <text v-show="current_value === 3">选择年份：</text>
                        <dyDatePicker v-show="current_value === 2" timeType="month" @getData="getMonth" :showDate="true"
                            placeholder="请点击选择月份" minSelect="2000/01/01" maxSelect="2025/12/31" style="flex: 1; color: #aaa;">
                        </dyDatePicker>
                        <dyDatePicker v-show="current_value === 3" timeType="year" @getData="getYear" :showDate="true"
                            placeholder="请点击选择年份" minSelect="2000/01/01" maxSelect="2025/12/31" style="flex: 1; color: #aaa;">
                        </dyDatePicker>
                    </view>
                    <view v-if="current_value === 0 || current_value === 1" class="content-item">
                        <text>选择日期:</text>
                        <text style="flex: 1; color: #848b9a;" @tap="dateIconClick" v-show="current_value === 0">{{start_date? `${start_date} - ${stop_date}` : '请选择日期'}}</text>
                        <text style="flex: 1; color: #848b9a;" @tap="dateIconClick" v-show="current_value === 1">{{month? month: '请选择日期'}}</text>
                    </view>
                </view>

                <view class="uni-tip-group-button" style="margin-top: 30px;">
                    <view class="uni-tip-button" @click="cancelCondition()">
                        <view class="btn-cancel">
                            取消
                        </view>
                    </view>
                    <view class="uni-tip-button" @click="confirmCondition()">
                        <view class="btn-confirm">
                            确定
                        </view>
                    </view>
                </view>
                <mx-date-picker :show="show_date_modal" :type="type" :show-tips="true" :show-seconds="true" @confirm="onSelected"
                    @cancel="show_date_modal = false" v-if="current_value === 0 || current_value === 1" />
                <uni-popup :show="isShow" type="bottom" mode="fixed" msg="选择收货地址" @hidePopup="togglePopup('')">
                    <semp-city @confirmSelect="onCityClick" @cancelSelect="cancelselected_dist"></semp-city>
                </uni-popup>
            </view>
        </uni-popup>
        <view class="review" @tap="showCondition" v-if="!show_condition">查询选项</view>
    </view>
</template>

<script>
    // 图标
    import uniIcons from '@/components/uni-icons/uni-icons.vue'
    // popup 弹出层
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    // 类似于下拉框
    import uniCombox from "@/components/uni-combox/uni-combox"
    // 省市县
    import sempCity from "@/components/semp-city/semp-city/semp-city.vue"
    // 日期
    import MxDatePicker from "@/components/mx-datepicker/mx-datepicker.vue";
    import dyDatePicker from '@/components/dy-Date/dy-Date.vue'
    // 加载更多
    import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue"
    import mixin from '@/common/mixin.js'

    export default {
        components: {
            uniIcons,
            uniPopup,
            uniCombox,
            sempCity,
            MxDatePicker,
            dyDatePicker,
            uniLoadMore
        },
        mixins: [mixin],
        data() {
            return {
                selected_index: null,
                search_flag: false, // 用于标识是否进行过搜索, 当没有进行过搜索查询列表数据时, 不会触发上拉加载更多
                list: [],
                sumi: 0, // 用于标识: 触发上拉加载更多的执行次数, 以便用来设置加载更多组件的 提示描述等
                lock: true, // 在上拉加载更多程序中: 用来控制上拉加载更多, 避免短时间内持续上拉, 导致加载过多数据, 效果不好, 
                load_more_status: 'noMore', // 上拉加载更多组件的文字提示描述; noMore: 没有更多数据, more: 加载更多 loading: 加载更多
                show_condition: false,
                current_value: null,
                // == 以下为选择地区依赖的数据
                isCanUse: false, // 控制选择地区显示/隐藏
                refs: ['combox1', 'combox2', 'combox3'],
                /** 选择国家 选中的代码集name / value */
                select_country_name: '',
                select_country_value: '',
                /** 选择地区文字展示 */
                selected_dist: '请选择地区',
                /** 选择地区 依赖的属性值 */
                region_code: '', // 地区编码
                province_name: '', // 省name
                province_value: '', // 省code
                city_name: '', // 市name
                city_value: '', // 市code
                county_name: '', // 县name
                county_value: '', // 县code
                // 控制选择地区 popup 弹框的显示 / 隐藏
                isShow: false,
                // == 以下为选中组织机构弹框依赖的数据
                /** 选择所属组织 选中的代码集的name / value */
                select_oganization_name: '',
                select_oganization_value: '',
                // == 以下为选中整车编号弹框依赖的数据
                /** 选择整车编号 选中的代码集的name / value */
                select_vehicle_id_name: '',
                select_vehicle_id_value: '',
                // ==>以下为选择日期期间依赖的数据
                month: '',
                year: '',
                // ==>以下为选择日期期间依赖的数据
                show_date_modal: false, // 控制日期选择弹框的显示/隐藏
                select_date: '',
                start_date: '',
                stop_date: '',
                // value: '',
                type: '',
                date: '2019/01/01',
                range: ['2019/01/01', '2019/01/06']
            }
        },
        methods: {
            table_item_tap(item, index) {
                if (this.selected_index === index) {
                    this.selected_index = null;
                } else {
                    this.selected_index = index;
                }
            },
            /** 获取列表数据 */
            getListData(url, select_key) {
                this.search_flag = true // 用于标识是否进行过搜索
                uni.showLoading({
                    title: '请稍后'
                });

                uni.request({
                    url: url,
                    // #ifdef MP-WEIXIN
                    header: this.getApp().globalData.header,
                    // #endif
                    data: {
                        select_key: {
                            ...select_key
                        }
                    },
                    method: 'POST',
                    timeout: 60000,
                    dataType: 'json',
                    success: (res) => {
                        this.btnDisable = false
                        if (res.data.error_code === '000000') {
                            if (res.data.record && res.data.record.length) {
                                this.record = res.data.record;
                                let list = [];
                                /** 需求: 一次会返回所有的数据, 但是每次展示20条数据, 
                                    当触发上拉加载更多时, 每次添加20条数据, 直到将所有的数据添加完 */
                                this.list = list.concat(this.record.slice(0, 20));
                                if ((this.sumi + 1) * 20 >= this.record.length) {
                                    this.load_more_status = 'noMore'; // 没有更多数据了
                                } else {
                                    this.load_more_status = 'more'; // 加载更多数据
                                }
                            } else {
                                uni.showToast({
                                    title: '暂无数据',
                                    icon: 'none'
                                })
                                // 没有数据, 设置list=[], 加载更多组件提示为: 无更多数据
                                this.list = [];
                                this.load_more_status = 'noMore';
                            }

                            let timer = setTimeout(() => {
                                uni.hideLoading();
                                clearTimeout(timer);
                            }, 1000)

                        } else {
                            this.toastRequestErr(res.data);
                            uni.hideLoading();
                        }
                    },
                    fail: (err) => {
                        this.btnDisable = false;
                        uni.hideLoading();
                        this.toastErr();
                    }
                })
            },
            /** 选择地区 */
            isClick(e) {
                if (this.select_country_value && this.select_country_value == '156') {
                    this.isShow = true;
                    uni.hideKeyboard();
                }
            },
            /** 三级联动 确定按钮 注册的 确定选择事件 */
            onCityClick(e) {
                this.selected_dist = '';
                this.province_name = e.province.label;
                this.province_value = e.province.value;
                this.city_name = e.city.label;
                this.city_value = e.city.value;
                this.county_name = e.county.label;
                this.county_value = e.county.value;
                // this.townName = e.town.label;
                if (this.province_name) {
                    this.selected_dist = this.province_name;
                }
                if (this.city_name) {
                    this.selected_dist = this.province_name + '-' + this.city_name;
                }
                if (this.county_name) {
                    this.selected_dist = this.province_name + '-' + this.city_name + '-' + this.county_name;
                }

                /** 清空 选择车辆编号依赖的数据 */
                this.select_vehicle_id_name = '';
                this.select_vehicle_id_value = '';
                console.log(this.selected_dist)
                this.togglePopup()
            },
            /** 三级联动 取消按钮 注册的 取消选择事件 */
            cancelselected_dist(e) {
                this.togglePopup()
                this.province_name = e.province.label;
                this.province_value = e.province.value;
                this.city_name = e.city.label;
                this.city_value = e.city.value;
                this.county_name = e.county.label;
                this.county_value = e.county.value;
                this.selected_dist = '请选择地区';
            },
            /** 关闭popup 弹框 */
            togglePopup() {
                this.isShow = false;

                if (this.county_value) {
                    this.region_code = this.county_value;
                } else if (!this.county_value && this.city_value) {
                    this.region_code = this.city_value;
                } else if (!this.city_value && this.province_value) {
                    this.region_code = this.province_value;
                } else if (!this.province_value && this.select_country_value) {
                    this.region_code = this.select_country_value;
                }
            },
            /** 选中的 国家 value */
            selectedCountry(value) {
                this.select_country_value = value
                this.region_code = value
                /** 清空 选择车辆编号依赖的数据 */
                this.select_vehicle_id_name = '';
                this.select_vehicle_id_value = '';
                // 选择的是中国, 设置地区选择可用
                if (this.select_country_value && this.select_country_value == '156') {
                    this.isCanUse = true;
                } else {
                    // 选择的不是中国, 设置地区选择不可用
                    this.isCanUse = false;
                    this.province_name = '';
                    this.province_value = '';
                    this.city_name = '';
                    this.city_value = '';
                    this.county_name = '';
                    this.county_value = '';
                    this.selected_dist = '请选择地区';
                }
            },
            /** 选中的 组织value: 赋值选择的组织value */
            selectedOganization(value) {
                this.select_oganization_value = value;

                /** 清空 选择车辆编号依赖的数据 */
                this.select_vehicle_id_name = '';
                this.select_vehicle_id_value = '';
            },
            /** 选中的整车编号 value */
            selectedVehicleID(value) {
                // 赋值选择的车辆编号value
                this.select_vehicle_id_value = value;
            },
            // 选择日期/时间 图标上绑定的点击事件
            dateIconClick() {
                if (this.current_value === 2 || this.current_value === 3) {
                    this.show_date_modal = true;
                } else {
                    uni.showLoading();
                    if (this.current_value === 0) {
                        this.type = 'range';
                    } else if (this.current_value === 1) {
                        uni.showLoading()
                        this.type = 'date';
                    }

                    // this.value = this[this.type];
                    this.show_date_modal = true;
                    let timer = setTimeout(() => {
                        uni.hideLoading();
                        clearTimeout(timer);
                    }, 1200)
                }
            },
            onSelected(e) {
                if (e) {
                    console.log(e.value);
                    this[this.type] = e.value;
                    this.select_date = e.value;
                    if (this.current_value === 0) {
                        let start_time = new Date(this.select_date[0]).getTime();
                        let end_time = new Date(this.select_date[0]).getTime();
                        
                        if (start_time && end_time) {
                            if ((end_time - start_time) / 86400000 > 60) {
                                uni.showToast({
                                    title: '间隔时间不能超过60天, 请重新选择',
                                    icon: 'none'
                                })
                                
                                this.select_date = '';
                            } else {
                                let time1 = this.select_date[0] + '';
                                let time2 = this.select_date[1] + '';
                                this.start_date = time1.replace(/-+|\s|:|\/+/g, '');
                                this.stop_date = time2.replace(/-+|\s|:|\/+/g, '');

                                console.log(this.start_date, this.stop_date);
                                this.show_date_modal = false;
                            }
                        }
                    } else if (this.current_value === 1) {
                        this.month = this.select_date.replace(/-+|\s|:|\/+/g, '')
                        this.show_date_modal = false;
                    }
                }
            },
            /** 选择月份 */
            getMonth(value) {
                this.month = value.replace(/-+|\s|:+/g, '');
            },
            /** 选择年份 */
            getYear(value) {
                this.year = value.replace(/-+|\s|:+/g, '');
            },
            showCondition() {
                this.show_condition = true;
                this.addEventListenerComBoxToggle();
            },
            /* 条件选择弹框 取消按钮 */
            cancelCondition() {
                this.show_condition = false;
                this.removeEventListenerComBoxToggle();
            },
            /* 条件选择弹框 确定按钮 */
            confirmCondition() {
                let url = '';
                let select_key = {};

                if (this.current_value === 2) {
                    // 说明是统计月
                    if (!this.month) {
                        uni.showToast({
                            title: '请选择要查询的月份',
                            icon: 'none'
                        })
                        this.btnDisable = false
                        return
                    }

                    url = `${this.api}txnts1003.ajson`;
                    select_key = {
                        organization_uid: this.select_vehicle_id_value, // 机构uid
                        region_code: this.region_code, // 地区
                        month: this.month // 日期,
                    }
                } else if (this.current_value === 1) {
                    if (!this.month) {
                        uni.showToast({
                            title: '请选择要查询的日期',
                            icon: 'none'
                        })
                        this.btnDisable = false
                        return
                    }

                    url = `${this.api}txnts1001.ajson`;
                    select_key = {
                        organization_uid: this.select_vehicle_id_value, // 机构uid
                        region_code: this.region_code, // 地区
                        m_date: this.month // 日期,
                    }
                } else if (this.current_value === 0) {
                    if (!this.start_date || !this.stop_date) {
                        uni.showToast({
                            title: '请选择要查询的日期期间',
                            icon: 'none'
                        })
                        this.btnDisable = false
                        return
                    }

                    if (!this.select_vehicle_id_value) {
                        uni.showToast({
                            title: '请选择要查询的车辆',
                            icon: 'none'
                        })
                        this.btnDisable = false
                        return
                    }

                    url = `${this.api}txntq1011.ajson`

                    select_key = {
                        region_code: this.region_code, // 地区
                        start_date: this.start_date, // 起始日期
                        stop_date: this.stop_date, // 结束日期
                        vehicle_uid: this.vehicle_uid // 车辆,
                    }

                } else if (this.current_value === 3) {
                    if (!this.year) {
                        uni.showToast({
                            title: '请选择要查询的年份',
                            icon: 'none'
                        })
                        this.btnDisable = false
                        return
                    }

                    url = `${this.api}txnts1005.ajson`;
                    select_key = {
                        organization_uid: this.select_vehicle_id_value, // 机构uid
                        region_code: this.region_code, // 地区
                        year: this.year // 日期,
                    }
                }

                this.getListData(url, select_key);
                this.show_condition = false;
                this.removeEventListenerComBoxToggle();
            }
        },
        onLoad(option) {
            console.log('跳转页面携带的参数', option)
            this.current_value = Number(option.current_value); // current_value: 功能选项 标识 value
            
            if (this.current_value === 0) {
                uni.setNavigationBarTitle({
                    title: `工作状况查询 - 查询日`
                })
            } else if (this.current_value === 1) {
                uni.setNavigationBarTitle({
                    title: `工作状况查询 - 统计日`
                })
            } else if (this.current_value === 2) {
                uni.setNavigationBarTitle({
                    title: `工作状况查询 - 统计月`
                })
            } else if (this.current_value === 3) {
                uni.setNavigationBarTitle({
                    title: `工作状况查询 - 统计年`
                })
            }
        },
        mounted() {
            this.showCondition();
        },
        // 上拉加载更多
        onReachBottom() {
            if (!this.search_flag) return
            if ((this.sumi + 1) * 20 >= this.record.length) {
                this.load_more_status = 'noMore';
                return
            }
            if (this.lock) {
                this.sumi += 1;
                this.lock = false;
                this.load_more_status = 'loading';
                let timer = setTimeout(() => {
                    let list = [];
                    this.list = list.concat(this.record.slice(0, (this.sumi + 1) * 20));
                    this.lock = true;
                    this.load_more_status = 'more';
                    clearTimeout(timer);
                }, 1500)
            }
        },
        onBackPress() {
            if (this.show_condition) {
                this.cancelCondition();
                return true
            } 
        }
    }
</script>

<style lang="less">
    @import '../../../common/uni-nvue.css';

    .uni-tip {
        width: 660rpx;
        padding: 40rpx 30rpx 60rpx 30rpx;
        background: #fff;
        box-sizing: border-box;
        border-radius: 20rpx;

        .uni-tip-title {
            color: #333;
            text-align: center;
            font-weight: bold;
            font-size: 32rpx;
        }

        .uni-tip-content {
            padding: 30rpx;
            color: #666;
            font-size: 28rpx;
            text-align: center;
        }

        .content {

            .content-item {
                display: flex;
                padding: 48rpx 0rpx 32rpx 0rpx;;
                border-bottom: 1px solid #ccc; 
                font-size: 28rpx;
            }
        }

        .uni-tip-group-button {
            display: flex;
            padding: 0 8rpx;
            
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

    .tstati-container {
        width: 100%;
        height: 100%;
        position: relative;
        background: blue;
    }

    .thead {
        position: fixed;
        display: flex;
        flex-direction: row;
        left: 0;
        width: 100%;
        height: 64rpx;
        line-height: 64rpx;
        font-size: 18rpx;
        color: #fff;
        background: #0c316e;
    }

    .tbody {
        padding-top: 64rpx;
        box-sizing: border-box;
    }

    .tbody>view {
        width: 100%;

        &>view {
            display: flex;
            width: 100%;
            height: 76rpx;
            line-height: 76rpx;
            font-size: 18rpx;
        }
    }

    .tbody>view:nth-child(2n) {
        background: #efefef;
    }

    .tbody>view:nth-child(2n+1) {
        background: #dcdee2;
    }

    .tbody>view.selectItem {
        background: #fff;
    }

    .review {
        position: fixed;
        right: 40rpx;
        bottom: 40rpx;
        background: #0c316e;
        color: #fff;
        box-shadow: 0 0 2rpx 0 #0c316e;
        font-size: 24rpx;
        padding: 12rpx 20rpx;
        height: 32rpx;
        line-height: 32rpx;
        border-radius: 8rpx;
        opacity: .5;
    }
</style>
