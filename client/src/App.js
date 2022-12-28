import { useEffect, useState } from 'react';
import Highcharts from 'highcharts/highstock';
import './App.css';
import Papa from "papaparse";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Exporting from 'highcharts/modules/exporting';
Exporting(Highcharts);




function convertToTimestamp(number) {
  const date = new Date(number);
  return date.getTime();
};

function App() {
  const [Stocks, setStocks] = useState([]);
  // const [financialData, setFinancialData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const stocksUrl= "http://localhost:5000/";
  const [loader, setloader] = useState(false);
  const [Iserror,setIsError]=useState(false);
  const [currentPrice,setCurrentPrice] = useState(null);
  const getStocks = async (url) => {
    const response = await fetch(url)
    
    if (response.ok) {
      setloader(false);
      setIsError(false);
      return response.json()
    } else {
      setloader(false);
      setIsError(true);
      throw new Error('Data coud not be fetched!')
    }
  }
  
  const getData = () => {
    fetch('tickers.json'
      , {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setStocks(myJson)
      });
  }
  useEffect(() => {
    getData()
    
  }, [])
  console.log(Stocks)
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setloader(true);
    if(searchText.length>0 && Stocks[searchText.toUpperCase()]){
      
      const data = await getStocks(stocksUrl + searchText)
      const latestData = await getStocks(stocksUrl +"price/"+searchText)
      const financialData = latestData.quoteSummary.result[0].financialData;
      // setFinancialData(financialData)
      setCurrentPrice(financialData.currentPrice.raw)
      const csv = Papa.parse(data, { header: true });
      Chart(csv)
    }else{
      setIsError(true);
      setloader(false);

    }
  }

  function Chart(csv) {
    const chartData = []
    for (var i = 0; i < csv.data.length; i++) {
      chartData.push([convertToTimestamp(csv.data[i].Date), parseInt(csv.data[i].Close)]);
    }

    Highcharts.stockChart('chartcontainer', {
      
      rangeSelector: {
        verticalAlign: 'bottom',
         allButtonsEnabled: true,
            buttons: [
              {
                type:'day',
                count: 7,
                text: '1W',
                dataGrouping:{
                  forced: true,
                  units:[['day',[1]]]
                }
              },
              
              {
                type: 'month',
                count: 1,
                text: '1M',
                dataGrouping: {
                    forced: true,
                    units: [['day', [1]]]
                }
            },
            {
              type: 'month',
              count: 3,
              text: '3M',
              dataGrouping: {
                  forced: true,
                  units: [['day', [1]]]
              }
          }, {
                type: 'year',
                count: 1,
                text: '1Y',
                dataGrouping: {
                    forced: true,
                    units: [['week', [1]]]
                }
            }, {
                type: 'all',
                text: '5Y',
                dataGrouping: {
                    forced: true,
                    units: [['month', [1]]]
                }
            }],
            selected: 2
      },
     
      series: [{
        name: searchText,
        data: chartData,
        tooltip: {
          valueDecimals: 2
        }
      }]

    });
  }
  return (
    <div className='App'>
      <div className="stock-price" style={{marginBottom:"30px"}}>Search your favourite stocks 😊🔥</div>
      <form className="search-box">
        
          <input className="search-input" type="text" placeholder="Enter any stock ticker" onChange={(e) => { setSearchText(e.target.value);
          setIsError(false); setCurrentPrice(null); setloader(true); if(e.target.value===""){setloader(false)} }}/>
          <button type="submit"  onClick={handleSubmit} className="search-btn"><i className="fas fa-search"></i></button>
        
      </form>
      <div className="stock-heading"> {Stocks[searchText.toUpperCase()]}</div>
      {(currentPrice!==null)?(<div className="stock-price"> ${currentPrice}</div>):" "}
      {Iserror ? <p className="stock-price">Invalid ticker</p>
          :<></>}
        
      { loader?<Box sx={{marginTop:"10px", marginLeft:"20px"}}>
        <CircularProgress />
      </Box>:(Iserror?(" "):(<div id="chartcontainer"  ></div>))}
    </div>
  );
}

export default App;

