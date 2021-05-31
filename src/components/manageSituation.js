import React from 'react';
import { Form, Button, Col, Row, InputGroup, FormControl, Modal } from 'react-bootstrap';
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker"
import * as publicUtils from './utils/publicUtils.js';
import '../asserts/css/style.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faEnvelope, faIdCard, faListOl, faBuilding, faDownload, faBook } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import TableSelect from './TableSelect';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MyToast from './myToast';
import ErrorsMessageToast from './errorsMessageToast';
import SalesContent from './salesContent';
import store from './redux/store';
axios.defaults.withCredentials = true;
/**
 * 営業状況画面
 */
class manageSituation extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initialState;// 初期化
	}

	// 初期化
	initialState = {
		serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
		rowNo: '',// 明細番号
		employeeNo: '',// 社員NO
		yearMonth: new Date(new Date().getFullYear() + '/' + (new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 2) : (new Date().getMonth() + 2))).getTime(),
		interviewDate1Show: '',　// 面接1日付
		interviewDate1: '',　// 面接1日付
		interviewDate2Show: '',　// 面接1日付
		interviewDate2: '',　// 面接2日付
		stationCode1: '',　// 面接1場所
		stationCode2: '',　// 面接2場所
		interviewCustomer1: '',　// 面接1客様
		interviewCustomer2: '',　// 面接2客様
		hopeLowestPrice: '',　// 希望単価min
		hopeHighestPrice: '',　// 希望単価max
		remark1: '',　// 備考
		remark2: '',　// 備考
		salesSituationLists: [],// 明細
		readFlag: true,// readonlyflag
		style: {
			"backgroundColor": ""
		},// 単価エラー色
		allEmpNo:[],
		allEmpNoName: [],
		allresumeInfo: [],
		allresumeInfo1: [],
		allresumeInfo2: [],
		sendLetterFalg:true,
		salesProgressCodes: store.getState().dropDown[16],// ステータス
		allCustomer: store.getState().dropDown[15],// お客様レコード用
		editFlag: false,// 確定客様編集flag
		priceEditFlag: false,// 確定単価編集flag
		updateBtnflag: false,// レコード選択flag
		salesYearAndMonth: '',
		salesPriorityStatus: '',// 優先度
		regexp: /^[0-9\b]+$/,// 数字正則式
		salesStaff: '',// 営業担当
		salesPriorityStatuss: store.getState().dropDown[41],// 全部ステータス
		salesPersons: store.getState().dropDown[56],// 全部営業
		customers: store.getState().dropDown[15],// 全部お客様 画面入力用
		getstations: store.getState().dropDown[14], // 全部場所
		totalPersons: '',// 合計人数
		decidedPersons: '',// 確定人数
		linkDisableFlag: true,// linkDisableFlag
		checkSelect: true,
		admissionStartDate: '', // record開始時間
		customerNo: '', // 該当レコードおきゃくNO
		unitPrice: '', // 該当レコード単価
		resumeInfo1: '',　// 履歴情報１
		resumeInfo2: '',　// 履歴情報２
		resumeName1: '',　// 履歴情報１
		resumeName2: '',　// 履歴情報２
		myToastShow: false,// 状態ダイアログ
		myDirectoryShow: false,// 状態ダイアログ
		errorsMessageShow: false,// ERRダイアログ
		errorsMessageValue: '',// ERRメッセージ
		customerContracts: store.getState().dropDown[24],
		customerContractStatus: '',
		modeSelect: 'checkbox',
		selectetRowIds: [],
		onSelectFlag: true,
		checkFlag: false,
		checkDisabledFlag: false,
		daiologShowFlag: false,
		isSelectedAll:false,
		makeDirectoryFalg :true,
	};

	// 初期表示のレコードを取る
	componentDidMount() {
		this.getLoginUserInfo();
		// let sysYearMonth = new Date();
		// let searchYearMonth = sysYearMonth.getFullYear() +
		// (sysYearMonth.getMonth() + 1 < 10 ? '0' + (sysYearMonth.getMonth() +
		// 2) : (sysYearMonth.getMonth() + 2));
		if (this.props.location.state !== null && this.props.location.state !== undefined && this.props.location.state !== '') {
			this.getSalesSituation(this.props.location.state.sendValue.salesYearAndMonth);
			axios.post(this.state.serverIP + "salesSituation/checkDirectory", {salesYearAndMonth:this.props.location.state.sendValue.salesYearAndMonth})
			.then(response => {
				if(response.data){
					this.setState({
						makeDirectoryFalg: true,
					});
				}
				else{
					this.setState({
						makeDirectoryFalg: false,
					});
				}
			}).catch((error) => {
				console.error("Error - " + error);
			});
			this.setState({
				salesYearAndMonth: this.props.location.state.sendValue.salesYearAndMonth,
				yearMonth:publicUtils.converToLocalTime(this.props.location.state.sendValue.salesYearAndMonth,false),
			});
		}else{
			this.getSalesSituation(this.getNextMonth(new Date(), 1));
			axios.post(this.state.serverIP + "salesSituation/checkDirectory", {salesYearAndMonth:this.getNextMonth(new Date(), 1)})
			.then(response => {
				if(response.data){
					this.setState({
						makeDirectoryFalg: true,
					});
				}
				else{
					this.setState({
						makeDirectoryFalg: false,
					});
				}
			}).catch((error) => {
				console.error("Error - " + error);
			});
			this.setState({
				salesYearAndMonth: this.getNextMonth(new Date(), 1),
			});
		}
	}
	
	getLoginUserInfo = () => {
		axios.post(this.state.serverIP + "sendLettersConfirm/getLoginUserInfo")
		.then(result => {
			this.setState({
				authorityCode: result.data[0].authorityCode,
			})
		})
		.catch(function(error) {
			alert(error);
		});	
	}

	getNextMonth = (date, addMonths) => {
		// var dd = new Date();
		var m = date.getMonth() + 1;
		var y = date.getMonth() + 1 + addMonths > 12 ? (date.getFullYear() + 1) : date.getFullYear();
		if (m + addMonths == 0) {
			y = y - 1;
			m = 12;
		} else {
			if (m + addMonths > 12) {
				m = '01';
			} else {
				m = m + 1 <= 10 ? '0' + (m + addMonths) : (m + addMonths);
			}
		}
		return y + "" + m;
	}

	// レコードを取る
	getSalesSituation = (searchYearMonth) => {
		axios.post(this.state.serverIP + "salesSituation/getSalesSituationNew", { salesYearAndMonth: searchYearMonth })
			.then(result => {
				if (result.data != null) {
					this.refs.table.setState({
						selectedRowKeys: []
					});
					let empNoArray = new Array();
					let empNoNameArray = new Array();
					let resumeInfo1Array = new Array();
					let resumeInfo2Array = new Array();
					let resumeInfoArray = new Array();
					for (let i in result.data) {
						empNoArray.push(result.data[i].employeeNo);
						empNoNameArray.push(result.data[i].employeeNo + "_" + result.data[i].employeeName);
						resumeInfo1Array.push(result.data[i].resumeInfo1);
						resumeInfo2Array.push(result.data[i].resumeInfo2);
						resumeInfoArray.push(result.data[i].resumeInfo1);
						resumeInfoArray.push(result.data[i].resumeInfo2);
					}
					var totalPersons = result.data.length;
					this.setState({
						checkDisabledFlag: totalPersons === 0 ? true : false,
					});
					var decidedPersons = 0;
					if (totalPersons !== 0) {
						for (var i = 0; i < result.data.length; i++) {
							if (result.data[i].salesProgressCode === '4') {
								decidedPersons = decidedPersons + 1;
							}
						}
					}
					this.refs.table.store.selected = [];
					this.refs.table.setState({
						selectedRowKeys: []
					});
					this.setState({
						selectetRowIds: [],
						modeSelect: 'checkbox',
						checkSelect: true,
						onSelectFlag: true,
						checkFlag: false,
						salesSituationLists: result.data,
						interviewDate1Show: '',　// 面接1日付
						interviewDate1: '',　// 面接1日付
						interviewDate2Show: '',　// 面接1日付
						interviewDate2: '',　// 面接2日付
						stationCode1: '',　// 面接1場所
						stationCode2: '',　// 面接2場所
						interviewCustomer1: '',　// 面接1客様
						interviewCustomer2: '',　// 面接2客様
						hopeLowestPrice: '',　// 希望単価min
						hopeHighestPrice: '',　// 希望単価max
						remark1: '',　// 備考
						remark2: '',　// 備考
						salesPriorityStatus: '',
						style: {
							"backgroundColor": ""
						},
						readFlag: true,
						updateBtnflag: false,
						linkDisableFlag: true,// linkDisableFlag
						sendLetterFalg:true,
						totalPersons: totalPersons,// 合計人数
						decidedPersons: decidedPersons,// 確定人数
						errorsMessageShow: false,
						errorsMessageValue: '',
						allEmpNo: empNoArray,
						allEmpNoName: empNoNameArray,
						allresumeInfo1: resumeInfo1Array,
						allresumeInfo2: resumeInfo2Array,
						allresumeInfo: resumeInfoArray,
					},()=>{
						if (this.props.location.state !== null && this.props.location.state !== undefined && this.props.location.state !== '') {
/*
 * this.refs.table.setState({ selectedRowKeys:
 * this.props.location.state.sendValue.selectetRowIds, });
 */
							this.setState({
/*
 * linkDisableFlag: this.props.location.state.sendValue.linkDisableFlag,
 * sendLetterFalg: this.props.location.state.sendValue.sendLetterFalg,
 */
								linkDisableFlag: true,
								sendLetterFalg: true,
							})
						}
					});
				} else {
					alert("FAIL");
				}
			})
			.catch(function (error) {
				// alert("ERR");
			});
	}

	// レコードのステータス
	formatType = (cell) => {
		var statuss = this.state.salesProgressCodes;
		for (var i in statuss) {
			if (cell === statuss[i].code) {
				return statuss[i].name;
			}
		}
	}

	// 契約区分
	formatcustomerContract = (cell) => {
		var customerContracts = this.state.customerContracts;
		for (var i in customerContracts) {
			if (cell === customerContracts[i].code) {
				return customerContracts[i].name;
			}
		}
	}

	// レコードおきゃく表示
	formatCustome = (cell) => {
		var allCustomers = this.state.allCustomer;
		if (cell === '') {
			return '';
		} else {
			for (var i in allCustomers) {
				if (cell === allCustomers[i].code) {
					return allCustomers[i].name;
				}
			}
		}
	}

	// 明細選択したCustomerNoを設定する
	getCustomerNo = (no) => {
		this.state.salesSituationLists[this.state.rowNo - 1].customer = no;
		this.formatCustome(no);
		this.afterSaveCell(this.state.salesSituationLists[this.state.rowNo - 1]);
	}

	// 明細選択したSalesProgressCodeを設定する
	getSalesProgressCode = (no) => {
		this.state.salesSituationLists[this.state.rowNo - 1].salesProgressCode = no;
		if (!(no === '4' || no === '5')) {
			this.state.salesSituationLists[this.state.rowNo - 1].customer = '';
			this.formatCustome(no);
		}
		if (no === '5') {
			this.state.salesSituationLists[this.state.rowNo - 1].customer =
				this.state.salesSituationLists[this.state.rowNo - 1].nowCustomer;
		}
		this.formatType(no);
		
		// データが変更する時、ajaxを呼び出す
// this.changeDataStatus(this.state.salesSituationLists[this.state.rowNo - 1]);
	}

	// 明細選択したSalesStaffを設定する
	getSalesStaff = (no) => {
		this.state.salesSituationLists[this.state.rowNo - 1].salesStaff = no;
		this.formatStaff(no);
		this.setState({
			salesStaff: no,
		});
		// データが変更する時、ajaxを呼び出す
// this.changeDataStatus(this.state.salesSituationLists[this.state.rowNo - 1]);
	}

	// 明細選択したCustomerContractを設定する
	getCustomerContract = (no) => {
		this.state.salesSituationLists[this.state.rowNo - 1].customerContractStatus = no;
		this.formatcustomerContract(no);
		this.setState({
			customerContractStatus: no,
		});
	}

	// レコードおきゃく表示
	formatStaff(cell) {
		var salesPersons = this.state.salesPersons;
		for (var i in salesPersons) {
			if (cell === salesPersons[i].code) {
				return salesPersons[i].name.replace(/\(.*?\)/g, '' );
			}
		}
	}
	
	// changeData レコードのステータス
	changeDataStatus = (salesSituationList, admissionEndDate) => {
		salesSituationList.admissionEndDate = admissionEndDate
		axios.post(this.state.serverIP + "salesSituation/changeDataStatus", salesSituationList)
		.then(response => {
			if (response.data.errorsMessage != null) {
				this.setState({ "errorsMessageShow": true, errorsMessageValue: response.data.errorsMessage });
			} else {
				this.getSalesSituation(salesSituationList.admissionEndDate.substring(0,6));
				this.setState({ myToastShow: true, errorsMessageShow: false, errorsMessageValue: '' });
				setTimeout(() => this.setState({ myToastShow: false }), 3000);
			}
		}).catch((error) => {
			console.error("Error - " + error);
		});
	}
	
	// table編集保存
	afterSaveCell = (row) => {
		if (row.salesProgressCode === '4' || row.salesProgressCode === '5') {
			if (row.customer === '' || row.customer === undefined) {
				row.customer = '';
			}
			this.setState({
				customerNo: row.customer,
			})
			// ステータスは確定の場合、確定お客様入力可能です、フォーカスが外に移動すれば、更新処理されている。現場情報(T006EmployeeSiteInfo)を使われます
			// table表数据更新暂时不用以下写法,注释掉的代码可供参考
			if (row.customer !== '' && row.price !== '' && row.customer !== undefined && row.price !== undefined && row.customer !== null && row.price !== null) {
				row.customerNo = row.customer;
				row.salesYearAndMonth = this.state.salesYearAndMonth;
				row.admissionStartDate = this.state.admissionStartDate;
// axios.post(this.state.serverIP + "salesSituation/updateEmployeeSiteInfo",
// row)
// .then(result => {
// if (result.data != null) {
// this.getSalesSituation(this.state.salesYearAndMonth)
// this.setState({ myToastShow: true });
// setTimeout(() => this.setState({ myToastShow: false }), 3000);
// } else {
// alert("FAIL");
// }
// })
// .catch(function (error) {
// alert("ERR");
// });
			}
		} else {
			row.customer = 'noedit';
		}
	};

	// メモ INDEX取る方法
	/*
	 * indexN(cell, row, enumObject, index) { return (<div>{index + 1}</div>); }
	 */
 
	// 優先度表示
	showPriority(cell, row, enumObject, index) {
		if(row.salesProgressCode === "1" || row.salesProgressCode === "2" || row.salesProgressCode === "4"){
			return (<div><font color="grey">{row.employeeName}</font></div>);
		}else{
			if (row.salesPriorityStatus === '1') {
				return (<div>{row.employeeName}<font color="red">★</font></div>);
			} else if(row.salesPriorityStatus === '2') {
				return (<div>{row.employeeName}<font color="black">★</font></div>);
			} else {
				return (<div>{row.employeeName}</div>);
			}
		}
	}

	// 更新ボタン
	changeState = () => {
		if (this.state.readFlag) {
/*
 * if (!this.state.updateBtnflag) { alert("エラーメッセージ"); } else { this.setState({
 * readFlag: !this.state.readFlag, }) }
 */
			this.setState({
				readFlag: !this.state.readFlag,
				updateBtnflag:true,
			})
		} else {
			this.state.employeeNo = String(this.refs.table.state.selectedRowKeys);
			axios.post(this.state.serverIP + "salesSituation/updateSalesSituation", this.state)
				.then(result => {
					if (result.data != null) {
						if (result.data.errorsMessage != null) {
							this.setState({
								errorsMessageShow: true,
								errorsMessageValue: result.data.errorsMessage,
								style: {
									"backgroundColor": "red"
								},
							});
						} else {
							this.getSalesSituation(this.state.salesYearAndMonth)
							this.setState({ myToastShow: true, errorsMessageShow: false, errorsMessageValue: '' });
							setTimeout(() => this.setState({ myToastShow: false }), 3000);
						}
					} else {
						alert("FAIL");
					}
				})
				.catch(function (error) {
					alert("ERR");
				});
		}
	}

	// onchange
	valueChange = event => {
		this.setState({
			[event.target.name]: event.target.value,
		})
	};

	// AUTOSELECT select事件
	handleTag = ({ target }, fieldName) => {
		const { value, id } = target;
		if (value === '') {
			this.setState({
				[id]: '',
			})
		} else {
			if (fieldName === "station" && this.state.getstations.find((v) => (v.name === value)) !== undefined) {
				switch (id) {
					case 'stationCode1':
						this.setState({
							stationCode1: this.state.getstations.find((v) => (v.name === value)).code,
						})
						break;
					case 'stationCode2':
						this.setState({
							stationCode2: this.state.getstations.find((v) => (v.name === value)).code,
						})
						break;
					default:
				}
			} else if (fieldName === "interviewCustomer" && this.state.customers.find((v) => (v.name === value)) !== undefined) {
				switch (id) {
					case 'interviewCustomer1':
						this.setState({
							interviewCustomer1: this.state.customers.find((v) => (v.name === value)).code,
						})
						break;
					case 'interviewCustomer2':
						this.setState({
							interviewCustomer2: this.state.customers.find((v) => (v.name === value)).code,
						})
						break;
					default:
				}
			}
		}
	};

	// numbre only
	valueChangeNUmberOnly = event => {
		// 全角ー＞半角に変更
		var val = event.target.value;
	    var han = val.replace( /[Ａ-Ｚａ-ｚ０-９－！”＃＄％＆’（）＝＜＞，．？＿［］｛｝＠＾～￥]/g, function(s){return String.fromCharCode(s.charCodeAt(0) - 65248)});
		if (han === '' || this.state.regexp.test(han)) {
			if(han.length > 3){
				this.setState({
					[event.target.name]: han.substring(0,3),
				})
			}else{
				this.setState({
					[event.target.name]: han,
				})
			}
		} else {
			alert("ONLY NUMBER");
		}
	}

	// 年月変更後、レコ＾ド再取る
	setEndDate = (date) => {
		axios.post(this.state.serverIP + "salesSituation/checkDirectory", {salesYearAndMonth:publicUtils.formateDate(date, false)})
				.then(response => {
					if(response.data){
						this.setState({
							makeDirectoryFalg: true,
						});
					}
					else{
						this.setState({
							makeDirectoryFalg: false,
						});
					}
				}).catch((error) => {
					console.error("Error - " + error);
				});
		this.setState({
			yearMonth: date,
			salesYearAndMonth: publicUtils.formateDate(date, false),
		});
		// let searchYearMonth = date.getFullYear() + '' + (date.getMonth() + 1
		// < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1));
		this.getSalesSituation(this.getNextMonth(date, 0))
	}

	// setinterviewDate1
	setinterviewDate1 = (date) => {
		this.setState({
			interviewDate1Show: date,
			interviewDate1: publicUtils.timeToStr(date)
		});
	}

	// setinterviewDate2
	setinterviewDate2 = (date) => {
		this.setState({
			interviewDate2Show: date,
			interviewDate2: publicUtils.timeToStr(date)
		});
	}

	// レコードselect事件
	handleRowSelect = (row, isSelected, e) => {
		console.log(this.refs.table);
		this.refs.table.setState({
			selectedRowKeys: []
		});
		if (isSelected) {
			this.setState({
				selectetRowIds: row.employeeNo === null ? [] : this.state.selectetRowIds.concat([row.employeeNo]),
				rowNo: row.rowNo === null ? '' : row.rowNo,
				salesDateUpdate: row.salesDateUpdate === null ? '' : row.salesDateUpdate,
				employeeNo: row.employeeNo === null ? '' : row.employeeNo,
				interviewDate1: row.interviewDate1 === null ? '' : row.interviewDate1,
				interviewDate1Show: row.interviewDate1 === null ? '' : new Date(publicUtils.strToTime(row.interviewDate1)).getTime(),
				interviewDate2: row.interviewDate2 === null ? '' : row.interviewDate2,
				interviewDate2Show: row.interviewDate2 === null ? '' : new Date(publicUtils.strToTime(row.interviewDate2)).getTime(),
				stationCode1: row.stationCode1 === null ? '' : row.stationCode1,
				stationCode2: row.stationCode2 === null ? '' : row.stationCode2,
				interviewCustomer1: row.interviewCustomer1 === null ? '' : row.interviewCustomer1,
				interviewCustomer2: row.interviewCustomer2 === null ? '' : row.interviewCustomer2,
				hopeLowestPrice: row.hopeLowestPrice === null ? '' : row.hopeLowestPrice,
				hopeHighestPrice: row.hopeHighestPrice === null ? '' : row.hopeHighestPrice,
				salesPriorityStatus: row.salesPriorityStatus === null ? '' : row.salesPriorityStatus,
				salesProgressCode: row.salesProgressCode === null ? '' : row.salesProgressCode,
				remark1: row.remark1 === null ? '' : row.remark1,
				remark2: row.remark2 === null ? '' : row.remark2,
				editFlag: row.salesProgressCode === '4' || row.salesProgressCode === '5' ? { type: 'select', readOnly: false, options: { values: this.state.allCustomer } } : false,
				priceEditFlag: row.salesProgressCode === '4' || row.salesProgressCode === '5' ? true : false,// 確定単価編集flag
				updateBtnflag: isSelected,
				salesStaff: row.salesStaff === null ? '' : row.salesStaff,
				readFlag: row.employeeNo === this.state.employeeNo && !this.state.readFlag ? false : true,
				linkDisableFlag: this.refs.table.state.selectedRowKeys.length === 0 ? false : true,
				sendLetterFalg: this.refs.table.state.selectedRowKeys.length >= 0 ? false : true,
				admissionStartDate: row.admissionStartDate === null ? publicUtils.formateDate(new Date(), true) : row.admissionStartDate,
				customerNo: row.customer === null ? '' : row.customer,
				unitPrice: row.price === null ? '' : row.price,
				resumeInfo1: row.resumeInfo1 === null ? '' : row.resumeInfo1,
				resumeInfo2: row.resumeInfo2 === null ? '' : row.resumeInfo2,
				resumeName1: row.resumeName1 === null ? '' : row.resumeName1,
				resumeName2: row.resumeName2 === null ? '' : row.resumeName2,
				customerContractStatus: row.customerContractStatus === null ? '' : row.customerContractStatus,
			});
		} else {
			if(this.refs.table.state.selectedRowKeys.length === 2){
				let employeeNo;
				for(let i = 0; i < this.refs.table.state.selectedRowKeys.length; i++){
					if(String(row.employeeNo) !== String(this.refs.table.state.selectedRowKeys[i])){
						employeeNo = this.refs.table.state.selectedRowKeys[i];
					}
				}
				for(let i = 0; i < this.state.salesSituationLists.length; i++){
					if(String(employeeNo) === String(this.state.salesSituationLists[i].employeeNo)){
						row = this.state.salesSituationLists[i];
					}
				}
				this.setState({
					selectetRowIds: row.employeeNo === null ? [] : this.state.selectetRowIds.concat([row.employeeNo]),
					rowNo: row.rowNo === null ? '' : row.rowNo,
					salesDateUpdate: row.salesDateUpdate === null ? '' : row.salesDateUpdate,
					employeeNo: row.employeeNo === null ? '' : row.employeeNo,
					interviewDate1: row.interviewDate1 === null ? '' : row.interviewDate1,
					interviewDate1Show: row.interviewDate1 === null ? '' : new Date(publicUtils.strToTime(row.interviewDate1)).getTime(),
					interviewDate2: row.interviewDate2 === null ? '' : row.interviewDate2,
					interviewDate2Show: row.interviewDate2 === null ? '' : new Date(publicUtils.strToTime(row.interviewDate2)).getTime(),
					stationCode1: row.stationCode1 === null ? '' : row.stationCode1,
					stationCode2: row.stationCode2 === null ? '' : row.stationCode2,
					interviewCustomer1: row.interviewCustomer1 === null ? '' : row.interviewCustomer1,
					interviewCustomer2: row.interviewCustomer2 === null ? '' : row.interviewCustomer2,
					hopeLowestPrice: row.hopeLowestPrice === null ? '' : row.hopeLowestPrice,
					hopeHighestPrice: row.hopeHighestPrice === null ? '' : row.hopeHighestPrice,
					salesPriorityStatus: row.salesPriorityStatus === null ? '' : row.salesPriorityStatus,
					salesProgressCode: row.salesProgressCode === null ? '' : row.salesProgressCode,
					remark1: row.remark1 === null ? '' : row.remark1,
					remark2: row.remark2 === null ? '' : row.remark2,
					editFlag: row.salesProgressCode === '4' || row.salesProgressCode === '5' ? { type: 'select', readOnly: false, options: { values: this.state.allCustomer } } : false,
					priceEditFlag: row.salesProgressCode === '4' || row.salesProgressCode === '5' ? true : false,// 確定単価編集flag
					updateBtnflag: isSelected,
					salesStaff: row.salesStaff === null ? '' : row.salesStaff,
					readFlag: row.employeeNo === this.state.employeeNo && !this.state.readFlag ? false : true,
					linkDisableFlag: this.refs.table.state.selectedRowKeys.length === 2 ? false : true,
					sendLetterFalg: (!this.state.isSelectedAll && this.refs.table.state.selectedRowKeys.length > 1 ) ? false : true,
					admissionStartDate: row.admissionStartDate === null ? publicUtils.formateDate(new Date(), true) : row.admissionStartDate,
					customerNo: row.customer === null ? '' : row.customer,
					unitPrice: row.price === null ? '' : row.price,
					resumeInfo1: row.resumeInfo1 === null ? '' : row.resumeInfo1,
					resumeInfo2: row.resumeInfo2 === null ? '' : row.resumeInfo2,
					resumeName1: row.resumeName1 === null ? '' : row.resumeName1,
					resumeName2: row.resumeName2 === null ? '' : row.resumeName2,
					customerContractStatus: row.customerContractStatus === null ? '' : row.customerContractStatus,
				});
			}
			else{
				this.setState({
					selectetRowIds: [],
					employeeNo: '',
					interviewDate1: '',
					interviewDate1Show: '',
					interviewDate2: '',
					interviewDate2Show: '',
					stationCode1: '',
					stationCode2: '',
					interviewCustomer1: '',
					interviewCustomer2: '',
					hopeLowestPrice: '',
					hopeHighestPrice: '',
					salesPriorityStatus: '',
					remark1: '',
					remark2: '',
					editFlag: row.salesProgressCode === '4' ? { type: 'select', readOnly: false, options: { values: this.state.allCustomer } } : false,
					updateBtnflag: isSelected,
					readFlag: true,
					linkDisableFlag: this.refs.table.state.selectedRowKeys.length === 2 ? false : true,
					sendLetterFalg: (!this.state.isSelectedAll && this.refs.table.state.selectedRowKeys.length > 1 ) ? false : true,
					isSelectedAll: false,
				});
			}
		}
	}
	
	// 全て選択ボタン事件
	selectAllLists = () => {
		this.refs.table.store.selected = [];
		this.refs.table.setState({
			selectedRowKeys: this.refs.table.state.selectedRowKeys.length !== this.state.allEmpNo.length ? this.state.allEmpNo : [],
		},()=>{
			this.setState({
				linkDisableFlag: this.refs.table.state.selectedRowKeys.length === 1 ? false : true,
				sendLetterFalg: this.refs.table.state.selectedRowKeys.length > 0 ? false : true,
				isSelectedAll: !this.state.isSelectedAll,
			});}
		);
	}


	// 明細多選処理
	handleCheckModeSelect = (row, isSelected, e) => {
		if (isSelected) {
			let tempSelectetRowIds = this.state.selectetRowIds.concat([row.employeeNo]);
			this.setState({
				selectetRowIds: tempSelectetRowIds,
				checkSelect: false,
			})
		} else {
			let index = this.state.selectetRowIds.findIndex(item => item === row.employeeNo);
			this.state.selectetRowIds.splice(index, 1);
			this.setState({
				selectetRowIds: this.state.selectetRowIds,
				checkSelect: this.state.selectetRowIds.length === 0 ? true : false,
			})
		}
	}

	// サブ画面消す
	closeDaiolog = () => {
		this.setState({
			daiologShowFlag: false,
		})
	}

	// // サブ画面表示
	openDaiolog = () => {
		this.setState({
			employeeNo:String(this.refs.table.state.selectedRowKeys),
			daiologShowFlag: true,
		});
	}
	
	downloadResume= (resumeInfo, no) => {
		let fileKey = "";
		let downLoadPath = "";
		if(resumeInfo !== null && resumeInfo.split("file/").length > 1){
			fileKey = resumeInfo.split("file/")[1];
			downLoadPath = (resumeInfo.substring(0, resumeInfo.lastIndexOf("/") + 1) + ( no === 1 ? this.state.resumeName1 : this.state.resumeName2 )).replaceAll("/","//");
		}
		axios.post(this.state.serverIP + "s3Controller/downloadFile", {fileKey:fileKey , downLoadPath:downLoadPath})
		.then(result => {
			let path = downLoadPath.replaceAll("//","/");
			if(no === 1){
				publicUtils.resumeDownload(path, this.state.serverIP, null);
			}
			else if(no === 2){
				publicUtils.resumeDownload(path, this.state.serverIP, null);
			}
		}).catch(function (error) {
			alert("ファイルが存在しません。");
		});
	}

	makeDirectory = () => {
		axios.post(this.state.serverIP + "salesSituation/makeDirectory",
		{ salesYearAndMonth: this.state.salesYearAndMonth,employeeNoList:this.state.allEmpNoName,resumeInfo1List:this.state.allresumeInfo1,resumeInfo2List:this.state.allresumeInfo2 })
		.then(response => {
			if (response.data.errorsMessage != null) {
				this.setState({ "errorsMessageShow": true, errorsMessageValue: response.data.errorsMessage });
			} else {
				this.setState({ myDirectoryShow: true, errorsMessageShow: false, errorsMessageValue: '' });
				setTimeout(() => this.setState({ myDirectoryShow: false }), 3000);
			}
		}).catch((error) => {
			console.error("Error - " + error);
		});
		this.setState({
			makeDirectoryFalg: false,
		});
	}
	
	folderDownload = () => {
		publicUtils.folderDownload("C:/file/salesFolder/" + this.state.salesYearAndMonth + ".rar", this.state.serverIP);
	}

	// TABLE共通
	renderShowsTotal = (start, to, total) => {
		return (
			<p style={{ color: 'dark', "float": "left", "display": total > 0 ? "block" : "none" }}  >
				{start}から  {to}まで , 総計{total}
			</p>
		);
	}
	
	// react download Excel-----------メモ
	/*
	 * handleDownload = (resumeInfo) => { var resumeInfos= new Array();
	 * console.log(resumeInfo); resumeInfos=resumeInfo.split("/");
	 * console.log(resumeInfos); axios({ method: "POST", //请求方式 url:
	 * "http://IP/download", //下载地址 data: { name: resumeInfos[6] }, //请求内容
	 * responseType: 'arraybuffer' }) .then((response) => {
	 * console.log(response); if (response.data.byteLength === 0) { alert('no
	 * resume'); } else { let blob = new Blob([response.data], { type:
	 * 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
	 * let downloadElement = document.createElement('a'); let href =
	 * window.URL.createObjectURL(blob); // 创建下载的链接 downloadElement.href = href;
	 * downloadElement.download = resumeInfos[6]; // 下载后文件名
	 * document.body.appendChild(downloadElement); downloadElement.click(); //
	 * 点击下载 document.body.removeChild(downloadElement); // 下载完成移除元素
	 * window.URL.revokeObjectURL(href); // 释放掉blob对象 } }).catch((error) => {
	 * alert('文件下载失败', error); }); }
	 */
 
	shuseiTo = (actionType) => {
		var path = {};
		const sendValue = {
			salesYearAndMonth: this.state.salesYearAndMonth,
			selectetRowIds: this.refs.table.state.selectedRowKeys,
			linkDisableFlag: this.state.linkDisableFlag,// linkDisableFlag
			sendLetterFalg: this.state.sendLetterFalg,
		};
		switch (actionType) {
			case "selectAll":
				break;
			case "detailUpdate":
				this.changeDataStatus(this.state.salesSituationLists[this.state.rowNo - 1], this.state.salesYearAndMonth);
				break;
			case "detail":
				path = {
					pathname: '/subMenuManager/employeeUpdateNew',
					state: {
						actionType: 'detail',
						id: String(this.refs.table.state.selectedRowKeys),
						backPage: 'manageSituation',
						sendValue: sendValue,
					},
				}
				break;
			case "salesSendLetter":
				path = {
					pathname: '/subMenuManager/salesSendLetter',
					state: {
						backPage: "manageSituation",
						sendValue: sendValue,
						selectetRowIds: this.refs.table.state.selectedRowKeys,
					},
				}
				break;
			case "siteInfo":
				path = {
					pathname: '/subMenuManager/siteInfo',
					state: {
						employeeNo: String(this.refs.table.state.selectedRowKeys),
						backPage: "manageSituation",
						sendValue: sendValue,
					},
				}
				break;
			default:
		}
		this.props.history.push(path);
	}
	
	render() {
		const selectRow = {
			mode: this.state.modeSelect,
			bgColor: 'pink',
			clickToSelectAndEditCell: true,
			hideSelectColumn: true,
			clickToSelect: true,
			clickToExpand: true,
			onSelect: this.state.onSelectFlag ? this.handleRowSelect : this.handleCheckModeSelect,
		};
		
		const cellEdit = {
			mode: 'click',
			blurToSave: true,
			afterSaveCell: this.afterSaveCell,
		}

		const options = {
			noDataText: (<i className="" style={{ 'fontSize': '24px' }}>show what you want to show!</i>),
			defaultSortOrder: 'dsc',
			sizePerPage: 10,
			pageStartIndex: 1,
			paginationSize: 3,
			prePage: '<', // Previous page button text
			nextPage: '>', // Next page button text
			firstPage: '<<', // First page button text
			lastPage: '>>', // Last page button text
			hideSizePerPage: true,
			alwaysShowAllBtns: true,
			paginationShowsTotal: this.renderShowsTotal,
		};

		const tableSelect1 = (onUpdate, props) => (<TableSelect dropdowns={this} flag={1} onUpdate={onUpdate} {...props} />);
		const tableSelect2 = (onUpdate, props) => (<TableSelect dropdowns={this} flag={2} onUpdate={onUpdate} {...props} />);
		const tableSelect3 = (onUpdate, props) => (<TableSelect dropdowns={this} flag={3} onUpdate={onUpdate} {...props} />);
		const tableSelect4 = (onUpdate, props) => (<TableSelect dropdowns={this} flag={4} onUpdate={onUpdate} {...props} />);
		
		return (
			<div>
				<div style={{ "display": this.state.myToastShow ? "block" : "none" }}>
					<MyToast myToastShow={this.state.myToastShow} message={"更新成功！"} type={"success"} />
				</div>
				<div style={{ "display": this.state.myDirectoryShow ? "block" : "none" }}>
					<MyToast myToastShow={this.state.myDirectoryShow} message={"作成完了！"} type={"success"} />
				</div>
				<div style={{ "display": this.state.errorsMessageShow ? "block" : "none" }}>
					<ErrorsMessageToast errorsMessageShow={this.state.errorsMessageShow} message={this.state.errorsMessageValue} type={"success"} />
				</div>
				<Modal aria-labelledby="contained-modal-title-vcenter" centered backdrop="static"
					onHide={this.closeDaiolog} show={this.state.daiologShowFlag} dialogClassName="modal-bankInfo">
					<Modal.Header closeButton><Col className="text-center">
						<h2>営業文章</h2>
					</Col></Modal.Header>
					<Modal.Body >
						<SalesContent empNo={this.state.employeeNo} salesProgressCode={this.state.salesProgressCode} />
					</Modal.Body>
				</Modal>
				<Row inline="true">
					<Col className="text-center">
						<h2>営業状況確認一覧</h2>
					</Col>
				</Row>
				<Form onSubmit={this.savealesSituation}>
					<Form.Group>
						<Row >
							<Col sm={4}>
								<InputGroup size="sm" className="mb-3" >
									<FormControl placeholder="社員NO" autoComplete="off" hidden
										defaultValue={this.state.employeeNo} size="sm" name="employeeNo" />
								</InputGroup>
							</Col>
						</Row>
						<Row>
							<Col sm={4}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">年月</InputGroup.Text>
									</InputGroup.Prepend>
									<InputGroup.Append>
										<DatePicker
											selected={this.state.yearMonth}
											onChange={this.setEndDate}
											autoComplete="off"
											locale="ja"
											showMonthYearPicker
											showFullMonthYearPicker
											className="form-control form-control-sm"
											dateFormat="yyyy/MM"
											id="datePicker"
										/>
									</InputGroup.Append>
								</InputGroup>
							</Col>
						</Row>
						<Row style={{ padding: "10px" }}><Col sm={12}></Col></Row>
						<Row>
							<Col sm={6}>
								<Form.Label style={{ "color": "#000000" }}>営業情報設定</Form.Label>
							</Col>
							<Col sm={6}>
								<Form.Label style={{ "color": "#000000" }}>面談情報</Form.Label>
							</Col>
						</Row>
						<Row>
							<Col sm={4}>
							<InputGroup size="sm" className="mb-3">
								<InputGroup.Prepend>
									<InputGroup.Text id="inputGroup-sizing-sm">希望単価</InputGroup.Text>
								</InputGroup.Prepend>
								<FormControl value={this.state.hopeLowestPrice} autoComplete="off" name="hopeLowestPrice"
									style={this.state.style} onChange={this.valueChangeNUmberOnly.bind(this)} size="sm" maxLength="3" readOnly={this.state.readFlag || this.state.authorityCode !== "4" ? true : false } />
								<InputGroup.Append>
									<InputGroup.Text id="twoKanji">万円</InputGroup.Text>
								</InputGroup.Append>
								<font style={{ marginLeft: "10px", marginRight: "10px", marginTop: "5px" }}>～</font>
								<FormControl value={this.state.hopeHighestPrice} autoComplete="off" name="hopeHighestPrice"
									style={this.state.style} onChange={this.valueChangeNUmberOnly.bind(this)} size="sm" maxLength="3" readOnly={this.state.readFlag || this.state.authorityCode !== "4" ? true : false } />
								<InputGroup.Append>
									<InputGroup.Text id="twoKanji">万円</InputGroup.Text>
								</InputGroup.Append>
							</InputGroup>
							</Col>
							<Col sm={2}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">優先度</InputGroup.Text>
									</InputGroup.Prepend>
									<Form.Control as="select" size="sm"
										onChange={this.valueChange}
										name="salesPriorityStatus" value={this.state.salesPriorityStatus}
										autoComplete="off" disabled={this.state.readFlag || this.state.authorityCode !== "4" ? true : false }>
										{this.state.salesPriorityStatuss.map(date =>
											<option key={date.code} value={date.code}>
												{date.name}
											</option>
										)}
									</Form.Control>
								</InputGroup>
							</Col>
							<Col sm={2}>
								<InputGroup size="sm" className="mb-3" style={{ flexFlow: "nowrap", width: "200%" }}>
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">日付</InputGroup.Text>
									</InputGroup.Prepend>
									<InputGroup.Append>
										<DatePicker
											selected={this.state.interviewDate1Show}
											onChange={this.setinterviewDate1}
											autoComplete="off"
											locale="ja"
											showTimeSelect
											className="form-control form-control-sm"
											dateFormat="MM/dd HH:mm"
											minDate={new Date()}
											id={this.state.readFlag ? 'datePickerReadonly' : 'datePicker2'}
											readOnly={this.state.readFlag}
										/>
									</InputGroup.Append>
								</InputGroup>
							</Col>
							<Col sm={2}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">場所</InputGroup.Text>
									</InputGroup.Prepend>
									<Autocomplete
										disabled={this.state.readFlag}
										name="stationCode1"
										options={this.state.getstations}
										getOptionLabel={(option) => option.name ? option.name : ""}
										value={this.state.getstations.find(v => v.code === this.state.stationCode1) || ""}
										onSelect={(event) => this.handleTag(event, 'station')}
										renderInput={(params) => (
											<div ref={params.InputProps.ref}>
												<input type="text" {...params.inputProps}
													id="stationCode1" className="auto form-control Autocompletestyle-situation"
												/>
											</div>
										)}
									/>
								</InputGroup>
							</Col>
							<Col sm={2}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">お客様</InputGroup.Text>
									</InputGroup.Prepend>
									<Autocomplete
										disabled={this.state.readFlag}
										name="interviewCustomer1"
										options={this.state.customers}
										getOptionLabel={(option) => option.name ? option.name : ""}
										value={this.state.customers.find(v => v.code === this.state.interviewCustomer1) || ""}
										onSelect={(event) => this.handleTag(event, 'interviewCustomer')}
										renderInput={(params) => (
											<div ref={params.InputProps.ref}>
												<input type="text" {...params.inputProps}
													id="interviewCustomer1" className="auto form-control Autocompletestyle-situation"
												/>
											</div>
										)}
									/>
								</InputGroup>
							</Col>
							
						</Row>
						<Row>
							<Col sm={6}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">備考</InputGroup.Text>
									</InputGroup.Prepend>
									<FormControl value={this.state.remark1} autoComplete="off" name="remark1"
										onChange={this.valueChange} size="sm" maxLength="30" readOnly={this.state.readFlag} />
									<font className="site-mark"></font>
									<FormControl value={this.state.remark2} autoComplete="off" name="remark2"
									onChange={this.valueChange} size="sm" maxLength="30" readOnly={this.state.readFlag} />
								</InputGroup>
							</Col>
							
							<Col sm={2}>
							<InputGroup size="sm" className="mb-3" style={{ flexFlow: "nowrap", width: "200%" }}>
								<InputGroup.Prepend>
									<InputGroup.Text id="inputGroup-sizing-sm">日付</InputGroup.Text>
								</InputGroup.Prepend>
								<InputGroup.Append>
									<DatePicker
										selected={this.state.interviewDate2Show}
										onChange={this.setinterviewDate2}
										autoComplete="off"
										locale="ja"
										showTimeSelect
										className="form-control form-control-sm"
										dateFormat="MM/dd HH:mm"
										minDate={new Date()}
										id={this.state.readFlag ? 'datePickerReadonly' : 'datePicker2'}
										readOnly={this.state.readFlag}
									/>
								</InputGroup.Append>
							</InputGroup>
						</Col>
						<Col sm={2}>
							<InputGroup size="sm" className="mb-3" >
								<InputGroup.Prepend>
									<InputGroup.Text id="inputGroup-sizing-sm">場所</InputGroup.Text>
								</InputGroup.Prepend>
								<Autocomplete
									disabled={this.state.readFlag}
									name="stationCode2"
									options={this.state.getstations}
									getOptionLabel={(option) => option.name ? option.name : ""}
									value={this.state.getstations.find(v => v.code === this.state.stationCode2) || ""}
									onSelect={(event) => this.handleTag(event, 'station')}
									renderInput={(params) => (
										<div ref={params.InputProps.ref}>
											<input type="text" {...params.inputProps}
												id="stationCode2" className="auto form-control Autocompletestyle-situation"
											/>
										</div>
									)}
								/>
							</InputGroup>
						</Col>
						<Col sm={2}>
							<InputGroup size="sm" className="mb-3">
								<InputGroup.Prepend>
									<InputGroup.Text id="inputGroup-sizing-sm">お客様</InputGroup.Text>
								</InputGroup.Prepend>
								<Autocomplete
									disabled={this.state.readFlag}
									name="interviewCustomer2"
									options={this.state.customers}
									getOptionLabel={(option) => option.name ? option.name : ""}
									value={this.state.customers.find(v => v.code === this.state.interviewCustomer2) || ""}
									onSelect={(event) => this.handleTag(event, 'interviewCustomer')}
									renderInput={(params) => (
										<div ref={params.InputProps.ref}>
											<input type="text" {...params.inputProps}
												id="interviewCustomer2" className="auto form-control Autocompletestyle-situation"
											/>
										</div>
									)}
								/>
							</InputGroup>
						</Col>
							
						</Row>
					</Form.Group>
					<div>
						<div style={{ "textAlign": "center" }}><Button size="sm" variant="info" onClick={this.changeState} disabled={this.state.linkDisableFlag}>
							<FontAwesomeIcon icon={faSave} /> {!this.state.readFlag && this.state.updateBtnflag ? " 更新" : " 解除"}</Button></div>
					</div>
					<br />
					<Row>
						<Col sm={12}>
							<div style={{"float": "left"}}>
								<Button onClick={this.selectAllLists} size="sm" variant="info" name="clickButton"><FontAwesomeIcon icon={faListOl} /> すべて選択</Button>{' '}
								<Button onClick={this.shuseiTo.bind(this, "detail")} size="sm" variant="info" name="clickButton" disabled={this.state.linkDisableFlag}><FontAwesomeIcon icon={faIdCard} /> 個人情報</Button>{' '}
								<Button onClick={this.shuseiTo.bind(this, "siteInfo")} size="sm" variant="info" name="clickButton" disabled={this.state.linkDisableFlag}><FontAwesomeIcon icon={faBuilding} /> 現場情報</Button>{' '}
								<Button onClick={this.shuseiTo.bind(this, "salesSendLetter")} size="sm" variant="info" name="clickButton"  disabled={this.state.sendLetterFalg}><FontAwesomeIcon icon={faEnvelope} /> お客様送信</Button>{' '}
								<Button onClick={this.folderDownload} size="sm" variant="info" name="clickButton" disabled={this.state.makeDirectoryFalg}><FontAwesomeIcon icon={faDownload} /> 営業フォルダ</Button>{' '}
							</div>
							<div style={{ "float": "right" }}>
								<Button onClick={this.shuseiTo.bind(this, "detailUpdate")} size="sm" variant="info" name="clickButton" disabled={!this.state.linkDisableFlag || !this.state.checkSelect ? false : true}><FontAwesomeIcon icon={faBuilding} /> 明細更新</Button>{' '}
								<Button onClick={this.makeDirectory} size="sm" variant="info" name="clickButton" ><FontAwesomeIcon icon={faDownload} /> {this.state.makeDirectoryFalg ? "営業フォルダ作成":"営業フォルダ更新"}</Button>{' '}
								<Button onClick={this.openDaiolog} size="sm" variant="info" name="clickButton" disabled={this.state.linkDisableFlag}><FontAwesomeIcon icon={faBook} /> 営業文章</Button>{' '}
								<Button onClick={this.downloadResume.bind(this,this.state.resumeInfo1,1)} size="sm" variant="info" name="clickButton" disabled={this.state.linkDisableFlag || this.state.resumeInfo1 === null || this.state.resumeInfo1 === "" ? true:false}><FontAwesomeIcon icon={faDownload} />
								{this.state.linkDisableFlag || this.state.resumeInfo1 === null || this.state.resumeInfo1 === "" ? "履歴書1": this.state.resumeName1.split("_")[1]}</Button>{' '}
								<Button onClick={this.downloadResume.bind(this,this.state.resumeInfo2,2)} size="sm" variant="info" name="clickButton" disabled={this.state.linkDisableFlag || this.state.resumeInfo2 === null || this.state.resumeInfo2 === "" ? true:false}><FontAwesomeIcon icon={faDownload} />
								{this.state.linkDisableFlag || this.state.resumeInfo2 === null || this.state.resumeInfo2 === "" ? "履歴書2":this.state.resumeName2.split("_")[1]}</Button>
							</div>
						</Col>
					</Row>
					<Row>
						<Col sm={12}>
							<BootstrapTable
								ref='table'
								/* className={"bg-white text-dark"} */
								data={this.state.salesSituationLists}
								pagination
								options={options}
								selectRow={selectRow}
								cellEdit={cellEdit}
								trClassName="customClass"
								headerStyle={{ background: '#5599FF' }} striped hover condensed>
							    <TableHeaderColumn hidden={true} width='0%' dataField='salesDateUpdate' autoValue dataSort={true} editable={false}>salesDateUpdateHid</TableHeaderColumn>
								<TableHeaderColumn width='5%' dataField='rowNo' autoValue editable={false}>番号</TableHeaderColumn>
								<TableHeaderColumn dataField='employeeNo' editable={false} hidden={true} isKey>社員番号</TableHeaderColumn>
								<TableHeaderColumn width='11%' dataField='employeeName' dataFormat={this.showPriority} editable={false}>氏名</TableHeaderColumn>
								<TableHeaderColumn dataField='interviewDate1' hidden={true}>面接1日付</TableHeaderColumn>
								<TableHeaderColumn dataField='stationCode1' hidden={true}>面接1場所</TableHeaderColumn>
								<TableHeaderColumn dataField='interviewCustomer1' hidden={true}>面接1客様</TableHeaderColumn>
								<TableHeaderColumn dataField='interviewDate2' hidden={true}> 面接2日付</TableHeaderColumn>
								<TableHeaderColumn dataField='stationCode2' hidden={true}>面接2場所</TableHeaderColumn>
								<TableHeaderColumn dataField='interviewCustomer2' hidden={true}>面接2客様</TableHeaderColumn>
								<TableHeaderColumn dataField='hopeLowestPrice' hidden={true}>希望単価min</TableHeaderColumn>
								<TableHeaderColumn dataField='hopeHighestPrice' hidden={true}>希望単価max</TableHeaderColumn>
								<TableHeaderColumn dataField='remark1' hidden={true}>備考1</TableHeaderColumn>
								<TableHeaderColumn dataField='remark2' hidden={true}>備考2</TableHeaderColumn>
								<TableHeaderColumn dataField='salesPriorityStatus' hidden={true}>優先度</TableHeaderColumn>
								<TableHeaderColumn dataField='admissionStartDate' hidden={true}>開始時間</TableHeaderColumn>
								<TableHeaderColumn dataField='resumeInfo1' hidden={true}>履歴書1</TableHeaderColumn>
								<TableHeaderColumn dataField='resumeInfo2' hidden={true}>履歴書2</TableHeaderColumn>
								<TableHeaderColumn dataField='resumeName1' hidden={true}>履歴書名前1</TableHeaderColumn>
								<TableHeaderColumn dataField='resumeName2' hidden={true}>履歴書名前2</TableHeaderColumn>
								<TableHeaderColumn width='5%' dataField='siteRoleCode' editable={false}>役割</TableHeaderColumn>
								<TableHeaderColumn width='19%' dataField='developLanguage' editable={false}>開発言語</TableHeaderColumn>
								<TableHeaderColumn width='8%' dataField='nearestStation' editable={false}>寄り駅</TableHeaderColumn>
								<TableHeaderColumn width='6%' dataField='unitPrice' editable={false}>単価</TableHeaderColumn>
								<TableHeaderColumn width='9%' dataField='salesProgressCode' dataFormat={this.formatType.bind(this)} customEditor={{ getElement: tableSelect2 }}>進捗</TableHeaderColumn>
								<TableHeaderColumn width='7%' dataField='customerContractStatus' dataFormat={this.formatcustomerContract.bind(this)} customEditor={{ getElement: tableSelect4 }}
									editable={this.state.salesProgressCode === '' || this.state.salesProgressCode === '0' || this.state.salesProgressCode === '1' ? false : true}>契約区分</TableHeaderColumn>
								<TableHeaderColumn width='10%' dataField='customer' dataFormat={this.formatCustome.bind(this)} customEditor={{ getElement: tableSelect1 }}
									editable={this.state.salesProgressCode === '4' || this.state.salesProgressCode === '5' ? true : false}>確定客様</TableHeaderColumn>
								<TableHeaderColumn width='8%' dataField='price' editable={this.state.salesProgressCode === '4' || this.state.salesProgressCode === '5' ? true : false}
									editColumnClassName="dutyRegistration-DataTableEditingCell" editable={this.state.priceEditFlag} >確定単価</TableHeaderColumn>
								<TableHeaderColumn width='8%' dataField='salesStaff' dataFormat={this.formatStaff.bind(this)} customEditor={{ getElement: tableSelect3 }}>営業担当</TableHeaderColumn>
							</BootstrapTable>
						</Col>
					</Row>
				</Form>
			</div>
		);
	}
}
export default manageSituation;

