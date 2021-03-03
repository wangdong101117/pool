const mixin = {
    data() {
        return {
            api: "http://pengxiang.tlsk.com.cn/",
            // api: "http://test.gps.tlsk.com.cn/",
            // api: "http://192.168.114.136:7082/",
            // api: "/api/",
            /* 经纬度 */
            // currentLon: '',
            // currentLat: ''
            my_platform: '', // 平台: ios还是android
            distCodeDatas: [], // 保存 含有车辆的 省市县
            /** 分页参数 */
            attribute_node: {
                record_start_row: 1, // 从第几条开始
                record_page_row: 10, // 每页条数
                record_record_number: 0, // 数据总数
                sortColumn: ''
            },
        }
    },
    methods: {
        showToast(title) {
            uni.showToast({
                title: title,
                icon: 'none'
            })
        },
        toastRequestErr(data) {
            let code = data['error_code'];
            let desc = data['error_desc'];
            if (code === undefined) {
                if (typeof(data) === 'string' && data.includes('error_code')) {
                    let s_data = data.split('==>')[0];
                    let errorData = JSON.parse(s_data.concat('"}'));
                    uni.showToast({
                        title: errorData['error_desc'],
                        position: 'bottom',
                        icon: 'none'
                    })
                }
            } else {
                uni.showToast({
                    title: desc,
                    position: 'bottom',
                    icon: 'none'
                })
                if (code === 'AUTH02' || code === 'SSO001') {
                    uni.clearStorageSync();
                    uni.redirectTo({
                        url: '/pages/login/login'
                    })
                }
            }
        },
        toastErr() {
            uni.showToast({
                title: '网络故障, 请稍后尝试',
                icon: 'none',
                position: 'bottom'
            })
        },
        callBack(data) {
            for (let k in this.$refs) {
                if (k != data.data) {
                    console.log(this.$refs[k].showSelector)
                    this.$refs[k].showSelector = false
                }
            }
        },
        addEventListenerComBoxToggle() {
            this.$nextTick(() => {
                uni.$on('comBoxToggle', this.callBack)
            })
        },
        removeEventListenerComBoxToggle() {
            uni.$off('comBoxToggle', this.callBack);
        }
    }
}
export default mixin
