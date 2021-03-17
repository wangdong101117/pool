<script>
    // 混入
    import mixin from '@/common/mixin.js'
    export default {
        globalData: {  
            // addcode_get_flag: false,
            // addcode_get_count: 0
            header:{
                // 'content-type': 'application/x-www-form-urlencoded',
                'Cookie': ''
            },
            // #ifdef MP-WEIXIN
            // header:{
            //     // 'content-type': 'application/x-www-form-urlencoded',
            //     'Cookie': ''
            // },
            // #endif
        },
        data() {
            return {}
        },
        mixins: [mixin],
        methods: {
            getBleInfo() {
                uni.request({
                    url: `${this.api}txnabt101.ajson`,
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
                            // 提前配置好用于保存蓝牙信息的本地存储字段
                            uni.setStorageSync(userName + 'lock_vehicles', JSON.stringify(lock_vehicles))
                            uni.setStorageSync(userName + 'postpone_vehicles', JSON.stringify(postpone_vehicles))
            
                        } else {
                            this.toastRequestErr(res.data)
                        }
                    },
                    fail: () => {
                        this.toastErr()
                    }
                })
            },
            update_bluetooth_Info() {
                // 判断保存在本地的执行成功的蓝牙指令有无数据
                let userName = uni.getStorageSync('username')
                let bluetoothInfo_list = ''
                if (uni.getStorageSync(userName + 'bluetoothInfo')) {
                    bluetoothInfo_list = JSON.parse(uni.getStorageSync(userName + 'bluetoothInfo'))
                    
                    let not_notify_info_list = []
                    
                    bluetoothInfo_list.forEach((item, index) => {
                        if (!item.notify) {
                            not_notify_info_list.push(item)
                        }
                    })
                    
                    console.log('-----------------', not_notify_info_list)
                    if (not_notify_info_list.length) {
                        not_notify_info_list.forEach((item, index) => {
                            // 向服务端发送蓝牙指令执行成功
                            uni.request({
                                url: `${this.api}txnabt102.ajson`,
                                data: {
                                    input: {
                                        dev_id: item.dev_id,
                                        type: item.type
                                    }	
                                },
                                method: 'POST',
                                dataType: 'json',
                                success: (res) => {
                                    console.log('向服务端发送蓝牙指令执行成功', res.data)
                                    if (res.data.error_code === '000000') {
                                        bluetoothInfo_list.forEach((itemC, indeC) => {
                                            if (item.dev_id === itemC.dev_id && item.type === itemC.type) {
                                                itemC.notify = true // 设置该条消息为通知状态
                                            }
                                        })
                                    }
                                    
                                    uni.setStorageSync(userName + 'bluetoothInfo', JSON.stringify([]))
                                },
                                fail: () => {}
                            })
                        })
                    } else {
                        uni.setStorageSync(userName + 'bluetoothInfo', JSON.stringify([]))
                    }
                    
                    this.getBleInfo()
                }
            }
        },
        onLaunch() {
            console.log('App Launch')
        },
        onLoad() {
            uni.removeStorageSync()
        },
        onShow() {
            console.log('App Show')
            // uni.getNetworkType({
            //     success: (res) => {
            //         if (res.networkType != 'none') {
            //             // 更新 蓝牙操作指令 到服务端
            //             this.update_bluetooth_Info()
            //         } 
            //     }
            // })
            uni.onNetworkStatusChange((res) => {
                let userName = uni.getStorageSync('username')
                if (res.networkType != 'none') {
                    // 说明是从无网络连接状态到有其他网络连接状态
                    if(uni.getStorageSync(userName + 'networkStatus:none')) {
                        uni.setStorageSync(userName + 'networkStatus:none', false)
                        // 更新 蓝牙操作指令 到服务端
                        this.update_bluetooth_Info()
                    }
                } else {
                    uni.setStorageSync(userName + 'networkStatus:none', true)
                }
            })
        },
        onHide() {
            console.log('App Hide')
            // uni.showToast({
            //     title: 'GPS应用已切换至后台运行',
            //     position: 'bottom',
            //     icon: 'none'
            // })
        }
    }
</script>

<style>
    /*每个页面公共css */
    .uni-container {
        min-height: 100%;
        height: 100%;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }
    
    .hoverStyle {
        opacity: 0.5;
    }
    
    uni-button:after {
        border: none;
    }
</style>
