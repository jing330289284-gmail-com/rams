import React,{Component} from 'react';
import {Row , Col , InputGroup , Button , FormControl } from 'react-bootstrap';
import '../asserts/css/style.css';
import DatePicker from "react-datepicker";
import * as publicUtils from './utils/publicUtils.js';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import axios from 'axios';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ErrorsMessageToast from './errorsMessageToast';
class individualSales extends Component {
    state = { 
        actionType:'',
        fiscalYear:'',
        employeeName:'',
		individualSales_startYearAndMonth:'',
        individualSales_endYearAndMonth:'',
        
     }
     constructor(props){
		super(props);
		this.options = {
			sizePerPage: 12,
			pageStartIndex: 1,
			paginationSize: 2,
			prePage: '<', // Previous page button text
            nextPage: '>', // Next page button text
            firstPage: '<<', // First page button text
            lastPage: '>>', // Last page button text
			hideSizePerPage: true,
            alwaysShowAllBtns: true,
            paginationShowsTotal: this.renderShowsTotal,

		};
    }
	searchEmployee = () => { 
		const empInfo = {
            employeeName: publicUtils.labelGetValue($("#employeeName").val() ,this.state.employeeName),
            fiscalYear:this.state.fiscalYear,
            startYearAndMonth:publicUtils.formateDate(this.state.individualSales_startYearAndMonth,false),
            endYearAndMonth:publicUtils.formateDate(this.state.individualSales_endYearAndMonth,false),
		};
		axios.post("http://127.0.0.1:8080/personalSales/searchEmpDetails", empInfo)
			.then(response => {
				if (response.data.errorsMessage != null) {
                    this.setState({ "errorsMessageShow": true, errorsMessageValue: response.data.errorsMessage });
					setTimeout(() => this.setState({ "errorsMessageShow": false }), 3000);
                }else if(response.data.noData!= null){
                    this.setState({ "errorsMessageShow": true, errorsMessageValue: response.data.noData });
                    setTimeout(() => this.setState({ "errorsMessageShow": false }), 4000);
                    window.location.href = window.location.href
                }
                 else {
                    this.setState({ employeeInfoList: response.data.data })
                    this.setState({workMonthCount:this.state.employeeInfoList[0].workMonthCount})
                    this.feeTotal();
					
				}
			}).catch((error) => {
				console.error("Error - " + error);
			});
        //}
    }
    yearAndMonthChange =event =>{
    	this.setState({
			[event.target.name]: event.target.value
        })
        this.setState({individualSales_endYearAndMonth:''})
        this.setState({individualSales_startYearAndMonth:''})
    }

    	//onchange
	valueChange = event => {
		this.setState({
			[event.target.name]: event.target.value
        })

    }    
    feeTotal = () =>{
        var totalutilPrice = 0;
        var totalgrosProfits = 0;
        var paymentTotal = 0;
        for(var i=0;i<this.state.employeeInfoList.length;i++){
            if(this.state.employeeInfoList[i].paymentTotal==null){
            paymentTotal = paymentTotal + 0;
            }else{
            paymentTotal = parseInt(paymentTotal)+parseInt(this.state.employeeInfoList[i].paymentTotal)
            }
            if(this.state.employeeInfoList[i].unitPrice == null){
                totalutilPrice = totalutilPrice + 0;
            }else{
                totalutilPrice = parseInt(totalutilPrice) + parseInt(this.state.employeeInfoList[i].unitPrice)
            }
            if(this.state.employeeInfoList[i].grosProfits==null){
                totalgrosProfits = parseInt(totalgrosProfits) + 0;
            }else{
                totalgrosProfits = parseInt(totalgrosProfits) + parseInt(this.state.employeeInfoList[i].grosProfits) 
            }
        }
        
        this.setState({totalutilPrice:publicUtils.addComma(totalutilPrice.toString(),false)})
        this.setState({totalgrosProfits:publicUtils.addComma(totalgrosProfits.toString(),false)})
        this.setState({paymentTotal:publicUtils.addComma(paymentTotal.toString(),false)})
    }
	componentDidMount(){
        this.getDropDown();
		var date = new Date();
		var year = date.getFullYear();
		$('#fiscalYear').append('<option value="">'+""+'</option>');
		for(var i=2019;i<=year;i++){
				$('#fiscalYear').append('<option value="'+i+'">'+i+'</option>');
            }           
	}
	individualSalesStartYearAndMonthChange = date => {
        if(date !== null){
            this.setState({
                individualSales_startYearAndMonth: date,
                fiscalYear:'',
            });
        }else{
            this.setState({
                individualSales_startYearAndMonth: '',
            });
        }
	};
	
	individualSalesEndYearAndMonthChange = date => {
        if(date !== null){
            this.setState({
                individualSales_endYearAndMonth: date,
                fiscalYear:'',
            });
        }else{
            this.setState({
                individualSales_endYearAndMonth: '',
            });
        }
    };

    renderShowsTotal(start, to, total) {
		return (
			<p style={{ color: 'dark', "float": "left", "display": total > 0 ? "block" : "none" }}  >
				{start}から  {to}まで , 総計{total}
			</p>
		);
	}
    getDropDown = () => {
		var method = ["getEmployeeName"]
		var data = publicUtils.getPublicDropDown(method);
		this.setState(
			{
				employeeName: data[0],

			}
		);
	};
    unitPriceAddComma(cell,row){
        if(row.unitPrice ===null){
            return 
        }else{
            let formatUprice = publicUtils.addComma(row.unitPrice , false);
            return formatUprice;
        }   
    }

    salaryAddComma(cell,row){
        if(row.salary ===null){
            return 
        }else{
            let formatSalary = publicUtils.addComma(row.salary , false);
            return formatSalary;
        }

    }
    transportationExpensesAddComma(cell,row){
        if(row.transportationExpenses ===null){
            return 
        }else{
            let formatTransportationExpenses = publicUtils.addComma(row.transportationExpenses , false);
            return formatTransportationExpenses;
        } 
    }

    insuranceFeeAmountAddComma(cell,row){
        if(row.insuranceFeeAmount ===null){
            return 
        }else{
            let formatInsuranceFeeAmount= publicUtils.addComma(row.insuranceFeeAmount , false);
            return formatInsuranceFeeAmount;
        } 
    }

    scheduleOfBonusAmountAddComma(cell,row){
        if(row.scheduleOfBonusAmount ===null){
            return 
        }else{
            let formatScheduleOfBonusAmount= publicUtils.addComma(row.scheduleOfBonusAmount , false);
            return formatScheduleOfBonusAmount;
        } 
    }

    leaderAllowanceAmountAddComma(cell,row){
        if(row.leaderAllowanceAmount ===null){
            return 
        }else{
            let formatLeaderAllowanceAmount= publicUtils.addComma(row.leaderAllowanceAmount , false);
            return formatLeaderAllowanceAmount;
        }    
    }

    otherAllowanceAmountAddComma(cell,row){
        if(row. otherAllowanceAmount ===null){
            return 
        }else{
            let formatOtherAllowanceAmount= publicUtils.addComma(row. otherAllowanceAmount , false);
            return formatOtherAllowanceAmount;
        }
    }

    grosProfitsAddComma(cell ,row){
        if(row. grosProfits===null){
            return 
        }else{
         let mGrosProfits = row. grosProfits.split('.')[0];
         let formatmGrosProfits = publicUtils.addComma(mGrosProfits,false)
         return formatmGrosProfits;
        }
    }
render (){
    const { employeeName,errorsMessageValue } = this.state;
        return(
            
            <div>
                <div style={{ "display": this.state.errorsMessageShow ? "block" : "none" }}>
					<ErrorsMessageToast errorsMessageShow={this.state.errorsMessageShow} message={errorsMessageValue} type={"danger"} />
				</div>
                <Row inline="true">
                     <Col  className="text-center">
                    <h2>個人売上検索</h2>
                    </Col> 
                </Row>
				<Row>
				<Col sm={2}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroup-sizing-sm">年度</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl id="fiscalYear"  name="fiscalYear" value={this.state.fiscalYear} as="select" aria-label="Small" aria-describedby="inputGroup-sizing-sm" onChange={this.yearAndMonthChange} />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                    <p id ="individualSalesErrmsg" style={{visibility:"hidden"}} class="font-italic font-weight-light text-danger"></p>
                    </Col>
				</Row>
				<Row>
                <Col sm={3}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend><InputGroup.Text id="inputGroup-sizing-sm">社員名</InputGroup.Text></InputGroup.Prepend>
									<Autocomplete
									id="employeeName"
									name="employeeName"
									options={this.state.employeeName}
									getOptionLabel={(option) => option.name}
									renderInput={(params) => (
										<div ref={params.InputProps.ref}>
											<input placeholder="  社員名" type="text" {...params.inputProps}
												style={{ width: 150, height: 31, borderColor: "#ced4da", borderWidth: 1, borderStyle: "solid", fontSize: ".875rem", color: "#495057" }} />
										</div>
									)}
								/>
                                    <font color="red" style={{ marginLeft: "15px"}}>★</font>
								</InputGroup>
							</Col>
                    <Col sm={4}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroup-sizing-sm">年月</InputGroup.Text><DatePicker
                                selected={this.state.individualSales_startYearAndMonth}
                                onChange={this.individualSalesStartYearAndMonthChange}
                                dateFormat={"yyyy MM"}
                                autoComplete="off"
                                locale="pt-BR"
                                showMonthYearPicker
                                showFullMonthYearPicker
                                showDisabledMonthNavigation
                                className="form-control form-control-sm"
                                id="personalsalesSearchDatePicker"
                                dateFormat={"yyyy/MM"}
                                name="individualSales_startYearAndMonth"
                                locale="ja">
								</DatePicker><font id="mark">～</font><DatePicker
                                selected={this.state.individualSales_endYearAndMonth}
                                onChange={this.individualSalesEndYearAndMonthChange}
                                dateFormat={"yyyy MM"}
                                autoComplete="off"
                                locale="pt-BR"
                                showMonthYearPicker
                                showFullMonthYearPicker
                                showDisabledMonthNavigation
                                className="form-control form-control-sm"
                                id="personalsalesSearchBackDatePicker"
                                dateFormat={"yyyy/MM"}
                                name="individualSales_endYearAndMonth"
                                locale="ja">
								</DatePicker>
                            </InputGroup.Prepend>
                        </InputGroup>                       
                    </Col>                    
                    <Col sm={4}>
                    <Button variant="info" size="sm" id="search"style={{marginLeft:"100px",width:"60px"}} className="text-center" onClick={this.searchEmployee}><FontAwesomeIcon icon={faSearch} />検索</Button>              
                    </Col>

                </Row>
				<Row>
                    <Col sm={3}>
                    <label>稼働月数：</label>
                    <label>{this.state.workMonthCount}</label>
                    </Col>
                    
						<Col sm={3}>
                    <label>単価合計：</label>
                    <label>{this.state.totalutilPrice} </label>
						</Col>
						<Col sm={3}>
                    <label>支払合計：</label>
                      <label>{this.state.paymentTotal} </label>
						</Col>
						<Col sm={3}>
                    <label>粗利合計：
                    </label>
                    <label>{this.state.totalgrosProfits} </label>
						</Col>
				</Row>
                <div>
                    <BootstrapTable data={this.state.employeeInfoList} pagination={true}  headerStyle={{ background: '#5599FF'}} options={this.options} striped hover condensed>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} dataField='onlyYandM'dataSort={true} caretRender={publicUtils.getCaret} isKey>年月</TableHeaderColumn>                           
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} dataField='employeeFormName'>社員形式</TableHeaderColumn>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} width='125' dataField='customerName'>所属客様</TableHeaderColumn>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} dataField='unitPrice' dataFormat={this.unitPriceAddComma} >単価</TableHeaderColumn>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} dataField='salary' dataFormat={this.salaryAddComma}>基本支給</TableHeaderColumn>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} dataField='transportationExpenses' dataFormat={this.transportationExpensesAddComma}>交通代</TableHeaderColumn>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} dataField='insuranceFeeAmount'dataFormat={this.insuranceFeeAmountAddComma}>社会保険</TableHeaderColumn>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }}dataField='scheduleOfBonusAmount' dataFormat={this.scheduleOfBonusAmountAddComma}>ボーナス</TableHeaderColumn>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} width='125' dataField='leaderAllowanceAmount' dataFormat={this.leaderAllowanceAmountAddComma}>リーダー手当</TableHeaderColumn>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} dataField='otherAllowanceAmount' dataFormat={this.otherAllowanceAmountAddComma}>他の手当</TableHeaderColumn>
							<TableHeaderColumn  tdStyle={{ padding: '.45em' }} dataField='grosProfits' dataFormat={this.grosProfitsAddComma} >粗利</TableHeaderColumn>         
					</BootstrapTable>
                    </div>
						
			</div>
        );
    }
}export default individualSales;