<template>
    <!-- 条件选择弹框 -->
    <uni-popup :show="show_condition" type="center" :custom="true" :mask-click="false">
        <view class="uni-tip">
            <view class="uni-tip-title">
                <view>查询选择</view>
            </view>
            <view style="padding: 20rpx; text-align: center;" class="content">
                <uni-combox label="选择国家:" :placeholder="select_country_name? select_country_name : '请选择国家'" :value="select_country_name"
                    @sendValue="selectedCountry" v-model="select_country_name" codeType="tlt_have_truck_country"
                    :s_id="refs[0]" :ref="refs[0]"></uni-combox>
                <view style="position: static; overflow: hidden; padding: 0;" @click.prevent="isClick" v-show="is_can_use">
                    <uni-combox label="选择地区:" :placeholder="selected_dist" style="float: left; z-index: 0; width: 100%; padding: 30rpx 0;"
                        v-model="selected_dist">
                    </uni-combox>
                </view>
                <uni-combox label="所属组织:" :placeholder="select_oganization_name? select_oganization_name : '请选择所属组织'"
                    :s_id="refs[1]" :value="select_oganization_name" @sendValue="selectedOganization"
                    v-model="select_oganization_name" codeType="tlt_organization" :ref="refs[1]"></uni-combox>            
                <uni-combox label="整车编号:" :placeholder="select_vehicle_id_name? select_vehicle_id_name : '请选择整车编号'"
                    :s_id="refs[2]" :value="select_vehicle_id_name" :region_code="region_code"
                    @sendValue="selectedVehicleID" v-model="select_vehicle_id_name" codeType="tlt_vehicle_in_region"
                    :uid="select_oganization_value" :ref="refs[2]"></uni-combox>
            </view>            
            <view class="uni-tip-group-button" style="margin-top: 30px;">
                <view class="uni-tip-button" @click="cancelButton()">
                    <view class="btn-cancel">
                        取消
                    </view>
                </view>
                <view class="uni-tip-button" @click="confirmButton()">
                    <view class="btn-confirm">
                        确定
                    </view>
                </view>
            </view>
            <uni-popup :show="is_show" type="bottom" mode="fixed" msg="选择收货地址" @hidePopup="togglePopup('')">
                <semp-city @confirmSelect="onCityClick" @cancelSelect="cancelselected_dist"></semp-city>
            </uni-popup>
        </view>
    </uni-popup>
</template>

<script>
    import sempCity from "@/components/semp-city/semp-city/semp-city.vue"
    import uniIcons from '@/components/uni-icons/uni-icons.vue'
    import uniPopup from "@/components/uni-popup/uni-popup.vue"

    export default {
        components: {
            uniIcons,
            sempCity,
            uniPopup
        },
        inject: ['getVehicleList'],
        data() {
            return {
                show_condition: false,
                is_can_use: false,
                // 下拉框绑定 ref属性
                refs: ['combox1', 'combox2', 'combox3'],
                /** 选择国家 选中的代码集name / value */
                select_country_name: '',
                select_country_value: '',
                /** 选择所属组织 选中的代码集的name / value */
                select_oganization_name: '',
                select_oganization_value: '',
                /** 选择整车编号 选中的代码集的name / value */
                select_vehicle_id_name: '',
                select_vehicle_id_value: '',
                /** 选择地区 */
                selected_dist: '请选择地区',
                /** 选择地区 */
                region_code: '',
                province_name: '',
                province_value: '',
                city_name: '',
                city_value: '',
                county_name: '',
                county_value: '',
                is_show: false // 控制选择地区 popup 弹框的显示 / 隐藏
            }
        },
        methods: {
            showPreparatePopup() {
                this.show_condition = true;
                /** 监听 下拉框组件 注册的全局自定义事件 */
                this.$nextTick(() => {
                    uni.$on('comBoxToggle', this.callBack)
                })    
            },
            callBack(data) {
                for(let k in this.$refs) {
                    if (k != data.data) {
                        console.log(this.$refs[k].showSelector)
                        this.$refs[k].showSelector = false
                    }
                }
            },
            isClick(e) {
                if (this.select_country_value && this.select_country_value == '156') {
                    this.is_show = true;
                    uni.hideKeyboard()
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
                // this.townName = e.town.label;
                if (this.province_name) {
                    this.selected_dist = this.province_name
                    this.region_code = this.province_value
                }
                if (this.city_name) {
                    this.selected_dist = this.province_name + '-' + this.city_name
                    this.region_code = this.city_value
                }
                if (this.county_name) {
                    this.selected_dist = this.province_name + '-' + this.city_name + '-' + this.county_name
                     this.region_code = this.county_value
                }
                /** 清空 选择车辆编号依赖的数据 */
                this.select_vehicle_id_name = '';
                this.select_vehicle_id_value = '';
                console.log(this.selected_dist)
                this.togglePopup()
            },
            /** 三级联动 取消按钮 注册的 取消选择事件 */
            cancelselected_dist(e) {
                this.province_name = e.province.label;
                this.province_value = e.province.value;
                this.city_name = e.city.label;
                this.city_value = e.city.value;
                this.county_name = e.county.label;
                this.county_value = e.county.value;
                this.selected_dist = '请选择地区';
                this.togglePopup()
            },
            /** 关闭popup 弹框 */
            togglePopup() {
                this.is_show = false;
            },
            /** 选中的 国家 value */
            selectedCountry(value) {
                console.log(value)
                this.select_country_value = value
                this.region_code = this.select_country_value
                
                /** 清空 选择车辆编号依赖的数据 */
                this.select_vehicle_id_name = '';
                this.select_vehicle_id_value = '';
                if (this.select_country_value && this.select_country_value == '156') {
                    this.is_can_use = true;
                } else {
                    this.is_can_use = false;
                }
            },
            /** 选中的 组织 value */
            selectedOganization(value) {
                console.log(value)
                this.select_oganization_value = value
                
                /** 清空 选择车辆编号依赖的数据 */
                this.select_vehicle_id_name = '';
                this.select_vehicle_id_value = '';
            },
            /** 选中的整车编号 value */
            selectedVehicleID(value) {
                console.log(value)
                this.select_vehicle_id_value = value
            },
            /** 确定按钮 */
            confirmButton() {
                this.$parent.query_param.select_key.region_code = this.county_value || this.city_value || this.province_value || this.select_country_value;
                this.$parent.query_param.select_key.organization_uid = this.select_oganization_value;
                this.$parent.query_param.select_key.uid = this.select_vehicle_id_value;
                
                this.reset();
                this.getVehicleList(this.$parent.attribute_nodeR);
            },
            /** 取消按钮 */
            cancelButton() {
                this.show_condition = false;
                /** 移除监听 下拉框组件 注册的全局自定义事件 */
                uni.$off('comBoxToggle', this.callBack)
            },
            reset() {
                this.selected_dist = ''
                this.province_name = '';
                this.province_value = '';
                this.city_name = '';
                this.city_value = '';
                this.county_name = '';
                this.county_value = '';
                
                /** 清空 选择车辆编号依赖的数据 */
                this.select_vehicle_id_name = '';
                this.select_vehicle_id_value = '';
                /** 组织机构 */
                this.select_oganization_value = '';
                this.select_oganization_name = '';
                /** 国家地区 */
                this.select_country_name = '',
                this.select_country_value = '',
                
                this.is_can_use = false;
                this.show_condition = false;
            }
        }
    }
</script>

<style lang="less">
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
    
            &>view {
                padding: 30rpx 0;
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
</style>
