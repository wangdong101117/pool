<template>
    <view calss="uni-container tstati-container">
        <!-- 折线图 -->
        <view class="qiun-charts-rotate" v-if="!show_condition" :style="{'width': c_width2+'px', 'height': c_height2+'px'}">
            <canvas canvas-id="canvasLineB" id="canvasLineB" class="charts-rotate" :width="c_width2" :height="c_height2"
                :style="{'width':c_width2+'px','height':c_height2+'px'}" @touchstart="touchLineB" @touchmove="moveLineB"
                @touchend="touchEndLineB"></canvas>
        </view>
        <!-- 关闭图标 -->
        <uni-icons :size="26" v-if="!show_condition" class="uni-icon-close" color="#1296db" type="closeempty" @tap="emptyCchart" />
        <!-- 条件选择弹框 -->
        <uni-popup :show="show_condition" type="center" :custom="true" :mask-click="false">
            <view class="uni-tip">
                <view class="uni-tip-title">
                    <view>查询选择</view>
                </view>
                <!-- <view class="uni-tip-content" style="padding: 10rpx;"></view> -->
                <view style="padding: 20rpx; text-align: center;" class="content">
                    <uni-combox label="选择国家：" placeholder="请选择国家" :value="select_country_name" @sendValue="selectedCountry"
                        v-model="select_country_name" codeType="tlt_have_truck_country" :s_id="refs[0]" :ref="refs[0]"></uni-combox>
                    <view style="position: static; overflow: hidden; padding: 0;" @click.prevent="isClick"
                        v-show="is_can_use">
                        <uni-combox label="选择地区：" :placeholder="selected_dist" style="float: left; z-index: 0; width: 100%; "
                            v-model="selected_dist">
                        </uni-combox>
                    </view>
                    <uni-combox label="整车编号：" placeholder="请选择整车编号" :s_id="refs[2]" :value="select_vehicle_id_name"
                        :region_code="region_code" @sendValue="selectedVehicleID" v-model="select_vehicle_id_name"
                        codeType="tlt_vehicle_in_region" :ref="refs[2]"></uni-combox>

                    <view style="border-bottom: 1px solid #ccc; display: flex; font-size: 28rpx; padding: 48rpx 0rpx 32rpx 0rpx;">
                        <text style="margin: auto;">选择日期：</text>
                        <text style="flex: 1; color: #848b9a; padding: 0 20rpx;"
                            @tap="dateIconClick">
                            {{select_date.length? `${select_date[0]} - ${select_date[1]}` : '请选择日期'}}
                        </text>    
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
                <!-- 选择日期期间弹框 -->
                <mx-date-picker :show="show_date_modal" type="rangetime" :show-tips="true" :show-seconds="true"
                    @confirm="onSelected" @cancel="show_date_modal = false" />

                <uni-popup :show="is_show" type="bottom" mode="fixed" msg="选择收货地址" @hidePopup="togglePopup('')">
                    <semp-city @confirmSelect="onCityClick" @cancelSelect="cancelselected_dist"></semp-city>
                </uni-popup>
            </view>
        </uni-popup>
    </view>
</template>

<script>
    var _self;
    var canvaLineB = null;
    import uCharts from '@/components/u-charts/u-charts.js'
    // 图标
    import uniIcons from '@/components/uni-icons/uni-icons.vue'
    // popup 弹出层
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    // 类似于下拉框
    import uniCombox from "@/components/uni-combox/uni-combox"
    import sempCity from "@/components/semp-city/semp-city/semp-city.vue"
    import MxDatePicker from "@/components/mx-datepicker/mx-datepicker.vue";
    import mixin from '@/common/mixin.js'

    export default {
        components: {
            uniIcons,
            uniPopup,
            uniCombox,
            sempCity,
            MxDatePicker
        },
        mixins: [mixin],
        data() {
            return {
                show_condition: false, // 控制条件选择框的显示隐藏
                showIconBox: true,
                // 折线图依赖数据
                c_width2: '', //横屏图表
                c_height2: '', //横屏图表

                pixelRatio: 1,
                btn_disable: false, // 控制搜索按钮禁用/启用, 避免短时间内多次操作点击搜索按钮
                current_value: null, 
                // == 以下为选择地区依赖的数据
                is_can_use: false, // 控制选择地区显示/隐藏
                refs: ['combox1', 'combox2', 'combox3'],
                /** 选择国家 选中的代码集name / value */
                select_country_name: '',
                select_country_value: '',
                /** 选择地区文字展示 */
                selected_dist: '请选择地区',
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
                rangetime: ['2019/01/08 14:00', '2019/01/16 13:59'],
            }
        },
        mounted() {
            this.show_condition = true;
            this.addEventListenerComBoxToggle();
            _self = this;
            uni.getSystemInfo({
                success: (res) => {
                    // if (res.pixelRatio > 1) {
                    //     //正常这里给2就行，如果pixelRatio=3性能会降低一点
                    //     _self.pixelRatio = 3;
                    // }
                    this.c_width2 = res.windowWidth - 20;
                    this.c_height2 = res.windowHeight - 20;
                },

            });
        },
        methods: {
            /** 选择条件弹框 取消按钮 */
            cancelCondition() {
                this.show_condition = false;            
                this.removeEventListenerComBoxToggle();
            },
            confirmCondition() {
                this.removeEventListenerComBoxToggle();
                this.search();
            },
            // 关闭图标上绑定的点击事件
            emptyCchart() {
                // 显示条件选择; 并且隐藏关闭图标; 清空 绘制的图表数据
                this.show_condition = true;
                this.addEventListenerComBoxToggle();
            },
            // 折线图/曲线图配置
            showLineB(canvasId, chartData, markLine, max) {
                canvaLineB = new uCharts({
                    $this: _self,
                    canvasId: canvasId,
                    type: 'line',
                    fontSize: 8,
                    legend: {
                        show: false
                    },
                    background: '#FFFFFF',
                    pixelRatio: _self.pixelRatio,
                    rotate: true, //开启图表横屏
                    // #ifdef MP-ALIPAY || MP-BAIDU
                    rotateLock: true, //百度及支付宝需要锁定旋转
                    // #endif
                    categories: chartData.categories,
                    enableMarkLine: true,
                    /***需要开启标记线***/
                    enableScroll: true, //开启图表拖拽功能
                    animation: false,
                    series: chartData.series,
                    xAxis: {
                        disableGrid: true,
                        type: 'grid',
                        gridType: 'dash',
                        itemCount: 25, //可不填写，配合enableScroll图表拖拽功能使用，x轴单屏显示数据的数量，默认为5个
                        scrollShow: true, //新增是否显示滚动条，默认false
                        scrollAlign: 'left',
                        rotateLabel: true,
                        scrollBackgroundColor: '#F7F7FF', //可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条背景颜色,默认为 #EFEBEF
                        scrollColor: '#DEE7F7', //可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条颜色,默认为 #A6A6A6
                    },
                    yAxis: {
                        max: max
                    },
                    width: _self.c_width2,
                    height: _self.c_height2,
                    dataLabel: true,
                    dataPointShape: true,
                    extra: {
                        line: {
                            type: 'curve'
                        },
                        markLine: {
                            type: 'dash',
                            dashLength: 15,
                            data: [{
                                value: markLine,
                                lineColor: '#f04864',
                                showLabel: true
                            }]
                        }
                    }
                });
            },
            touchLineB(e) {
                canvaLineB.scrollStart(e);
            },
            moveLineB(e) {
                canvaLineB.scroll(e);
            },
            touchEndLineB(e) {
                canvaLineB.scrollEnd(e);
                //下面是toolTip事件，如果滚动后不需要显示，可不填写
                canvaLineB.showToolTip(e, {
                    format: (item, category) => {
                        if (this.current_value === 10) {
                            return category + ' ' + item.name + ':' + item.data + ' km/h';
                        } else if (this.current_value === 13) {
                            return category + ' ' + item.name + ':' + item.data + ' rpm';
                        } else if (this.current_value === 11) {
                            return category + ' ' + item.name + ':' + item.data + ' per';
                        } else if (this.current_value === 12) {
                            return category + ' ' + item.name + ':' + item.data + ' kpa';
                        } else {
                            return category + ' ' + item.name + ':' + item.data + ' ℃';
                        }
                    }
                });
            },
            dateIconClick() {
                this.show_date_modal = true;
                uni.showLoading()
                let timer = setTimeout(() => {
                    uni.hideLoading();
                    clearTimeout(timer);
                }, 1200)
            },
            // 确认选择
            onSelected(e) {
                if (e) {
                    console.log(e.value);
                    this.select_date = e.value;
                    let time = e.value + '';
                    let start_time = new Date(this.select_date[0]).getTime();
                    let end_time = new Date(this.select_date[1]).getTime();
                    if (start_time && end_time) {
                        if ((end_time - start_time) / 86400000 > 1) {
                            uni.showToast({
                                title: '间隔时间不能超过24小时, 请重新选择',
                                icon: 'none'
                            })
                            
                            this.select_date = ''
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
            },
            search() {
                this.btn_disable = true;

                if (!this.start_date || !this.stop_date) {
                    uni.showToast({
                        title: '请选择要查询的日期期间',
                        icon: 'none'
                    })
                    this.btn_disable = false;
                    return
                }

                if (!this.select_vehicle_id_value) {
                    uni.showToast({
                        title: '请选择要查询的车辆',
                        icon: 'none'
                    })
                    this.btn_disable = false;
                    return
                }

                if (this.search_lock) {
                    uni.showToast({
                        title: '间隔时间不能超过12小时, 请重新选择',
                        icon: 'none'
                    })
                    this.btn_disable = false;
                    return
                }

                this.show_condition = false;
                this.getCchartData();
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
                this.selected_dist = ''
                this.province_name = e.province.label;
                this.province_value = e.province.value;
                this.city_name = e.city.label;
                this.city_value = e.city.value;
                this.county_name = e.county.label;
                this.county_value = e.county.value;

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
                this.selected_dist = '请选择地区'
            },
            /** 关闭popup 弹框 */
            togglePopup() {
                this.is_show = false
                if (this.county_value) {
                    this.region_code = this.county_value
                } else if (!this.county_value && this.city_value) {
                    this.region_code = this.city_value
                } else if (!this.city_value && this.province_value) {
                    this.region_code = this.province_value
                } else if (!this.province_value && this.select_country_value) {
                    this.region_code = this.select_country_value
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
                    this.is_can_use = true;
                } else {
                    // 选择的不是中国, 设置地区选择不可用
                    this.is_can_use = false;
                }
            },
            /** 选中的整车编号 value */
            selectedVehicleID(value) {
                // 赋值选择的车辆编号value
                this.select_vehicle_id_value = value;
            },
            /** 获取折线图数据 */
            getCchartData() {
                this.showIconBox = false;
                uni.showLoading({
                    title: '请稍后'
                });
                let url = '';
                let select_key = {
                    region_code: this.region_code, // 地区
                    start_time: this.start_date, // 起始日期
                    stop_time: this.stop_date, // 结束日期
                    vehicle_uid: this.select_vehicle_id_value // 车辆,
                };
                if (this.current_value === 10) {
                    url = `${this.api}txncc0101.ajson`;
                } else if (this.current_value === 13) {
                    url = `${this.api}txncc0201.ajson`;
                } else if (this.current_value === 11) {
                    url = `${this.api}txncc0301.ajson`;
                } else if (this.current_value === 12) {
                    url = `${this.api}txncc0302.ajson`;
                } else if (this.current_value === 14) {
                    url = `${this.api}txncc0801.ajson`;
                }
                uni.request({
                    url: url,
                    // #ifdef MP-WEIXIN
                    header: getApp.globalData.header,
                    // #endif
                    data: {
                        select_key: {
                            ...select_key
                        }
                    },
                    method: 'POST',
                    timeout: 90000,
                    dataType: 'json',
                    success: (res) => {
                        this.btn_disable = false;
                        uni.hideLoading();
                        console.log(res.data.record)
                        if (res.data.error_code === '000000') {
                            if (!res.data.record.length) {
                                this.showToast('当前车辆所查询时间段暂无数据');
                                return
                            };
                            let LineB = {
                                categories: [],
                                series: []
                            };
                            let markLine = '';
                            let max = ';'
                            let arr = [];
                            let name = ';'
                            if (this.current_value === 10) {
                                for (let i = 0; i <= res.data.record.length - 1; i++) {
                                    if (i >= 1 && i <= res.data.record.length - 2) {
                                        let j = i - 1;
                                        let t = i + 1;
                                        if (!(res.data.record[i].vehicle_speed === res.data.record[j].vehicle_speed &&
                                                res.data.record[i].vehicle_speed === res.data.record[t].vehicle_speed
                                            )) {
                                            arr.push(res.data.record[i].vehicle_speed);
                                            let xarisTime = res.data.record[i].date_time.slice(8);
                                            let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2,
                                                4) + ':' + xarisTime.slice(4);
                                            LineB.categories.push(editTime);
                                        }
                                    } else {
                                        arr.push(res.data.record[i].vehicle_speed);
                                        let xarisTime = res.data.record[i].date_time.slice(8);
                                        let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2, 4) +
                                            ':' + xarisTime.slice(4);
                                        LineB.categories.push(editTime);
                                    }
                                };
                                name = '速度';
                                markLine = 45;
                                max = 60
                            } else if (this.current_value === 13) {
                                // 发动机转速
                                for (let i = 0; i <= res.data.record.length - 1; i++) {
                                    if (i >= 1 && i <= res.data.record.length - 2) {
                                        let j = i - 1;
                                        let t = i + 1;
                                        if (!(res.data.record[i].engine_rpm === res.data.record[j].engine_rpm &&
                                                res.data.record[i].engine_rpm === res.data.record[t].engine_rpm
                                            )) {
                                            arr.push(res.data.record[i].engine_rpm);
                                            let xarisTime = res.data.record[i].date_time.slice(8);
                                            let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2,
                                                4) + ':' + xarisTime.slice(4);
                                            LineB.categories.push(editTime)
                                        }
                                    } else {
                                        arr.push(res.data.record[i].engine_rpm);
                                        let xarisTime = res.data.record[i].date_time.slice(8);
                                        let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2, 4) +
                                            ':' + xarisTime.slice(4);
                                        LineB.categories.push(editTime);
                                    }
                                }
                                name = '发动机转速';
                                markLine = 1900;
                                max = 3000;
                            } else if (this.current_value === 11) {
                                // 机油液位
                                for (let i = 0; i <= res.data.record.length - 1; i++) {
                                    if (i >= 1 && i <= res.data.record.length - 2) {
                                        let j = i - 1;
                                        let t = i + 1;
                                        if (!(res.data.record[i].engine_oil_level === res.data.record[j].engine_oil_level &&
                                                res.data.record[i].engine_oil_level === res.data.record[t].engine_oil_level
                                            )) {
                                            arr.push(res.data.record[i].engine_oil_level);
                                            let xarisTime = res.data.record[i].date_time.slice(8);
                                            let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2,
                                                4) + ':' + xarisTime.slice(4);
                                            LineB.categories.push(editTime);
                                        }
                                    } else {
                                        arr.push(res.data.record[i].engine_oil_level);
                                        let xarisTime = res.data.record[i].date_time.slice(8);
                                        let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2, 4) +
                                            ':' + xarisTime.slice(4);
                                        LineB.categories.push(editTime);
                                    }
                                };
                                name = '机油液位';
                                markLine = 80;
                                max = 120
                            } else if (this.current_value === 12) {
                                // 机油压力
                                for (let i = 0; i <= res.data.record.length - 1; i++) {
                                    if (i >= 1 && i <= res.data.record.length - 2) {
                                        let j = i - 1;
                                        let t = i + 1;
                                        if (!(res.data.record[i].engine_oil_pressure === res.data.record[j]
                                                .engine_oil_pressure && res.data.record[i].engine_oil_pressure ===
                                                res.data.record[t].engine_oil_pressure)) {
                                            arr.push(res.data.record[i].engine_oil_pressure);
                                            let xarisTime = res.data.record[i].date_time.slice(8);
                                            let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2,
                                                4) + ':' + xarisTime.slice(4);
                                            LineB.categories.push(editTime);
                                        }
                                    } else {
                                        arr.push(res.data.record[i].engine_oil_pressure);
                                        let xarisTime = res.data.record[i].date_time.slice(8);
                                        let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2, 4) +
                                            ':' + xarisTime.slice(4);
                                        LineB.categories.push(editTime);
                                    }
                                };
                                name = '机油压力';
                                markLine = 69;
                                max = 100
                            } else {
                                // 冷却液温度
                                for (let i = 0; i <= res.data.record.length - 1; i++) {
                                    if (i >= 1 && i <= res.data.record.length - 2) {
                                        let j = i - 1;
                                        let t = i + 1;
                                        if (!(res.data.record[i].engine_coolant_temperature === res.data.record[
                                                    j].engine_coolant_temperature && res.data.record[i].engine_coolant_temperature ===
                                                res.data.record[t].engine_coolant_temperature)) {
                                            arr.push(res.data.record[i].engine_coolant_temperature);
                                            let xarisTime = res.data.record[i].date_time.slice(8);
                                            let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2,
                                                4) + ':' + xarisTime.slice(4);
                                            LineB.categories.push(editTime);
                                        }
                                    } else {
                                        arr.push(res.data.record[i].engine_coolant_temperature);
                                        let xarisTime = res.data.record[i].date_time.slice(8);
                                        let editTime = xarisTime.slice(0, 2) + ':' + xarisTime.slice(2, 4) +
                                            ':' + xarisTime.slice(4);
                                        LineB.categories.push(editTime);
                                    }
                                };
                                name = '冷却液温度';
                                markLine = 103;
                                max = 150;
                            }

                            LineB.series.push({
                                name: name,
                                data: [...arr]
                            })

                            this.showLineB("canvasLineB", LineB, markLine, max);

                            let timer = setTimeout(() => {
                                uni.hideLoading();
                                clearTimeout(timer);
                            }, 1000)
                        } else {
                            this.toastRequestErr(res.data);
                            uni.hideLoading();
                        }
                    },
                    fail: () => {
                        this.btn_disable = false;
                        uni.hideLoading();
                        this.toastErr();
                    }
                })
            }
        },
        onBackPress() {
            if (this.show_condition) {
                this.cancelCondition();
                return true
            }
        },
        onLoad(option) {
            this.current_value = Number(option.current_value);
            if (this.current_value === 10) {
                uni.setNavigationBarTitle({
                    title: `车辆分析 - 车速`
                })
            } else if (this.current_value === 13) {
                uni.setNavigationBarTitle({
                    title: `车辆分析 - 发动机转速`
                })
            } else if (this.current_value === 11) {
                uni.setNavigationBarTitle({
                    title: `车辆分析 - 机油液位`
                })
            } else if (this.current_value === 12) {
                uni.setNavigationBarTitle({
                    title: `车辆分析 - 机油压力`
                })
            } else if (this.current_value === 14) {
                uni.setNavigationBarTitle({
                    title: `车辆分析 - 冷却液温度`
                })
            }
        },
    }
</script>

<style lang="less">
    @import '../../../common/uni-nvue.css';
    @import '../../../common/common.css';

    /* 提示窗口 */
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

    /** 折线图 */
    .qiun-charts-rotate {
        width: 680upx;
        height: 1150upx;
        background-color: #FFFFFF;
    }

    .charts-rotate {
        width: 680upx;
        height: 1150upx;
        background-color: #FFFFFF;
    }

    .tstati-container {
        position: relative;
        background: blue;
    }

    // 关闭按钮
    .uni-icon-close {
        position: fixed;
        bottom: 20rpx;
        right: 16rpx;
    }

    .review {
        position: fixed;
        right: 40rpx;
        bottom: 40rpx;
        background: #00a0e8;
        color: #fff;
        box-shadow: 0 0 2rpx 0 #00a0e8;
        font-size: 26rpx;
    }
</style>
