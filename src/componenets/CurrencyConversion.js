import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';


const base_url = process.env.REACT_APP_BASE_URL;


export default function CurrencyConversion() {
   
    const [value, setValue] = React.useState(dayjs().format('YYYY/MM/DD'));


    const [sourceCur, setSource] = useState("USD");
    const [targetCur, setTarget] = useState("INR");
    const [currList, setCurrList] = useState([]);

    const [srcInputVal, setSrcInputVal] = useState();
    const [tarInputVal, setTarInputVal] = useState();

    const handleSourceDropdownSelection = (e) => {
    
        setSource(e.target.value);
    }

    const handleTargetDropdownSelction = (e) => {
    
        setTarget(e.target.value);

    }

    const handleSrcInputVal = (e) => {
        setSrcInputVal(e.target.value);

    }

    const handleTarInputVal = (e) => {
        setTarInputVal(e.target.value);
        

    }


    const fetchCurrList = async (url) => {
        if (currList.length) {
            return
        }
        try {

            const res = await fetch(`${base_url}/codes`);
            let data = await res.json();

            let currListDataArr = data.supported_codes;


            setCurrList(currListDataArr);


        } catch (error) {
            return

        }
    }

    useEffect(() => {
        fetchCurrList();
    }, []);


    const fetchDataForPairConversion = async (url) => {

        try {
            const res = await fetch(`${base_url}/pair/${sourceCur}/${targetCur}`);

            let data = await res.json();
            if (!res.ok) {
                return
            }

            let conversionRate = data.conversion_rate;
            if (srcInputVal) {
                let converted_amt = srcInputVal * conversionRate;
                setTarInputVal(converted_amt);
            }


        } catch (error) {

            return

        }

    };

    useEffect(() => {
        if (srcInputVal) {
            fetchDataForPairConversion();
         
            if (value === dayjs().format('YYYY/MM/DD')) {
                fetchDataForPairConversion();

            } else {
                fetchDataForSelectedDate();
            }
        } else {
            setTarInputVal(0);

        }

    }, [srcInputVal, value, targetCur, sourceCur]);



    const handleDate = (inputDate) => {
        setValue(dayjs(inputDate.$d).format('YYYY/MM/DD'));

    }


  

    const fetchDataForSelectedDate = async (url) => {
        try {

            let [year, month, day] = value.split("/");
      

            const res = await fetch(`${base_url}/history/${sourceCur}/${year}/${month}/${day}`);

            const data = await res.json();
            if (!res.ok) {
              
                alert('No data available for this date in the database.');
                setValue(dayjs().format('YYYY/MM/DD'))
                return

            }

            let conversionRate = data.conversion_rates;

           



            // if the src currency is available in the conversion_rates obj and input is present 
            if (targetCur in conversionRate && srcInputVal) {
                let conversionRateForSrcCurr = conversionRate[targetCur];

                let converted_amt = srcInputVal * conversionRateForSrcCurr;
                setTarInputVal(converted_amt);
               

            }

        } catch (error) {
            return
        }
    }


    return (

        <div className="currency-conversion-layout">

            <div className='header'>Currency Converter</div>

            <Box
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <div>

                    {/* for source currency */}
                    <TextField
                        id="outlined-select-currency"
                        select
                        label="Source"
                        defaultValue="USD"
                        helperText=""
                        value={sourceCur || ""}
                        onChange={handleSourceDropdownSelection}
                    >
                        {currList.map((option) => (
                            <MenuItem key={option[0]} value={option[0]}>
                                {option[0]}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* for target currency */}
                    <TextField
                        id="outlined-select-currency"
                        select
                        label="Target"
                        defaultValue="EUR"
                        helperText=""
                        value={targetCur || ""}
                        onChange={handleTargetDropdownSelction}
                    >
                        {currList.map((option) =>
                        (

                            <MenuItem key={option[0]} value={option[0]}>
                                {option[0]}
                            </MenuItem>
                        )
                        )}
                    </TextField>

                </div>


            </Box>

            {/* input section */}

            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '40ch', display: "flex", flexWrap: "nowrap", gap: 2 },
                }}
            >
                <div>

                    <TextField type="number" id="standard-basic" label="" variant="standard" value={srcInputVal || ""} onChange={handleSrcInputVal} />

                    <TextField disabled id="standard-basic" label="" variant="standard" value={tarInputVal || ""} onChange={handleTarInputVal} />

                </div>
            </Box>

            {/* date picker section */}

            <LocalizationProvider dateAdapter={AdapterDayjs}>

                <DatePicker
                    label="Select Date"
                    value={dayjs(value)}
                    format='YYYY/MM/DD'
                    onChange={(newValue) => handleDate(newValue)}
                    disableFuture
                />

            </LocalizationProvider>

        </div>

    );

}







