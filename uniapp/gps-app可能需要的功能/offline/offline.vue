<!-- 蓝牙解锁 业务流程
    1. 判断用户是否启用蓝牙:
        - 未启用, 提示用户启用蓝牙
     
    2. 初始化蓝牙设备
        
    3. 搜索设备
        
    4. 一段时间后, 停止搜索(搜索周围蓝牙设备太耗费性能)
        
    5. 连接蓝牙设备(包括配对)
        
    6. 由于设备端(硬件) 服务uuid是固定的, 找到对应的服务
        
    7. 设备端的特征值也是固定的
            - 0002(支持write 写入数据) 用来向设备端发送数据
                === 向设备端写入数据
                
            - 0003(支持notify 接收通知) 用来接收设备端向手机端的通知消息
                === 接收设备端的通知消息    
-->
<template>
    <view class="uni-container bluetooth-container">
        <view style="" class="list-container">
            <view v-for="(item, index) in deviceList" :key="index" v-if="deviceList.length">
                <view class="list-item">
                    <view class="desc">
                        <view>设备名称：{{ item.name || item.localName }}</view>
                        <!-- <view>信号强度：{{ item.RSSI }}dBm</view> -->
                        <view>UUID：{{ item.deviceId }}</view>
                    </view>

                    <view class="action">
                        <!-- <button type="primary" class="connect-btn" hover-class="hover-style" style="height: 120rpx; line-height: 120rpx;"
                            size="mini" @tap="selectDevice(item, index)" v-if="!isShow[index]" :disabled="(selectedIndex === index && isDisabled)? false : true">
                            连接设备
                        </button> -->
                        <button type="primary" class="connect-btn" hover-class="hover-style" style="height: 120rpx; line-height: 120rpx;"
                            size="mini" @tap="selectDevice(item, index)" v-if="!isShow[index] &&  !isDisabled">
                            连接设备
                        </button>
                        <view>
                            <button type="primary" class="postpone-btn" v-show="isShow[index] && item.is_lock" size="mini"
                                hover-class="hover-style" @tap="getService(item, index, 'lock')">{{item.action === '1'? '锁车': '解锁'}}</button>
                        </view>
                        <view>
                            <button type="primary" class="lock-btn" v-show="isShow[index] && item.is_postpone" size="mini"
                                hover-class="hover-style" @tap="getService(item, index, 'postpone')">延期</button>
                        </view>

                    </view>
                </view>
            </view>
            <view v-if="deviceList.length === 0">暂无设备</view>
        </view>

        <uni-popup :show="bluetoothModal" type="center" :custom="true" :mask-click="false">
            <view class="uni-tip">
                <view class="uni-tip-title">
                    <image src="../../static/tabBar/bluetooth1.png" style="width: 24px; height: 24px;"></image>
                    <view>蓝牙</view>
                </view>
                <view class="uni-tip-content" style="padding: 5px;">蓝牙初始化成功, 是否开始搜索附近的设备？</view>

                <view class="uni-tip-group-button" style="margin-top: 30px;">
                    <view class="uni-tip-button" hover-class="hoverStyle" @click="cancelSearchDevice()">取消</view>
                    <view class="uni-tip-button" hover-class="hoverStyle" @click="confirmSearchDevice()">确定</view>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script>
    // 获取蓝牙原生插件: module
    var module = uni.requireNativePlugin("Tlsk-bluetooth")
    const modal = uni.requireNativePlugin('modal');

    // popup 弹出层
    import uniPopup from "@/components/uni-popup/uni-popup.vue"
    // 图标
    import uniIcons from '@/components/uni-icons/uni-icons.vue'
    // 退出登录模板
    import logout from '@/pages/component/logout/logout.vue'

    // 导入所需要 四个工具对象
    import ByteUtil from '@/common/bluetooth/util/byteUtil.js'
    import CRCUtil from '@/common/bluetooth/util/crcUtil.js'
    import MathUtils from '@/common/bluetooth/util/mathUtil.js'
    import ToolUtils from '@/common/bluetooth/util/toolUtil.js'
    import VoLockPostponeRequest from '@/common/bluetooth/message/v1/vo/voLockPostponeRequest.js'
    import VoLockTheCarRequest from '@/common/bluetooth/message/v1/vo/voLockTheCarRequest.js'
    // V1ConstantsMsgType
    import V1ConstantsMsgType from '@/common/bluetooth/message/v1/v1ConstantsMsgType.js'
    // 导入分析 Analysis
    import Analysis from '@/common/bluetooth/analysis.js'

    // 混入
    import mixin from '@/common/mixin.js'

    export default {
        mixins: [mixin],
        components: {
            uniPopup,
            uniIcons,
            logout
        },
        data() {
            return {
                bluetoothModal: false, // 控制搜索蓝牙modal框的显示/隐藏
                veh_arr: [],
                lock_arr: [],
                writeValue: '', // 写入的数据
                readValue: '', // 接收的通知消息
                equipment: [],
                adapterState: {
                    discovering: false,
                    available: false
                },
                servicesData: [],
                characteristicsData: [],
                valueChangeData: '',
                isStop: true,
                list: [], // 主服务下的所有特征值服务
                deviceList: [], // 设备数组
                selectedIndex: '', // 选择的第几个设备
                selectedItem: '',
                selectedStr: '',
                isDisabled: false, // 解锁按钮是否禁用
                isShow: [], // 是否显示解锁按钮 
                servicesList: [], // 服务数组
                bs: '',
                dev_id: '', // 当前操作的device_id: 设备序号
                index: 0, // 控制特征值的监听事件, 只开启一次
                flag: false
            }
        },
        onNavigationBarButtonTap() {
            if (this.selectedIndex || this.selectedIndex !== '') {
                this.closeBLEConnection(this.selectedIndex)
            }
            this.closeBluetoothAdapter()
            this.index = 0 // 将控制notify监听的 index 重置为0

            this.getStorageBlueToothData()
        },
        onLoad() {
            // 调用监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
            this.onBLEConnectionStateChange();
        },
        onShow() {
            if (this.flag) {
                this.flag = false
                // 说明: 是调用原生插件后 触发的onHide回调, 配对成功, 这时可以直接连接
                // 调用连接蓝牙设备方法
                this.createBLEConnection(this.selectedIndex)
            } else {
                // #ifdef APP-PLUS
                let main = plus.android.runtimeMainActivity();
                let BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
                let BAdapter = BluetoothAdapter.getDefaultAdapter();
                if (!BAdapter.isEnabled()) {
                    BAdapter.enable();
                    this.bluetoothModal = true
                } else {
                    this.getStorageBlueToothData()
                }
                // #endif
            }
        },
        methods: {
            cancelSearchDevice() {
                this.bluetoothModal = false
            },
            confirmSearchDevice() {
                this.bluetoothModal = false
                this.getStorageBlueToothData()
            },

            // 获取缓存中的 蓝牙指令 权限数据
            getStorageBlueToothData() {
                // 获取缓存中 保存的 有蓝牙操作指令权限的设备
                let userName = uni.getStorageSync('username')
                let lock_vehicles = JSON.parse(uni.getStorageSync(userName + 'lock_vehicles')) // 解锁/锁车 蓝牙指令权限
                let postpone_vehicles = JSON.parse(uni.getStorageSync(userName + 'postpone_vehicles')) // 延期锁车 蓝牙指令权限

                let veh_arr = []
                this.lock_arr = []
                if (postpone_vehicles.length || lock_vehicles.length) {
                    if (postpone_vehicles.length) {
                        postpone_vehicles.forEach(item => {
                            item.is_postpone = true
                            item.postpone_token = item.token
                        })
                        this.veh_arr = veh_arr.concat(postpone_vehicles)
                    }

                    if (lock_vehicles.length) {
                        lock_vehicles.forEach((itemC, indexC) => {
                            itemC.is_lock = true
                            itemC.lock_token = itemC.token
                            if (!this.veh_arr.length) {
                                this.lock_arr.push(itemC)
                            } else {
                                let sumi = 0
                                this.veh_arr.forEach((item, index) => {
                                    if (itemC.dev_id !== item.dev_id) {
                                        sumi += 1
                                    } else {
                                        item.is_lock = true // 该设备 存在 锁车/解锁权限
                                        item.lock_token = itemC.token // 锁车token
                                        item.action = itemC.action // 锁车: 1 / 锁车 0
                                        item.lock_date = itemC.lock_date // 锁车日期
                                    }
                                })
                                if (sumi === this.veh_arr.length) {
                                    this.lock_arr.push(itemC)
                                }
                            }
                        })
                    }
                    this.veh_arr.push(...this.lock_arr)
                }
                console.log('888888888888', this.veh_arr)
                this.openBluetoothAdapter()
            },
            deCode(item, str) {
                this.dev_id = item.device_id
                /** 锁车/解锁 */
                if (str === 'lock') {
                    VoLockTheCarRequest.setAction()
                    VoLockTheCarRequest.setLockDate(item.lock_date);
                    VoLockTheCarRequest.setAction(item.action);
                    VoLockTheCarRequest.setLockToken(item.lock_token)
                    VoLockTheCarRequest.myProto.myProto.setDevId(item.device_id)
                    VoLockPostponeRequest.myProto.myProto.setMsgProtocol(2)
                    VoLockPostponeRequest.myProto.myProto.setMsgType(V1ConstantsMsgType.REQ_LOCK_THE_CAR)
                    this.bs = VoLockTheCarRequest.enCode();
                    console.log(this.bs);
                }
                /** 延期锁车 */
                if (str === 'postpone') {
                    VoLockPostponeRequest.setPostponeDate(item.postpone_date);
                    VoLockPostponeRequest.setPostponeToken(item.postpone_token)
                    VoLockPostponeRequest.myProto.myProto.setDevId(item.device_id)
                    VoLockPostponeRequest.myProto.myProto.setMsgProtocol(2)
                    VoLockPostponeRequest.myProto.myProto.setMsgType(V1ConstantsMsgType.REQ_LOCK_POSTPONE)

                    this.bs = VoLockPostponeRequest.enCode();
                    console.log(this.bs);
                }
            },

            /**设备列表上面的 连接按钮:
             *   1. 连接设备
             *   2. 连接成功, 获取第三个服务
             *   3. 获取第三个服务后, 根据读写来分别 使用 第三 第二个特征值
             * */
            selectDevice(item, index) {
                this.index = 0 // 将控制notify监听的 index 重置为0

                if (this.selectedIndex || this.selectedIndex !== '') {
                    this.closeBLEConnection(this.selectedIndex)
                }
                this.selectedIndex = index
                console.log('选择的设备', item, item.deviceId)

                if (this.equipment.length > 0) {
                    this.equipment[0] = item;
                } else {
                    this.equipment.push(item);
                }

                let turn_10 = ''
                if (item.deviceId.includes(':')) {
                    let dev_arr = item.deviceId.split(':')
                    dev_arr.forEach(itemC => {
                        turn_10 += (parseInt(itemC.slice(1), 16) + '').slice(-1)
                    })
                }
                console.log('计算的配对码', turn_10)
                if (!item.isClick) {
                    // 调用原生插件
                    module.connect({
                        'bt_name': item.name || item.localName,
                        'bt_mac': item.deviceId,
                        'bt_pin': turn_10
                    });

                    item.isClick = true
                } else {
                    this.createBLEConnection(this.selectedIndex)
                }
                // 执行了 module.connect() 后 设置一个标识
                this.flag = true
                // this.isDisabled = true
                // setTimeout(() => {
                //     this.isDisabled = false
                // }, 35000)
            },

            /** 选择完设备后, 进行的操作 */
            getService(item, index, str) {
                this.selectedItem = item
                this.selectedStr = str
                this.getBLEDeviceServices(item, index, str)
            },
            tapQuery(itemC, item, index, str) {
                if (this.servicesData.length > 0) {
                    this.servicesData[0] = itemC;
                } else {
                    this.servicesData.push(itemC);
                }

                // 获取该主服务下的所有特征值服务
                this.getBLEDeviceCharacteristics(item, index, str)
            },
            /**
             * 初始化蓝牙设备
             */
            openBluetoothAdapter() {
                uni.openBluetoothAdapter({
                    success: e => {
                        console.log('初始化蓝牙成功:' + e.errMsg);
                        console.log(JSON.stringify(e));
                        this.isStop = false;

                        // 获取本机蓝牙适配器状态
                        this.getBluetoothAdapterState();
                    },
                    fail: e => {
                        console.log(e)
                        console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
                        if (e.errCode !== 0) {
                            initTypes(e.errCode, e.errMsg);
                        }
                    }
                });
            },
            /**
             * 开始搜索蓝牙设备
             */
            startBluetoothDevicesDiscovery() {
                uni.startBluetoothDevicesDiscovery({
                    success: e => {
                        console.log('开始搜索蓝牙设备:' + e.errMsg);
                        uni.showLoading({
                            title: '正在搜索附近可用的设备',
                            mask: true
                        })

                        // 发现外围设备方法
                        this.onBluetoothDeviceFound();
                    },
                    fail: e => {
                        console.log('搜索蓝牙设备失败，错误码：' + e.errCode);
                        if (e.errCode !== 0) {
                            initTypes(e.errCode);
                        }
                    }
                });
            },
            /**
             * 停止搜索蓝牙设备
             */
            stopBluetoothDevicesDiscovery(types) {
                uni.stopBluetoothDevicesDiscovery({
                    success: e => {
                        console.log('停止搜索蓝牙设备:' + e.errMsg);
                        uni.hideLoading()
                    },
                    fail: e => {
                        console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode);
                        if (e.errCode !== 0) {
                            initTypes(e.errCode);
                        }
                    }
                });
            },
            /**
             * 发现外围设备
             */
            onBluetoothDeviceFound() {
                uni.onBluetoothDeviceFound(devices => {
                    // 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备
                    this.getBluetoothDevices();
                });
            },
            /**
             * 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。
             */
            getBluetoothDevices() {
                uni.getBluetoothDevices({
                    success: res => {
                        this.newDeviceLoad = false;
                        // console.log('获取蓝牙设备成功:' + res.errMsg);
                        /** res.devices : 已发现的设备列表数组
                            在这里需要对发现的设备进行过滤处理, 只保留 要操作的设备
                               赋予了权限的 dev_id, 蓝牙mac
                        */
                        this.deviceList = []
                        // console.log(res.devices)
                        res.devices.forEach(item => {
                            this.veh_arr.forEach(itemC => {
                                if (itemC.bt_id === item.deviceId) {
                                    if (itemC.is_lock) {
                                        item.lock_token = itemC.lock_token
                                        item.action = itemC.action
                                        item.is_lock = itemC.is_lock
                                        item.lock_date = itemC.lock_date // 锁车/解锁 蓝牙指令权限的 创建时间
                                    }
                                    if (itemC.is_postpone) {
                                        item.postpone_token = itemC.postpone_token
                                        item.is_postpone = itemC.is_postpone
                                    }
                                    item.device_id = itemC.dev_id
                                    item.postpone_date = itemC.postpone_date
                                    this.deviceList.push(item)
                                }
                            })
                        })

                        this.isShow = []
                        this.deviceList.forEach(item => {
                            this.isShow.push(false)
                        })
                    },
                    fail: e => {
                        console.log('获取蓝牙设备错误，错误码：' + e.errCode);
                        if (e.errCode !== 0) {
                            initTypes(e.errCode);
                        }
                    }
                });
            },
            /**
             * 获取本机蓝牙适配器状态
             */
            getBluetoothAdapterState() {
                uni.getBluetoothAdapterState({
                    success: res => {
                        console.log(JSON.stringify(res));
                        this.adapterState = res;
                        // 判断蓝牙适配器是否可用, 如果可用, 调用搜索设备方法
                        if (res.available) {
                            this.startBluetoothDevicesDiscovery()

                            // 调用停止搜索方法
                            let timer = setTimeout(() => {
                                this.stopBluetoothDevicesDiscovery()
                                timer = null
                            }, 8000)

                        } else {
                            // 如果不可用, 调用初始化蓝牙方法(发现外围设备)
                        }
                    },
                    fail: e => {
                        console.log('获取本机蓝牙适配器状态失败，错误码：' + e.errCode);
                        if (e.errCode !== 0) {
                            initTypes(e.errCode);
                        }
                    }
                });
            },
            /**
             * 连接低功耗蓝牙
             */
            createBLEConnection(index) {
                // this.deviceList[index].disabled = true
                let deviceId = this.equipment[0].deviceId;

                uni.createBLEConnection({
                    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                    deviceId,
                    success: res => {
                        console.log(res);
                        console.log('连接蓝牙成功:' + res.errMsg);

                            // 获取服务等相关操作, 那么应该显示解锁按钮
                            this.$set(this.isShow, index, true)
                            this.isShow.forEach((itemC, indexC) => {
                                if (indexC !== index) {
                                    this.$set(this.isShow, indexC, false)
                                }
                            })
                    },
                    fail: e => {
                        console.log('连接低功耗蓝牙失败，错误码：' + e.errCode);
                        if (e.errCode !== 0) {
                            initTypes(e.errCode);
                        }
                    }
                });
            },
            /**
             * 断开与低功耗蓝牙设备的连接
             */
            closeBLEConnection(index) {
                // this.deviceList[index].disabled = false
                let deviceId = this.equipment[0].deviceId;
                uni.closeBLEConnection({
                    deviceId,
                    success: res => {
                        console.log(res);
                        console.log('断开低功耗蓝牙成功:' + res.errMsg);
                        this.$set(this.isShow, index, false)

                        // this.deviceList = []
                        // this.equipment = [];
                        this.servicesData = [];
                        this.characteristicsData = [];
                    },
                    fail: e => {
                        console.log('断开低功耗蓝牙成功，错误码：' + e.errCode);
                        if (e.errCode !== 0) {
                            initTypes(e.errCode);
                        }
                    }
                });
            },
            /**
             * 获取所有服务
             */
            getBLEDeviceServices(item, index, str) {
                let deviceId = this.equipment[0].deviceId;
                console.log('获取所有服务的 uuid:' + deviceId);

                uni.getBLEDeviceServices({
                    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                    deviceId,
                    success: res => {
                        console.log(JSON.stringify(res.services));
                        console.log('获取设备服务成功:' + res.errMsg);

                        this.servicesList = res.services;

                        this.characteristicsData = [];
                        if (this.servicesList.length <= 0) {
                            this.showToast('获取服务失败，请重试!');
                            return;
                        }

                        // 选择 uuid: 6E400001 的服务
                        res.services.forEach(itemC => {
                            if (itemC.uuid.includes('6E400001')) {
                                // 主动触发 点击事件
                                this.tapQuery(itemC, item, index, str)
                            }
                        })
                    },
                    fail: e => {
                        console.log('获取设备服务失败，错误码：' + e.errCode);
                        if (e.errCode !== 0) {
                            initTypes(e.errCode);
                        }
                    }
                });
            },
            /**
             * 获取某个服务下的所有特征值
             */
            getBLEDeviceCharacteristics(item, index, str) {
                let deviceId = this.equipment[0].deviceId;
                let serviceId = this.servicesData[0].uuid;
                console.log(deviceId);
                console.log(serviceId);
                uni.getBLEDeviceCharacteristics({
                    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                    deviceId,
                    // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
                    serviceId,
                    success: res => {
                        console.log(JSON.stringify(res));
                        console.log('获取特征值成功:' + res.errMsg, res.characteristics);

                        this.valueChangeData = {};
                        this.list = res.characteristics;
                        if (this.list.length <= 0) {
                            this.showToast('获取特征值失败，请重试!');
                            return;
                        } else {
                            this.list.forEach(itemC => {
                                if (itemC.uuid.includes('6E400002')) {
                                    this.writeBuffer(itemC.uuid, item, index, str)
                                }
                            })
                            if (!this.index) {
                                this.notifyBLECharacteristicValueChange();
                            }
                        }
                    },
                    fail: e => {
                        console.log('获取特征值失败，错误码：' + e.errCode);
                        if (e.errCode !== 0) {
                            initTypes(e.errCode);
                        }
                    }
                });
            },
            /**
             * 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
             */
            onBLEConnectionStateChange() {
                uni.onBLEConnectionStateChange(res => {
                    // 该方法回调中可以用于处理连接意外断开等异常情况
                    console.log(JSON.stringify(res));
                    if (!res.connected) {
                        this.$set(this.isShow, this.selectedIndex, false)
                        if (this.isStop) return;
                        // this.deviceList = []
                        // this.equipment = [];
                        this.servicesData = [];
                        this.characteristicsData = [];
                        this.valueChangeData = {};
                    } else {
                        // 说明连接成功
                        // 
                    }
                });
            },
            /**
             * 监听低功耗蓝牙设备的特征值变化事件。必须先启用 notifyBLECharacteristicValueChange 接口才能接收到设备推送的 notification。
             */
            onBLECharacteristicValueChange() {
                // 必须在这里的回调才能获取
                uni.onBLECharacteristicValueChange((characteristic) => {
                    console.log('监听低功耗蓝牙设备的特征值变化事件成功');
                    console.log(JSON.stringify(characteristic.characteristicId));
                    // characteristic.characteristicId 蓝牙特征值的uuid
                    if (characteristic.characteristicId.includes('6E400003')) {

                        // Analysis.decode() 分析 蓝牙发出的通知消息(通知报文), 查看是否为 成功接收下发到蓝牙指令的 响应通知报文
                        // 例如: 如果我发送的是解锁指令, 那么, 蓝牙接收到解锁指令后, 会返回一个成功接收到解锁指令的通知
                        // -- 判断蓝牙发出的通知消息: 是否为 成功接收到蓝牙解锁指令的 通知消息(响应报文), 是app端进行提示
                        // 如果不是, 那么app端继续发送解锁指令(例如: 隔几秒发送一次, 直到蓝牙响应 成功接收该指令的报文)
                        let crc_result = Analysis.deCode(characteristic.value)

                        function ab2hex(buffer) {
                            const hexArr = Array.prototype.map.call(
                                new Uint8Array(buffer),
                                function(bit) {
                                    return ('00' + bit.toString(16)).slice(-2)
                                }
                            )
                            return hexArr.join('')
                        }
                        console.log('读取的数据', ab2hex(characteristic.value))
                        this.valueChangeData = ab2hex(characteristic.value)
                        this.servicesData = []

                        if (crc_result) {
                            let type = ''
                            let text = ''
                            if (this.selectedStr === 'lock') {
                                type = 1
                            
                                if (this.selectedItem.action === '1') {
                                    text = '锁车'
                                } else if (this.selectedItem.action === '2') {
                                    text = '解锁'
                                }
                            } else if (this.selectedStr === 'postpone') {
                                type = 2
                                text = '延期'
                            }
                            this.showToast(`${text}成功`)

                            uni.getNetworkType({
                                success: (res) => {
                                    /** 如果当前网络状态为 无网络: */
                                    if (res.networkType == 'none') {
                                        // 将蓝牙指令执行成功信息保存起来
                                        let bluetoothInfo = {
                                            type: type,
                                            dev_id: this.dev_id,
                                            notify: false
                                        }
                                        let userName = uni.getStorageSync('username')
                                        if (uni.getStorageSync(userName + 'bluetoothInfo')) {
                                            let bluetoothInfo_list = JSON.parse(uni.getStorageSync(
                                                userName + 'bluetoothInfo'))
                                            let flag = false;
                                            bluetoothInfo_list.forEach((item, index) => {
                                                if (item.dev_id === bluetoothInfo.dev_id &&
                                                    item.type === bluetoothInfo.type) {
                                                    flag = true
                                                }
                                            })
                                            if (!flag) {
                                                bluetoothInfo_list.push(bluetoothInfo)
                                            }
                                            uni.setStorageSync(userName + 'bluetoothInfo', JSON.stringify(bluetoothInfo_list))
                                        } else {
                                            // 避免没有设置过缓存, 导致缓存获取时 使用 JSON.parse() 转换报错
                                            let bluetoothInfo_list = []
                                            bluetoothInfo_list.push(bluetoothInfo)
                                            uni.setStorageSync(userName + 'bluetoothInfo', JSON.stringify(bluetoothInfo_list))
                                        }

                                        console.log('已经设置的缓存', uni.getStorageSync(userName + 'bluetoothInfo'))
                                        return
                                    } 
                                }
                            })
                        }
                    }
                });
            },
            /**
             * 订阅操作成功后需要设备主动更新特征值的 value，才会触发 uni.onBLECharacteristicValueChange 回调。
             */
            notifyBLECharacteristicValueChange() {
                let deviceId = this.equipment[0].deviceId;
                let serviceId = this.servicesData[0].uuid;
                let characteristicId = '';
                let notify = '';
                this.list.forEach(item => {
                    // 说明是支持 notify 的特征值服务
                    if (item.uuid.includes('6E400003')) {
                        characteristicId = item.uuid;
                        notify = item.properties.notify;
                    }
                })

                uni.notifyBLECharacteristicValueChange({
                    state: true, // 启用 notify 功能
                    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                    deviceId,
                    // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
                    serviceId,
                    // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
                    characteristicId,
                    success: (res) => {
                        console.log('notifyBLECharacteristicValueChange success:' + res.errMsg);
                        console.log(JSON.stringify(res));
                        this.index = 1
                        this.onBLECharacteristicValueChange();
                    }
                });
            },
            /**
             * 	断开蓝牙模块
             */
            closeBluetoothAdapter(OBJECT) {
                uni.closeBluetoothAdapter({
                    success: res => {
                        console.log('断开蓝牙模块成功');
                        this.isStop = true;

                        this.deviceList = []
                        // this.equipment = [];
                        this.servicesData = [];
                        this.characteristicsData = [];
                        this.valueChangeData = {};
                        this.adapterState = [];
                    }
                });
            },

            /**  写入数据时: 首先从 list: 所有的特征值服务中找到 6E400002 的特征值服务, 支持写入的特征值服务 */
            writeBuffer(uuid, item, index, str) {
                // 说明是支持写入的特征值服务
                let deviceId = this.equipment[0].deviceId;
                let serviceId = this.servicesData[0].uuid;
                let characteristicId = uuid;

                this.deCode(item, str)
                uni.writeBLECharacteristicValue({
                    // 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                    deviceId,
                    // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
                    serviceId,
                    // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
                    characteristicId,
                    // 这里的value是ArrayBuffer类型
                    value: this.bs,
                    success: (res) => {
                        console.log('writeBLECharacteristicValue success', res.errMsg)
                        this.bs = ''
                    }
                })
            }
        }
    };

    /**
     * 判断初始化蓝牙状态
     */
    function initTypes(code, errMsg) {
        switch (code) {
            case 10000:
                toast('未初始化蓝牙适配器');
                break;
            case 10001:
                toast('未检测到蓝牙，请打开蓝牙重试！');
                break;
            case 10002:
                toast('没有找到指定设备');
                break;
            case 10003:
                toast('连接失败');
                break;
            case 10004:
                toast('没有找到指定服务, 请重试');
                break;
            case 10005:
                toast('没有找到指定特征值');
                break;
            case 10006:
                toast('当前连接已断开');
                break;
            case 10007:
                toast('当前特征值不支持此操作');
                break;
            case 10008:
                toast('其余所有系统上报的异常');
                break;
            case 10009:
                toast('Android 系统特有，系统版本低于 4.3 不支持 BLE');
                break;
            default:
                toast(errMsg);
        }
    }
    /**
     * 弹出框封装
     */
    function toast(content, showCancel = false) {
        uni.showModal({
            title: '提示',
            content,
            showCancel
        });
    }
</script>

<style lang="less">
    @import '~@/common/uni-nvue.css';

    .bluetooth-container {
        background: #f7f7f7;
        padding: 30rpx;

        .list-container {
            margin-top: 30rpx;
            padding: 0 10rpx 10rpx 10rpx;
            box-sizing: border-box;

            .list-item {
                padding: 20rpx;
                background: #fff;
                display: flex;
                font-size: 28rpx;
                margin-top: 20rpx;
                border-radius: 20rpx;

                .desc {
                    flex: 3;
                    display: flex;
                    flex-direction: column;

                    view {
                        flex: 1;
                        line-height: 60rpx;
                    }
                }

                .action {
                    flex: 2;
                    display: flex;

                    view {
                        flex: 1
                    }

                    button {
                        margin-left: 20rpx;
                        background: #fff;
                        float: right;

                        &.connect-btn {
                            color: #23a234;
                        }

                        &.postpone-btn {
                            color: #23a234;
                        }

                        &.lock-btn {
                            color: #fa0014;
                        }
                    }

                    uni-button:after {
                        border: none;
                    }
                }
            }
        }

        /* 提示窗口 */
        .uni-tip {
            padding: 30rpx;
            width: 600rpx;
            background: #fff;
            box-sizing: border-box;
            border-radius: 20rpx;

            .uni-tip-title {
                text-align: center;
                font-weight: bold;
                font-size: 32rpx;
                color: #333;
            }

            .uni-tip-content {
                padding: 30rpx;
                font-size: 28rpx;
                color: #666;
                text-align: center;
            }

            .uni-tip-group-button {
                margin-top: 20rpx;
                display: flex;

                .uni-tip-button {
                    width: 100%;
                    text-align: center;
                    font-size: 28rpx;
                    color: #3b4144;
                    font-weight: 600;
                }

                view:nth-child(2) {
                    color: #dc1110;
                }
            }
        }
    }
</style>
