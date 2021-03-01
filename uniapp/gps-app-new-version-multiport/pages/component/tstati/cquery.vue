<template>
    <view calss="uni-container tstati-container">
        <view class="thead" v-if="current_value === 20">
            <view style="width: 80rpx; text-align: center;">#</view>
            <view>日期</view>
            <view>速度</view>
            <view>转速</view>
            <view>机油液位</view>
            <view>机油压力</view>
            <view>冷却液温度</view>
        </view>
        <view class="thead" v-if="current_value === 21">
            <view style="width: 80rpx; text-align: center;">#</view>
            <view style="flex: 1;">日期</view>
            <view style="flex: 1;">高度</view>
            <view style="flex: 1;">经度</view>
            <view style="flex: 1;">纬度</view>
            <view style="flex: 1;">速度</view>
        </view>
        <view class="tbody" v-if="current_value !== 22">
            <view v-for="(item ,index) in list" :key="index" v-if="current_value === 20">
                <view style="width: 80rpx; text-align: center;">{{index + 1}}</view>
                <view>{{item.date_time}}</view>
                <view>{{item.vehicle_speed}}</view>
                <view>{{item.engine_rpm}}</view>
                <view>{{item.engine_oil_level}}</view>
                <view>{{item.engine_oil_pressure}}</view>
                <view>{{item.engine_coolant_temperature}}</view>
            </view>
            <view v-for="(item ,index) in list" :key="index" v-if="current_value === 21">
                <view style="width: 80rpx; text-align: center;">{{index + 1}}</view>
                <view style="flex: 1;">{{item.date_time}}</view>
                <view style="flex: 1;">{{item.height}}</view>
                <view style="flex: 1;">{{item.latitude}}</view>
                <view style="flex: 1;">{{item.longitude}}</view>
                <view style="flex: 1;">{{item.speed}}</view>
            </view>
        </view>
        <view class="thead_lock" v-if="current_value === 22">
            <view style="width: 60rpx; text-align: center;"></view>
            <view style="width: 80rpx; text-align: center;">#</view>
            <view style="flex: 1; text-align: center;">日期</view>
            <view style="flex: 1; text-align: center;">CAN_ID</view>
            <view style="flex: 1; text-align: center;">CAN_ID名称</view>
        </view>
        <view class="tbody_lock" v-if="current_value === 22">
            <view v-for="(item, index) in list" :key="index" @tap="table_item_tap(item, index)" :class="selected_index === index? 'selectItem' : ''">
                <view>
                    <view style="width: 60rpx; text-align: center;">
                        <uni-icons :size="14" class="uni-icon-wrapper" hover-class="hoverStyle" color="#333" v-if="selected_index !== index"
                            type="arrowright" />
                        <uni-icons :size="14" class="uni-icon-wrapper" hover-class="hoverStyle" color="#333" v-else
                            type="arrowdown" />
                    </view>
                    <view style="width: 80rpx; text-align: center;">{{index + 1}}</view>
                    <view style="flex: 1; text-align: center;">{{item.date_time}}</view>
                    <view style="flex: 1; text-align: center;">{{item.can_id}}</view>
                    <view style="flex: 1; text-align: center;">{{item.can_id_name}}</view>
                </view>
                <view style="background: #fceee8; color: #333" v-if="selected_index === index" class="expend-view">
                    <view style="text-align: center;">CAN_DATA: {{item.can_data}}</view>
                    <view style="text-align: center;">注释: {{item.data_annotation}}</view>
                </view>
            </view>
        </view>
        <uni-load-more :status="load_more_status"></uni-load-more>

        <!-- 条件选择弹框 -->
        <uni-popup :show="show_condition" type="center" :custom="true" :mask-click="false">
            <view class="uni-tip">
                <view class="uni-tip-title">
                    <view>查询选择</view>
                </view>
                <view class="uni-tip-content" style="padding: 10rpx;"></view>
                <view style="padding: 20rpx; text-align: center;" class="content">
                    <uni-combox label="选择国家:" placeholder="请选择国家" :value="select_country_name" @sendValue="selectedCountry"
                        v-model="select_country_name" codeType="tlt_have_truck_country" :s_id="refs[0]" :ref="refs[0]"></uni-combox>
                    <view style="position: static; overflow: hidden; padding: 0;" @click.prevent="isClick"
                        v-show="isCanUse">
                        <uni-combox label="选择地区:" :placeholder="select_dist" style="float: left; z-index: 0; width: 100%;"
                            v-model="select_dist">
                        </uni-combox>
                    </view>
                    <uni-combox label="整车编号:" placeholder="请选择整车编号" :s_id="refs[1]" :value="select_vehicle_id_name"
                        :region_code="region_code" @sendValue="selectedVehicleID" v-model="select_vehicle_id_name"
                        codeType="tlt_vehicle_in_region" uid="" :ref="refs[1]"></uni-combox>

                    <view style="border-bottom: 1px solid #ccc; display: flex; font-size: 28rpx;  padding: 48rpx 0rpx 32rpx 0rpx;">
                        <text style="margin: auto;">选择日期:</text>
                        <text style="flex: 1; color: #848b9a; padding: 0 20rpx;"
                            @tap="dateIcon_click" v-show="current_value === 22">{{select_date.length? `${select_date[0]} - ${select_date[1]}` : '请选择日期'}}</text>
                        <text style="flex: 1; color: #848b9a; padding: 0 20rpx;" @tap="dateIcon_click" v-show="current_value === 20 || current_value === 21">{{m_date? m_date: '请选择日期'}}</text>
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
                <!-- 选择日期期间 -->
                <mx-date-picker :show="show_date_modal" :type="type" :show-tips="true" :show-seconds="true" @confirm="onSelected"
                    @cancel="show_date_modal = false" />
                <uni-popup :show="is_show" type="bottom" mode="fixed" msg="选择收货地址" @hidePopup="togglePopup('')">
                    <semp-city @confirmSelect="onCityClick" @cancelSelect="cancelselect_dist"></semp-city>
                </uni-popup>
            </view>
        </uni-popup>
        
        <view class="review" @tap="showCondition" v-show="!show_condition">查询选项</view>
    </view>
</template>

<script>
    // 图标
    import uniIcons from '@/components/uni-icons/uni-icons.vue'
    // popup 弹出层
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    // 类似于下拉框
    import uniCombox from "@/components/uni-combox/uni-combox"
    import sempCity from "@/components/semp-city/semp-city/semp-city.vue"
    import MxDatePicker from "@/components/mx-datepicker/mx-datepicker.vue";
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
            uniLoadMore
        },
        mixins: [mixin],
        data() {
            return {
                selected_index: null,
                show_condition: false,
                
                search_flag: false, // 用于标识是否进行过搜索, 当没有进行过搜索查询列表数据时, 不会触发上拉加载更多
                list: [], // 表格数据
                sumi: 0, // 用于标识: 触发上拉加载更多的执行次数, 以便用来设置加载更多组件的 提示描述等
                lock: true, // 在上拉加载更多程序中: 用来控制上拉加载更多, 避免短时间内持续上拉, 导致加载过多数据, 效果不好, 
                load_more_status: 'noMore', // 上拉加载更多组件的文字提示描述; noMore: 没有更多数据, more: 加载更多 loading: 加载更多
                
                current_value: null, 
                // == 以下为选择地区依赖的数据
                isCanUse: false, // 控制选择地区显示/隐藏
                refs: ['combox1', 'combox2'],
                /** 选择国家 选中的代码集name / value */
                select_country_name: '',
                select_country_value: '',
                /** 选择地区文字展示 */
                select_dist: '请选择地区',
                /** 选择地区 依赖的属性值 */
                region_code: '', // 地区编码
                province_name: '',
                province_value: '',
                city_name: '',
                city_value: '',
                county_name: '',
                county_value: '',
                // 控制选择地区 popup 弹框的显示 / 隐藏
                is_show: false,
                // == 以下为选中整车编号弹框依赖的数据
                /** 选择整车编号 选中的代码集的name / value */
                select_vehicle_id_name: '',
                select_vehicle_id_value: '',

                // ==>以下为选择日期期间依赖的数据
                show_date_modal: false, // 控制日期选择弹框的显示/隐藏
                select_date: '',
                start_date: '',
                stop_date: '',
                m_date: '',
                // value: '',
                type: '',
                date: '2019/01/01',
                rangetime: ['2019/01/08 14:00', '2019/01/16 13:59'],
                // 分页
                attribute_nodeR: {
                    record_start_row: 1, // 从第几条开始
                    record_page_row: 40, // 每页条数
                    record_record_number: 0, // 数据总数
                    sortColumn: ''
                },
                attribute_node: {
                    record_start_row: 1, // 从第几条开始
                    record_page_row: 40, // 每页条数
                    record_record_number: 0, // 数据总数
                    sortColumn: ''
                }
            }
        },
        mounted() {
            this.showCondition();
        },
        methods: {
            table_item_tap(item, index) {
                if (this.selected_index === index) {
                    this.selected_index = null
                } else {
                    this.selected_index = index
                }
            },
            showCondition() {
                this.show_condition = true;  
                this.addEventListenerComBoxToggle();
            },
            cancelCondition() {
                this.show_condition = false  
                this.removeEventListenerComBoxToggle();
            },
            confirmCondition() {                
                this.search()
            },
            // 选择日期/时间 图标上绑定的点击事件
            dateIcon_click() {
                uni.showLoading()
                if (this.current_value === 20 || this.current_value === 21) {
                    this.type = 'date';
                } else if (this.current_value === 22) {
                    this.type = 'rangetime';
                }

                // this.value = this[this.type];
                this.show_date_modal = true;
                let timer = setTimeout(() => {
                    uni.hideLoading();
                    clearTimeout(timer)
                }, 1200)
            },
            onSelected(e) {
                if (e) {
                    console.log(e.value)
                    this[this.type] = e.value;
                    this.select_date = e.value;
                    if (this.current_value === 20 || this.current_value === 21) {

                        this.m_date = (this.select_date + '').replace(/-+|\s|:|\/+/g, '')
                        this.show_date_modal = false;
                    } else if (this.current_value === 22) {
                        let start_time = new Date(this.select_date[0]).getTime();
                        let end_time = new Date(this.select_date[1]).getTime();
                        if (start_time && end_time) {
                            if ((end_time - start_time) / 86400000 > 10) {
                                uni.showToast({
                                    title: '间隔时间不能超过10天, 请重新选择',
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
                    }
                }
            },
            search() {
                this.list = [];
                this.sumi = 0;
                if (this.current_value === 22) {
                    // 说明是锁车通信数据查询
                    if (!this.start_date || !this.stop_date) {
                        uni.showToast({
                            title: '请选择要查询的日期期间',
                            icon: 'none'
                        })
                        
                        return
                    }
                } else if (this.current_value === 21 || this.current_value === 20) {
                    if (!this.m_date) {
                        uni.showToast({
                            title: '请选择要查询的日期',
                            icon: 'none'
                        })

                        return
                    }
                }
                if (!this.select_vehicle_id_value) {
                    uni.showToast({
                        title: '请选择要查询的车辆',
                        icon: 'none'
                    })
            
                    return
                }
                this.show_condition = false;
                this.removeEventListenerComBoxToggle();
                this.getListData(this.attribute_nodeR);
            },
            /** 选择地区 */
            isClick(e) {
                if (this.select_country_value && this.select_country_value == '156') {
                    this.is_show = true;
                    uni.hideKeyboard();
                }
            },
            /** 三级联动 确定按钮 注册的 确定选择事件 */
            onCityClick(e) {
                this.select_dist = ''
                this.province_name = e.province.label;
                this.province_value = e.province.value;
                this.city_name = e.city.label;
                this.city_value = e.city.value;
                this.county_name = e.county.label;
                this.county_value = e.county.value;

                if (this.province_name) {
                    this.select_dist = this.province_name;
                }
                if (this.city_name) {
                    this.select_dist = this.province_name + '-' + this.city_name;
                }
                if (this.county_name) {
                    this.select_dist = this.province_name + '-' + this.city_name + '-' + this.county_name;
                }
                /** 清空 选择车辆编号依赖的数据 */
                this.select_vehicle_id_name = '';
                this.select_vehicle_id_value = '';
                console.log(this.select_dist);
                this.togglePopup();
            },
            /** 三级联动 取消按钮 注册的 取消选择事件 */
            cancelselect_dist(e) {
                this.togglePopup()
                this.province_name = e.province.label;
                this.province_value = e.province.value;
                this.city_name = e.city.label;
                this.city_value = e.city.value;
                this.county_name = e.county.label;
                this.county_value = e.county.value;
                this.select_dist = '请选择地区';
            },
            /** 关闭popup 弹框 */
            togglePopup() {
                this.is_show = false

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
                this.select_country_value = value;
                this.region_code = value;
                
                /** 清空 选择车辆编号依赖的数据 */
                this.select_vehicle_id_name = '';
                this.select_vehicle_id_value = '';
                // 选择的是中国, 设置地区选择可用
                if (this.select_country_value && this.select_country_value == '156') {
                    this.isCanUse = true;
                } else {
                    // 选择的不是中国, 设置地区选择不可用
                    this.isCanUse = false;
                }
            },

            /** 选中的整车编号 value */
            selectedVehicleID(value) {
                // 赋值选择的车辆编号value
                this.select_vehicle_id_value = value;
            },

            /** 获取列表数据 */
            getListData(attribut) {
                if (!this.search_flag) {
                    this.search_flag = true; // 用于标识是否进行过搜索
                }

                uni.showLoading({
                    title: '请稍后'
                });
                let url = '';
                let select_key;
                if (this.current_value === 20) {
                    url =
                        `${this.api}txncq0101.ajson?attribute_node:record_start_row=${attribut.record_start_row}&attribute_node:record_record_number=${attribut.record_record_number}&attribute_node:record_page_row=${attribut.record_page_row}&attribute_node:record_sort-column=${attribut.sortColumn}`
                    select_key = {
                        region_code: this.region_code, // 地区
                        m_date: this.m_date, // 日期
                        vehicle_uid: this.select_vehicle_id_value // 车辆,
                    }
                }
                if (this.current_value === 21) {
                    url =
                        `${this.api}txncq0201.ajson?attribute_node:record_start_row=${attribut.record_start_row}&attribute_node:record_record_number=${attribut.record_record_number}&attribute_node:record_page_row=${attribut.record_page_row}&attribute_node:record_sort-column=${attribut.sortColumn}`
                    select_key = {
                        region_code: this.region_code, // 地区
                        m_date: this.m_date, // 日期
                        vehicle_uid: this.select_vehicle_id_value // 车辆,
                    }
                }
                if (this.current_value === 22) {
                    url =
                        `${this.api}txncqe101.ajson?attribute_node:record_start_row=${attribut.record_start_row}&attribute_node:record_record_number=${attribut.record_record_number}&attribute_node:record_page_row=${attribut.record_page_row}&attribute_node:record_sort-column=${attribut.sortColumn}`
                    select_key = {
                        region_code: this.region_code, // 地区
                        start_time: this.start_date,
                        /** 开始时间 */
                        stop_time: this.stop_date,
                        /** 结束时间 */
                        vehicle_uid: this.select_vehicle_id_value // 车辆,
                    }
                }
                uni.request({
                    url: url,
                    // #ifdef MP-WEIXIN
                    header: getApp().globalData.header,
                    // #endif
                    data: {
                        select_key: {
                            ...select_key
                        }
                    },
                    method: 'POST',
                    timeout: 120000,
                    dataType: 'json',
                    success: (res) => {
                        if (res.data.error_code === '000000') {
                            console.log(res.data)
                            let {
                                error_code,
                                record,
                                attribute_node
                            } = res.data

                            if (record && record.length) {
                                this.record = record;
                               
                                this.attribute_node.record_record_number = attribute_node.record_record_number;
                                let list = this.list
                                /** 需求: 一次会返回所有的数据, 但是每次展示20条数据, 
                                    当触发上拉加载更多时, 每次添加20条数据, 直到将所有的数据添加完 */
                                this.list = list.concat(this.record)
                                if ((this.sumi + 1) * 40 >= Number(attribute_node.record_record_number)) {
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
                            // 如果出现sql116之类的报错, 那么该40条数据其实是没有查到的, 此时如果再执行上拉加载更多, 那么起始条数会比上次再增加40
                            // 因此, 查询不成功, sumi减1, 这样再次操作 上拉加载, 实现查询的是上次执行不成功所查询的数据
                            this.sumi -= 1;
                            this.toastRequestErr(res.data);
                            uni.hideLoading();
                        }
                    },
                    fail: () => {
                        // 同上
                        this.sumi -= 1;
                        uni.hideLoading();
                        this.toastErr();
                    }
                })
            }
        },
        onLoad(option) {
            this.current_value = Number(option.current_value);
            if (this.current_value === 20) {
                uni.setNavigationBarTitle({
                    title: `车辆查询 - 车辆状态`
                })
            } else if (this.current_value === 21) {
                uni.setNavigationBarTitle({
                    title: `车辆查询 - 车辆位置`
                })
            } else if (this.current_value === 22) {
                uni.setNavigationBarTitle({
                    title: `车辆查询 - 锁车通信数据`
                })
            }
        },
        // 上拉加载更多
        onReachBottom() {
            if (!this.search_flag) {
                return
            }
            if ((this.sumi + 1) * 40 >= this.attribute_node.record_record_number) {
                this.load_more_status = 'noMore';
                return
            }
            if (this.lock) {
                this.sumi += 1;
                this.lock = false;
                this.load_more_status = 'loading';

                this.attribute_node.record_start_row = (this.sumi + 1) * 40 + 1;
                this.getListData(this.attribute_node);

                let timer = setTimeout(() => {
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

    /* 提示窗口 */
    .uni-tip {
        width: 660rpx;
        padding: 40rpx 40rpx 60rpx 40rpx;
        background: #fff;
        box-sizing: border-box;
        border-radius: 20rpx;

        .uni-tip-title {
            text-align: center;
            font-weight: bold;
            font-size: 32rpx;
            color: #333;
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
        position: relative;
        background: blue;
    }

    .thead, .thead_lock {
        display: flex;
        flex-direction: row;
        position: fixed;
        left: 0;
        width: 100%;
        height: 64rpx;
        line-height: 64rpx;
        font-size: 18rpx;
        color: #fff;
        background: #0c316e;
    }

    .tbody,
    .tbody_lock {
        padding-top: 64rpx;
        box-sizing: border-box;
    }

    .tbody>view {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 64rpx;
        line-height: 64rpx;
        font-size: 18rpx;
    }

    .tbody_lock>view {
        width: 100%;

        &>view:first-child {
            display: flex;
            width: 100%;
            height: 76rpx;
            line-height: 76rpx;
            font-size: 18rpx;
        }
        
        .expend-view {
            width: 100%;
             
            &>view {
                width: 100%;
                height: 56rpx;
                line-height: 56rpx;
                font-size: 18rpx;
                text-align: center;
            }
        }
    }

    .thead>view:nth-child(2),
    .tbody>view view:nth-child(2) {
        flex: 4;
        text-align: center;
    }

    .thead>view:nth-child(3),
    .tbody>view view:nth-child(3) {
        flex: 2;
        text-align: center;
    }

    .thead>view:nth-child(4),
    .tbody>view view:nth-child(4) {
        flex: 2;
        text-align: center;
    }

    .thead>view:nth-child(5),
    .tbody>view view:nth-child(5) {
        flex: 3;
        text-align: center;
    }

    .thead>view:nth-child(6),
    .tbody>view view:nth-child(6) {
        flex: 3;
        text-align: center;
    }

    .thead>view:nth-child(7),
    .tbody>view view:nth-child(7) {
        flex: 3;
        text-align: center;
    }

    .tbody>view:nth-child(2n), .tbody_lock>view:nth-child(2n) {
        background: #efefef;
    }
    
    .tbody>view:nth-child(2n+1), .tbody_lock>view:nth-child(2n+1) {
        background: #dcdee2;
    }
    
    .tbody_lock>view.selectItem {
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
