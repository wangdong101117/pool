/* https://blog.csdn.net/qq_33430445/article/details/106349858?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-5.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-5.control
    - vue-element-admin中可导出多级表头: https://blog.csdn.net/xingchen678/article/details/102686621?utm_medium=distribute.wap_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.wap_blog_relevant_pic&depth_1-utm_source=distribute.wap_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-3.wap_blog_relevant_pic   
    -- 如果需要修改样式: 参考: https://www.cnblogs.com/yinxingen/p/11052184.html  

    1. 安装 xlsx
		npm install --save xlsx file-saver

	2. 使用两个文件:
		- Blob.js
		- Export2Excel.js

	3. vue中使用:
        	 // myExport() {
            //     // 懒加载，@/common/vendor/Export2Excel 此路径为本地路径
            //     import('@/libs/Export2Excel').then((excel) => {
            //          const multiHeader = [
            //             [
            //                 '材料入库单', '', '', '', '', '', '', '', '', ''
            //             ],
            //         ];
            //         const multiHeader2 = [
            //             [
            //                 'No:SCCG_20210201_002', '', '', '', '', '', '', '', '', ''
            //             ],
            //         ];
            //         const multiHeader3 = [
            //             [
            //                 '123456789556565', '', '', '', '', '', '', '', '', ''
            //             ],
            //         ];
            //         const tHeader = [
            //             '采购单编号', '供应商名称', '材料名称', '规格', '采购数量', '采购单价', '金额', '入库数量', '入库单价', '金额',
            //         ];
            //         const filterVal = [];// 表头所对应的字段，这里未填写
            //         // const filterVal = ['NAME', 'VESSEL_LENGTH', 'CARGO_NAME', 'DEADWEIGHT_TONNAGE', 'NET_TONNAGE', 'ANCHORAGE_ID', 'EXP_ARCHORAGE_TIME', 'AC_ARCHORAGE_TIME', 'RECOMMEND_BERTH']
            //         // const data = this.marketing.list.map(v => filterVal.map(j => v[j]));
            //         const data = this.tableData.map(v => filterVal.map(j => v[j]));
            //         // 进行所有表头的单元格合并
            //         const merges = [
            //             'A1:J1', 'A2:J2', 'A3:J3',
            //         ];

            //         excel.export_json_to_excel({
            //             multiHeader, // 这里是第一行的表头
            //             multiHeader2, // 这里是第二行的表头
            //             multiHeader3,
            //             header: tHeader, // 这里是第三行的表头
            //             data,
            //             filename: '采购',
            //             merges,
            //         });
            //     });
            // },
*/
	